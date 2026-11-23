  // =================================================================== polish: splash, transitions, press feedback, tutorial, haptics
  let press = null, pNow = performance.now(), pdt = 0;
  let splashA = TEST_MODE ? 0 : 1, splashOut = TEST_MODE, splashT0 = performance.now(), tipI = 0;
  let lastScene = null, transA = 0, lastTab = null, tabT0 = 0, lastPopup = null, popT0 = 0;
  const tut = { step: 0, moveT: 0, stillT: 0, doneT: 0 };

  const easeOut = k => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
  const easeBack = k => { k = clamp(k, 0, 1); const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
  const since = t0 => (pNow - t0) / 1000;

  // a button looks pushed in for a moment after a tap inside it
  function isPressed(x, y, w, h) {
    return press && pNow - press.t < 140 && press.x >= x && press.x <= x + w && press.y >= y && press.y <= y + h;
  }

  // short vibration on phones (only when sound effects are on: one switch for "feedback")
  function buzz(p) {
    if (SIM.on || !Sound.sfx || !navigator.vibrate) return;
    try { navigator.vibrate(p); } catch (e) { /* not allowed before the first tap */ }
  }

  function polishTick() {
    const now = performance.now(); pdt = Math.min(0.05, (now - pNow) / 1000); pNow = now;
    if (lastScene !== scene) { if (lastScene !== null) transA = 1; lastScene = scene; }
    transA = Math.max(0, transA - pdt * 2.6);
    if (menuTab !== lastTab) { lastTab = menuTab; tabT0 = now; }
    if (menuPopup !== lastPopup) { lastPopup = menuPopup; popT0 = now; }
    if (!splashOut && (G3.heroSpear && since(splashT0) > 2.4 || since(splashT0) > 20)) splashOut = true;
    if (splashOut) splashA = Math.max(0, splashA - pdt * 1.6);
  }

  // ---- splash while the menu scene loads
  const TIPS = {
    ru: ['Стойте на месте — батыр стреляет сам', 'Ящики с припасами можно открыть выстрелом', 'Три одинаковых предмета объединяются в более редкий', 'Бомба сносит вражеские снаряды', 'Қыдыр ата помогает тем, кто дошёл до ворот', 'Заходите каждый день: на 7-й день эпический предмет'],
    kz: ['Орнында тұрыңыз — батыр өзі атады', 'Жәшіктерді оқпен ашуға болады', 'Үш бірдей зат сирегіне бірігеді', 'Бомба жау оқтарын жояды', 'Қыдыр ата қақпаға жеткендерге көмектеседі', 'Күнде кіріңіз: 7-күні эпикалық зат'],
    en: ['Stand still and the batyr shoots by himself', 'Supply crates open with an arrow too', 'Three identical items merge into a rarer one', 'A bomb wipes out enemy projectiles', 'Kydyr ata helps those who reach the gate', 'Come back daily: an epic item on day 7'],
  };
  function drawSplash() {
    if (splashA <= 0) return;
    ui.push({ x: 0, y: 0, w: W, h: H, fn: null });
    ctx.save(); ctx.globalAlpha = splashA;
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b3a46'); g.addColorStop(0.55, '#07262e'); g.addColorStop(1, '#1a0f0a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // soft sun disc behind the logo
    const sun = ctx.createRadialGradient(W / 2, 250, 10, W / 2, 250, 200);
    sun.addColorStop(0, 'rgba(255,200,90,0.35)'); sun.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = sun; ctx.fillRect(0, 50, W, 400);
    ornamentBand(ctx, 0, 0, W, 16, C.red, C.gold); ornamentBand(ctx, 0, H - 16, W, 16, C.red, C.gold);
    const t = since(splashT0), rise = easeOut(t / 0.9);
    ctx.save(); ctx.globalAlpha = splashA * rise;
    koshkar(ctx, W / 2, 178 - (1 - rise) * 20, 40 + Math.sin(t * 2) * 1.5, C.gold, 4);
    txt('БАТЫР01', W / 2, 250 + (1 - rise) * 16, fitText('БАТЫР01', W - 50, 60), C.gold, { stroke: C.ink, lw: 11, weight: 900 });
    txt(tr('subtitle'), W / 2, 298, 15, C.cream, { stroke: C.ink, lw: 4, weight: 900 });
    ctx.restore();
    const k = (G3.loadDone || 0) / (G3.loadTotal || 1), bw = 220, bx = (W - bw) / 2, by = 440;
    rr(ctx, bx - 2, by - 6, bw + 4, 12, 6); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
    const fillW = Math.max(8, bw * (G3.heroSpear ? Math.max(k, 0.35) : Math.min(0.33, 0.05 + t * 0.08)));
    rr(ctx, bx, by - 4, fillW, 8, 4); const pg = ctx.createLinearGradient(bx, 0, bx + bw, 0); pg.addColorStop(0, C.goldDk); pg.addColorStop(1, '#ffe27a'); ctx.fillStyle = pg; ctx.fill();
    txt(tr('loading'), W / 2, by + 22, 12, '#9fb3b8', { weight: 700 });
    tipI = Math.floor(t / 3.2) % TIPS.ru.length;
    const tip = TIPS[lang][tipI], ta = clamp(Math.min((t % 3.2) / 0.4, (3.2 - t % 3.2) / 0.4), 0, 1);
    ctx.save(); ctx.globalAlpha = splashA * ta;
    wrap('💡 ' + tip, W / 2, 520, W - 70, 18, 13, C.cream, { weight: 700 });
    ctx.restore();
    ctx.restore();
  }

  // ---- whole-screen fade when the scene changes (menu → battle → results → menu)
  function drawTransition() {
    if (transA <= 0) return;
    ctx.fillStyle = `rgba(4,16,22,${easeOut(transA) * 0.95})`; ctx.fillRect(0, 0, W, H);
  }
  // tab content slides in, popups pop
  function tabEase() { return easeOut(since(tabT0) / 0.22); }
  function popEase() { return easeBack(since(popT0) / 0.26); }
  function withPop(fn) {
    const k = popEase(), a = clamp(since(popT0) / 0.12, 0, 1);
    ctx.save(); ctx.globalAlpha = a;
    ctx.translate(W / 2, H / 2); ctx.scale(0.86 + 0.14 * k, 0.86 + 0.14 * k); ctx.translate(-W / 2, -H / 2);
    fn(); ctx.restore();
  }

  // ---- chest and reward reveal
  function drawChest(x, y, s, col, lid) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, s * 0.62, s * 0.8, s * 0.14, 0, 0, TAU); ctx.fill();
    rr(ctx, -s * 0.7, -s * 0.05, s * 1.4, s * 0.65, s * 0.08); ctx.fillStyle = '#7a4a22'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    ctx.save(); ctx.translate(0, -s * 0.05); ctx.rotate(-lid * 0.9);
    ctx.beginPath(); ctx.moveTo(-s * 0.7, 0); ctx.quadraticCurveTo(-s * 0.7, -s * 0.5, 0, -s * 0.52); ctx.quadraticCurveTo(s * 0.7, -s * 0.5, s * 0.7, 0); ctx.closePath();
    ctx.fillStyle = '#8f5a2a'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = col; ctx.fillRect(-s * 0.08, -s * 0.52, s * 0.16, s * 0.52);
    ctx.restore();
    ctx.fillStyle = col; ctx.fillRect(-s * 0.08, -s * 0.05, s * 0.16, s * 0.65);
    for (const sx of [-1, 1]) { ctx.fillRect(sx * s * 0.62 - s * 0.04, -s * 0.05, s * 0.08, s * 0.65); }
    ctx.fillStyle = C.gold; rr(ctx, -s * 0.13, s * 0.05, s * 0.26, s * 0.24, 4); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, s * 0.14, s * 0.04, 0, TAU); ctx.fill(); ctx.fillRect(-s * 0.015, s * 0.14, s * 0.03, s * 0.08);
    koshkar(ctx, 0, -s * 0.3, s * 0.18, C.gold, 2);
    ctx.restore();
  }
  function rays(x, y, r, col, a, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= a;
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    for (let i = 0; i < 12; i++) { ctx.rotate(TAU / 12); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, -r * 0.13); ctx.lineTo(r, r * 0.13); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  const countUp = (v, k) => Math.round(v * easeOut(k));

  // ---- first-run tutorial in room 1
  function tutActive() { return scene === 'play' && !modal && run && run.room === 1 && !Save.data.tut && introT <= 0 && !SIM.on; }
  function tutTick(dt) {
    if (!tutActive()) return;
    if (tut.step === 0) { if (player.moving) tut.moveT += dt; if (tut.moveT > 0.7) tut.step = 1; }
    else if (tut.step === 1) { if (!player.moving) tut.stillT += dt; if (tut.stillT > 1.4 || run.kills > 0) { tut.step = 2; tut.doneT = 0; } }
    else { tut.doneT += dt; if (tut.doneT > 1.6) { Save.data.tut = true; Save.write(); } }
  }
  function drawTutorial() {
    if (!tutActive()) return;
    const msg = mt(['tutMove', 'tutStop', 'tutGood'][tut.step]);
    const y = 104;
    rr(ctx, 30, y - 24, W - 60, 46, 14); ctx.fillStyle = 'rgba(7,30,38,0.82)'; ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
    txt(msg, W / 2, y - 1, fitText(msg, W - 80, 15), '#fff', { weight: 900 });
    if (tut.step === 0) {
      // finger swiping left and right
      const k = (Math.sin(pNow / 420) + 1) / 2, hx = W / 2 - 60 + k * 120, hy = 540;
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(W / 2 - 60, hy); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(hx, hy, 14, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(hx, hy, 22 + Math.sin(pNow / 200) * 3, 0, TAU); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.stroke();
    } else if (tut.step === 1) {
      const pulse = 0.5 + Math.sin(pNow / 180) * 0.5;
      ctx.strokeStyle = `rgba(244,196,48,${0.4 + pulse * 0.5})`; ctx.lineWidth = 3;
      const p = proj(player.x, 0.1, player.y);
      ctx.beginPath(); ctx.arc(p.x, p.y, 28 + pulse * 8, 0, TAU); ctx.stroke();
    }
  }
