  // =================================================================== combat: player
  function pickTarget() {
    let bestE = null, bestD = 1e9, bestLos = false;
    for (const e of enemies) {
      if (e.spawn > 0 || e.dead) continue;
      const d = dist(player, e);
      const los = lineOfSight(player, e);
      if ((los && !bestLos) || (los === bestLos && d < bestD)) { bestE = e; bestD = d; bestLos = los; }
    }
    return bestE;
  }

  const heavyOn = () => !!(player && player.weapon && player.weapon.kind === 'w_heavy');
  function spawnArrow(x, y, ang, dmg, kind) {
    arrows.push({
      x, y, vx: Math.cos(ang) * 560, vy: Math.sin(ang) * 560, ang, dmg, kind: kind || 'arrow',
      pierce: sk('pierce') + (heavyOn() ? 2 : 0), rico: sk('rico'), wall: sk('wall') * 2, hit: new Set(), life: 1.6,
      fire: sk('fire') > 0, ice: sk('ice') > 0, heavy: heavyOn(),
    });
  }

  function fireVolley(ang) {
    const dmg = atk() * Math.pow(0.9, sk('multi')) * Math.pow(0.9, sk('front')) * (heavyOn() ? 1.8 : 1);
    const nf = 1 + sk('front');
    const px = -Math.sin(ang), py = Math.cos(ang);
    for (let i = 0; i < nf; i++) {
      const off = (i - (nf - 1) / 2) * 9;
      spawnArrow(player.x + px * off, player.y + py * off, ang, dmg);
    }
    const extra = [];
    if (player.weapon && player.weapon.kind === 'w_triple') extra.push(0.24, -0.24);
    if (sk('diag') >= 1) extra.push(0.7, -0.7);
    if (sk('diag') >= 2) extra.push(0.35, -0.35);
    if (sk('side') >= 1) extra.push(Math.PI / 2, -Math.PI / 2);
    if (sk('side') >= 2) extra.push(Math.PI / 2 + 0.4, -Math.PI / 2 - 0.4);
    if (sk('rear') >= 1) extra.push(Math.PI);
    for (const da of extra) spawnArrow(player.x, player.y, ang + da, dmg * 0.85);
    player.atkAnim = 0.18;
    burst(player.x + Math.cos(ang) * 16, player.y + Math.sin(ang) * 16, '#fff2c0', 3, 70, 2);
    Sound.shoot();
  }

  function hitEnemy(e, dmg, opts) {
    if (e.dead || e.spawn > 0) return;
    let d = dmg, crit = false;
    if (!opts.noCrit && Math.random() < player.crit) { d *= player.critMul; crit = true; }
    e.hp -= d; e.flash = 0.1; e.punch = 1;
    burst(e.x, e.y, crit ? '#ffb040' : '#fff0c0', crit ? 8 : 4, 130, 2.2);
    if (crit) { hitStop = Math.max(hitStop, 0.025); shake = Math.max(shake, 3); }
    floatText(e.x, e.y, String(Math.round(d)), crit ? '#ff9b2f' : (opts.col || '#ffffff'), crit ? 17 : 13, MODEL_H[e.type] + 0.15);
    if (opts.fire) { e.burn = 2.2; e.burnDmg = atk() * 0.12 * sk('fire'); }
    if (opts.ice) e.slow = 1.6;
    if (!e.boss && opts.kb) { e.kx += Math.cos(opts.kb) * 90; e.ky += Math.sin(opts.kb) * 90; }
    if (!opts.silent) Sound.hit();
    if (e.hp <= 0) killEnemy(e);
  }

  function killEnemy(e) {
    if (e.dead) return;
    e.dead = true;
    run.kills++;
    questEvent('kill'); if (e.type === 'w') questEvent('wolf'); if (e.boss) { questEvent('boss'); run.gems += 3; }
    Sound.kill();
    const col = { w: '#9a9ea8', s: '#5b3a24', j: '#c4572f', a: '#dfe9f2', m: '#6d4c8f', D: '#a8683a', J: '#7a4fa0', A: '#3b9a5b' }[e.type];
    burst(e.x, e.y, col, e.boss ? 60 : 16, e.boss ? 260 : 150, e.boss ? 5 : 3.5);
    burst(e.x, e.y, '#ffe08a', e.boss ? 30 : 6, 120, 2.5);
    hitStop = Math.max(hitStop, e.boss ? 0.28 : 0.045);
    addFx('ring', e.x, e.y, { col, size: e.boss ? 4.5 : 1.5, max: e.boss ? 0.8 : 0.45 });
    addFx('wisp', e.x, e.y, { col: '#fff6d0', size: e.boss ? 3 : 1.1, max: 0.8 });
    if (e.boss) slowT = 1.0;
    if (e.boss) { shake = 18; Sound.boom(); buzz([60, 40, 110]); }
    const gems = Math.ceil(e.xp / 3);
    for (let i = 0; i < gems; i++) dropPickup(e.x, e.y, 'xp', e.xp / gems);
    const coinV = e.coin * (isSurv() ? 1.5 : 1), coins = Math.min(12, Math.ceil(coinV));   // the arena is the place to farm coins
    for (let i = 0; i < coins; i++) dropPickup(e.x, e.y, 'coin', coinV / coins);
    if (Math.random() < (e.boss ? 1 : 0.09)) dropPickup(e.x, e.y, 'heart', 0);
    if (e.boss) dropBonus(e.x, e.y, randomItem()); else if (Math.random() < 0.05) dropBonus(e.x, e.y, randomItem());
    if (sk('blood')) healPlayer(player.maxHp * 0.02 * sk('blood'));
  }

  function dropBonus(x, y, item) { const a = Math.random() * TAU; pickups.push({ x, y, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, kind: 'bonus', item, v: 0, t: 0 }); }
  function openCrate(c) {
    if (c.open) return;
    questEvent('crate');
    c.open = true; Sound.crate();
    burst(c.x, c.y, '#b07a3e', 18, 160, 3); burst(c.x, c.y, '#ffe08a', 8, 120, 2.5);
    addFx('ring', c.x, c.y, { col: '#ffd24a', size: 1.6, max: 0.45 });
    dropBonus(c.x, c.y, randomItem());
    for (let i = 0; i < 4; i++) dropPickup(c.x, c.y, 'coin', 1);
  }
  function applyBonus(item) {
    const it = ITEMS[item];
    floatText(player.x, player.y, it.name[lang], it.col, 15, 2.1);
    addFx('ring', player.x, player.y, { col: it.col, size: 2, max: 0.5 });
    if (item === 'medkit') healPlayer(player.maxHp * 0.35);
    else if (item === 'bomb') run.bombs = Math.min(3, run.bombs + 1);
    else if (item === 'shield') player.shield = 2;
    else player.weapon = { kind: item, t: WEAPON_TIME };
    Sound.level();
  }
  // bomb: thrown at the nearest enemy (or straight ahead), explodes after a short arc
  function throwBomb() {
    if (scene !== 'play' || modal || introT > 0 || !run || run.bombs <= 0) return;
    run.bombs--; questEvent('bomb');
    let tx = player.x + Math.cos(player.face) * 120, ty = player.y + Math.sin(player.face) * 120, bd = 1e9;
    for (const e of enemies) { if (e.dead || e.spawn > 0) continue; const d = dist(player, e); if (d < bd && d < 260) { bd = d; tx = e.x; ty = e.y; } }
    thrown.push({ x0: player.x, y0: player.y, x1: clamp(tx, ARENA.x + 10, AX2 - 10), y1: clamp(ty, ARENA.y + 10, AY2 - 10), t: 0 });
    Sound.shoot();
  }
  function explode(x, y) {
    const R = 115;
    shake = Math.max(shake, 14); hitStop = Math.max(hitStop, 0.08); Sound.boom();
    burst(x, y, '#ff8a2a', 40, 260, 4); burst(x, y, '#ffe08a', 24, 200, 3); burst(x, y, '#3a3028', 20, 140, 4);
    addFx('ring', x, y, { col: '#ff8a2a', size: 6, max: 0.6 });
    addFx('pillar', x, y, { col: '#ff9a3a', size: 2.4, max: 0.5 });
    for (const e of enemies) {
      if (e.dead || e.spawn > 0) continue;
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < R + e.r) hitEnemy(e, atk() * (e.boss ? 5 : 7), { noCrit: true, kb: Math.atan2(e.y - y, e.x - x), col: '#ffb040' });
    }
    for (const c of crates) if (!c.open && Math.hypot(c.x - x, c.y - y) < R) openCrate(c);
    bullets = bullets.filter(b => Math.hypot(b.x - x, b.y - y) > R);
  }

  function dropPickup(x, y, kind, v) {
    const a = Math.random() * TAU, s = rand(60, 170);
    pickups.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, kind, v, t: 0 });
  }

  function healPlayer(h) {
    const before = player.hp;
    player.hp = Math.min(player.maxHp, player.hp + h);
    const got = Math.round(player.hp - before);
    if (got > 0) floatText(player.x, player.y, '+' + got, '#7cf07a', 13);
  }

  function hurtPlayer(dmg, src) {
    if (player.inv > 0 || scene !== 'play' || (TEST_MODE && !SIM.on)) return;
    if (player.shield > 0) {
      player.shield--; player.inv = 0.6; Sound.shield();
      floatText(player.x, player.y, tr('blocked'), '#8fdcff', 15, 1.9);
      addFx('ring', player.x, player.y, { col: '#5fc8ff', size: 1.8, max: 0.4 });
      return;
    }
    dmg = Math.max(1, Math.round(dmg * (1 - (player.armor || 0))));
    run.roomDmg += dmg;
    if (SIM.on && src) SIM.dmgBy[src] = (SIM.dmgBy[src] || 0) + dmg;
    player.hp -= dmg; player.inv = 0.9; shake = Math.max(shake, 8); hitStop = Math.max(hitStop, 0.06); hurtFlash = 0.4;
    floatText(player.x, player.y, '-' + dmg, '#ff4b4b', 15);
    Sound.hurt();
    if (player.hp <= 0) {
      player.hp = 0;
      burst(player.x, player.y, '#1d4f91', 30, 180, 4);
      if (!run.revived && !SIM.noRevive) { modal = 'revive'; reviveT = REVIVE_TIME; joy.active = false; }
      else endRun(false);
    }
  }

  // one revive per run: pay coins (this run's first, then the saved ones), get half health back and a moment of safety
  const canRevive = () => run && !run.revived && run.coins + bank >= REVIVE_COST;
  function doRevive() {
    if (!canRevive()) return;
    const fromRun = Math.min(run.coins, REVIVE_COST);
    run.coins -= fromRun; bank -= REVIVE_COST - fromRun; saveProgress();
    run.revived = true; modal = null;
    player.hp = Math.round(player.maxHp * 0.5); player.inv = 2.5;
    bullets = [];
    for (const e of enemies) { const a = angTo(player, e); if (!e.boss) { e.kx += Math.cos(a) * 260; e.ky += Math.sin(a) * 260; } }
    addFx('pillar', player.x, player.y, { col: '#7cf07a', size: 1.5, max: 1.0 });
    addFx('ring', player.x, player.y, { col: '#7cf07a', size: 5, max: 0.7 });
    burst(player.x, player.y, '#b8ffb0', 30, 200, 3);
    Sound.level();
  }
  function declineRevive() { modal = null; endRun(false); }

  function endRun(won) {
    if (scene !== 'play') return;
    scene = won ? 'victory' : 'dead';
    endT = 0; modal = null;
    if (!SIM.on) { if (isSurv()) survivalRewards(); else runRewards(won); }
    bank += run.coins; saveProgress();
    const reached = won ? TOTAL_ROOMS : run.room;
    if (!isSurv() && reached > best) { best = reached; saveProgress(); }
  }

  function gainXp(v) {
    run.xp += v;
    while (run.xp >= xpNeed(run.level)) {
      run.xp -= xpNeed(run.level);
      run.level++; questEvent('level', run.level);
      run.pendingLv++;
    }
  }

  function rollChoices() {
    const pool = SKILLS.filter(s => sk(s.id) < s.max);
    const out = [];
    while (out.length < 3 && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return out;
  }

  function applySkill(s) {
    run.sk[s.id] = sk(s.id) + 1;
    if (s.id === 'hp') { const add = player.maxHp * 0.2; player.maxHp = Math.round(player.maxHp + add); healPlayer(add); }
    if (s.id === 'crit') { player.crit += 0.1; player.critMul += 0.25; }
  }

