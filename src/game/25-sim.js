  // =================================================================== balance simulation (test mode only)
  // A bot plays full runs without rendering: dodges bullets it notices, keeps distance from melee enemies,
  // stands still to shoot, throws bombs at crowds, takes random skills. `skill` sets reaction time and mistakes.
  function botDecide() {
    const p = player, sk2 = SIM.skill;
    let fx = 0, fy = 0;
    const look = 60 + 70 * sk2;
    for (const b of bullets) {
      if (Math.random() > 0.55 + 0.45 * sk2) continue;   // did not notice this one
      const rx = p.x - b.x, ry = p.y - b.y, d = Math.hypot(rx, ry);
      if (d > look) continue;
      const sp = Math.hypot(b.vx, b.vy) || 1, ux = b.vx / sp, uy = b.vy / sp;
      if (rx * ux + ry * uy < 0) continue;
      const perp = rx * -uy + ry * ux;
      if (Math.abs(perp) > b.r + p.r + 12) continue;
      const sgn = perp >= 0 ? 1 : -1, w = (look - d) / look;
      fx += -uy * sgn * w * 2; fy += ux * sgn * w * 2;
    }
    // a wolf crouching for a dash (red ring) gets side-stepped, like a bullet
    for (const e of enemies) {
      if (e.ai !== 'wolf' || e.st !== 'wind' || Math.random() > 0.5 + 0.5 * sk2) continue;
      const rx = p.x - e.x, ry = p.y - e.y, d = Math.hypot(rx, ry) || 1;
      if (d > 180) continue;
      const s = (rx * 0.3 - ry) >= 0 ? 1 : -1; fx += -ry / d * s * 2.2; fy += rx / d * s * 2.2;
    }
    for (const e of enemies) {
      if (e.spawn > 0 || e.dead) continue;
      const rx = p.x - e.x, ry = p.y - e.y, d = Math.hypot(rx, ry) || 1;
      const keep = e.boss ? 150 : (e.ai === 'wolf' || e.ai === 'spider' ? 105 : 75);
      if (d < keep) { const w = (keep - d) / keep * 1.6; fx += rx / d * w; fy += ry / d * w; }
    }
    const m = 34;
    if (p.x < ARENA.x + m) fx += 0.7; if (p.x > AX2 - m) fx -= 0.7; if (p.y < ARENA.y + m) fy += 0.7; if (p.y > AY2 - m) fy -= 0.7;
    let l = Math.hypot(fx, fy);
    // nothing to dodge but no clear shot: walk around cover toward the nearest enemy, like a player would
    if (l <= 0.3 && !enemies.some(e => e.spawn <= 0 && !e.dead && lineOfSight(p, e))) {
      let t = null, bd = 1e9;
      for (const e of enemies) { if (e.spawn > 0 || e.dead) continue; const d = dist(p, e); if (d < bd) { bd = d; t = e; } }
      if (t) { const a = pathAngleFor(p, t); fx = Math.cos(a); fy = Math.sin(a); l = 1; }
    }
    SIM.mv = l > 0.3 ? { x: fx / l, y: fy / l } : { x: 0, y: 0 };
    if (run.bombs > 0) {
      let near = 0, bossNear = false;
      for (const e of enemies) { if (e.spawn > 0) continue; const d = dist(p, e); if (d < 130) near++; if (e.boss && d < 170) bossNear = true; }
      if (near >= 3 || bossNear) throwBomb();
    }
  }

  // route around cover using the grid (BFS from the target cell), falls back to a straight line
  function pathAngleFor(a, b) {
    const [tc, tr] = cellOf(b.x, b.y), [sc, sr] = cellOf(a.x, a.y);
    const D = new Int16Array(COLS * ROWS).fill(-1), q = [[tc, tr]]; D[tr * COLS + tc] = 0;
    while (q.length) {
      const [c, r] = q.shift(), v = D[r * COLS + c];
      for (const [dc, dr] of DIRS) { const nc = c + dc, nr = r + dr; if (cellBlocked(nc, nr) || D[nr * COLS + nc] >= 0) continue; if (dc && dr && (cellBlocked(c + dc, r) || cellBlocked(c, r + dr))) continue; D[nr * COLS + nc] = v + 1; q.push([nc, nr]); }
    }
    let best = null, bv = D[sr * COLS + sc] < 0 ? 9999 : D[sr * COLS + sc];
    for (const [dc, dr] of DIRS) { const nc = sc + dc, nr = sr + dr; if (cellBlocked(nc, nr)) continue; const v = D[nr * COLS + nc]; if (v >= 0 && v < bv) { bv = v; best = [nc, nr]; } }
    if (!best) return angTo(a, b);
    return Math.atan2(ARENA.y + best[1] * CELL + CELL / 2 - a.y, ARENA.x + best[0] * CELL + CELL / 2 - a.x);
  }

  function simRun(skill, revive) {
    SIM.on = true; SIM.skill = skill; SIM.noRevive = !revive; SIM.next = 0;
    newRun();
    const rooms = [];
    let cur = null, steps = 0;
    const startRoom = () => { cur = { room: run.room, t: 0, dmg: 0, maxHp: player.maxHp }; };
    startRoom();
    while (steps++ < 60 * 60 * 40 && scene === 'play') {
      if (modal === 'levelup') { pickCard(Math.floor(Math.random() * choices.length)); continue; }
      if (modal === 'kydyr') { healPlayer(player.maxHp * 0.4); modal = null; if (kydyrNext) kydyrNext(); continue; }
      if (modal === 'revive') { if (!SIM.noRevive && canRevive()) doRevive(); else declineRevive(); continue; }
      if (cur.room !== run.room) { rooms.push(cur); startRoom(); }
      SIM.next -= DT;
      if (SIM.next <= 0) { SIM.next = 0.36 - 0.22 * skill; botDecide(); }
      if (roomClear && gateOpen >= 1 && !fadeDir) { player.x = GATE_X; player.y = ARENA.y + player.r; }
      else if (!roomClear && introT <= 0 && !fadeDir) cur.t += DT;
      const hp0 = player.hp;
      update(DT); tickFx(DT); hitStop = 0; slowT = 0;
      if (player.hp < hp0) cur.dmg += hp0 - player.hp;
    }
    rooms.push(cur);
    SIM.on = false; SIM.mv = { x: 0, y: 0 };
    const res = { won: scene === 'victory', room: run.room, level: run.level, revived: !!run.revived, rooms };
    scene = 'menu'; modal = null;
    return res;
  }

  function simBatch(o) {
    const runs = o.runs || 20, skill = o.skill === undefined ? 0.6 : o.skill;
    const keep = { bank, upAtk, upHp };
    const out = { runs, skill, wins: 0, deaths: {}, revives: 0, time: 0, roomTime: {}, roomDmg: {}, roomN: {}, dmgBy: {} };
    SIM.dmgBy = {};
    for (let i = 0; i < runs; i++) {
      bank = o.bank === undefined ? 0 : o.bank; upAtk = o.upAtk || 0; upHp = o.upHp || 0;
      const r = simRun(skill, o.revive !== false);
      if (r.won) out.wins++; else out.deaths[r.room] = (out.deaths[r.room] || 0) + 1;
      if (r.revived) out.revives++;
      for (const rm of r.rooms) {
        out.time += rm.t;
        out.roomTime[rm.room] = (out.roomTime[rm.room] || 0) + rm.t;
        out.roomDmg[rm.room] = (out.roomDmg[rm.room] || 0) + rm.dmg / rm.maxHp;
        out.roomN[rm.room] = (out.roomN[rm.room] || 0) + 1;
      }
    }
    for (const k in out.roomN) { out.roomTime[k] = +(out.roomTime[k] / out.roomN[k]).toFixed(1); out.roomDmg[k] = Math.round(out.roomDmg[k] / out.roomN[k] * 100); }
    out.time = +(out.time / runs / 60).toFixed(1);
    const tot = Object.values(SIM.dmgBy).reduce((a, b) => a + b, 0) || 1;
    for (const k of Object.keys(SIM.dmgBy).sort((a, b) => SIM.dmgBy[b] - SIM.dmgBy[a])) out.dmgBy[k] = Math.round(SIM.dmgBy[k] / tot * 100) + '%';
    bank = keep.bank; upAtk = keep.upAtk; upHp = keep.upHp; saveProgress();
    return out;
  }
