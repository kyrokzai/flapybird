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
    player.x = W / 2; player.y = AY2 - 30; player.volleys = []; player.fireCd = 0.4;
    // supply crates: one per room, two in the long ones (boss rooms always have one)
    for (let i = 0; i < (ROWS >= 20 ? 2 : 1); i++) { const sp = freeSpotAwayFromPlayer(110); crates.push({ x: sp.x, y: sp.y }); }
    player.eagle.x = player.x - 20; player.eagle.y = player.y - 30;
    G3.dirty = true; flowT = 0;
    const boss = enemies.find(e => e.boss);
    if (boss) { banner = { kind: 'boss', type: boss.type, room: n, t: 3.2 }; Sound.roar(); }
    else banner = { kind: 'room', room: n, t: 3.0 };
  }

  function spawnEnemy(type, x, y, spawn) {
    const d = ENEMY[type];
    const room = diffLevel();
    const hpMul = d.boss ? 1 : 1 + 0.2 * (room - 1);
    const dmgMul = 1 + 0.07 * (room - 1);
    const e = {
      type, x, y, r: d.r, hp: d.hp * hpMul, maxHp: d.hp * hpMul, speed: d.speed, dmg: d.dmg * dmgMul,
      xp: d.xp, coin: d.coin, ai: d.ai, fly: !!d.fly, boss: !!d.boss, name: d.name,
      vx: 0, vy: 0, kx: 0, ky: 0, spawn: spawn || 0, flash: 0, burn: 0, burnT: 0, burnDmg: 0, slow: 0,
      st: 'chase', t: rand(0.3, 1.2), cd: rand(0.8, 2), rot: 0, face: Math.PI / 2, anim: Math.random() * 10,
      pi: 0, ps: {}, hitWall: false, alpha: 1,
    };
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

