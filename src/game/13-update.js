  // =================================================================== update
  const keys = new Set();
  const joy = { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0 };

  function moveInput() {
    if (SIM.on) return SIM.mv;
    let dx = 0, dy = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) dy -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) dy += 1;
    if (dx || dy) { const l = Math.hypot(dx, dy); return { x: dx / l, y: dy / l }; }
    if (joy.active) {
      const jx = joy.x - joy.ox, jy = joy.y - joy.oy, l = Math.hypot(jx, jy);
      if (l > 6) { const m = Math.min(1, l / 36); return { x: jx / l * m, y: jy / l * m }; }
    }
    return { x: 0, y: 0 };
  }

  function update(dt) {
    time += dt;
    Sound.setMode(scene === 'play' || scene === 'dead' || scene === 'victory' ? (enemies.some(e => e.boss) ? 'boss' : 'battle') : 'menu');
    if (hurtFlash > 0) hurtFlash -= dt;
    for (const e of enemies) if (e.punch > 0) e.punch = Math.max(0, e.punch - dt * 7);
    if (shake > 0) shake = Math.max(0, shake - dt * 40);
    if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }

    if (fadeDir) {
      fade = clamp(fade + fadeDir * dt * 3.5, 0, 1);
      if (fadeDir > 0 && fade >= 1) { fadeDir = -1; if (fadeThen) { const f = fadeThen; fadeThen = null; f(); } }
      else if (fadeDir < 0 && fade <= 0) fadeDir = 0;
      if (fadeDir > 0) return;
    }

    for (const p of particles) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92; p.life -= dt;
      p.h += p.vh * dt; p.vh -= 7 * dt; if (p.h < 0.03) { p.h = 0.03; p.vh *= -0.35; }
    }
    particles = particles.filter(p => p.life > 0);
    for (const t of texts) { t.rise += 30 * dt; t.life -= dt; }
    texts = texts.filter(t => t.life > 0);

    if (scene === 'dead' || scene === 'victory') { endT += dt; return; }
    if (modal === 'revive' && scene === 'play') { reviveT -= dt; if (reviveT <= 0) declineRevive(); return; }
    if (scene !== 'play' || modal) return;
    if (introT > 0) { introT -= dt; return; }

    if (run.pendingLv > 0) {
      if (lvlT === 0) {
        lvlT = 0.65; Sound.level();
        addFx('pillar', player.x, player.y, { col: '#ffd24a', size: 1.3, max: 1.0 });
        addFx('ring', player.x, player.y, { col: '#ffd24a', size: 3, max: 0.7 });
        burst(player.x, player.y, '#ffe08a', 26, 170, 3);
        floatText(player.x, player.y, tr('levelUp'), '#ffd24a', 16, 2.3);
      }
      lvlT = Math.max(0.0001, lvlT - dt);
      if (lvlT <= 0.0001) { lvlT = 0; choices = rollChoices(); if (choices.length) { modal = 'levelup'; return; } run.pendingLv = 0; }
    }

    updatePlayer(dt);
    flowT -= dt;
    if (flowT <= 0) { flowT = 0.2; computeFlow(); }
    for (const e of enemies) updateEnemy(e, dt);
    // keep enemies apart
    for (let i = 0; i < enemies.length; i++) for (let j = i + 1; j < enemies.length; j++) {
      const a = enemies[i], b = enemies[j];
      if (a.spawn > 0 || b.spawn > 0) continue;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = a.r + b.r - 2;
      if (d > 0 && d < m) {
        const push = (m - d) / 2, ux = dx / d, uy = dy / d;
        if (!a.boss) { a.x -= ux * push; a.y -= uy * push; }
        if (!b.boss) { b.x += ux * push; b.y += uy * push; }
      }
    }
    enemies = enemies.filter(e => !e.dead);
    updateArrows(dt);
    updateBullets(dt);
    updatePickups(dt);
    for (const c of crates) if (!c.open && Math.hypot(c.x - player.x, c.y - player.y) < 24) openCrate(c);
    for (const b of thrown) { b.t += dt / 0.5; if (b.t >= 1) { b.done = true; explode(b.x1, b.y1); } }
    thrown = thrown.filter(b => !b.done);
    if (player.weapon) { player.weapon.t -= dt; if (player.weapon.t <= 0) player.weapon = null; }

    if (!roomClear && enemies.length === 0) {
      roomClear = true; clearT = 0;
      questEvent('room'); if (run.roomDmg === 0) questEvent('nohit');
      if (run.S.regen > 0) healPlayer(player.maxHp * run.S.regen);
      slowT = 0.7; Sound.clear();
      banner = { kind: 'clear', t: 2.0 };
      addFx('ring', player.x, player.y, { col: '#7cf07a', size: 5, max: 0.9 });
      for (const p of pickups) p.t = 99;
    }
    if (roomClear) {
      clearT += dt;
      if (clearT > 0.7 && gateOpen === 0) Sound.gate();
      if (clearT > 0.7) gateOpen = Math.min(1, gateOpen + dt * 2);
      if (gateOpen >= 1 && player.y - player.r <= ARENA.y + 3 && Math.abs(player.x - GATE_X) < GATE_W / 2) leaveRoom();
    }
  }

  function leaveRoom() {
    if (fadeDir) return;
    const done = run.room;
    const go = () => {
      fadeDir = 1;
      fadeThen = () => {
        for (const p of pickups) { if (p.kind === 'xp') gainXp(p.v); else if (p.kind === 'coin') run.coins += Math.max(1, Math.round(p.v)); }
        pickups = [];
        if (done >= TOTAL_ROOMS) { endRun(true); return; }
        run.room = done + 1;
        buildRoom(run.room);
      };
    };
    if (KYDYR_AFTER.includes(done) && done < TOTAL_ROOMS) { modal = 'kydyr'; kydyrNext = go; Sound.magic(); }
    else go();
  }
  let kydyrNext = null;

  function updatePlayer(dt) {
    const p = player;
    if (p.inv > 0) p.inv -= dt;
    if (p.atkAnim > 0) p.atkAnim -= dt;
    const mv = moveInput();
    p.moving = mv.x !== 0 || mv.y !== 0;
    if (p.moving) {
      const sp = moveSpeed();
      p.x += mv.x * sp * dt; p.y += mv.y * sp * dt;
      p.face = Math.atan2(mv.y, mv.x);
      p.walk += dt * 12;
      p.dustT = (p.dustT || 0) - dt;
      if (p.dustT <= 0) { p.dustT = 0.09; particles.push({ x: p.x + rand(-4, 4), y: p.y + rand(-3, 3), h: 0.05, vh: rand(0.3, 0.8), vx: rand(-20, 20), vy: rand(-20, 20), life: 0.45, max: 0.45, col: '#7a6a50', size: 2.5 }); }
      p.volleys = [];
    }
    pushOut(p, p.r, true);
    if (roomClear && gateOpen >= 1 && Math.abs(p.x - GATE_X) < GATE_W / 2) p.y = Math.max(p.y, ARENA.y + p.r - 4);

    p.fireCd -= dt;
    if (!p.moving && p.fireCd <= 0) {
      const t = pickTarget();
      if (t) {
        p.face = angTo(p, t);
        const n = 1 + sk('multi');
        for (let k = 0; k < n; k++) p.volleys.push({ t: k * 0.11, target: t });
        p.fireCd = fireInterval();
      }
    }
    for (const v of p.volleys) {
      v.t -= dt;
      if (v.t <= 0) {
        if (v.target && !v.target.dead) p.face = angTo(p, v.target);
        fireVolley(p.face);
        v.done = true;
      }
    }
    p.volleys = p.volleys.filter(v => !v.done);

    // Тұмар — orbiting charms
    const no = sk('orbit');
    if (no) {
      p.orbitA += dt * 3.2;
      for (let i = 0; i < no; i++) {
        const a = p.orbitA + i * TAU / no;
        const ox = p.x + Math.cos(a) * 44, oy = p.y + Math.sin(a) * 44;
        for (const e of enemies) {
          if (e.spawn > 0 || e.dead) continue;
          if (Math.hypot(e.x - ox, e.y - oy) < e.r + 8) {
            const key = e, last = p.orbitHits.get(key) || 0;
            if (time - last > 0.45) { p.orbitHits.set(key, time); hitEnemy(e, atk() * 0.55, { col: '#e3c6ff' }); }
          }
        }
      }
    }

    // Бүркіт — golden eagle companion
    const eg = p.eagle;
    eg.a += dt;
    const tx = p.x - 22 + Math.cos(eg.a * 1.3) * 8, ty = p.y - 30 + Math.sin(eg.a * 2.1) * 5;
    eg.x += (tx - eg.x) * Math.min(1, dt * 5); eg.y += (ty - eg.y) * Math.min(1, dt * 5);
    if (sk('eagle')) {
      eg.cd -= dt;
      if (eg.cd <= 0) {
        const t = pickTarget();
        if (t) {
          eg.cd = 1.15 - 0.2 * sk('eagle');
          const a = angTo(eg, t);
          arrows.push({ x: eg.x, y: eg.y, vx: Math.cos(a) * 480, vy: Math.sin(a) * 480, ang: a, dmg: atk() * (0.5 + 0.25 * sk('eagle')), kind: 'feather',
            pierce: 0, rico: 0, wall: 0, hit: new Set(), life: 1.4, fire: false, ice: false });
        }
      }
    }
  }

  function updateArrows(dt) {
    for (const a of arrows) {
      a.x += a.vx * dt; a.y += a.vy * dt; a.life -= dt;
      if (a.x < ARENA.x || a.x > AX2) { if (a.wall > 0) { a.wall--; a.vx *= -1; a.x = clamp(a.x, ARENA.x, AX2); } else a.dead = true; }
      if (a.y < ARENA.y || a.y > AY2) { if (a.wall > 0) { a.wall--; a.vy *= -1; a.y = clamp(a.y, ARENA.y, AY2); } else a.dead = true; }
      const o = !a.dead && solidAt(a.x, a.y, 0);
      if (o) {
        if (a.wall > 0) {
          a.wall--;
          const ox = Math.min(a.x - o.x, o.x + o.w - a.x), oy = Math.min(a.y - o.y, o.y + o.h - a.y);
          if (ox < oy) { a.vx *= -1; a.x += Math.sign(a.vx) * (ox + 1); } else { a.vy *= -1; a.y += Math.sign(a.vy) * (oy + 1); }
        } else { a.dead = true; burst(a.x, a.y, '#cfc3a8', 4, 60, 2); }
      }
      a.ang = Math.atan2(a.vy, a.vx);
      if (a.dead) continue;
      for (const c of crates) if (!c.open && Math.hypot(c.x - a.x, c.y - a.y) < 16) { openCrate(c); a.dead = true; }
      if (a.dead) continue;
      for (const e of enemies) {
        if (e.dead || e.spawn > 0 || a.hit.has(e)) continue;
        if (Math.hypot(e.x - a.x, e.y - a.y) < e.r + 4) {
          a.hit.add(e);
          hitEnemy(e, a.dmg, { fire: a.fire, ice: a.ice, kb: a.ang });
          if (a.pierce > 0) { a.pierce--; a.dmg *= 0.67; continue; }
          if (a.rico > 0) {
            let nb = null, nd = 190;
            for (const o2 of enemies) {
              if (o2.dead || o2.spawn > 0 || a.hit.has(o2)) continue;
              const dd = Math.hypot(o2.x - a.x, o2.y - a.y);
              if (dd < nd) { nd = dd; nb = o2; }
            }
            if (nb) { a.rico--; a.dmg *= 0.7; const an = angTo(a, nb); a.vx = Math.cos(an) * 560; a.vy = Math.sin(an) * 560; a.life = 1; break; }
          }
          a.dead = true; break;
        }
      }
      if (a.life <= 0) a.dead = true;
    }
    arrows = arrows.filter(a => !a.dead);
  }

  function updateBullets(dt) {
    for (const b of bullets) {
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.x < ARENA.x - 10 || b.x > AX2 + 10 || b.y < ARENA.y - 10 || b.y > AY2 + 10 || b.life <= 0) { b.dead = true; continue; }
      if (solidAt(b.x, b.y, 0)) { b.dead = true; burst(b.x, b.y, '#bba98a', 4, 60, 2); continue; }
      if (Math.hypot(b.x - player.x, b.y - player.y) < b.r + player.r * 0.75) {
        if (player.inv <= 0) { hurtPlayer(b.dmg, b.src); b.dead = true; }
      }
    }
    bullets = bullets.filter(b => !b.dead);
  }

  function updatePickups(dt) {
    for (const p of pickups) {
      p.t += dt;
      const d = Math.hypot(player.x - p.x, player.y - p.y);
      if (p.t > 0.45 && (d < 70 * (1 + run.S.magnet) || roomClear)) {
        const a = Math.atan2(player.y - p.y, player.x - p.x), s = 520;
        p.vx += Math.cos(a) * s * dt * 6; p.vy += Math.sin(a) * s * dt * 6;
        const sp = Math.hypot(p.vx, p.vy), mx = 480;
        if (sp > mx) { p.vx *= mx / sp; p.vy *= mx / sp; }
      } else { p.vx *= 0.9; p.vy *= 0.9; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.x = clamp(p.x, ARENA.x + 4, AX2 - 4); p.y = clamp(p.y, ARENA.y + 4, AY2 - 4);
      if (d < 16 && p.t > 0.3) {
        p.dead = true;
        if (p.kind === 'xp') gainXp(p.v);
        else if (p.kind === 'coin') { const c = Math.max(1, Math.round(p.v * (1 + run.S.loot))); run.coins += c; questEvent('coins', c); }
        else if (p.kind === 'bonus') applyBonus(p.item);
        else healPlayer(player.maxHp * 0.15);
        Sound.pick();
      }
    }
    pickups = pickups.filter(p => !p.dead);
  }

