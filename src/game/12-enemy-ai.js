  // =================================================================== enemy AI
  function enemyBullet(e, a, spd, kind) {
    const R = { claw: 5, magic: 6, rock: 7, boulder: 11, fire: 6, ghost: 6 }[kind] || 6;
    bullets.push({ x: e.x + Math.cos(a) * e.r * 0.7, y: e.y + Math.sin(a) * e.r * 0.7, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, r: R, dmg: e.dmg * (e.boss ? 0.72 : 0.68), kind, life: 7, a });
  }
  function ring(e, n, spd, kind, off) { for (let i = 0; i < n; i++) enemyBullet(e, (off || 0) + i * TAU / n, spd, kind); }
  function aimed(e, n, spread, spd, kind) {
    const a = angTo(e, player);
    for (let i = 0; i < n; i++) enemyBullet(e, a + (n > 1 ? (i - (n - 1) / 2) * spread : 0), spd, kind);
  }
  function steer(e, tx, ty, spd) { const a = Math.atan2(ty - e.y, tx - e.x); e.vx = Math.cos(a) * spd; e.vy = Math.sin(a) * spd; e.face = a; }

  const BOSS_PATTERNS = {
    walk(e, dt, s) { if (s.t === undefined) s.t = 1.1; steerPath(e, e.speed); s.t -= dt; return s.t <= 0; },
    stomp(e, dt, s) {
      if (s.n === undefined) { s.n = 0; s.t = 0; }
      e.vx = e.vy = 0; e.wind = true; s.t += dt;
      if (s.t > 0.55) { s.t = 0; ring(e, 16, 135, 'rock', s.n * 0.2); shake = Math.max(shake, 8); Sound.boom(); s.n++; }
      return s.n >= 3;
    },
    charge(e, dt, s) {
      if (!s.st) { s.st = 'wind'; s.t = 0.65; }
      if (s.st === 'wind') {
        e.vx = e.vy = 0; e.wind = true; s.a = angTo(e, player); e.face = s.a; s.t -= dt;
        if (s.t <= 0) { s.st = 'go'; s.t = 0.75; }
        return false;
      }
      e.vx = Math.cos(s.a) * 360; e.vy = Math.sin(s.a) * 360; s.t -= dt;
      if (e.hitWall && s.t < 0.7) { ring(e, 10, 120, e.type === 'A' ? 'fire' : 'rock', 0); shake = Math.max(shake, 10); Sound.boom(); e.vx = e.vy = 0; return true; }
      return s.t <= 0;
    },
    boulders(e, dt, s) {
      if (s.n === undefined) { s.n = 0; s.t = 0.35; }
      e.vx = e.vy = 0; s.t -= dt;
      if (s.t <= 0) { s.t = 0.38; aimed(e, 1, 0, 215, 'boulder'); s.n++; }
      return s.n >= 4;
    },
    spiral(e, dt, s) {
      if (s.dur === undefined) { s.dur = 2.8; s.t = 0; s.a = Math.random() * TAU; }
      e.vx = e.vy = 0; e.wind = true; s.dur -= dt; s.t -= dt;
      if (s.t <= 0) { s.t = 0.085; for (let k = 0; k < 3; k++) enemyBullet(e, s.a + k * TAU / 3, 125, 'magic'); s.a += 0.24; }
      return s.dur <= 0;
    },
    summon(e, dt, s) {
      if (!s.done) {
        s.done = true; s.t = 0.7; Sound.magic();
        for (let k = 0; k < 3; k++) {
          const a = k * TAU / 3 + Math.random();
          const m = spawnEnemy('s', clamp(e.x + Math.cos(a) * 50, ARENA.x + 15, AX2 - 15), clamp(e.y + Math.sin(a) * 50, ARENA.y + 15, AY2 - 60), 0.6);
          pushOut(m, m.r, true);
        }
      }
      e.vx = e.vy = 0; s.t -= dt; return s.t <= 0;
    },
    wolves(e, dt, s) {
      if (!s.done) {
        s.done = true; s.t = 0.8; Sound.roar();
        for (const sx of [-60, 60]) { const m = spawnEnemy('w', clamp(e.x + sx, ARENA.x + 20, AX2 - 20), clamp(e.y + 20, ARENA.y + 20, AY2 - 80), 0.6); pushOut(m, m.r, true); }
      }
      e.vx = e.vy = 0; s.t -= dt; return s.t <= 0;
    },
    teleport(e, dt, s) {
      if (!s.st) {
        s.st = 1; s.t = 0.5;
        burst(e.x, e.y, '#9b6bd6', 24, 140, 3.5);
        const p = freeSpotAwayFromPlayer(140); e.x = p.x; e.y = p.y;
        burst(e.x, e.y, '#9b6bd6', 24, 140, 3.5); Sound.magic();
      }
      e.vx = e.vy = 0; s.t -= dt;
      if (s.st === 1 && s.t <= 0) { aimed(e, 5, 0.2, 185, 'magic'); s.st = 2; s.t = 0.5; }
      return s.st === 2 && s.t <= 0;
    },
    breath(e, dt, s) {
      if (s.dur === undefined) { s.dur = 1.7; s.t = 0.35; }
      e.vx = e.vy = 0; e.wind = true; e.face = angTo(e, player); s.dur -= dt; s.t -= dt;
      if (s.t <= 0 && s.dur < 1.4) { s.t = 0.055; enemyBullet(e, e.face + rand(-0.38, 0.38), rand(190, 250), 'fire'); }
      return s.dur <= 0;
    },
    rings(e, dt, s) {
      if (s.n === undefined) { s.n = 0; s.t = 0.3; }
      e.vx = e.vy = 0; s.t -= dt;
      if (s.t <= 0) { s.t = 0.45; ring(e, 14, 150, 'fire', s.n % 2 ? Math.PI / 14 : 0); s.n++; }
      return s.n >= 4;
    },
  };

  function updateEnemy(e, dt) {
    e.anim += dt;
    if (e.spawn > 0) { e.spawn -= dt; return; }
    e.flash -= dt; e.wind = false;
    if (e.burn > 0) {
      e.burn -= dt; e.burnT -= dt;
      if (e.burnT <= 0) { e.burnT = 0.4; hitEnemy(e, e.burnDmg, { noCrit: true, silent: true, col: '#ffae4d' }); if (e.dead) return; }
    }
    if (e.slow > 0) e.slow -= dt;
    const sf = e.slow > 0 ? 0.5 : 1;
    const d = dist(e, player);

    switch (e.ai) {
      case 'wolf':
        e.t -= dt; e.cd -= dt;
        if (e.st === 'chase') {
          steerPath(e, e.speed);
          if (d < 150 && e.cd <= 0 && clearPath(e, player, 4)) { e.st = 'wind'; e.t = 0.45; }
        } else if (e.st === 'wind') {
          e.vx = e.vy = 0; e.wind = true; e.face = angTo(e, player);
          if (e.t <= 0) { e.st = 'dash'; e.t = 0.38; e.dashA = e.face; }
        } else if (e.st === 'dash') {
          e.vx = Math.cos(e.dashA) * 300; e.vy = Math.sin(e.dashA) * 300;
          if (e.t <= 0) { e.st = 'rest'; e.t = 0.5; }
        } else {
          e.vx *= 0.85; e.vy *= 0.85;
          if (e.t <= 0) { e.st = 'chase'; e.cd = rand(1.8, 2.6); }
        }
        break;
      case 'spider':
        e.t -= dt;
        if (e.t <= 0) { e.t = rand(0.35, 0.8); const a = pathAngle(e) + rand(-0.8, 0.8); e.vx = Math.cos(a) * e.speed; e.vy = Math.sin(a) * e.speed; e.face = a; }
        break;
      case 'shooter':
        e.t -= dt;
        if (e.st !== 'aim') {
          if (e.t <= 0) { e.st = 'aim'; e.t = 0.6; e.vx = e.vy = 0; }
        } else {
          e.aimA = angTo(e, player);
          if (e.t <= 0) {
            for (const da of [-0.22, 0, 0.22]) enemyBullet(e, e.aimA + da, 170, 'claw');
            e.st = 'move'; e.t = rand(1.1, 1.9);
            const a = Math.random() * TAU; e.vx = Math.cos(a) * e.speed; e.vy = Math.sin(a) * e.speed;
          }
        }
        break;
      case 'ghost':
        steer(e, player.x, player.y, e.speed);
        e.cd -= dt;
        if (e.cd <= 0) { e.cd = 2.6; ring(e, 6, 115, 'ghost', e.rot); e.rot += 0.52; }
        break;
      case 'witch':
        e.vx = e.vy = 0; e.cd -= dt;
        if (e.cd <= 0) {
          e.cd = 3.1; ring(e, 10, 95, 'magic', Math.random()); Sound.magic();
          e.rot++;
          if (e.rot % 2 === 0) {
            burst(e.x, e.y, '#6d4c8f', 18, 120, 3);
            const p = freeSpotAwayFromPlayer(120); e.x = p.x; e.y = p.y;
            burst(e.x, e.y, '#6d4c8f', 18, 120, 3);
          }
        }
        break;
      case 'boss': {
        const pats = ENEMY[e.type].pats;
        const fn = BOSS_PATTERNS[pats[e.pi % pats.length]];
        const enr = e.hp < e.maxHp * 0.5 ? 1.25 : 1;
        if (fn(e, dt * enr, e.ps)) { e.pi++; e.ps = {}; }
        break;
      }
    }

    e.kx *= 0.86; e.ky *= 0.86;
    e.x += (e.vx * sf + e.kx) * dt;
    e.y += (e.vy * sf + e.ky) * dt;
    if (e.fly) { e.hitWall = false; e.x = clamp(e.x, ARENA.x + e.r, AX2 - e.r); e.y = clamp(e.y, ARENA.y + e.r, AY2 - e.r); }
    else e.hitWall = pushOut(e, e.r, true);

    if (d < e.r + player.r - 2) hurtPlayer(e.dmg);
  }

