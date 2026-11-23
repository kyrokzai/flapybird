  // =================================================================== UI layer (2D canvas over the 3D view)
  function txt(s, x, y, size, color, o) {
    o = o || {};
    ctx.font = `${o.weight || 700} ${size}px ${FONT}`;
    ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
    if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.lw || size * 0.2; ctx.strokeStyle = o.stroke; ctx.strokeText(s, x, y); }
    ctx.fillStyle = color; ctx.fillText(s, x, y);
  }
  function wrap(s, x, y, maxW, lh, size, color, o) {
    ctx.font = `${(o && o.weight) || 500} ${size}px ${FONT}`;
    const words = s.split(' '), lines = [];
    let line = '';
    for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
    if (line) lines.push(line);
    lines.forEach((l, i) => txt(l, x, y + i * lh, size, color, Object.assign({ weight: 500 }, o)));
  }
  function fitText(s, maxW, size, weight) {
    ctx.font = `${weight || 900} ${size}px ${FONT}`;
    while (size > 9 && ctx.measureText(s).width > maxW) { size--; ctx.font = `${weight || 900} ${size}px ${FONT}`; }
    return size;
  }

  function button(x, y, w, h, label, fn, o) {
    o = o || {};
    const c1 = o.col || C.gold, c2 = o.col2 || '#e08a1a';
    ctx.save();
    if (o.disabled) ctx.globalAlpha = 0.5;
    rr(ctx, x, y + 4, w, h, 12); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    rr(ctx, x, y, w, h, 12); ctx.fillStyle = C.ink; ctx.fill();
    rr(ctx, x + 3, y + 3, w - 6, h - 6, 9);
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fill();
    rr(ctx, x + 8, y + 6, w - 16, 5, 2.5); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
    const size = fitText(label, w - 18, o.size || 18);
    txt(label, x + w / 2, y + h / 2 + 1, size, '#ffffff', { stroke: C.ink, lw: 4, weight: 900 });
    ctx.restore();
    ui.push({ x, y, w, h, fn: o.disabled ? null : fn, tag: o.tag });
  }

  function panel(x, y, w, h) {
    rr(ctx, x, y + 5, w, h, 16); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    rr(ctx, x, y, w, h, 16); ctx.fillStyle = C.ink; ctx.fill();
    rr(ctx, x + 3, y + 3, w - 6, h - 6, 13); ctx.fillStyle = C.cream; ctx.fill();
    rr(ctx, x + 8, y + 8, w - 16, h - 16, 9); ctx.strokeStyle = '#d6b471'; ctx.lineWidth = 2; ctx.stroke();
    for (const [cx, cy, a] of [[x + 20, y + 20, 0], [x + w - 20, y + 20, 0], [x + 20, y + h - 20, Math.PI], [x + w - 20, y + h - 20, Math.PI]]) {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); koshkar(ctx, 0, 0, 14, C.red, 1.8); ctx.restore();
    }
  }

  function heart(x, y, s, color) {
    ctx.fillStyle = color; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x, y + s * 0.8);
    ctx.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.6, y - s * 1.1, x, y - s * 0.35);
    ctx.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.8);
    ctx.fill(); ctx.stroke();
  }

  function skillIcon(id, x, y, s) {
    const sd = SKILL[id];
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = C.teal; ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.scale(s / 20, s / 20);
    const c = sd.col;
    const arrow = (ax, ay, a, len) => {
      ctx.save(); ctx.translate(ax, ay); ctx.rotate(a);
      ctx.strokeStyle = c; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-len / 2, 0); ctx.lineTo(len / 2, 0); ctx.moveTo(len / 2 - 4, -3.5); ctx.lineTo(len / 2, 0); ctx.lineTo(len / 2 - 4, 3.5); ctx.stroke();
      ctx.restore();
    };
    const U = -Math.PI / 2;
    ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    switch (id) {
      case 'multi': arrow(0, -3, U, 14); arrow(0, 6, U, 10); break;
      case 'front': arrow(-4, 0, U, 18); arrow(4, 0, U, 18); break;
      case 'diag': arrow(0, 2, U, 16); arrow(-5, 2, U - 0.7, 16); arrow(5, 2, U + 0.7, 16); break;
      case 'side': arrow(-6, 0, Math.PI, 12); arrow(6, 0, 0, 12); ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, TAU); ctx.fill(); break;
      case 'rear': arrow(0, -5, U, 10); arrow(0, 6, Math.PI / 2, 10); break;
      case 'pierce': ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.stroke(); arrow(0, 0, 0, 24); break;
      case 'rico': ctx.beginPath(); ctx.moveTo(-10, 8); ctx.lineTo(-2, -6); ctx.lineTo(4, 4); ctx.stroke(); arrow(7, -1, -0.9, 9); break;
      case 'wall': ctx.fillRect(7, -11, 3, 22); ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(5, 0); ctx.stroke(); arrow(-2, 6, Math.PI - 0.5, 12); break;
      case 'atk': arrow(0, 0, U + 0.6, 20); arrow(0, 0, U - 0.6, 20); break;
      case 'spd': arrow(3, 0, 0, 14); ctx.beginPath(); ctx.moveTo(-11, -5); ctx.lineTo(-5, -5); ctx.moveTo(-12, 0); ctx.lineTo(-6, 0); ctx.moveTo(-11, 5); ctx.lineTo(-5, 5); ctx.stroke(); break;
      case 'crit': ctx.beginPath(); ctx.moveTo(-11, 0); ctx.quadraticCurveTo(0, -10, 11, 0); ctx.quadraticCurveTo(0, 10, -11, 0); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 3.6, 0, TAU); ctx.fill(); break;
      case 'hp': heart(0, 1, 9, '#ff5a5f'); break;
      case 'blood': ctx.fillStyle = '#ff4b4b'; ctx.beginPath(); ctx.moveTo(0, -10); ctx.quadraticCurveTo(9, 2, 0, 9); ctx.quadraticCurveTo(-9, 2, 0, -10); ctx.fill(); break;
      case 'fire': ctx.beginPath(); ctx.moveTo(0, 10); ctx.quadraticCurveTo(-10, 4, -4, -4); ctx.quadraticCurveTo(-2, 0, 0, -11); ctx.quadraticCurveTo(10, -2, 6, 6); ctx.quadraticCurveTo(4, 10, 0, 10); ctx.fill(); ctx.fillStyle = '#ffe17a'; ctx.beginPath(); ctx.arc(0, 4, 3, 0, TAU); ctx.fill(); break;
      case 'ice': for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(i * Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(0, 11); ctx.moveTo(-3, -8); ctx.lineTo(0, -5); ctx.lineTo(3, -8); ctx.moveTo(-3, 8); ctx.lineTo(0, 5); ctx.lineTo(3, 8); ctx.stroke(); ctx.restore(); } break;
      case 'orbit': ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.lineWidth = 1.2; ctx.stroke(); ctx.beginPath(); ctx.arc(9, 0, 3.4, 0, TAU); ctx.arc(-4.5, 7.8, 3.4, 0, TAU); ctx.arc(-4.5, -7.8, 3.4, 0, TAU); ctx.fill(); break;
      case 'eagle': ctx.beginPath(); ctx.moveTo(-12, -4); ctx.quadraticCurveTo(-6, -8, 0, -1); ctx.quadraticCurveTo(6, -8, 12, -4); ctx.quadraticCurveTo(6, 0, 1, 6); ctx.lineTo(-1, 6); ctx.quadraticCurveTo(-6, 0, -12, -4); ctx.fill(); break;
      case 'speed': ctx.beginPath(); ctx.moveTo(-10, 6); ctx.quadraticCurveTo(-2, -12, 12, -8); ctx.quadraticCurveTo(4, -6, 8, -2); ctx.quadraticCurveTo(0, -2, 4, 3); ctx.quadraticCurveTo(-4, 3, -10, 6); ctx.fill(); break;
    }
    ctx.restore();
  }

  function drawKydyr(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const halo = ctx.createRadialGradient(0, -10, 4, 0, -10, 40);
    halo.addColorStop(0, 'rgba(255,240,170,0.75)'); halo.addColorStop(1, 'rgba(255,240,170,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, -10, 40, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#7a5428'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(13, 20); ctx.lineTo(15, -24); ctx.quadraticCurveTo(15, -30, 10, -29); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
    ctx.fillStyle = '#f4f0e4';
    ctx.beginPath(); ctx.moveTo(-14, 20); ctx.quadraticCurveTo(-15, -4, -7, -8); ctx.lineTo(7, -8); ctx.quadraticCurveTo(15, -4, 14, 20); ctx.quadraticCurveTo(0, 24, -14, 20); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, 21); ctx.stroke();
    ctx.fillStyle = '#e6b88e'; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(0, -15, 7, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(-6, -14); ctx.quadraticCurveTo(-7, 0, 0, 8); ctx.quadraticCurveTo(7, 0, 6, -14); ctx.quadraticCurveTo(0, -10, -6, -14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-2.4, -16, 0.9, 0, TAU); ctx.arc(2.4, -16, 0.9, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(-7.5, -18); ctx.quadraticCurveTo(-8, -28, 0, -29); ctx.quadraticCurveTo(8, -28, 7.5, -18); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = C.gold; ctx.beginPath(); ctx.moveTo(-7, -20); ctx.lineTo(7, -20); ctx.stroke();
    ctx.restore();
  }

  function drawHud() {
    const hg = ctx.createLinearGradient(0, 0, 0, 70);
    hg.addColorStop(0, 'rgba(7,30,38,0.92)'); hg.addColorStop(1, 'rgba(7,30,38,0.78)');
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, 66);
    ornamentBand(ctx, 0, 62, W, 10, C.red, C.gold);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(28, 22, 17, 0, TAU); ctx.fill();
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(28, 22, 14, 0, TAU); ctx.fill();
    txt(String(run.level), 28, 23, 15, '#fff', { stroke: C.ink, lw: 3, weight: 900 });
    const bx = 50, bw = 250;
    rr(ctx, bx, 15, bw, 14, 7); ctx.fillStyle = C.ink; ctx.fill();
    const frac = clamp(run.xp / xpNeed(run.level), 0, 1);
    if (frac > 0) { rr(ctx, bx + 2, 17, Math.max(10, (bw - 4) * frac), 10, 5); ctx.fillStyle = '#3fd0e8'; ctx.fill(); }
    ctx.fillStyle = C.gold; ctx.strokeStyle = C.goldDk; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(20, 49, 7, 0, TAU); ctx.fill(); ctx.stroke();
    txt('₸', 20, 49.5, 9, C.goldDk, { weight: 900 });
    txt(String(run.coins), 32, 49, 14, '#fff', { align: 'left', weight: 700 });
    txt(`${tr('room')} ${run.room}/${TOTAL_ROOMS}`, W / 2, 48, 15, C.gold, { weight: 900, stroke: C.ink, lw: 3 });
    rr(ctx, W - 46, 8, 36, 36, 9); ctx.fillStyle = C.ink; ctx.fill();
    rr(ctx, W - 43, 11, 30, 30, 7); ctx.fillStyle = C.blueDk; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(W - 34, 18, 4, 16); ctx.fillRect(W - 26, 18, 4, 16);
    ui.push({ x: W - 50, y: 4, w: 46, h: 46, fn: () => { if (scene === 'play' && !modal) { modal = 'pause'; Sound.click(); } } });
    // bomb button (bottom right) — tap or E/B
    if (scene === 'play' && introT <= 0) {
      const bx = W - 52, by = H - 86, has = run.bombs > 0;
      ctx.save(); ctx.globalAlpha = has ? 1 : 0.45;
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(bx, by + 3, 30, 0, TAU); ctx.fill();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(bx, by, 30, 0, TAU); ctx.fill();
      const gr = ctx.createLinearGradient(0, by - 27, 0, by + 27); gr.addColorStop(0, '#ffb04a'); gr.addColorStop(1, '#d0561a');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(bx, by, 26, 0, TAU); ctx.fill();
      ctx.fillStyle = '#1e1e22'; ctx.beginPath(); ctx.arc(bx - 2, by + 3, 11, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#8a6a44'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(bx + 5, by - 6); ctx.quadraticCurveTo(bx + 9, by - 13, bx + 13, by - 12); ctx.stroke();
      ctx.fillStyle = '#fff2a0'; ctx.beginPath(); ctx.arc(bx + 13, by - 12, 3 + Math.random() * 1.2, 0, TAU); ctx.fill();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(bx + 20, by + 18, 11, 0, TAU); ctx.fill();
      txt(String(run.bombs), bx + 20, by + 19, 13, '#fff', { weight: 900 });
      ctx.restore();
      ui.push({ x: bx - 32, y: by - 32, w: 64, h: 64, fn: throwBomb });
      // active weapon and shield
      let sx = 12; const cy = enemies.some(e => e.boss && e.spawn <= 0) ? 112 : 80;
      const chip = (label, color, frac) => {
        ctx.font = `900 11px ${FONT}`; const w = ctx.measureText(label).width + 16;
        rr(ctx, sx, cy, w, 20, 10); ctx.fillStyle = 'rgba(7,30,38,0.85)'; ctx.fill();
        if (frac !== undefined) { rr(ctx, sx, cy, Math.max(10, w * frac), 20, 10); ctx.fillStyle = color + '55'; ctx.fill(); }
        rr(ctx, sx, cy, w, 20, 10); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
        txt(label, sx + w / 2, cy + 10.5, 11, '#fff', { weight: 900 }); sx += w + 6;
      };
      if (player.weapon) chip(ITEMS[player.weapon.kind].name[lang] + ' ' + Math.ceil(player.weapon.t), ITEMS[player.weapon.kind].col, player.weapon.t / WEAPON_TIME);
      if (player.shield > 0) chip(ITEMS.shield.name[lang] + ' ×' + player.shield, '#5fc8ff');
    }
    const boss = enemies.find(e => e.boss && e.spawn <= 0);
    if (boss) {
      const x = 40, w = W - 80, y = 80;
      rr(ctx, x, y, w, 12, 6); ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fill();
      rr(ctx, x + 2, y + 2, Math.max(4, (w - 4) * clamp(boss.hp / boss.maxHp, 0, 1)), 8, 4); ctx.fillStyle = '#e23a33'; ctx.fill();
      txt(boss.name[lang], W / 2, y + 22, 12, '#fff', { stroke: C.ink, lw: 3, weight: 900 });
    }
  }

  // health bars, damage numbers, gate arrow — positioned by projecting 3D points
  function drawWorldOverlay() {
    if (introT > 0) return;
    for (const e of enemies) {
      if (e.boss || e.spawn > 0 || e.hp >= e.maxHp) continue;
      const p = proj(e.x, MODEL_H[e.type] + 0.12, e.y), w = e.r * 2 + 8;
      ctx.fillStyle = 'rgba(0,0,0,0.65)'; rr(ctx, p.x - w / 2 - 1, p.y - 1, w + 2, 6, 3); ctx.fill();
      ctx.fillStyle = '#e0423a'; rr(ctx, p.x - w / 2, p.y, Math.max(2, w * clamp(e.hp / e.maxHp, 0, 1)), 4, 2); ctx.fill();
    }
    if (scene === 'play') {
      const p = proj(player.x, 1.85, player.y), w = 42;
      ctx.fillStyle = 'rgba(0,0,0,0.65)'; rr(ctx, p.x - w / 2 - 1, p.y - 1, w + 2, 7, 3); ctx.fill();
      ctx.fillStyle = '#5fd35a'; rr(ctx, p.x - w / 2, p.y, Math.max(3, w * clamp(player.hp / player.maxHp, 0, 1)), 5, 2.5); ctx.fill();
      txt(String(Math.ceil(player.hp)), p.x, p.y - 8, 11, '#fff', { stroke: C.ink, lw: 3, weight: 900 });
    }
    if (roomClear && gateOpen >= 1) {
      const p = proj(GATE_X, 0.2, ARENA.y + 30), b = Math.sin(time * 6) * 4;
      ctx.fillStyle = '#fff6c8'; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(p.x, p.y - 14 + b); ctx.lineTo(p.x + 12, p.y + b); ctx.lineTo(p.x + 5, p.y + b); ctx.lineTo(p.x + 5, p.y + 12 + b);
      ctx.lineTo(p.x - 5, p.y + 12 + b); ctx.lineTo(p.x - 5, p.y + b); ctx.lineTo(p.x - 12, p.y + b); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    for (const t of texts) {
      const p = proj(t.x, t.h, t.y);
      ctx.globalAlpha = clamp(t.life / 0.4, 0, 1);
      txt(t.t, p.x, p.y - t.rise, t.size, t.col, { stroke: C.ink, lw: 3, weight: 900 });
    }
    ctx.globalAlpha = 1;
  }

  function vignette() {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,6,2,0.38)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  function drawJoystick() {
    if (!joy.active || modal || scene !== 'play') return;
    const jx = joy.x - joy.ox, jy = joy.y - joy.oy, l = Math.hypot(jx, jy), m = Math.min(l, 36);
    const kx = joy.ox + (l ? jx / l * m : 0), ky = joy.oy + (l ? jy / l * m : 0);
    ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(joy.ox, joy.oy, 40, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(244,196,48,0.9)'; ctx.beginPath(); ctx.arc(kx, ky, 17, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.stroke();
  }

  function drawBanner() {
    if (!banner) return;
    if (banner.max === undefined) banner.max = banner.t;
    const a = clamp(banner.t / 0.4, 0, 1) * clamp((banner.max - banner.t) * 4, 0, 1);
    let text, sub, color = C.gold;
    if (banner.kind === 'boss') { text = ENEMY[banner.type].name[lang].toUpperCase(); sub = tr('boss') + ' · ' + roomPlace(banner.room); color = '#ff6b5b'; }
    else if (banner.kind === 'room') { text = roomPlace(banner.room).toUpperCase(); sub = tr('room') + ' ' + banner.room + '/' + TOTAL_ROOMS + ' · ' + biome(banner.room).zone[lang]; }
    else if (banner.kind === 'clear') { text = tr('clear'); sub = tr('clearSub'); color = '#7cf07a'; }
    else { text = SKILL[banner.skill].name[lang]; sub = tr('blessGot') + ': ' + SKILL[banner.skill].desc[lang]; }
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(7,30,38,0.72)'; ctx.fillRect(0, 230, W, 76);
    ctx.fillStyle = C.gold; ctx.fillRect(0, 230, W, 2); ctx.fillRect(0, 304, W, 2);
    txt(text, W / 2, 258, fitText(text, W - 30, 30), color, { stroke: C.ink, lw: 6, weight: 900 });
    txt(sub, W / 2, 288, fitText(sub, W - 30, 14, 700), C.cream, { weight: 700 });
    ctx.restore();
  }

  function overlay(a) { ctx.fillStyle = `rgba(4,16,22,${a})`; ctx.fillRect(0, 0, W, H); }

  function pickCard(i) {
    const s = choices[i]; if (!s) return;
    applySkill(s); Sound.click();
    run.pendingLv--;
    if (run.pendingLv > 0) { choices = rollChoices(); if (!choices.length) { run.pendingLv = 0; modal = null; } }
    else modal = null;
  }

  function drawLevelUp() {
    overlay(0.7);
    txt(tr('levelUp'), W / 2, 112, fitText(tr('levelUp'), W - 30, 26), C.gold, { stroke: C.ink, lw: 6, weight: 900 });
    txt(tr('choose', run.level - run.pendingLv + 1), W / 2, 142, 14, C.cream, { weight: 500 });
    choices.forEach((s, i) => {
      const x = 24, y = 170 + i * 128, w = W - 48, h = 112;
      const pulse = 1 + Math.sin(time * 4 + i) * 0.01;
      ctx.save(); ctx.translate(W / 2, y + h / 2); ctx.scale(pulse, pulse); ctx.translate(-W / 2, -(y + h / 2));
      panel(x, y, w, h);
      skillIcon(s.id, x + 50, y + h / 2, 28);
      txt(s.name[lang], x + 92, y + 34, fitText(s.name[lang], w - 110, 19), C.redDk, { align: 'left', weight: 900 });
      wrap(s.desc[lang], x + 92, y + 60, w - 112, 17, 13, C.ink, { align: 'left' });
      const lv = sk(s.id);
      for (let k = 0; k < s.max; k++) {
        ctx.fillStyle = k < lv ? C.gold : 'rgba(42,22,12,0.2)';
        ctx.beginPath(); ctx.arc(x + 98 + k * 12, y + h - 20, 4, 0, TAU); ctx.fill();
      }
      ctx.restore();
      ui.push({ x, y, w, h, fn: () => pickCard(i) });
    });
  }

  function drawRevive() {
    overlay(0.72);
    panel(30, 150, W - 60, 340);
    txt(tr('revive'), W / 2, 196, fitText(tr('revive'), W - 100, 28), C.redDk, { weight: 900 });
    txt(tr('reviveText'), W / 2, 226, 13, C.ink, { weight: 500 });
    // countdown ring
    const k = clamp(reviveT / REVIVE_TIME, 0, 1), cx = W / 2, cy = 300;
    ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(42,22,12,0.15)'; ctx.beginPath(); ctx.arc(cx, cy, 40, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#e8463a'; ctx.beginPath(); ctx.arc(cx, cy, 40, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke();
    txt(String(Math.ceil(reviveT)), cx, cy + 2, 32, C.redDk, { weight: 900 });
    const ok = canRevive();
    button(54, 370, W - 108, 52, ok ? tr('reviveBtn', REVIVE_COST) : tr('reviveNeed', REVIVE_COST), doRevive, { disabled: !ok, col: '#8be07a', col2: '#3d9a36', size: 17 });
    button(54, 432, W - 108, 38, tr('reviveNo'), () => { Sound.click(); declineRevive(); }, { col: '#c9b8a0', col2: '#8a7a64', size: 14 });
  }

  function drawKydyrModal() {
    overlay(0.72);
    panel(24, 120, W - 48, 400);
    if (G3.kydyrImg) {
      const hg = ctx.createRadialGradient(W / 2, 205, 10, W / 2, 205, 95);
      hg.addColorStop(0, 'rgba(255,236,170,0.85)'); hg.addColorStop(1, 'rgba(255,236,170,0)');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(W / 2, 205, 95, 0, TAU); ctx.fill();
      ctx.drawImage(G3.kydyrImg, W / 2 - 66, 126, 132, 165);
    } else drawKydyr(W / 2, 220, 2.2);
    txt(tr('kydyr'), W / 2, 298, 24, C.redDk, { weight: 900 });
    wrap(tr('kydyrText'), W / 2, 326, W - 100, 17, 13, C.ink);
    button(48, 370, W - 96, 54, tr('heal'), () => { healPlayer(player.maxHp * 0.4); Sound.level(); modal = null; kydyrNext && kydyrNext(); }, { col: '#8be07a', col2: '#3d9a36', size: 16 });
    button(48, 438, W - 96, 54, tr('bless'), () => {
      const pool = rollChoices();
      if (pool.length) { applySkill(pool[0]); banner = { kind: 'skill', skill: pool[0].id, t: 2.4 }; }
      Sound.level(); modal = null; kydyrNext && kydyrNext();
    }, { size: 16 });
  }

  function drawPause() {
    overlay(0.7);
    panel(30, 110, W - 60, 430);
    txt(tr('pause'), W / 2, 150, 26, C.redDk, { weight: 900 });
    const owned = SKILLS.filter(s => sk(s.id) > 0);
    if (owned.length) {
      owned.forEach((s, i) => {
        const cx = 70 + (i % 6) * 44, cy = 200 + Math.floor(i / 6) * 46;
        skillIcon(s.id, cx, cy, 17);
        if (sk(s.id) > 1) txt('×' + sk(s.id), cx + 14, cy + 14, 11, C.redDk, { weight: 900 });
      });
    } else txt(tr('noSkills'), W / 2, 210, 13, '#7a6a55', { weight: 500 });
    const onoff = v => v ? tr('on') : tr('off');
    button(60, 318, W - 120, 46, tr('resume'), () => { modal = null; Sound.click(); });
    const half = (W - 130) / 2;
    button(60, 374, half, 42, tr('music') + ': ' + onoff(Sound.music), () => { Sound.init(); Sound.setMusic(!Sound.music); }, { col: '#5fc8de', col2: '#1d7f99', size: 14 });
    button(70 + half, 374, half, 42, tr('sfx') + ': ' + onoff(Sound.sfx), () => { Sound.init(); Sound.setSfx(!Sound.sfx); }, { col: '#5fc8de', col2: '#1d7f99', size: 14 });
    button(60, 424, W - 120, 42, tr('graphics') + ': ' + qualityLabel(), cycleQuality, { col: '#a99bff', col2: '#5a46c8', size: 14 });
    button(60, 476, W - 120, 42, tr('toMenu'), () => {
      bank += run.coins;
      if (run.room > best) best = run.room;
      saveProgress();
      scene = 'menu'; modal = null; Sound.click();
    }, { col: '#ff8a6a', col2: '#c2402a', size: 15 });
  }

  function drawEnd() {
    const won = scene === 'victory';
    overlay(clamp(endT * 1.5, 0, 0.72));
    if (endT < 0.5) return;
    panel(30, 130, W - 60, 380);
    if (won) {
      txt(tr('victory'), W / 2, 180, 40, C.gold, { stroke: C.ink, lw: 7, weight: 900 });
      txt(tr('victoryText'), W / 2, 214, 13, C.ink, { weight: 500 });
    } else {
      txt(tr('dead'), W / 2, 180, 28, C.redDk, { weight: 900 });
      txt(tr('deadText'), W / 2, 210, 13, C.ink, { weight: 500 });
    }
    const rows = [[tr('sRoom'), (won ? TOTAL_ROOMS : run.room) + ' / ' + TOTAL_ROOMS], [tr('sLevel'), String(run.level)], [tr('sKills'), String(run.kills)], [tr('sCoins'), '+' + run.coins + ' ₸'], [tr('sBest'), tr('roomWord') + ' ' + best]];
    rows.forEach(([k, v], i) => {
      txt(k, 60, 250 + i * 30, 15, '#6a5a45', { align: 'left', weight: 500 });
      txt(v, W - 60, 250 + i * 30, 16, C.ink, { align: 'right', weight: 900 });
    });
    button(54, 410, W - 108, 48, tr('again'), () => { Sound.click(); newRun(); });
    button(54, 464, W - 108, 36, tr('menu'), () => { Sound.click(); scene = 'menu'; }, { col: '#5fc8de', col2: '#1d7f99', size: 14 });
  }

  function drawMenu() {
    const top = ctx.createLinearGradient(0, 0, 0, 200);
    top.addColorStop(0, 'rgba(7,30,38,0.75)'); top.addColorStop(1, 'rgba(7,30,38,0)');
    ctx.fillStyle = top; ctx.fillRect(0, 0, W, 200);
    ornamentBand(ctx, 0, 0, W, 16, C.red, C.gold);
    const wob = Math.sin(time * 1.5) * 2;
    txt('БАТЫР01', W / 2, 92 + wob, fitText('БАТЫР01', W - 40, 56), C.gold, { stroke: C.ink, lw: 10, weight: 900 });
    koshkar(ctx, W / 2, 136, 30, C.red, 3.5);
    txt(tr('subtitle'), W / 2, 160, 16, C.cream, { stroke: C.ink, lw: 4, weight: 900 });
    button(W / 2 - 100, 372, 200, 56, tr('play'), () => { Sound.init(); Sound.click(); newRun(); }, { size: 24 });
    txt(tr('hint'), W / 2, 442, 11, '#fff', { stroke: C.ink, lw: 3, weight: 700 });
    panel(24, 456, W - 48, 146);
    ctx.fillStyle = C.gold; ctx.strokeStyle = C.goldDk; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(W / 2 - 34, 481, 8, 0, TAU); ctx.fill(); ctx.stroke();
    txt('₸', W / 2 - 34, 481.5, 10, C.goldDk, { weight: 900 });
    txt(String(bank), W / 2 - 20, 481, 17, C.ink, { align: 'left', weight: 900 });
    const rowsU = [
      [tr('upAtk'), tr('upAtkD'), upAtk, () => { const c = upCost(upAtk); if (bank >= c && upAtk < 10) { bank -= c; upAtk++; saveProgress(); Sound.level(); } }],
      [tr('upHp'), tr('upHpD'), upHp, () => { const c = upCost(upHp); if (bank >= c && upHp < 10) { bank -= c; upHp++; saveProgress(); Sound.level(); } }],
    ];
    rowsU.forEach(([name, desc, lv, fn], i) => {
      const y = 505 + i * 45;
      txt(name + ' · ' + tr('lvl') + ' ' + lv, 44, y, 15, C.redDk, { align: 'left', weight: 900 });
      txt(desc, 44, y + 17, 11, '#6a5a45', { align: 'left', weight: 500 });
      const c = upCost(lv), maxed = lv >= 10;
      button(W - 142, y - 14, 104, 36, maxed ? tr('max') : c + ' ₸', fn, { disabled: maxed || bank < c, size: 15, col: '#8be07a', col2: '#3d9a36' });
    });
    if ((G3.loadDone || 0) < (G3.loadTotal || 1)) {
      const k = (G3.loadDone || 0) / (G3.loadTotal || 1), bw = 180, bx = (W - bw) / 2, by = G3.heroSpear ? 636 : 300;
      if (!G3.heroSpear) txt(tr('loading'), W / 2, by - 16, 15, '#fff', { stroke: C.ink, lw: 4, weight: 900 });
      rr(ctx, bx, by - 3, bw, 6, 3); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill();
      rr(ctx, bx, by - 3, Math.max(6, bw * k), 6, 3); ctx.fillStyle = C.gold; ctx.fill();
    }
    txt(tr('best', best), W / 2, 620, 12, C.cream, { stroke: C.ink, lw: 3, weight: 700 });
    // language + sound toggles
    const tg = (x, w, on, label, fn) => {
      rr(ctx, x, 24, w, 34, 9); ctx.fillStyle = C.ink; ctx.fill();
      rr(ctx, x + 3, 27, w - 6, 28, 7); ctx.fillStyle = on ? C.blueDk : '#5a3a30'; ctx.fill();
      txt(label, x + w / 2, 41.5, 14, on ? '#fff' : '#c9a9a0', { weight: 900 });
      ui.push({ x, y: 22, w, h: 38, fn });
    };
    tg(10, 44, lang === 'ru', 'RU', () => { setLang('ru'); Sound.click(); });
    tg(58, 54, lang === 'kz', 'ҚАЗ', () => { setLang('kz'); Sound.click(); });
    tg(116, 44, lang === 'en', 'EN', () => { setLang('en'); Sound.click(); });
    tg(W - 172, 72, true, '⚙ ' + tr('q' + Save.data.settings.quality), cycleQuality);
    tg(W - 96, 40, Sound.music, '♪', () => { Sound.init(); Sound.setMusic(!Sound.music); });
    tg(W - 52, 40, Sound.sfx, '♫', () => { Sound.init(); Sound.setSfx(!Sound.sfx); });
  }

