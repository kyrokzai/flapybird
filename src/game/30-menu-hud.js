  // =================================================================== main menu chrome (premium look): frames, logo, top bar, counters, PLAY, tab bar
  const REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  let logoT0 = performance.now();

  // draw fn() shifted down by oy, moving the tap areas it registers with it
  function shiftUI(oy, fn) {
    if (!oy) { fn(); return; }
    const n = ui.length;
    ctx.save(); ctx.translate(0, oy); fn(); ctx.restore();
    for (let i = n; i < ui.length; i++) ui[i].y += oy;
  }

  // thin double gold rule with a knot in the middle (top and bottom of the screen, above the tab bar)
  function frameBand(y, flip) {
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, 'rgba(220,183,94,0)'); g.addColorStop(0.18, 'rgba(220,183,94,0.85)'); g.addColorStop(0.82, 'rgba(220,183,94,0.85)'); g.addColorStop(1, 'rgba(220,183,94,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.moveTo(14, y + (flip ? -4 : 4)); ctx.lineTo(W - 14, y + (flip ? -4 : 4)); ctx.stroke();
    // scroll-work either side of the knot
    ctx.strokeStyle = goldGrad(y - 8, 16); ctx.lineWidth = 1.4;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(W / 2 + s * 14, y); ctx.bezierCurveTo(W / 2 + s * 30, y - 9, W / 2 + s * 44, y + 7, W / 2 + s * 58, y);
      ctx.moveTo(W / 2 + s * 58, y); ctx.bezierCurveTo(W / 2 + s * 66, y - 5, W / 2 + s * 74, y - 3, W / 2 + s * 78, y + 1);
      ctx.stroke();
      koshkar(ctx, W / 2 + s * 36, y + (flip ? 5 : -5), 7, '#d6ad52', 1.2);
    }
    diamond(W / 2, y, 10); diamond(W / 2, y, 6, '#151b28'); diamond(W / 2, y, 3);
  }

  // ---- icons (gold line-art, drawn at size s around cx, cy)
  function icoSwords(x, y, s, c) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineCap = 'round'; ctx.lineWidth = 2.6;
    for (const k of [-1, 1]) {
      ctx.save(); ctx.scale(k, 1); ctx.rotate(Math.PI / 4);
      ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-1.6, -12); ctx.lineTo(0, -16); ctx.lineTo(1.6, -12); ctx.fill();
      ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-5, 7); ctx.lineTo(5, 7); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 13); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  function icoHelmet(x, y, s, c) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20); ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-11, 9); ctx.quadraticCurveTo(-12, -9, 0, -12); ctx.quadraticCurveTo(12, -9, 11, 9); ctx.lineTo(4, 9); ctx.lineTo(4, -1); ctx.lineTo(-4, -1); ctx.lineTo(-4, 9); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, -17); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -17.5, 1.8, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function icoTree(x, y, s, c) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineCap = 'round'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(0, 13); ctx.lineTo(0, -2); ctx.moveTo(0, 4); ctx.lineTo(-7, -4); ctx.moveTo(0, 2); ctx.lineTo(7, -5); ctx.moveTo(0, -2); ctx.lineTo(-3, -9); ctx.moveTo(0, -2); ctx.lineTo(4, -10); ctx.stroke();
    for (const [a, b, r] of [[-8, -6, 4], [8, -7, 4], [-3, -11, 4], [4, -12, 4], [0, -6, 3.5], [-11, -1, 3], [11, -1, 3]]) { ctx.beginPath(); ctx.arc(a, b, r, 0, TAU); ctx.fill(); }
    ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-6, 14); ctx.lineTo(6, 14); ctx.stroke();
    ctx.restore();
  }
  function icoScroll(x, y, s, c) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 1.8;
    rr(ctx, -9, -11, 18, 22, 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -11, 11, 3, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, 11, 11, 3, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(20,14,6,0.6)'; ctx.lineWidth = 1.4; ctx.beginPath(); for (let i = -5; i <= 5; i += 4) { ctx.moveTo(-5, i); ctx.lineTo(5, i); } ctx.stroke();
    ctx.restore();
  }
  function icoNote(x, y, s, c) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20); ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(-3, 8); ctx.lineTo(-3, -9); ctx.lineTo(9, -12); ctx.lineTo(9, 5); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-6, 8, 4, 3, -0.4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(6, 5, 4, 3, -0.4, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function icoSpeaker(x, y, s, c, off) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20); ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, -4); ctx.lineTo(-5, -4); ctx.lineTo(1, -10); ctx.lineTo(1, 10); ctx.lineTo(-5, 4); ctx.lineTo(-10, 4); ctx.closePath(); ctx.fill();
    if (off) { ctx.beginPath(); ctx.moveTo(5, -5); ctx.lineTo(13, 5); ctx.moveTo(13, -5); ctx.lineTo(5, 5); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(2, 0, 6, -0.9, 0.9); ctx.stroke(); ctx.beginPath(); ctx.arc(2, 0, 11, -0.9, 0.9); ctx.stroke(); }
    ctx.restore();
  }
  function icoGear(x, y, s, c) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20); ctx.fillStyle = c;
    ctx.beginPath();
    for (let i = 0; i < 16; i++) { const a = i * TAU / 16, r = i % 2 ? 9.5 : 12.5; ctx.lineTo(Math.cos(a - 0.12) * r, Math.sin(a - 0.12) * r); ctx.lineTo(Math.cos(a + 0.12) * r, Math.sin(a + 0.12) * r); }
    ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function icoHand(x, y, s, c) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20); ctx.strokeStyle = c; ctx.lineWidth = 1.7; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-2, 12); ctx.lineTo(-7, 3); ctx.quadraticCurveTo(-8, 0, -5, 1); ctx.lineTo(-2, 4); ctx.lineTo(-2, -9); ctx.quadraticCurveTo(0, -12, 2, -9); ctx.lineTo(2, -1);
    ctx.lineTo(6, -1); ctx.quadraticCurveTo(9, 0, 9, 3); ctx.lineTo(8, 9); ctx.quadraticCurveTo(7, 12, 4, 12); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -10, 6, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -10, 9.5, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
    ctx.restore();
  }
  function icoArena(x, y, s, c) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, -6, 12, 4, 0, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-12, -6); ctx.lineTo(-12, 8); ctx.ellipse(0, 8, 12, 4, 0, Math.PI, 0, true); ctx.lineTo(12, -6); ctx.stroke();
    for (const px of [-7, 0, 7]) { ctx.beginPath(); ctx.moveTo(px, -1); ctx.lineTo(px, 10); ctx.stroke(); }
    ctx.restore();
  }
  function icoTrophy(x, y, s, c) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20); ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(8, -10); ctx.lineTo(7, -1); ctx.quadraticCurveTo(0, 7, -7, -1); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(-9, -5, 4, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(9, -5, 4, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
    ctx.fillRect(-1.5, 3, 3, 5); rr(ctx, -6, 8, 12, 3.5, 1); ctx.fill();
    ctx.restore();
  }

  // ---- the BATIR01 logo: emblem ring, golden eagle over mountains, metallic lettering, a ruled divider
  function eaglePath() {
    ctx.beginPath();
    ctx.moveTo(0, -6);
    for (const s of [1, -1]) {
      ctx.moveTo(s * 3, -3);
      ctx.bezierCurveTo(s * 14, -14, s * 30, -24, s * 50, -30);
      ctx.lineTo(s * 40, -21); ctx.lineTo(s * 47, -20); ctx.lineTo(s * 36, -13); ctx.lineTo(s * 42, -11); ctx.lineTo(s * 31, -6); ctx.lineTo(s * 35, -3); ctx.lineTo(s * 22, -1);
      ctx.bezierCurveTo(s * 14, 0, s * 8, 3, s * 3, 5);
    }
    ctx.closePath();
    ctx.moveTo(-4, 4); ctx.lineTo(0, 16); ctx.lineTo(4, 4); ctx.closePath();             // tail
    ctx.moveTo(-3.2, -4); ctx.arc(0, -6.5, 3.6, Math.PI * 0.8, Math.PI * 2.2); ctx.lineTo(7, -6); ctx.lineTo(3, -3.6); ctx.closePath();   // head and beak
  }
  function drawLogo(cx, cy, sc, alpha) {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, cy); ctx.scale(sc, sc);
    // emblem ring (upper arc) with ornament ticks
    ctx.strokeStyle = 'rgba(220,183,94,0.5)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(0, -4, 64, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, -4, 58, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    for (let i = 0; i <= 12; i++) { const a = Math.PI * (1.12 + i * 0.0633); diamond(Math.cos(a) * 61, -4 + Math.sin(a) * 61, 1.6, 'rgba(220,183,94,0.7)'); }
    // mountains
    ctx.strokeStyle = goldGrad(-40, 30); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-70, -12); ctx.lineTo(-44, -22); ctx.lineTo(-30, -16); ctx.lineTo(-10, -38); ctx.lineTo(4, -26); ctx.lineTo(14, -33); ctx.lineTo(40, -14); ctx.lineTo(70, -12); ctx.stroke();
    ctx.fillStyle = 'rgba(220,183,94,0.18)'; ctx.beginPath(); ctx.moveTo(-10, -38); ctx.lineTo(-3, -30); ctx.lineTo(-14, -30); ctx.closePath(); ctx.fill();
    // eagle
    ctx.save(); ctx.translate(2, -56); ctx.scale(1.0, 1.0);
    ctx.shadowColor = 'rgba(255,200,90,0.55)'; ctx.shadowBlur = 10;
    eaglePath(); ctx.fillStyle = goldGrad(-32, 50); ctx.fill('evenodd');
    ctx.restore();
    // lettering: BATIR in brushed silver, 01 in gold
    const size = 46;
    ctx.font = `900 ${size}px ${FONTS.logo}`; ctx.textBaseline = 'middle';
    const w1 = ctx.measureText('BATIR').width, w2 = ctx.measureText('01').width, gap = 4, x0 = -(w1 + w2 + gap) / 2;
    ctx.textAlign = 'left';
    ctx.lineJoin = 'round';
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
    ctx.lineWidth = 5; ctx.strokeStyle = '#1a140c'; ctx.strokeText('BATIR', x0, 6); ctx.strokeText('01', x0 + w1 + gap, 6);
    ctx.restore();
    const sil = ctx.createLinearGradient(0, -size / 2 + 6, 0, size / 2 + 6);
    sil.addColorStop(0, '#ffffff'); sil.addColorStop(0.45, '#dfe3ea'); sil.addColorStop(0.52, '#8c93a0'); sil.addColorStop(0.75, '#d3d8e0'); sil.addColorStop(1, '#f5f7fa');
    ctx.fillStyle = sil; ctx.fillText('BATIR', x0, 6);
    ctx.fillStyle = goldGrad(-size / 2 + 6, size); ctx.fillText('01', x0 + w1 + gap, 6);
    ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(255,240,200,0.55)'; ctx.strokeText('BATIR', x0, 6); ctx.strokeText('01', x0 + w1 + gap, 6);
    // a glint sweeping across the letters now and then
    if (!REDUCED_MOTION) {
      const ph = ((pNow / 1000) % 5) / 5, gx = -150 + ph * 600;
      if (gx < 150) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath(); ctx.rect(x0, -20, w1 + w2 + gap, 50); ctx.clip();
        const gl = ctx.createLinearGradient(gx - 20, 0, gx + 20, 0); gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(0.5, 'rgba(255,250,230,0.35)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gl; ctx.font = `900 ${size}px ${FONTS.logo}`; ctx.fillText('BATIR', x0, 6); ctx.fillText('01', x0 + w1 + gap, 6);
        ctx.restore();
      }
    }
    // divider
    // tagline in spaced small caps between two gold rules, a knot underneath
    const dy = 40, tag = mt('tagline').toUpperCase();
    ctx.font = `700 11px ${FONTS.head}`;
    const sp = 3.2, chars = [...tag], tw = chars.reduce((a, c) => a + ctx.measureText(c).width + sp, -sp);
    const half = Math.min(150, tw / 2 + 64);
    const lg = ctx.createLinearGradient(-half, 0, half, 0); lg.addColorStop(0, 'rgba(220,183,94,0)'); lg.addColorStop(0.25, 'rgba(220,183,94,0.9)'); lg.addColorStop(0.75, 'rgba(220,183,94,0.9)'); lg.addColorStop(1, 'rgba(220,183,94,0)');
    ctx.strokeStyle = lg; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-half, dy); ctx.lineTo(-tw / 2 - 10, dy); ctx.moveTo(tw / 2 + 10, dy); ctx.lineTo(half, dy); ctx.stroke();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#eadbb4';
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 6;
    let cx2 = -tw / 2; for (const c of chars) { ctx.fillText(c, cx2, dy + 1); cx2 += ctx.measureText(c).width + sp; }
    ctx.restore();
    diamond(0, dy + 15, 5); diamond(0, dy + 15, 2.2, '#151b28');
    ctx.restore();
  }

  // ---- slow golden dust in front of the scene
  const EMBERS = Array.from({ length: 22 }, (_, i) => ({ x: (i * 97) % W, y: (i * 211) % 860, s: 0.6 + (i % 5) * 0.35, v: 6 + (i % 7) * 2.2, ph: i * 1.7 }));
  function drawEmbers() {
    if (REDUCED_MOTION || QL === 'low') return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const e of EMBERS) {
      e.y -= e.v * pdt; if (e.y < -10) { e.y = H + 10; e.x = Math.random() * W; }
      const x = e.x + Math.sin(pNow / 1400 + e.ph) * 8, a = 0.25 + 0.25 * Math.sin(pNow / 700 + e.ph);
      const g = ctx.createRadialGradient(x, e.y, 0, x, e.y, e.s * 4); g.addColorStop(0, `rgba(255,214,130,${a})`); g.addColorStop(1, 'rgba(255,214,130,0)');
      ctx.fillStyle = g; ctx.fillRect(x - e.s * 4, e.y - e.s * 4, e.s * 8, e.s * 8);
    }
    ctx.restore();
  }

  // ---- top bar: language segments, music + sound, settings
  function capsule(x, y, w, h) {
    rr(ctx, x, y, w, h, h / 2);
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(24,31,46,0.92)'); g.addColorStop(1, 'rgba(10,13,20,0.92)');
    ctx.fillStyle = g; ctx.fill();
    goldFrame(x, y, w, h, h / 2, 1.3);
  }
  function topBar() {
    const y = 22, h = 32;
    // language: one capsule, three segments, the active one is a gold pill
    avatarButton(10, y, h);
    const lx = 48, lw = 122, langs = [['ru', 'RU'], ['kz', 'ҚАЗ'], ['en', 'EN']], sw = lw / 3;
    capsule(lx, y, lw, h);
    langs.forEach(([id, label], i) => {
      const sx = lx + i * sw, on = lang === id;
      if (on) {
        rr(ctx, sx + 3, y + 3, sw - 6, h - 6, (h - 6) / 2);
        const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#f8e19a'); g.addColorStop(0.5, '#d9ad4e'); g.addColorStop(1, '#a9781f');
        ctx.fillStyle = g; ctx.fill();
      }
      txt(label, sx + sw / 2, y + h / 2 + 1, 12.5, on ? '#2b1a05' : T.text, { weight: 800 });
      ui.push({ x: sx, y: y - 4, w: sw, h: h + 8, fn: () => { if (lang !== id) { setLang(id); Sound.click(); } } });
    });
    // music + sound in one capsule
    const mx = W - 142, mw = 86;
    capsule(mx, y, mw, h);
    ctx.strokeStyle = 'rgba(220,183,94,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(mx + mw / 2, y + 7); ctx.lineTo(mx + mw / 2, y + h - 7); ctx.stroke();
    icoNote(mx + mw / 4, y + h / 2, 15, Sound.music ? T.gold : T.dim);
    if (!Sound.music) { ctx.strokeStyle = T.dim; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(mx + mw / 4 - 8, y + h / 2 + 8); ctx.lineTo(mx + mw / 4 + 8, y + h / 2 - 8); ctx.stroke(); }
    icoSpeaker(mx + mw * 3 / 4, y + h / 2, 14, Sound.sfx ? T.gold : T.dim, !Sound.sfx);
    ui.push({ x: mx, y: y - 4, w: mw / 2, h: h + 8, fn: () => { Sound.init(); Sound.setMusic(!Sound.music); } });
    ui.push({ x: mx + mw / 2, y: y - 4, w: mw / 2, h: h + 8, fn: () => { Sound.init(); Sound.setSfx(!Sound.sfx); } });
    // install the game as an app (hidden once it runs as the installed app)
    if (!isInstalledApp()) {
      const ix = 176, pulse = REDUCED_MOTION ? 0 : 0.5 + 0.5 * Math.sin(pNow / 500);
      ctx.save(); ctx.shadowColor = `rgba(255,200,90,${0.25 + pulse * 0.35})`; ctx.shadowBlur = 10; capsule(ix, y, 38, h); ctx.restore();
      capsule(ix, y, 34, h);
      icoInstall(ix + 17, y + h / 2, 15, T.goldLt);
      ui.push({ x: ix - 2, y: y - 4, w: 38, h: h + 8, fn: doInstall });
    }
    // settings (graphics quality)
    const gx = W - 48;
    capsule(gx, y, 36, h);
    icoGear(gx + 18, y + h / 2, 15, T.gold);
    ui.push({ x: gx - 2, y: y - 4, w: 40, h: h + 8, fn: () => { menuPopup = 'settings'; Sound.click(); } });
  }

  // ---- counters: coins, gems, energy (+ opens the energy shop)
  function counters() {
    const y = 64, h = 28, gap = 6, w = (W - 24 - gap * 2) / 3;
    const e = Save.data.energy, full = e.val >= ENERGY_MAX;
    const items = [
      [(x, yy) => coinIcon(x, yy, 9), String(bank), null],
      [(x, yy) => gemIcon(x, yy, 9), String(Save.data.gems), null],
      [(x, yy) => boltIcon(x, yy, 9), e.val + '/' + ENERGY_MAX, () => { menuPopup = 'energy'; Sound.click(); }],
    ];
    items.forEach(([icon, label, plus], i) => {
      const x = 12 + i * (w + gap);
      capsule(x, y, w, h);
      icon(x + 15, y + h / 2);
      txt(label, x + 29, y + h / 2 + 1, fitText(label, w - (plus ? 58 : 36), 13, 800), T.text, { align: 'left', weight: 800 });
      if (plus) {
        const px = x + w - 14;
        ctx.beginPath(); ctx.arc(px, y + h / 2, 9, 0, TAU); ctx.fillStyle = 'rgba(220,183,94,0.16)'; ctx.fill(); ctx.strokeStyle = T.gold; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.strokeStyle = T.goldLt; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(px - 4, y + h / 2); ctx.lineTo(px + 4, y + h / 2); ctx.moveTo(px, y + h / 2 - 4); ctx.lineTo(px, y + h / 2 + 4); ctx.stroke();
        ui.push({ x, y: y - 4, w, h: h + 8, fn: plus });
      }
      if (i === 2 && !full) txt('+1 ⚡ ' + fmtTime(energyLeftMs()), x + w / 2, y + h + 9, 9.5, T.muted, { weight: 600, shadow: 'rgba(0,0,0,0.9)', blur: 4, dy: 0 });
    });
  }

  // ---- bottom tab bar
  const TAB_ICON = { fight: icoSwords, gear: icoHelmet, talents: icoTree, quests: icoScroll, pass: (x, y, s, c) => icoRoad(x, y, s, c) };
  const TABS = ['fight', 'gear', 'talents', 'quests', 'pass'];
  function tabBar() {
    const y = TAB_Y, h = 60, gap = 5, w = (W - 16 - gap * (TABS.length - 1)) / TABS.length;
    const bg = ctx.createLinearGradient(0, y - 10, 0, H); bg.addColorStop(0, 'rgba(9,12,19,0)'); bg.addColorStop(0.18, 'rgba(9,12,19,0.94)'); bg.addColorStop(1, 'rgba(6,8,13,0.98)');
    ctx.fillStyle = bg; ctx.fillRect(0, y - 10, W, H - y + 10);
    frameBand(y - 4);
    TABS.forEach((id, i) => {
      const x = 8 + i * (w + gap), on = menuTab === id, ty = y + 6, down = isPressed(x, ty, w, h);
      ctx.save(); if (down) ctx.translate(0, 2);
      rr(ctx, x, ty, w, h, 10);
      const g = ctx.createLinearGradient(0, ty, 0, ty + h);
      if (on) { g.addColorStop(0, 'rgba(120,86,28,0.95)'); g.addColorStop(1, 'rgba(46,32,10,0.95)'); } else { g.addColorStop(0, 'rgba(26,33,48,0.95)'); g.addColorStop(1, 'rgba(12,15,23,0.95)'); }
      ctx.fillStyle = g; ctx.fill();
      if (on) { ctx.save(); ctx.shadowColor = 'rgba(240,190,90,0.7)'; ctx.shadowBlur = 12; goldFrame(x, ty, w, h, 10, 2); ctx.restore(); }
      else { rr(ctx, x, ty, w, h, 10); ctx.strokeStyle = 'rgba(220,183,94,0.35)'; ctx.lineWidth = 1.2; ctx.stroke(); }
      TAB_ICON[id](x + w / 2, ty + 22, 15, on ? T.goldLt : '#b9a476');
      const label = mt('tab' + id[0].toUpperCase() + id.slice(1));
      txt(label, x + w / 2, ty + 46, fitText(label, w - 6, 10.5, 700), on ? '#fff3d6' : T.muted, { weight: 700 });
      const badge = id === 'quests' ? questsReady() + (canClaimDaily() ? 1 : 0) : id === 'gear' ? (gearItems().some(canMerge) ? 1 : 0) : id === 'pass' ? passReady() : 0;
      if (badge) {
        const bx = x + w - 10, by = ty + 8;
        ctx.beginPath(); ctx.arc(bx, by, 8, 0, TAU); ctx.fillStyle = '#c4161c'; ctx.fill(); ctx.strokeStyle = '#ffd7a0'; ctx.lineWidth = 1.2; ctx.stroke();
        txt(badge > 9 ? '!' : String(badge), bx, by + 0.5, 10, '#fff', { weight: 800 });
      }
      ctx.restore();
      ui.push({ x, y: ty, w, h, fn: () => { if (menuTab !== id) { menuTab = id; invPage = 0; Sound.click(); } } });
    });
  }

  // ---- Battle tab: logo, PLAY, hint, record
  function drawFightTab() {
    const top = SAFE.t;
    // logo fades in and settles whenever the menu opens
    const k = REDUCED_MOTION ? 1 : easeOut(since(logoT0) / 0.9), float = REDUCED_MOTION ? 0 : Math.sin(pNow / 1300) * 1.5;
    const extra = clamp((H - SAFE.t - SAFE.b - 640) / 200, 0, 1);   // tall phones: a bigger logo a little lower
    drawLogo(W / 2, top + 170 + extra * 22 + (1 - k) * 14 + float, 0.84 + extra * 0.18, k);
    // PLAY: gold plate with pointed ends, soft breathing glow
    const pw = 300, ph = 56, px = (W - pw) / 2, py = TAB_Y - 180;
    if (!REDUCED_MOTION) {
      const gl = 0.35 + 0.25 * Math.sin(pNow / 600);
      ctx.save(); ctx.shadowColor = `rgba(255,196,90,${gl})`; ctx.shadowBlur = 26; hexPath(px, py, pw, ph, ph * 0.42); ctx.fillStyle = 'rgba(255,200,90,0.01)'; ctx.fill(); ctx.restore();
    }
    // ornament knot above the button
    diamond(W / 2, py - 9, 7); diamond(W / 2, py - 9, 3, '#151b28');
    button(px, py, pw, ph, tr('play'), () => { Sound.init(); Sound.click(); startGame(); },
      { shape: 'hex', size: 22, icon: (x, y, s, c) => icoSwords(x, y, s * 0.95, c), sub: '⚡' + RUN_COST });
    // sheen sweeping across the plate
    if (!REDUCED_MOTION) {
      const ph2 = ((pNow / 1000) % 3.4) / 3.4, sx = px - 60 + ph2 * (pw + 240);
      if (sx < px + pw + 40) {
        ctx.save(); hexPath(px, py, pw, ph, ph * 0.42); ctx.clip();
        const sg = ctx.createLinearGradient(sx - 30, 0, sx + 30, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,252,235,0.35)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sg; ctx.fillRect(px, py, pw, ph); ctx.restore();
      }
    }
    // survival arena: the bonus mode for coins and levels
    // timed bonus round, entered with a ticket; locked until the first boss (Dau) is beaten
    const aw = 250, ax = (W - aw) / 2, ay = TAB_Y - 114, open = arenaUnlocked();
    if (open) {
      button(ax, ay, aw, 40, mt('survival') + ' · 3:00', () => { Sound.init(); Sound.click(); startGame('survival'); },
        { col: '#7a2a24', col2: '#3a1210', size: 13, icon: (x, y, s, c) => icoArena(x, y, s * 1.05, T.goldLt), sub: '🎟' + Save.data.tickets.n });
    } else {
      button(ax, ay, aw, 40, '🔒 ' + mt('arenaLocked'), () => { Sound.click(); }, { col: '#2a3040', col2: '#151a26', size: 11 });
    }
    // hint and record
    const hy = TAB_Y - 58;
    const hs = fitText(tr('hint'), W - 70, 12, 600); ctx.font = `600 ${hs}px ${FONT}`; const hw = ctx.measureText(tr('hint')).width;
    icoHand(W / 2 - (hw + 22) / 2 + 7, hy, 14, T.gold);
    txt(tr('hint'), W / 2 + 11, hy + 1, hs, T.text, { weight: 600, shadow: 'rgba(0,0,0,0.9)', blur: 6, dy: 0 });
    const ry = TAB_Y - 36, rl = tr('best', best) + (Save.data.bestWave ? '  ·  ' + mt('arenaRec', Save.data.bestWave) : '');
    ctx.font = `700 12px ${FONT}`; const rw = ctx.measureText(rl).width;
    icoTrophy(W / 2 - rw / 2 - 10, ry, 13, T.gold);
    txt(rl, W / 2 + 6, ry + 1, fitText(rl, W - 60, 12, 700), T.text, { weight: 700, shadow: 'rgba(0,0,0,0.9)', blur: 6, dy: 0 });
    const bx = 60, bw = W - 120, by = ry + 12;
    rr(ctx, bx, by, bw, 5, 2.5); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fill(); ctx.strokeStyle = 'rgba(220,183,94,0.3)'; ctx.lineWidth = 1; ctx.stroke();
    const fk = clamp(best / TOTAL_ROOMS, 0, 1);
    if (fk > 0) {
      rr(ctx, bx, by, Math.max(6, bw * fk), 5, 2.5); const fg = ctx.createLinearGradient(bx, 0, bx + bw, 0); fg.addColorStop(0, '#a8781f'); fg.addColorStop(1, '#ffe08a'); ctx.fillStyle = fg; ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const ex = bx + bw * fk, eg = ctx.createRadialGradient(ex, by + 2.5, 0, ex, by + 2.5, 10); eg.addColorStop(0, 'rgba(255,230,150,0.9)'); eg.addColorStop(1, 'rgba(255,230,150,0)'); ctx.fillStyle = eg; ctx.fillRect(ex - 10, by - 8, 20, 21); ctx.restore();
    }
  }

  // ---- installing the game as an app: Chrome's own prompt when it is ready, otherwise step-by-step help for this browser
  const isInstalledApp = () => !!(window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) || navigator.standalone === true;
  function doInstall() {
    Sound.click();
    const p = installPrompt;
    if (p) {
      installPrompt = null; menuPopup = null;
      try { Promise.resolve(p.prompt()).catch(() => { menuPopup = 'install'; }); } catch (e) { menuPopup = 'install'; }
    } else menuPopup = 'install';
  }
  function installSteps() {
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
    if (/Telegram|WhatsApp|Instagram|FBAN|FBAV|wv\)/.test(ua)) return 'inapp';
    if (/SamsungBrowser/.test(ua)) return 'samsung';
    return 'chrome';
  }
  function icoInstall(x, y, s, c) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20); ctx.strokeStyle = c; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    rr(ctx, -7, -12, 14, 24, 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, 4); ctx.moveTo(-4, 0); ctx.lineTo(0, 4); ctx.lineTo(4, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-2.5, 8.5); ctx.lineTo(2.5, 8.5); ctx.stroke();
    ctx.restore();
  }
  function drawInstallPopup() {
    const kind = installSteps(), steps = mt('inst_' + kind).split('|');
    panel(24, 140, W - 48, 356);
    icoInstall(W / 2, 182, 26, T.goldLt);
    txt(mt('installTitle'), W / 2, 218, 20, T.gold, { f: 'head', weight: 700 });
    steps.forEach((st, i) => {
      const y = 256 + i * 56;
      ctx.beginPath(); ctx.arc(52, y, 11, 0, TAU); ctx.fillStyle = 'rgba(220,183,94,0.18)'; ctx.fill(); ctx.strokeStyle = T.gold; ctx.lineWidth = 1.2; ctx.stroke();
      txt(String(i + 1), 52, y + 0.5, 12, T.goldLt, { weight: 800 });
      wrap(st, 72, y - 6, W - 124, 15, 12.5, T.text, { align: 'left', weight: 600 });
    });
    button(W / 2 - 70, 432, 140, 42, mt('ok'), () => { menuPopup = null; Sound.click(); }, { size: 15 });
  }

  // ---- settings popup: graphics quality (the same four modes as before)
  function drawSettingsPopup() {
    const inst = !isInstalledApp();
    panel(30, 190, W - 60, 268 + (inst ? 58 : 0));
    txt(tr('graphics'), W / 2, 226, 22, T.gold, { f: 'head', weight: 700 });
    ['auto', 'low', 'medium', 'high'].forEach((q, i) => {
      const on = Save.data.settings.quality === q;
      button(54, 250 + i * 46, W - 108, 38, tr('q' + q), () => { setQuality(q); Sound.click(); }, on ? { size: 14 } : { size: 14, col: '#2a3550', col2: '#151c2c' });
    });
    if (inst) button(54, 440, W - 108, 42, mt('install'), doInstall, { size: 14, col: '#2f6a3a', col2: '#163a1e', icon: (x, yy, s, c) => icoInstall(x, yy, s, c) });
    txt('×', W - 48, 208, 20, T.muted, { weight: 600 });
    ui.push({ x: W - 70, y: 190, w: 40, h: 36, fn: () => { menuPopup = null; Sound.click(); } });
  }

  // ---- the menu frame around every tab
  function drawMenu() {
    energyTick(); ticketsTick();
    achUpdate();
    TAB_Y = H - SAFE.b - 72;
    if (!dailyShown && G3.heroSpear && splashA <= 0) { dailyShown = true; if (canClaimDaily() && !TEST_MODE) menuPopup = 'daily'; }
    // cinematic grade over the 3D scene: dark top and bottom so the gold chrome reads
    // dusk grade: deep navy sky fading into the amber horizon (the concept's palette)
    const sky = H * 0.62;
    const tg = ctx.createLinearGradient(0, 0, 0, sky); tg.addColorStop(0, 'rgba(8,12,22,0.95)'); tg.addColorStop(0.35, 'rgba(14,24,44,0.72)'); tg.addColorStop(0.75, 'rgba(20,30,52,0.32)'); tg.addColorStop(1, 'rgba(20,30,52,0)');
    ctx.fillStyle = tg; ctx.fillRect(0, 0, W, sky);
    const bgr = ctx.createLinearGradient(0, TAB_Y - 210, 0, TAB_Y); bgr.addColorStop(0, 'rgba(8,11,18,0)'); bgr.addColorStop(1, 'rgba(8,11,18,0.75)');
    ctx.fillStyle = bgr; ctx.fillRect(0, TAB_Y - 210, W, 210);
    drawEmbers();
    shiftUI(SAFE.t, () => {
      frameBand(8);
      const tk = tabEase();
      ctx.save(); ctx.globalAlpha = 0.25 + 0.75 * tk; ctx.translate((1 - tk) * 26, 0);
      if (menuTab === 'gear') drawGearTab();
      else if (menuTab === 'talents') drawTalentsTab();
      else if (menuTab === 'quests') drawQuestsTab();
      else if (menuTab === 'profile') drawProfileTab();
      else if (menuTab === 'rating') drawRatingTab();
      else if (menuTab === 'ach') drawAchTab();
      else if (menuTab === 'pass') drawPassTab();
      ctx.restore();
      topBar();
      counters();
    });
    if (menuTab === 'fight') { const tk = tabEase(); ctx.save(); ctx.globalAlpha = 0.25 + 0.75 * tk; drawFightTab(); ctx.restore(); }
    tabBar();
    if (menuPopup === 'comic') { ui.push({ x: 0, y: 0, w: W, h: H, fn: null }); drawComic(); return; }
    shiftUI(SAFE.t, () => drawToasts(pdt));
    if (menuPopup) { ui.push({ x: 0, y: 0, w: W, h: H, fn: null }); overlay(0.7 * clamp(since(popT0) / 0.15, 0, 1)); }
    if (menuPopup === 'item') withPop(drawItemPopup, true);
    else if (menuPopup === 'reward') withPop(drawRewardPopup, false);
    else if (menuPopup === 'energy') withPop(drawEnergyPopup, true);
    else if (menuPopup === 'daily') withPop(drawDailyPopup, true);
    else if (menuPopup === 'settings') withPop(drawSettingsPopup, true);
    else if (menuPopup === 'install') withPop(drawInstallPopup, true);
    else if (menuPopup === 'tickets') withPop(drawTicketsPopup, true);
  }
