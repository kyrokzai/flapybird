  // =================================================================== achievements, avatar frames and the «Жол» season pass
  const FRAMES = {
    gold: { col: '#e8c25a', name: { ru: 'Золото', kz: 'Алтын', en: 'Gold' } },
    silver: { col: '#d6dde6', name: { ru: 'Серебро', kz: 'Күміс', en: 'Silver' } },
    jade: { col: '#4fd8a0', name: { ru: 'Нефрит', kz: 'Нефрит', en: 'Jade' } },
    ruby: { col: '#ff4a5a', name: { ru: 'Рубин', kz: 'Лағыл', en: 'Ruby' } },
    amethyst: { col: '#c07aff', name: { ru: 'Аметист', kz: 'Аметист', en: 'Amethyst' } },
    steppe: { col: '#ffae3a', name: { ru: 'Закат степи', kz: 'Дала шапағы', en: 'Steppe Sunset' } },
  };
  const frameCol = () => (FRAMES[Save.data.profile.frame] || FRAMES.gold).col;

  // value(st) reads the lifetime numbers; rw = reward (gems, tickets, frame)
  const ACH = [
    { id: 'kill100', n: 100, v: s => s.kills, rw: { gems: 20 }, name: { ru: 'Первая сотня', kz: 'Алғашқы жүз', en: 'First Hundred' }, desc: { ru: 'Победить 100 чудищ', kz: '100 жауды жеңу', en: 'Slay 100 monsters' } },
    { id: 'kill1000', n: 1000, v: s => s.kills, rw: { gems: 60, frame: 'silver' }, name: { ru: 'Гроза чудищ', kz: 'Жаудың қатері', en: 'Monster Bane' }, desc: { ru: 'Победить 1000 чудищ', kz: '1000 жауды жеңу', en: 'Slay 1000 monsters' } },
    { id: 'wolf100', n: 100, v: s => s.wolves, rw: { gems: 25 }, name: { ru: 'Волкодав', kz: 'Бөрібасар', en: 'Wolfhound' }, desc: { ru: 'Победить 100 волков', kz: '100 қасқырды жеңу', en: 'Slay 100 wolves' } },
    { id: 'elite25', n: 25, v: s => s.elites, rw: { gems: 30 }, name: { ru: 'Охотник на элиту', kz: 'Таңдаулы аңшы', en: 'Elite Hunter' }, desc: { ru: 'Победить 25 элитных врагов', kz: '25 таңдаулы жауды жеңу', en: 'Slay 25 elite monsters' } },
    { id: 'boss1', n: 1, v: s => s.bosses, rw: { gems: 10, tickets: 1 }, name: { ru: 'Победа над Дәу', kz: 'Дәуді жеңу', en: 'Giant Slayer' }, desc: { ru: 'Победить первого босса', kz: 'Бірінші басты жеңу', en: 'Defeat your first boss' } },
    { id: 'boss15', n: 15, v: s => s.bosses, rw: { gems: 50 }, name: { ru: 'Укротитель легенд', kz: 'Аңыз жеңімпазы', en: 'Legend Tamer' }, desc: { ru: 'Победить 15 боссов', kz: '15 басты жеңу', en: 'Defeat 15 bosses' } },
    { id: 'room50', n: 50, v: s => s.rooms, rw: { gems: 20 }, name: { ru: 'Знаток Астаны', kz: 'Астананы білуші', en: 'Astana Explorer' }, desc: { ru: 'Пройти 50 комнат', kz: '50 бөлме өту', en: 'Clear 50 rooms' } },
    { id: 'win1', n: 1, v: s => s.wins - s.arenaWins, rw: { gems: 50, frame: 'gold' }, name: { ru: 'Спаситель столицы', kz: 'Елорда құтқарушысы', en: 'Saviour of the Capital' }, desc: { ru: 'Пройти главу «Астана»', kz: '«Астана» тарауын өту', en: 'Finish the Astana chapter' } },
    { id: 'clean', n: 1, v: s => s.noRevWins, rw: { gems: 60, frame: 'jade' }, name: { ru: 'Без единой царапины', kz: 'Сызатсыз', en: 'Flawless Legend' }, desc: { ru: 'Пройти главу без воскрешения', kz: 'Тарауды қайта тірілусіз өту', en: 'Finish the chapter without a revive' } },
    { id: 'arena', n: 20, v: () => Save.data.bestWave || 0, rw: { gems: 40 }, name: { ru: 'Покоритель арены', kz: 'Арена жеңімпазы', en: 'Arena Conqueror' }, desc: { ru: 'Отбить 20 волн на арене', kz: 'Аренада 20 толқын тойтару', en: 'Survive 20 arena waves' } },
    { id: 'wave10', n: 10, v: () => Save.data.bestWave || 0, rw: { gems: 30 }, name: { ru: 'Несокрушимый', kz: 'Мызғымас', en: 'Unbreakable' }, desc: { ru: 'Отбить 10 волн на арене', kz: 'Аренада 10 толқын тойтару', en: 'Survive 10 arena waves' } },
    { id: 'coins5k', n: 5000, v: s => s.coins, rw: { gems: 30 }, name: { ru: 'Богатый бай', kz: 'Бай', en: 'Wealthy Bai' }, desc: { ru: 'Собрать 5000 монет', kz: '5000 тиын жинау', en: 'Collect 5000 coins' } },
    { id: 'lvl15', n: 15, v: s => s.maxLevel, rw: { gems: 20 }, name: { ru: 'Опытный батыр', kz: 'Тәжірибелі батыр', en: 'Seasoned Batyr' }, desc: { ru: 'Достичь 15 уровня в забеге', kz: 'Жорықта 15-деңгейге жету', en: 'Reach level 15 in a run' } },
    { id: 'merge', n: 1, v: s => s.merges, rw: { gems: 15 }, name: { ru: 'Кузнец', kz: 'Ұста', en: 'Smith' }, desc: { ru: 'Объединить 3 предмета', kz: '3 затты біріктіру', en: 'Merge 3 items' } },
    { id: 'legend', n: 1, v: s => s.legend, rw: { gems: 50, frame: 'amethyst' }, name: { ru: 'Сокровище хана', kz: 'Хан қазынасы', en: "Khan's Treasure" }, desc: { ru: 'Получить легендарный предмет', kz: 'Аңыздық зат алу', en: 'Obtain a legendary item' } },
    { id: 'talent20', n: 20, v: () => Object.values(Save.data.talents).reduce((a, b) => a + b, 0), rw: { gems: 25 }, name: { ru: 'Ученик предков', kz: 'Ата шәкірті', en: 'Heir of Ancestors' }, desc: { ru: 'Изучить 20 уровней талантов', kz: '20 талант деңгейі', en: 'Learn 20 talent levels' } },
    { id: 'daily7', n: 7, v: () => Save.data.daily.day, rw: { gems: 30, tickets: 1 }, name: { ru: 'Верный батыр', kz: 'Адал батыр', en: 'Loyal Batyr' }, desc: { ru: 'Забрать 7 ежедневных наград', kz: '7 күнделікті сыйлық алу', en: 'Claim 7 daily rewards' } },
    { id: 'glory3k', n: 3000, v: () => Save.data.glory, rw: { frame: 'ruby', gems: 40 }, name: { ru: 'Слава степи', kz: 'Дала даңқы', en: 'Glory of the Steppe' }, desc: { ru: 'Набрать 3000 славы', kz: '3000 даңқ жинау', en: 'Earn 3000 glory' } },
  ];
  const achVal = a => Math.min(a.n, a.v(Save.data.stats) || 0);
  const achState = a => Save.data.ach[a.id] || 0;   // 0 in progress, 1 ready to claim, 2 claimed
  const achReady = () => ACH.filter(a => achState(a) === 1).length;
  const toasts = [];
  // mark newly finished achievements and announce them
  function achUpdate() {
    if (SIM.on || !Save.data) return;
    let changed = false;
    for (const a of ACH) if (!achState(a) && achVal(a) >= a.n) {
      Save.data.ach[a.id] = 1; changed = true;
      toasts.push({ text: a.name[lang], t: 0 });
      if (scene === 'play' && player) floatText(player.x, player.y, '🏆 ' + a.name[lang], '#ffd86a', 14, 2.6);
    }
    if (changed) Save.write();
  }
  // give a reward; returns what the reward popup should show (or null when nothing visual)
  function grant(rw) {
    const out = { items: [], gems: rw.gems || 0, coins: rw.coins || 0 };
    if (rw.coins) bank += rw.coins;
    if (rw.gems) Save.data.gems += rw.gems;
    if (rw.tickets) addTicket(rw.tickets);
    if (rw.energy) Save.data.energy.val = Math.min(99, Save.data.energy.val + rw.energy);
    if (rw.frame && !Save.data.frames.includes(rw.frame)) { Save.data.frames.push(rw.frame); Save.data.profile.frame = rw.frame; }
    if (rw.chest !== undefined) { const it = addItem(rollItem(rw.chest)); if (it) out.items.push(it); }
    saveProgress(); Sound.level();
    return out;
  }
  function rewardText(rw) {
    const p = [];
    if (rw.coins) p.push(rw.coins + ' ₸'); if (rw.gems) p.push(rw.gems + ' 💎'); if (rw.tickets) p.push(rw.tickets + ' 🎟'); if (rw.energy) p.push(rw.energy + ' ⚡');
    if (rw.chest !== undefined) p.push(mt('chest') + ' · ' + RARITY[rw.chest].name[lang]);
    if (rw.frame) p.push(mt('frame') + ' «' + FRAMES[rw.frame].name[lang] + '»');
    return p.join(' + ');
  }
  function claimAch(a) {
    if (achState(a) !== 1) return;
    Save.data.ach[a.id] = 2;
    const got = grant(a.rw);
    if (got.items.length) { popupData = got; menuPopup = 'reward'; }
    else toasts.push({ text: '+ ' + rewardText(a.rw), t: 0 });
  }

  // ---- Achievements screen (from the profile)
  let achPage = 0;
  function drawAchTab() {
    screenPanel(mt('achievements'));
    const per = 8, pages = Math.ceil(ACH.length / per); achPage = clamp(achPage, 0, pages - 1);
    const done = ACH.filter(a => achState(a) === 2).length;
    txt(done + ' / ' + ACH.length, W / 2, 148, 11, T.muted, { weight: 600 });
    ACH.slice(achPage * per, achPage * per + per).forEach((a, i) => {
      const y = 160 + i * 46, st = achState(a), v = achVal(a);
      rr(ctx, 16, y, W - 32, 42, 9); ctx.fillStyle = st === 1 ? 'rgba(220,183,94,0.2)' : T.fill; ctx.fill();
      if (st === 1) goldFrame(16, y, W - 32, 42, 9, 1.2);
      icoTrophy(36, y + 21, 15, st === 2 ? '#86d873' : st === 1 ? T.goldLt : T.dim);
      txt(a.name[lang], 54, y + 13, fitText(a.name[lang], 170, 12.5, 800), st === 2 ? T.muted : T.text, { align: 'left', weight: 800 });
      txt(a.desc[lang], 54, y + 29, fitText(a.desc[lang], 170, 9.5, 500), T.dim, { align: 'left', weight: 500 });
      if (st === 0) {
        const bw = 70, bx = W - 32 - bw;
        rr(ctx, bx, y + 17, bw, 7, 3.5); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
        rr(ctx, bx, y + 17, Math.max(5, bw * v / a.n), 7, 3.5); ctx.fillStyle = T.gold; ctx.fill();
        txt(v + '/' + a.n, bx + bw / 2, y + 33, 8.5, T.dim, { weight: 700 });
      } else if (st === 1) button(W - 104, y + 7, 80, 28, mt('claim'), () => claimAch(a), { size: 11 });
      else txt('✓', W - 44, y + 21, 16, '#86d873', { weight: 900 });
    });
    if (pages > 1) {
      button(W / 2 - 70, TAB_Y - SAFE.t - 50, 60, 30, '‹', () => { achPage = (achPage - 1 + pages) % pages; }, { size: 16, col: '#2a3550', col2: '#151c2c' });
      txt((achPage + 1) + '/' + pages, W / 2, TAB_Y - SAFE.t - 35, 12, T.muted, { weight: 700 });
      button(W / 2 + 10, TAB_Y - SAFE.t - 50, 60, 30, '›', () => { achPage = (achPage + 1) % pages; }, { size: 16, col: '#2a3550', col2: '#151c2c' });
    }
  }

  // ---- «Жол» season pass: 30 steps, one every 100 glory earned this season
  const PASS_STEP = 100;
  const PASS = [
    { coins: 100 }, { gems: 10 }, { tickets: 1 }, { coins: 200 }, { chest: 0 }, { gems: 15 }, { energy: 10 }, { coins: 300 }, { tickets: 1 }, { chest: 1 },
    { gems: 20 }, { coins: 400 }, { energy: 20 }, { tickets: 2 }, { chest: 1 }, { gems: 25 }, { coins: 500 }, { tickets: 1 }, { gems: 30 }, { chest: 2 },
    { coins: 700 }, { energy: 20 }, { gems: 35 }, { tickets: 2 }, { chest: 2 }, { coins: 1000 }, { gems: 50 }, { tickets: 3 }, { frame: 'steppe' }, { chest: 3 },
  ];
  const passPts = () => Math.max(0, Save.data.glory - Save.data.pass.start);
  const passTier = () => Math.min(PASS.length, Math.floor(passPts() / PASS_STEP));
  const passReady = () => { let n = 0; for (let i = 0; i < passTier(); i++) if (!Save.data.pass.claimed.includes(i)) n++; return n; };
  function claimPass(i) {
    const p = Save.data.pass;
    if (i >= passTier() || p.claimed.includes(i)) return;
    p.claimed.push(i);
    const got = grant(PASS[i]);
    if (got.items.length) { popupData = got; menuPopup = 'reward'; }
    else toasts.push({ text: '+ ' + rewardText(PASS[i]), t: 0 });
  }
  function newSeason() { const p = Save.data.pass; p.season++; p.start = Save.data.glory; p.claimed = []; Save.write(); Sound.level(); }
  function passGlyph(rw, x, y, s) {
    if (rw.chest !== undefined) { ctx.save(); ctx.scale(1, 1); drawChest(x, y + s * 0.1, s * 0.7, RARITY[rw.chest].col, 0); ctx.restore(); }
    else if (rw.gems) gemIcon(x, y, s * 0.55);
    else if (rw.coins) coinIcon(x, y, s * 0.55);
    else if (rw.tickets) icoTicket(x, y, s * 0.9, T.goldLt);
    else if (rw.energy) boltIcon(x, y, s * 0.6);
    else if (rw.frame) { ctx.beginPath(); ctx.arc(x, y, s * 0.55, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = FRAMES[rw.frame].col; ctx.stroke(); }
  }
  const passAmount = rw => rw.coins || rw.gems || rw.tickets || rw.energy ? '×' + (rw.coins || rw.gems || rw.tickets || rw.energy) : rw.chest !== undefined ? RARITY[rw.chest].name[lang] : FRAMES[rw.frame].name[lang];
  function drawPassTab() {
    const p = Save.data.pass, tier = passTier(), pts = passPts();
    screenPanel(mt('pass') + ' · ' + mt('season') + ' ' + p.season);
    // progress to the next step
    const bx = 26, bw = W - 160, by = 152, k = tier >= PASS.length ? 1 : (pts % PASS_STEP) / PASS_STEP;
    rr(ctx, bx, by, bw, 8, 4); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
    rr(ctx, bx, by, Math.max(8, bw * k), 8, 4); const g = ctx.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, '#9b7228'); g.addColorStop(1, '#ffe08a'); ctx.fillStyle = g; ctx.fill();
    const pl = tier >= PASS.length ? mt('passDone') : mt('passNext', PASS_STEP - pts % PASS_STEP);
    txt(pl, bx, by + 19, fitText(pl, bw + 20, 9.5, 600), T.muted, { align: 'left', weight: 600 });
    const ready = passReady();
    if (ready > 1) button(W - 124, 142, 100, 28, mt('claimAll'), () => { for (let i = 0; i < tier; i++) if (!p.claimed.includes(i) && PASS[i].chest === undefined) claimPass(i); }, { size: 10 });
    // 30 tiles, 5 per row
    const cols = 5, gw = (W - 32) / cols, avail = TAB_Y - SAFE.t - 186 - 10, gh = Math.min(70, avail / 6);
    PASS.forEach((rw, i) => {
      const cx = 16 + (i % cols) * gw, cy = 182 + Math.floor(i / cols) * gh, w = gw - 5, h = gh - 5;
      const got = p.claimed.includes(i), open = i < tier;
      rr(ctx, cx, cy, w, h, 8);
      ctx.fillStyle = got ? 'rgba(80,120,70,0.25)' : open ? 'rgba(220,183,94,0.24)' : 'rgba(255,236,200,0.04)'; ctx.fill();
      if (open && !got) { ctx.save(); ctx.shadowColor = 'rgba(255,200,90,0.8)'; ctx.shadowBlur = 8 + Math.sin(pNow / 300) * 3; goldFrame(cx, cy, w, h, 8, 1.6); ctx.restore(); }
      else { rr(ctx, cx, cy, w, h, 8); ctx.strokeStyle = 'rgba(220,183,94,0.25)'; ctx.lineWidth = 1; ctx.stroke(); }
      txt(String(i + 1), cx + 8, cy + 9, 8.5, open ? T.goldLt : T.dim, { align: 'left', weight: 800 });
      ctx.save(); if (!open) ctx.globalAlpha *= 0.45;
      passGlyph(rw, cx + w / 2, cy + h * 0.46, Math.min(w, h) * 0.42);
      ctx.restore();
      const lab = passAmount(rw);
      txt(lab, cx + w / 2, cy + h - 8, fitText(lab, w - 6, 9, 700), open ? T.text : T.dim, { weight: 700 });
      if (got) txt('✓', cx + w - 9, cy + 10, 11, '#86d873', { weight: 900 });
      if (open && !got) ui.push({ x: cx, y: cy, w, h, fn: () => claimPass(i) });
    });
    if (tier >= PASS.length && passReady() === 0) button(W / 2 - 80, TAB_Y - SAFE.t - 46, 160, 34, mt('newSeason'), newSeason, { size: 13 });
  }

  // ---- toasts: small gold notes at the top of the menu (achievement unlocked, reward received)
  function drawToasts(dt) {
    let y = 140;
    for (const t of toasts) {
      t.t += dt;
      const a = clamp(Math.min(t.t / 0.25, (3 - t.t) / 0.4), 0, 1);
      ctx.save(); ctx.globalAlpha = a;
      ctx.font = `700 12px ${FONT}`; const w = Math.min(W - 40, ctx.measureText(t.text).width + 44);
      rr(ctx, (W - w) / 2, y, w, 28, 14); ctx.fillStyle = 'rgba(14,18,28,0.94)'; ctx.fill(); goldFrame((W - w) / 2, y, w, 28, 14, 1.2);
      icoTrophy((W - w) / 2 + 16, y + 14, 12, T.goldLt);
      txt(t.text, W / 2 + 8, y + 14.5, fitText(t.text, w - 44, 12, 700), T.text, { weight: 700 });
      ctx.restore();
      y += 32;
    }
    for (let i = toasts.length - 1; i >= 0; i--) if (toasts[i].t > 3) toasts.splice(i, 1);
  }
  function icoRoad(x, y, s, c) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-6, 14); ctx.lineTo(-2, -12); ctx.moveTo(6, 14); ctx.lineTo(2, -12); ctx.stroke();
    ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(0, -8); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(4, -14); ctx.lineTo(4, -2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(4, -14); ctx.lineTo(13, -11); ctx.lineTo(4, -8); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
