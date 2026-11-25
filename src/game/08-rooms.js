  // =================================================================== rooms
  function buildRoom(n) {
    const L = ROOM_DEFS[n - 1].L;
    ROWS = L.length; ARENA.h = ROWS * CELL; AY2 = ARENA.y + ARENA.h;
    flow = new Int16Array(COLS * ROWS);
    introT = INTRO_T;
    obstacles = []; enemies = []; arrows = []; bullets = []; pickups = []; particles = []; texts = []; crates = []; thrown = [];
    roomClear = false; gateOpen = 0; clearT = 0; if (run) run.roomDmg = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const ch = L[r][c];
        const x = ARENA.x + c * CELL, y = ARENA.y + r * CELL;
        if (ch === '#') obstacles.push({ x, y, w: CELL, h: CELL, kind: 'stone', solid: true, seed: r * 31 + c * 7 + n * 101 });
        else if (ch === 'Y') obstacles.push({ x, y, w: CELL, h: CELL, kind: 'yurt', solid: true, seed: r * 13 + c });
        else if (ch === '~') obstacles.push({ x, y, w: CELL, h: CELL, kind: 'water', solid: false, seed: r * 17 + c });
        else if (ENEMY[ch]) spawnEnemy(ch, ENEMY[ch].boss ? W / 2 : x + CELL / 2, y + CELL / 2, 0.9);
      }
    }
    const def = ROOM_DEFS[n - 1], bossRoom = L.some(r => /[DJA]/.test(r));
    // more monsters as the chapter goes on: from room 9 (two), one more every third room, drawn from the act's own pack, in the north two thirds
    if (n <= TOTAL_ROOMS && !bossRoom) {
      const extra = n < 9 ? 0 : Math.floor((n - 6) / 3) + 1, pool = n <= 5 ? 'wwsj' : n <= 10 ? 'wsjja' : n <= 15 ? 'wjjam' : 'wjamm', rr = mulberry32(n * 17 + 3);
      for (let i = 0, tries = 0; i < extra && tries < 200; tries++) {
        const c = Math.floor(rr() * COLS), r = 1 + Math.floor(rr() * ROWS * 0.62);
        if (L[r][c] !== '.' || enemies.some(e => Math.abs(e.x - (ARENA.x + c * CELL + CELL / 2)) < CELL && Math.abs(e.y - (ARENA.y + r * CELL + CELL / 2)) < CELL)) continue;
        spawnEnemy(pool[Math.floor(rr() * pool.length)], ARENA.x + c * CELL + CELL / 2, ARENA.y + r * CELL + CELL / 2, 0.9); i++;
      }
    }
    // the last boss: the same dragon, darker and much tougher
    if (def && def.bossMul) for (const e of enemies) if (e.boss) { e.hp *= def.bossMul; e.maxHp *= def.bossMul; e.dmg *= 1.2; }
    player.x = W / 2; player.y = AY2 - 30; player.volleys = []; player.fireCd = 0.4;
    // supply crate: one per room
    { const sp = freeSpotAwayFromPlayer(110); crates.push({ x: sp.x, y: sp.y }); }
    snapRun();
    player.eagle.x = player.x - 20; player.eagle.y = player.y - 30;
    G3.dirty = true; flowT = 0;
    const boss = enemies.find(e => e.boss);
    if (boss) { banner = { kind: 'boss', type: boss.type, name: def && def.bossName, room: n, t: 3.2 }; Sound.roar(); }
    else banner = { kind: 'room', room: n, t: 3.0 };
  }

  function spawnEnemy(type, x, y, spawn) {
    const d = ENEMY[type];
    const room = diffLevel();
    const hpMul = d.boss ? 1 : 1 + 0.2 * (room - 1) + 0.035 * Math.max(0, room - 10) ** 2;   // the later acts get tough fast
    const dmgMul = 1 + 0.085 * (room - 1);   // QARATUN: every room hits a little harder
    const e = {
      type, x, y, r: d.r, hp: d.hp * hpMul, maxHp: d.hp * hpMul, speed: d.speed, dmg: d.dmg * dmgMul,
      xp: d.xp, coin: d.coin, ai: d.ai, fly: !!d.fly, boss: !!d.boss, name: d.name,
      vx: 0, vy: 0, kx: 0, ky: 0, spawn: spawn || 0, flash: 0, burn: 0, burnT: 0, burnDmg: 0, slow: 0,
      st: 'chase', t: rand(0.3, 1.2), cd: rand(0.8, 2), rot: 0, face: Math.PI / 2, anim: Math.random() * 10,
      pi: 0, ps: {}, hitWall: false, alpha: 1,
    };
    maybeElite(e);
    enemies.push(e);
    return e;
  }

  function freeSpotAwayFromPlayer(minD) {
    for (let i = 0; i < 40; i++) {
      const c = Math.floor(Math.random() * COLS), r = 1 + Math.floor(Math.random() * (ROWS - 4));
      const x = ARENA.x + c * CELL + CELL / 2, y = ARENA.y + r * CELL + CELL / 2;
      if (obstacles.some(o => x > o.x - 4 && x < o.x + o.w + 4 && y > o.y - 4 && y < o.y + o.h + 4)) continue;
      if (Math.hypot(x - player.x, y - player.y) < minD) continue;
      return { x, y };
    }
    return { x: W / 2, y: ARENA.y + 120 };
  }

