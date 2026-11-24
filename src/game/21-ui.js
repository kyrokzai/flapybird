  // =================================================================== UI layer (2D canvas over the 3D view)
  // ---- UI kit: dark graphite/navy panels with antique-gold metal trim (one look for every screen and popup)
  const FONTS = { ui: FONT, head: '"Cormorant SC", "Cormorant", Georgia, serif', logo: '"Cinzel", "Cormorant SC", Georgia, serif' };
  const T = {
    text: '#f1e8d4', muted: '#ab9f88', dim: '#7f7665', gold: '#dcb75e', goldLt: '#f7e09a', goldDk: '#8a6522', amber: '#e9a43c',
    navy: '#111b2c', graphite: '#0d1119', line: 'rgba(220,183,94,0.42)', fill: 'rgba(255,236,200,0.06)', fill2: 'rgba(255,236,200,0.11)',
  };
  const fontOf = o => FONTS[(o && o.f) || 'ui'];
  function txt(s, x, y, size, color, o) {
    o = o || {};
    ctx.font = `${o.weight || 700} ${size}px ${fontOf(o)}`;
    ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
    if (o.shadow) { ctx.save(); ctx.shadowColor = o.shadow; ctx.shadowBlur = o.blur || 8; ctx.shadowOffsetY = o.dy === undefined ? 1 : o.dy; }
    if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.lw || size * 0.2; ctx.strokeStyle = o.stroke; ctx.strokeText(s, x, y); }
    ctx.fillStyle = color; ctx.fillText(s, x, y);
    if (o.shadow) ctx.restore();
  }
  function wrap(s, x, y, maxW, lh, size, color, o) {
    ctx.font = `${(o && o.weight) || 500} ${size}px ${fontOf(o)}`;
    const words = s.split(' '), lines = [];
    let line = '';
    for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
    if (line) lines.push(line);
    lines.forEach((l, i) => txt(l, x, y + i * lh, size, color, Object.assign({ weight: 500 }, o)));
  }
  function fitText(s, maxW, size, weight, f) {
    const fam = FONTS[f || 'ui'];
    ctx.font = `${weight || 800} ${size}px ${fam}`;
    while (size > 9 && ctx.measureText(s).width > maxW) { size--; ctx.font = `${weight || 800} ${size}px ${fam}`; }
    return size;
  }
  // metallic gold gradient for borders and accents
  function goldGrad(y, h) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#fbe7a6'); g.addColorStop(0.35, '#d6ad52'); g.addColorStop(0.55, '#9b7228'); g.addColorStop(0.8, '#d8b35e'); g.addColorStop(1, '#f3d98e');
    return g;
  }
  function goldFrame(x, y, w, h, r, lw) {
    rr(ctx, x, y, w, h, r); ctx.strokeStyle = goldGrad(y, h); ctx.lineWidth = lw || 1.6; ctx.stroke();
  }
  function diamond(x, y, s, fill) {
    ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s, y); ctx.closePath();
    ctx.fillStyle = fill || goldGrad(y - s, s * 2); ctx.fill();
  }
  // a hexagon-ended plate (the PLAY button, banners)
  function hexPath(x, y, w, h, tip) {
    ctx.beginPath(); ctx.moveTo(x + tip, y); ctx.lineTo(x + w - tip, y); ctx.lineTo(x + w, y + h / 2); ctx.lineTo(x + w - tip, y + h); ctx.lineTo(x + tip, y + h); ctx.lineTo(x, y + h / 2); ctx.closePath();
  }

  // o: { col, col2 } tints a dark button (green = upgrade, blue = equip, purple = chests…); no col = the gold primary
  //    { disabled, size, tag, shape: 'hex', icon: fn(cx, cy) drawn left of the label, sub: small text on the right }
  function button(x, y, w, h, label, fn, o) {
    o = o || {};
    const primary = !o.col, down = !o.disabled && isPressed(x, y, w, h), r = Math.min(12, h / 2.6);
    ctx.save();
    if (o.disabled) ctx.globalAlpha = 0.45;
    const shape = () => o.shape === 'hex' ? hexPath(x, y, w, h, h * 0.42) : rr(ctx, x, y, w, h, r);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4; shape(); ctx.fillStyle = '#0a0d14'; ctx.fill(); ctx.restore();
    if (down) ctx.translate(0, 2);
    shape();
    if (primary) {
      const g = ctx.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, '#fbe6a2'); g.addColorStop(0.45, '#e2b856'); g.addColorStop(0.55, '#c8962f'); g.addColorStop(1, '#9e6f1e');
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = '#4a320c'; ctx.lineWidth = 1.6; ctx.stroke();
    } else {
      const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, o.col); g.addColorStop(1, o.col2 || o.col);
      ctx.fillStyle = g; ctx.fill();
      ctx.fillStyle = 'rgba(10,14,24,0.5)'; ctx.fill();
      ctx.strokeStyle = goldGrad(y, h); ctx.lineWidth = 1.5; ctx.stroke();
    }
    // top sheen
    ctx.save(); shape(); ctx.clip();
    const sh = ctx.createLinearGradient(0, y, 0, y + h * 0.5); sh.addColorStop(0, 'rgba(255,255,255,0.28)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sh; ctx.fillRect(x, y, w, h * 0.5);
    ctx.restore();
    const lc = primary ? '#2b1a05' : T.text;
    let lx = x + w / 2;
    const size = fitText(label, w - (o.icon ? 56 : 18) - (o.sub ? 40 : 0), o.size || 17, 800);
    if (o.icon || o.sub) {
      ctx.font = `800 ${size}px ${FONT}`;
      const lw = ctx.measureText(label).width, iw = o.icon ? size * 1.5 : 0, sw = o.sub ? size * 2.2 : 0, tot = iw + lw + sw;
      const sx = x + (w - tot) / 2;
      if (o.icon) o.icon(sx + size * 0.6, y + h / 2, size, lc);
      lx = sx + iw + lw / 2;
      if (o.sub) txt(o.sub, sx + iw + lw + sw / 2 + size * 0.3, y + h / 2 + 1, size * 0.95, lc, { weight: 800 });
    }
    txt(label, lx, y + h / 2 + 1, size, lc, primary ? { weight: 800, shadow: 'rgba(255,240,200,0.6)', blur: 0, dy: 1 } : { weight: 800, shadow: 'rgba(0,0,0,0.6)', blur: 2, dy: 1 });
    if (down) { shape(); ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fill(); }
    ctx.restore();
    ui.push({ x, y, w, h, fn: o.disabled ? null : fn, tag: o.tag });
  }

  function panel(x, y, w, h) {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    rr(ctx, x, y, w, h, 14);
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(22,31,49,0.97)'); g.addColorStop(1, 'rgba(10,13,21,0.97)');
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
    goldFrame(x, y, w, h, 14, 1.8);
    rr(ctx, x + 5, y + 5, w - 10, h - 10, 10); ctx.strokeStyle = 'rgba(220,183,94,0.22)'; ctx.lineWidth = 1; ctx.stroke();
    for (const [cx, cy] of [[x + 5, y + 5], [x + w - 5, y + 5], [x + 5, y + h - 5], [x + w - 5, y + h - 5]]) diamond(cx, cy, 4);
    // knot on the top edge
    diamond(x + w / 2, y, 7); diamond(x + w / 2, y, 3.2, '#2a1c08');
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
    const hg = ctx.createLinearGradient(0, -SAFE.t, 0, 70);
    hg.addColorStop(0, 'rgba(10,13,21,0.96)'); hg.addColorStop(1, 'rgba(10,13,21,0.82)');
    ctx.fillStyle = hg; ctx.fillRect(0, -SAFE.t, W, 66 + SAFE.t);
    frameBand(66);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(28, 22, 17, 0, TAU); ctx.fill();
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(28, 22, 14, 0, TAU); ctx.fill();
    txt(String(run.level), 28, 23, 15, '#fff', { stroke: C.ink, lw: 3, weight: 900 });
    const bx = 50, bw = 250;
    rr(ctx, bx, 15, bw, 14, 7); ctx.fillStyle = C.ink; ctx.fill();
    const frac = clamp(run.xp / xpNeed(run.level), 0, 1);
    if (frac > 0) { rr(ctx, bx + 2, 17, Math.max(10, (bw - 4) * frac), 10, 5); ctx.fillStyle = xpPulse > 0.05 ? '#9ff4ff' : '#3fd0e8'; ctx.fill(); }
    ctx.fillStyle = C.gold; ctx.strokeStyle = C.goldDk; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(20, 49, 7, 0, TAU); ctx.fill(); ctx.stroke();
    txt('₸', 20, 49.5, 9, C.goldDk, { weight: 900 });
    txt(String(run.coins), 32, 49, 14 * (1 + coinPulse * 0.35), coinPulse > 0.05 ? '#ffe27a' : '#fff', { align: 'left', weight: 700 });
    const roomLabel = isSurv() ? `${mt('wave').toUpperCase()} ${Math.max(1, run.wave + (run.waveCleared ? 1 : 0))}  ·  ⏱ ${fmtClock(run.timeLeft)}` : `${tr('room')} ${run.room}/${TOTAL_ROOMS}`;
    txt(roomLabel, W / 2, 48, 15, C.gold, { weight: 900, stroke: C.ink, lw: 3 });
    rr(ctx, W - 46, 8, 36, 36, 9); ctx.fillStyle = C.ink; ctx.fill();
    rr(ctx, W - 43, 11, 30, 30, 7); ctx.fillStyle = C.blueDk; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(W - 34, 18, 4, 16); ctx.fillRect(W - 26, 18, 4, 16);
    ui.push({ x: W - 50, y: 4, w: 46, h: 46, fn: () => { if (scene === 'play' && !modal) { modal = 'pause'; Sound.click(); } } });
    // bomb button (bottom right) — tap or E/B
    if (scene === 'play' && introT <= 0) {
      const bx = W - 52, by = H - 86 - SAFE.b - SAFE.t, has = run.bombs > 0;   // drawn inside the safe-area shift
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
      // crits pop up big and shake for a moment
      const age = 0.8 - t.life, pk = t.pop ? Math.max(0, 1 - age / 0.14) : 0, sh = pk * 3;
      txt(t.t, p.x + (sh ? (Math.random() - 0.5) * sh : 0), p.y - t.rise, t.size * (1 + pk * 0.6), t.col, { stroke: C.ink, lw: t.pop ? 4 : 3, weight: 900 });
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
    else if (banner.kind === 'room') { text = roomPlace(banner.room).toUpperCase(); sub = isSurv() ? mt('survival') + ' · ' + mt('survSub') : tr('room') + ' ' + banner.room + '/' + TOTAL_ROOMS + ' · ' + biome(banner.room).zone[lang]; }
    else if (banner.kind === 'wave') { text = mt('wave').toUpperCase() + ' ' + banner.wave; sub = banner.boss ? tr('boss') + ': ' + ENEMY[banner.boss].name[lang] : mt('survival'); color = banner.boss ? '#ff6b5b' : C.gold; }
    else if (banner.kind === 'waveClear') { text = mt('waveClear'); sub = mt('waveClearSub'); color = '#7cf07a'; }
    else if (banner.kind === 'clear') { text = tr('clear'); sub = tr('clearSub'); color = '#7cf07a'; }
    else { text = SKILL[banner.skill].name[lang]; sub = tr('blessGot') + ': ' + SKILL[banner.skill].desc[lang]; }
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(7,30,38,0.72)'; ctx.fillRect(0, 230, W, 76);
    ctx.fillStyle = C.gold; ctx.fillRect(0, 230, W, 2); ctx.fillRect(0, 304, W, 2);
    txt(text, W / 2, 258, fitText(text, W - 30, 30), color, { stroke: C.ink, lw: 6, weight: 900 });
    txt(sub, W / 2, 288, fitText(sub, W - 30, 14, 700), C.cream, { weight: 700 });
    ctx.restore();
  }

  function overlay(a) { ctx.fillStyle = `rgba(6,9,16,${a})`; ctx.fillRect(0, -1000, W, H + 2000); }

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
      txt(s.name[lang], x + 92, y + 34, fitText(s.name[lang], w - 110, 19), T.gold, { align: 'left', weight: 900 });
      wrap(s.desc[lang], x + 92, y + 60, w - 112, 17, 13, T.text, { align: 'left' });
      const lv = sk(s.id);
      for (let k = 0; k < s.max; k++) {
        ctx.fillStyle = k < lv ? C.gold : 'rgba(255,236,200,0.2)';
        ctx.beginPath(); ctx.arc(x + 98 + k * 12, y + h - 20, 4, 0, TAU); ctx.fill();
      }
      ctx.restore();
      ui.push({ x, y, w, h, fn: () => pickCard(i) });
    });
  }

  function drawRevive() {
    overlay(0.72);
    panel(30, 150, W - 60, 340);
    txt(tr('revive'), W / 2, 196, fitText(tr('revive'), W - 100, 28), T.gold, { weight: 900 });
    txt(tr('reviveText'), W / 2, 226, 13, T.text, { weight: 500 });
    // countdown ring
    const k = clamp(reviveT / REVIVE_TIME, 0, 1), cx = W / 2, cy = 300;
    ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,236,200,0.15)'; ctx.beginPath(); ctx.arc(cx, cy, 40, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#e8463a'; ctx.beginPath(); ctx.arc(cx, cy, 40, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke();
    txt(String(Math.ceil(reviveT)), cx, cy + 2, 32, T.gold, { weight: 900 });
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
    txt(tr('kydyr'), W / 2, 298, 24, T.gold, { weight: 900 });
    wrap(tr('kydyrText'), W / 2, 326, W - 100, 17, 13, T.text);
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
    txt(tr('pause'), W / 2, 150, 26, T.gold, { weight: 900 });
    const owned = SKILLS.filter(s => sk(s.id) > 0);
    if (owned.length) {
      owned.forEach((s, i) => {
        const cx = 70 + (i % 6) * 44, cy = 200 + Math.floor(i / 6) * 46;
        skillIcon(s.id, cx, cy, 17);
        if (sk(s.id) > 1) txt('×' + sk(s.id), cx + 14, cy + 14, 11, T.gold, { weight: 900 });
      });
    } else txt(tr('noSkills'), W / 2, 210, 13, '#7a6a55', { weight: 500 });
    const onoff = v => v ? tr('on') : tr('off');
    button(60, 318, W - 120, 46, tr('resume'), () => { modal = null; Sound.click(); });
    const half = (W - 130) / 2;
    button(60, 374, half, 42, tr('music') + ': ' + onoff(Sound.music), () => { Sound.init(); Sound.setMusic(!Sound.music); }, { col: '#5fc8de', col2: '#1d7f99', size: 14 });
    button(70 + half, 374, half, 42, tr('sfx') + ': ' + onoff(Sound.sfx), () => { Sound.init(); Sound.setSfx(!Sound.sfx); }, { col: '#5fc8de', col2: '#1d7f99', size: 14 });
    button(60, 424, W - 120, 42, tr('graphics') + ': ' + qualityLabel(), cycleQuality, { col: '#a99bff', col2: '#5a46c8', size: 14 });
    button(60, 476, W - 120, 42, tr('toMenu'), () => {
      bank += run.coins; recordRun(false);
      if (isSurv()) { if (wavesDone() > (Save.data.bestWave || 0)) Save.data.bestWave = wavesDone(); }
      else if (run.room > best) best = run.room;
      saveProgress();
      scene = 'menu'; modal = null; Sound.click();
    }, { col: '#ff8a6a', col2: '#c2402a', size: 15 });
  }

  function drawEnd() {
    const won = scene === 'victory';
    overlay(clamp(endT * 1.5, 0, 0.72));
    if (endT < 0.5) return;
    panel(30, 110, W - 60, 420);
    if (won) {
      const vt = isSurv() ? mt('arenaWin') : tr('victory');
      txt(vt, W / 2, 156, fitText(vt, W - 90, 36), C.gold, { stroke: C.ink, lw: 7, weight: 900 });
      txt(isSurv() ? mt('arenaWinText') : tr('victoryText'), W / 2, 188, 13, T.text, { weight: 500 });
    } else {
      txt(tr('dead'), W / 2, 156, 28, T.gold, { weight: 900 });
      txt(tr('deadText'), W / 2, 184, 13, T.text, { weight: 500 });
    }
    const ck = (endT - 0.5) / 0.9;
    const surv = isSurv();
    const rows = surv
      ? [[mt('wavesDone'), String(wavesDone())], [tr('sLevel'), String(run.level)], [tr('sKills'), String(countUp(run.kills, ck))], [tr('sCoins'), '+' + countUp(run.coins, ck) + ' ₸'], [tr('sBest'), mt('wave').toLowerCase() + ' ' + (Save.data.bestWave || 0)]]
      : [[tr('sRoom'), (won ? TOTAL_ROOMS : run.room) + ' / ' + TOTAL_ROOMS], [tr('sLevel'), String(run.level)], [tr('sKills'), String(countUp(run.kills, ck))], [tr('sCoins'), '+' + countUp(run.coins, ck) + ' ₸'], [tr('sBest'), tr('roomWord') + ' ' + best]];
    rows.forEach(([k, v], i) => {
      txt(k, 60, 214 + i * 24, 14, T.muted, { align: 'left', weight: 500 });
      txt(v, W - 60, 214 + i * 24, 15, T.text, { align: 'right', weight: 900 });
    });
    // progress through the chapter: one pip per room, bosses bigger
    const reached = won ? TOTAL_ROOMS : run.room, pw = (W - 120) / TOTAL_ROOMS;
    if (surv) txt(mt('arenaName'), W / 2, 342, 12, T.muted, { weight: 600 });
    else for (let r = 1; r <= TOTAL_ROOMS; r++) {
      const boss = r % 5 === 0, px = 60 + (r - 0.5) * pw, rad = boss ? 6 : 4;
      const lit = r <= Math.ceil(reached * easeOut((endT - 0.6) / 0.9));
      ctx.fillStyle = !lit ? 'rgba(255,236,200,0.2)' : r < reached || won ? C.gold : C.red;
      ctx.beginPath(); ctx.arc(px, 342, rad, 0, TAU); ctx.fill();
      if (r === best && !won) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke(); }
    }
    const rw = run.rewards;
    txt(mt('rewards'), 60, 368, 14, T.gold, { align: 'left', weight: 900 });
    let rx = 60;
    if (run.glory) { txt('+' + countUp(run.glory, (endT - 0.9) / 0.6) + ' ' + mt('glory'), W - 60, 368, 12, '#e9c76b', { align: 'right', weight: 800 }); }
    if (rw && rw.gems) { gemIcon(rx + 8, 396, 8); txt('+' + countUp(rw.gems, (endT - 1.0) / 0.6), rx + 20, 396, 15, T.text, { align: 'left', weight: 900 }); rx += 60; }
    if (rw) rw.items.forEach((it, i) => {
      const k = easeBack((endT - 1.2 - i * 0.16) / 0.3);
      if (k > 0) { ctx.save(); ctx.translate(rx + 20, 396); ctx.scale(k, k); ctx.translate(-rx - 20, -396); if (it.r >= 2) { ctx.shadowColor = RARITY[it.r].col; ctx.shadowBlur = 14; } itemCard(it, rx, 376, 40, null); ctx.restore(); }
      rx += 46;
    });
    if (!rw || (!rw.gems && !rw.items.length)) txt(mt(surv ? 'noChestSurv' : 'noChest'), W / 2, 396, fitText(mt(surv ? 'noChestSurv' : 'noChest'), W - 100, 12, 500), T.dim, { weight: 500 });
    const mode = run.mode;
    button(54, 424, W - 108, 48, tr('again') + ' ⚡' + RUN_COST, () => { Sound.click(); startGame(mode); });
    button(54, 478, W - 108, 36, tr('menu'), () => { Sound.click(); scene = 'menu'; }, { col: '#5fc8de', col2: '#1d7f99', size: 14 });
  }

