  // =================================================================== profile, glory rating, arena tickets
  // Glory (слава) is earned by every run and never lost; it decides the league and the place on the ladder of epic heroes.
  const LEAGUES = [
    { g: 0, col: '#b08d57', name: { ru: 'Жас батыр', kz: 'Жас батыр', en: 'Young Batyr' } },
    { g: 300, col: '#c0c6cf', name: { ru: 'Сарбаз', kz: 'Сарбаз', en: 'Soldier' } },
    { g: 800, col: '#e0b84a', name: { ru: 'Жауынгер', kz: 'Жауынгер', en: 'Warrior' } },
    { g: 1800, col: '#3fc98a', name: { ru: 'Батыр', kz: 'Батыр', en: 'Batyr' } },
    { g: 3500, col: '#4aa8ff', name: { ru: 'Ер батыр', kz: 'Ер батыр', en: 'Hero' } },
    { g: 6000, col: '#e0503a', name: { ru: 'Хан батыр', kz: 'Хан батыры', en: "Khan's Champion" } },
    { g: 10000, col: '#c98bff', name: { ru: 'Аңыз', kz: 'Аңыз', en: 'Legend' } },
  ];
  // heroes of the Kazakh epics: milestones to overtake on the glory ladder (not real players)
  const LEGENDS = [
    { g: 9000, name: { ru: 'Алпамыс', kz: 'Алпамыс', en: 'Alpamys' } },
    { g: 7200, name: { ru: 'Қобыланды', kz: 'Қобыланды', en: 'Kobylandy' } },
    { g: 5600, name: { ru: 'Ер Тарғын', kz: 'Ер Тарғын', en: 'Er Targyn' } },
    { g: 4200, name: { ru: 'Ер Төстік', kz: 'Ер Төстік', en: 'Er Tostik' } },
    { g: 3000, name: { ru: 'Едіге', kz: 'Едіге', en: 'Edige' } },
    { g: 2000, name: { ru: 'Қамбар', kz: 'Қамбар', en: 'Kambar' } },
    { g: 1300, name: { ru: 'Шора', kz: 'Шора', en: 'Shora' } },
    { g: 700, name: { ru: 'Ер Сайын', kz: 'Ер Сайын', en: 'Er Sayin' } },
    { g: 250, name: { ru: 'Қозы Көрпеш', kz: 'Қозы Көрпеш', en: 'Kozy Korpesh' } },
  ];
  const leagueOf = g => { let i = 0; for (let k = 0; k < LEAGUES.length; k++) if (g >= LEAGUES[k].g) i = k; return i; };
  const playerName = () => (Save.data.profile.name || '').trim() || mt('defaultName');

  // ---- tickets for the arena: one free a day, one per story boss, one for all daily quests, or 15 gems
  const TICKET_MAX = 5, TICKET_GEMS = 15;
  const arenaUnlocked = () => TEST_MODE || best >= 6 || (Save.data.bestWave || 0) > 0;
  function ticketsTick() {
    const t = Save.data.tickets, d = todayStr();
    if (t.day !== d) { t.day = d; t.n = Math.min(TICKET_MAX, t.n + 1); Save.write(); }
  }
  function addTicket(n) { const t = Save.data.tickets; t.n = Math.min(TICKET_MAX, t.n + (n || 1)); Save.write(); }
  function spendTicket() {
    if (TEST_MODE) return true;
    ticketsTick();
    const t = Save.data.tickets; if (t.n <= 0) return false;
    t.n--; Save.write(); return true;
  }
  function buyTicket() {
    if (Save.data.gems < TICKET_GEMS || Save.data.tickets.n >= TICKET_MAX) return false;
    Save.data.gems -= TICKET_GEMS; addTicket(1); Sound.level(); return true;
  }

  // ---- what a finished run is worth, and the lifetime statistics
  function gloryFor(won) {
    if (isSurv()) return 18 * wavesDone() + Math.floor(run.coins / 5) + (won ? 80 : 0);
    const reached = won ? TOTAL_ROOMS : run.room;
    return 12 * Math.max(0, reached - 1) + 40 * (run.bossKills || 0) + (won ? 150 : 0);
  }
  // called once per finished or abandoned run
  function recordRun(won) {
    if (SIM.on || !run || run.recorded) return;
    run.recorded = true;
    const st = Save.data.stats;
    st.runs++; if (won) st.wins++;
    if (isSurv()) { st.arenaRuns++; if (won) st.arenaWins++; } else if (won && !run.revived) st.noRevWins++;
    st.coins += run.coins; st.time += Math.round(run.t || 0);
    run.glory = gloryFor(won);
    Save.data.glory += run.glory;
    Save.write(); achUpdate();
  }

  // ---- avatars: gold emblems on a coloured disc
  const AVATARS = [['#7a2a24', 'eagle'], ['#1f4f7a', 'wolf'], ['#2f6a3a', 'horse'], ['#6a3a8a', 'shanyrak'], ['#8a6a1a', 'bow'], ['#3a3f4a', 'koshkar']];
  function drawAvatar(x, y, r, idx, ring) {
    ring = ring || frameCol();
    const [bg, kind] = AVATARS[idx % AVATARS.length];
    ctx.save();
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, bg); g.addColorStop(1, '#0b0f17');
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = Math.max(1.8, r * 0.11); ctx.strokeStyle = ring; ctx.stroke();
    ctx.translate(x, y); ctx.scale(r / 30, r / 30); ctx.fillStyle = goldGrad(-24, 48); ctx.strokeStyle = goldGrad(-24, 48); ctx.lineWidth = 3; ctx.lineCap = 'round';
    if (kind === 'eagle') { ctx.save(); ctx.translate(0, 4); ctx.scale(0.42, 0.42); eaglePath(); ctx.fill('evenodd'); ctx.restore(); }
    else if (kind === 'wolf') { ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(-8, -2); ctx.lineTo(-12, 8); ctx.lineTo(0, 16); ctx.lineTo(12, 8); ctx.lineTo(8, -2); ctx.lineTo(14, -14); ctx.lineTo(4, -6); ctx.lineTo(-4, -6); ctx.closePath(); ctx.fill(); }
    else if (kind === 'horse') { ctx.beginPath(); ctx.moveTo(-8, 16); ctx.lineTo(-6, -2); ctx.quadraticCurveTo(-4, -16, 8, -16); ctx.lineTo(14, -8); ctx.lineTo(10, -4); ctx.lineTo(4, -6); ctx.lineTo(6, 16); ctx.closePath(); ctx.fill(); }
    else if (kind === 'shanyrak') { ctx.beginPath(); ctx.arc(0, 0, 13, 0, TAU); ctx.stroke(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 13, Math.sin(a) * 13); ctx.lineTo(-Math.cos(a) * 13, -Math.sin(a) * 13); ctx.stroke(); } }
    else if (kind === 'bow') { ctx.beginPath(); ctx.arc(-6, 0, 16, -1.1, 1.1); ctx.stroke(); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-6 + 16 * Math.cos(1.1), -16 * Math.sin(1.1)); ctx.lineTo(-6 + 16 * Math.cos(1.1), 16 * Math.sin(1.1)); ctx.stroke(); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(16, 0); ctx.stroke(); }
    else koshkar(ctx, 0, 0, 20, '#e2bd60', 3);
    ctx.restore();
  }
  function leagueBadge(x, y, s, li) {
    const L = LEAGUES[li];
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * TAU / 6; ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s); } ctx.closePath();
    const g = ctx.createLinearGradient(0, -s, 0, s); g.addColorStop(0, L.col); g.addColorStop(1, '#141a28');
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = goldGrad(-s, s * 2); ctx.stroke();
    txt(String(li + 1), 0, 1, s * 0.9, '#fff', { weight: 900, shadow: 'rgba(0,0,0,0.8)', blur: 3, dy: 1 });
    ctx.restore();
  }

  // ---- top-bar avatar button
  function avatarButton(x, y, h) {
    drawAvatar(x + h / 2, y + h / 2, h / 2, Save.data.profile.avatar);
    ui.push({ x: x - 2, y: y - 4, w: h + 4, h: h + 8, fn: () => { menuTab = 'profile'; Sound.click(); } });
  }

  // ---- Profile tab
  function fmtDur(s) { const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return h ? h + mt('hShort') + ' ' + m + mt('mShort') : m + mt('mShort'); }
  function drawProfileTab() {
    const p = Save.data.profile, st = Save.data.stats, g = Save.data.glory, li = leagueOf(g), L = LEAGUES[li], N = LEAGUES[li + 1];
    screenPanel(mt('profile'));
    drawAvatar(70, 186, 38, p.avatar);
    ui.push({ x: 30, y: 146, w: 80, h: 80, fn: () => { p.avatar = (p.avatar + 1) % AVATARS.length; Save.write(); Sound.click(); } });
    txt(mt('tapAvatar'), 70, 236, 9, T.dim, { weight: 600 });
    txt(playerName(), 122, 166, fitText(playerName(), 150, 18, 800), T.text, { align: 'left', weight: 800 });
    button(W - 98, 152, 72, 28, mt('rename'), () => {
      let v = null; try { v = window.prompt(mt('enterName'), p.name || ''); } catch (e) { v = null; }
      if (v !== null) { p.name = v.replace(/[<>]/g, '').trim().slice(0, 16); Save.write(); }
      Sound.click();
    }, { size: 11, col: '#2a3550', col2: '#151c2c' });
    leagueBadge(134, 200, 14, li);
    txt(L.name[lang], 154, 196, 14, L.col, { align: 'left', weight: 800 });
    txt(g + ' ' + mt('glory'), 154, 213, 11, T.muted, { align: 'left', weight: 600 });
    // progress to the next league
    const bx = 122, bw = W - 150, by = 228, k = N ? clamp((g - L.g) / (N.g - L.g), 0, 1) : 1;
    rr(ctx, bx, by, bw, 6, 3); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
    rr(ctx, bx, by, Math.max(6, bw * k), 6, 3); ctx.fillStyle = L.col; ctx.fill();
    if (N) txt(mt('toNext', N.g - g) + ' · ' + N.name[lang], bx + bw, by + 16, 9, T.dim, { align: 'right', weight: 600 });
    // lifetime statistics
    const rows = [
      [mt('stRuns'), st.runs], [mt('stWins'), st.wins], [mt('stKills'), st.kills], [mt('stBosses'), st.bosses],
      [mt('stRooms'), st.rooms], [mt('stCoins'), st.coins + ' ₸'], [mt('stBest'), best + ' / ' + TOTAL_ROOMS], [mt('stWave'), Save.data.bestWave || 0],
      [mt('stArena'), st.arenaRuns], [mt('stTime'), fmtDur(st.time)],
    ];
    rows.forEach(([k, v], i) => {
      const x = 22 + (i % 2) * ((W - 44) / 2), y = 262 + Math.floor(i / 2) * 44, w = (W - 44) / 2 - 6;
      rr(ctx, x, y, w, 38, 8); ctx.fillStyle = T.fill; ctx.fill();
      txt(k, x + 10, y + 12, 9.5, T.muted, { align: 'left', weight: 600 });
      txt(String(v), x + 10, y + 27, 14, T.text, { align: 'left', weight: 800 });
    });
    const hw = (W - 90) / 2, ar = achReady();
    button(40, 488, hw, 44, mt('rating'), () => { menuTab = 'rating'; Sound.click(); }, { size: 13, icon: (x, y, s, c) => icoTrophy(x, y, s, c) });
    button(50 + hw, 488, hw, 44, mt('achievements') + (ar ? ' (' + ar + ')' : ''), () => { menuTab = 'ach'; achPage = 0; Sound.click(); }, { size: 12, col: ar ? '#7a5a1a' : '#2a3550', col2: ar ? '#3a280a' : '#151c2c' });
    // frame and intro replay
    button(W - 98, 186, 72, 24, mt('frame'), () => { const f = Save.data.frames, i = f.indexOf(p.frame); p.frame = f[(i + 1) % f.length]; Save.write(); Sound.click(); }, { size: 10, col: '#2a3550', col2: '#151c2c' });
    if (COMIC.ready) button(W - 98, 538, 72, 24, mt('intro'), () => { Sound.click(); playComic(null); }, { size: 10, col: '#2a3550', col2: '#151c2c' });
  }

  // ---- Rating tab: leagues and the ladder of epic heroes with the player in it
  function drawRatingTab() {
    const g = Save.data.glory, li = leagueOf(g);
    screenPanel(mt('rating'));
    // league strip
    LEAGUES.forEach((L, i) => {
      const x = 36 + i * ((W - 72) / 6);
      ctx.save(); if (i > li) ctx.globalAlpha *= 0.35;
      leagueBadge(x, 158, i === li ? 13 : 10, i);
      ctx.restore();
    });
    txt(LEAGUES[li].name[lang] + ' · ' + g + ' ' + mt('glory'), W / 2, 184, 12, LEAGUES[li].col, { weight: 800 });
    const list = LEGENDS.map(l => ({ name: l.name[lang], g: l.g, me: false })).concat([{ name: playerName(), g, me: true }]).sort((a, b) => b.g - a.g);
    list.forEach((r, i) => {
      const y = 200 + i * 30;
      rr(ctx, 18, y, W - 36, 26, 7); ctx.fillStyle = r.me ? 'rgba(220,183,94,0.22)' : (i % 2 ? T.fill : 'rgba(255,236,200,0.03)'); ctx.fill();
      if (r.me) goldFrame(18, y, W - 36, 26, 7, 1.2);
      txt('#' + (i + 1), 32, y + 13.5, 11, r.me ? T.goldLt : T.dim, { align: 'left', weight: 800 });
      if (r.me) drawAvatar(70, y + 13, 10, Save.data.profile.avatar);
      leagueBadge(r.me ? 92 : 70, y + 13, 7, leagueOf(r.g));
      txt(r.name + (r.me ? '  · ' + mt('you') : ''), r.me ? 106 : 84, y + 13.5, fitText(r.name, 150, 12, 700), r.me ? '#fff3d6' : T.text, { align: 'left', weight: r.me ? 800 : 600 });
      txt(String(r.g), W - 30, y + 13.5, 12, r.me ? T.goldLt : T.muted, { align: 'right', weight: 800 });
    });
    wrap(mt('ratingNote'), W / 2, 508, W - 70, 13, 10, T.dim, { weight: 500 });
  }

  // ---- out of tickets: how to get more
  function drawTicketsPopup() {
    const t = Save.data.tickets;
    panel(28, 170, W - 56, 300);
    icoTicket(W / 2, 208, 26, T.goldLt);
    txt(mt('tickets') + ': ' + t.n + '/' + TICKET_MAX, W / 2, 244, 18, T.gold, { f: 'head', weight: 700 });
    wrap(mt('ticketHow'), W / 2, 272, W - 90, 16, 12, T.text, { weight: 500 });
    button(52, 348, W - 104, 44, mt('buyTicket') + '  ' + TICKET_GEMS, () => { if (buyTicket()) { menuPopup = null; } }, { disabled: Save.data.gems < TICKET_GEMS || t.n >= TICKET_MAX, size: 14, col: '#6a3a8a', col2: '#3a1f52' });
    gemIcon(W - 76, 370, 7);
    button(W / 2 - 60, 406, 120, 38, mt('ok'), () => { menuPopup = null; Sound.click(); }, { size: 14 });
  }
  function icoTicket(x, y, s, c) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-14, -8); ctx.lineTo(14, -8); ctx.lineTo(14, -3); ctx.arc(14, 0, 3, -Math.PI / 2, Math.PI / 2, true); ctx.lineTo(14, 8); ctx.lineTo(-14, 8); ctx.lineTo(-14, 3); ctx.arc(-14, 0, 3, Math.PI / 2, -Math.PI / 2, true); ctx.closePath(); ctx.stroke();
    ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.moveTo(5, -7); ctx.lineTo(5, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = `900 9px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('A', -4, 0.5);
    ctx.restore();
  }
