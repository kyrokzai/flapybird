  // =================================================================== menu tabs and meta screens (Battle · Gear · Talents · Quests)
  let menuTab = 'fight', menuPopup = null, popupData = null, selItem = null, invPage = 0, dailyShown = false;
  const TAB_Y = 578;
  const MSTR = {
    ru: {
      tabFight: 'Бой', tabGear: 'Снаряжение', tabTalents: 'Таланты', tabQuests: 'Задания', bag: 'Сумка', bonuses: 'Бонусы снаряжения и талантов',
      equip: 'НАДЕТЬ', unequip: 'СНЯТЬ', upgrade: 'УЛУЧШИТЬ', merge: 'ОБЪЕДИНИТЬ 3 → {n}', needMerge: 'Для объединения нужно 3 одинаковых', ok: 'ОТЛИЧНО',
      daily: 'Ежедневная награда', day: 'День {n}', claim: 'ЗАБРАТЬ', claimed: 'Получено', questsToday: 'Задания на сегодня', allQuests: 'Все задания: сундук + 20',
      shop: 'Лавка', chest: 'Сундук', energyPlus: 'Энергия +20', noEnergy: 'Мало энергии', nextEnergy: '+1 энергия через {n}', rewards: 'Награды',
      noChest: 'Дойдите до 5-й комнаты, чтобы получить сундук', emptySlot: 'пусто', equipped: 'надето', bagFull: 'Сумка полна', none: 'Пока ничего', newItem: 'Новый предмет!', wait: 'Подождать',
    },
    kz: {
      tabFight: 'Шайқас', tabGear: 'Жабдық', tabTalents: 'Таланттар', tabQuests: 'Тапсырмалар', bag: 'Қоржын', bonuses: 'Жабдық пен таланттар бонусы',
      equip: 'КИЮ', unequip: 'ШЕШУ', upgrade: 'ЖАҚСАРТУ', merge: '3 → {n} БІРІКТІРУ', needMerge: 'Біріктіру үшін 3 бірдей зат керек', ok: 'ТАМАША',
      daily: 'Күнделікті сыйлық', day: '{n}-күн', claim: 'АЛУ', claimed: 'Алынды', questsToday: 'Бүгінгі тапсырмалар', allQuests: 'Барлық тапсырма: сандық + 20',
      shop: 'Дүкен', chest: 'Сандық', energyPlus: 'Қуат +20', noEnergy: 'Қуат аз', nextEnergy: '+1 қуат {n} кейін', rewards: 'Сыйлықтар',
      noChest: 'Сандық алу үшін 5-бөлмеге жетіңіз', emptySlot: 'бос', equipped: 'киілген', bagFull: 'Қоржын толы', none: 'Әзірге ештеңе жоқ', newItem: 'Жаңа зат!', wait: 'Күту',
    },
    en: {
      tabFight: 'Battle', tabGear: 'Gear', tabTalents: 'Talents', tabQuests: 'Quests', bag: 'Bag', bonuses: 'Gear and talent bonuses',
      equip: 'EQUIP', unequip: 'UNEQUIP', upgrade: 'UPGRADE', merge: 'MERGE 3 → {n}', needMerge: 'Merging needs 3 identical items', ok: 'GREAT',
      daily: 'Daily reward', day: 'Day {n}', claim: 'CLAIM', claimed: 'Claimed', questsToday: "Today's quests", allQuests: 'All quests: chest + 20',
      shop: 'Shop', chest: 'Chest', energyPlus: 'Energy +20', noEnergy: 'Not enough energy', nextEnergy: '+1 energy in {n}', rewards: 'Rewards',
      noChest: 'Reach room 5 to earn a chest', emptySlot: 'empty', equipped: 'equipped', bagFull: 'Bag is full', none: 'Nothing yet', newItem: 'New item!', wait: 'Wait',
    },
  };
  const mt = (k, n) => { const s = MSTR[lang][k] || MSTR.ru[k] || k; return n === undefined ? s : s.replace('{n}', n); };

  // ---- small vector icons
  function gemIcon(x, y, s) {
    ctx.fillStyle = '#5fe0ff'; ctx.strokeStyle = '#0b4f63'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x - s, y - s * 0.3); ctx.lineTo(x - s * 0.5, y - s * 0.8); ctx.lineTo(x + s * 0.5, y - s * 0.8); ctx.lineTo(x + s, y - s * 0.3); ctx.lineTo(x, y + s); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.moveTo(x - s * 0.5, y - s * 0.3); ctx.lineTo(x, y - s * 0.75); ctx.lineTo(x + s * 0.1, y - s * 0.3); ctx.closePath(); ctx.fill();
  }
  function coinIcon(x, y, s) {
    ctx.fillStyle = C.gold; ctx.strokeStyle = C.goldDk; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill(); ctx.stroke();
    txt('₸', x, y + 0.5, s * 1.25, C.goldDk, { weight: 900 });
  }
  function boltIcon(x, y, s) {
    ctx.fillStyle = '#ffd23a'; ctx.strokeStyle = '#7a5200'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x + s * 0.2, y - s); ctx.lineTo(x - s * 0.6, y + s * 0.15); ctx.lineTo(x - s * 0.05, y + s * 0.15); ctx.lineTo(x - s * 0.25, y + s); ctx.lineTo(x + s * 0.6, y - s * 0.2); ctx.lineTo(x + s * 0.05, y - s * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  function slotIcon(slot, x, y, s, color) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    switch (slot) {
      case 'weapon': ctx.beginPath(); ctx.arc(-4, 0, 13, -1.2, 1.2); ctx.stroke(); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-4 + 13 * Math.cos(1.2), -13 * Math.sin(1.2)); ctx.lineTo(-4 + 13 * Math.cos(1.2), 13 * Math.sin(1.2)); ctx.stroke(); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(14, 0); ctx.moveTo(10, -4); ctx.lineTo(14, 0); ctx.lineTo(10, 4); ctx.stroke(); break;
      case 'helmet': ctx.beginPath(); ctx.moveTo(-11, 6); ctx.quadraticCurveTo(-11, -9, 0, -10); ctx.quadraticCurveTo(11, -9, 11, 6); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, -16); ctx.stroke(); ctx.fillRect(-13, 5, 26, 4); break;
      case 'armor': ctx.beginPath(); ctx.moveTo(-12, -8); ctx.lineTo(-5, -11); ctx.quadraticCurveTo(0, -6, 5, -11); ctx.lineTo(12, -8); ctx.lineTo(10, 12); ctx.lineTo(-10, 12); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let i = -2; i <= 6; i += 4) { ctx.moveTo(-9, i); ctx.lineTo(9, i); } ctx.stroke(); break;
      case 'belt': ctx.fillRect(-15, -4, 30, 8); ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, TAU); ctx.fill(); break;
      case 'ring': ctx.lineWidth = 3.4; ctx.beginPath(); ctx.arc(0, 4, 9, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-5, -6); ctx.lineTo(0, -12); ctx.lineTo(5, -6); ctx.lineTo(0, -3); ctx.closePath(); ctx.fill(); break;
      case 'amulet': ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-11, -13); ctx.lineTo(0, 0); ctx.lineTo(11, -13); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(7, 7); ctx.lineTo(0, 15); ctx.lineTo(-7, 7); ctx.closePath(); ctx.fill(); break;
      case 'star': ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r2 = i % 2 ? 6 : 14; ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); } ctx.closePath(); ctx.fill(); break;
      case 'magnet': ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -1, 9, Math.PI, 0); ctx.moveTo(-9, -1); ctx.lineTo(-9, 10); ctx.moveTo(9, -1); ctx.lineTo(9, 10); ctx.stroke(); break;
      case 'scroll': ctx.fillRect(-11, -12, 22, 24); ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (let i = -6; i <= 6; i += 6) ctx.fillRect(-7, i - 1, 14, 2); break;
    }
    ctx.restore();
  }
  const TALENT_ICON = { atk: 'weapon', hp: 'heart', armor: 'armor', magnet: 'magnet', regen: 'heart', loot: 'coin', start: 'star' };
  function talentIcon(id, x, y, s) {
    const k = TALENT_ICON[id];
    if (k === 'heart') heart(x, y + 1, s * 0.5, id === 'regen' ? '#7cf07a' : '#ff5a5f');
    else if (k === 'coin') coinIcon(x, y, s * 0.55);
    else slotIcon(k, x, y, s, '#f4c430');
  }

  function itemCard(it, x, y, s, onTap) {
    const R = RARITY[it.r];
    rr(ctx, x, y, s, s, 9); ctx.fillStyle = C.ink; ctx.fill();
    const g = ctx.createLinearGradient(0, y, 0, y + s); g.addColorStop(0, R.col); g.addColorStop(1, 'rgba(20,12,6,0.95)');
    rr(ctx, x + 2, y + 2, s - 4, s - 4, 7); ctx.fillStyle = g; ctx.fill();
    slotIcon(GEAR[it.b].slot, x + s / 2, y + s / 2 - 3, s * 0.36, '#fff');
    txt(tr('lvl') + it.l, x + s - 5, y + s - 9, Math.max(9, s * 0.17), '#fff', { align: 'right', stroke: C.ink, lw: 3, weight: 900 });
    if (isEquipped(it)) { ctx.fillStyle = '#7cf07a'; ctx.beginPath(); ctx.arc(x + 9, y + 9, 5.5, 0, TAU); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke(); }
    if (canMerge(it)) { ctx.fillStyle = '#ff5a3a'; ctx.beginPath(); ctx.arc(x + s - 8, y + 8, 4.5, 0, TAU); ctx.fill(); }
    if (onTap) ui.push({ x, y, w: s, h: s, fn: onTap });
  }

  function resourceBar() {
    const pill = (x, w, icon, label) => {
      rr(ctx, x, 66, w, 24, 12); ctx.fillStyle = 'rgba(7,30,38,0.82)'; ctx.fill();
      rr(ctx, x, 66, w, 24, 12); ctx.strokeStyle = 'rgba(244,196,48,0.5)'; ctx.lineWidth = 1.2; ctx.stroke();
      icon(x + 13, 78);
      txt(label, x + 26, 78.5, fitText(label, w - 30, 13, 900), '#fff', { align: 'left', weight: 900 });
    };
    pill(10, 98, (x, y) => coinIcon(x, y, 8), String(bank));
    pill(114, 78, (x, y) => gemIcon(x, y, 8), String(Save.data.gems));
    const e = Save.data.energy, full = e.val >= ENERGY_MAX;
    pill(198, W - 208, (x, y) => boltIcon(x, y, 8), e.val + '/' + ENERGY_MAX + (full ? '' : '  ' + fmtTime(energyLeftMs())));
  }

  function tabBar() {
    ctx.fillStyle = 'rgba(7,30,38,0.94)'; ctx.fillRect(0, TAB_Y, W, H - TAB_Y);
    ornamentBand(ctx, 0, TAB_Y - 6, W, 8, C.red, C.gold);
    const tabs = [['fight', 'weapon'], ['gear', 'helmet'], ['talents', 'star'], ['quests', 'scroll']];
    const w = W / tabs.length;
    tabs.forEach(([id, icon], i) => {
      const x = i * w, on = menuTab === id;
      if (on) { rr(ctx, x + 4, TAB_Y + 4, w - 8, H - TAB_Y - 8, 10); ctx.fillStyle = 'rgba(244,196,48,0.22)'; ctx.fill(); }
      slotIcon(icon, x + w / 2, TAB_Y + 22, 13, on ? C.gold : '#9fb3b8');
      const label = mt('tab' + id[0].toUpperCase() + id.slice(1));
      txt(label, x + w / 2, TAB_Y + 46, fitText(label, w - 8, 11, 900), on ? '#fff' : '#9fb3b8', { weight: 900 });
      const badge = id === 'quests' ? questsReady() + (canClaimDaily() ? 1 : 0) : id === 'gear' ? (gearItems().some(canMerge) ? 1 : 0) : 0;
      if (badge) { ctx.fillStyle = '#e8262e'; ctx.beginPath(); ctx.arc(x + w / 2 + 14, TAB_Y + 12, 7, 0, TAU); ctx.fill(); txt(String(badge), x + w / 2 + 14, TAB_Y + 12.5, 10, '#fff', { weight: 900 }); }
      ui.push({ x, y: TAB_Y, w, h: H - TAB_Y, fn: () => { if (menuTab !== id) { menuTab = id; invPage = 0; Sound.click(); } } });
    });
  }

  function screenPanel(title) {
    rr(ctx, 8, 96, W - 16, TAB_Y - 104, 14); ctx.fillStyle = 'rgba(247,237,213,0.97)'; ctx.fill();
    rr(ctx, 8, 96, W - 16, TAB_Y - 104, 14); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    txt(title, W / 2, 118, 20, C.redDk, { weight: 900 });
  }

  // ---- Battle tab
  function drawFightTab() {
    const wob = Math.sin(time * 1.5) * 2;
    txt('БАТЫР01', W / 2, 124 + wob, fitText('БАТЫР01', W - 60, 50), C.gold, { stroke: C.ink, lw: 9, weight: 900 });
    koshkar(ctx, W / 2, 163, 26, C.red, 3.2);
    txt(tr('subtitle'), W / 2, 184, 14, C.cream, { stroke: C.ink, lw: 4, weight: 900 });
    const label = tr('play') + '  ⚡' + RUN_COST;
    button(W / 2 - 110, 452, 220, 58, label, () => { Sound.init(); Sound.click(); startGame(); }, { size: 24 });
    txt(tr('hint'), W / 2, 526, 11, '#fff', { stroke: C.ink, lw: 3, weight: 700 });
    txt(tr('best', best), W / 2, 548, 12, C.cream, { stroke: C.ink, lw: 3, weight: 700 });
  }

  // ---- Gear tab
  function drawGearTab() {
    screenPanel(mt('tabGear'));
    SLOTS.forEach((slot, i) => {
      const x = 38 + (i % 3) * 102, y = 132 + Math.floor(i / 3) * 96, s = 78;
      const it = equippedIn(slot);
      if (it) itemCard(it, x, y, s, () => { selItem = it; menuPopup = 'item'; Sound.click(); });
      else {
        rr(ctx, x, y, s, s, 9); ctx.fillStyle = 'rgba(42,22,12,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(42,22,12,0.3)'; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
        slotIcon(slot, x + s / 2, y + s / 2 - 4, 26, 'rgba(42,22,12,0.25)');
      }
      txt(SLOT_NAME[slot][lang], x + s / 2, y + s + 9, 10, '#6a5a45', { weight: 700 });
    });
    const S = statsTotal(), parts = [];
    for (const k of ['atk', 'aspd', 'hp', 'armor', 'crit', 'critDmg', 'magnet', 'regen', 'loot']) if (S[k] > 0) parts.push(STAT[k].name[lang] + ' ' + fmtStat(k, S[k]));
    txt(mt('bonuses'), W / 2, 340, 11, '#6a5a45', { weight: 700 });
    wrap(parts.join(' · ') || mt('none'), W / 2, 356, W - 50, 14, 11, C.ink, { weight: 700 });
    const inv = gearItems().filter(it => !isEquipped(it)).sort((a, b) => b.r - a.r || b.l - a.l || SLOTS.indexOf(GEAR[a.b].slot) - SLOTS.indexOf(GEAR[b.b].slot));
    const per = 10, pages = Math.max(1, Math.ceil(inv.length / per));
    invPage = clamp(invPage, 0, pages - 1);
    txt(mt('bag') + ' ' + gearItems().length + '/' + INV_MAX, 22, 392, 13, C.redDk, { align: 'left', weight: 900 });
    inv.slice(invPage * per, invPage * per + per).forEach((it, i) => {
      itemCard(it, 19 + (i % 5) * 66, 404 + Math.floor(i / 5) * 66, 58, () => { selItem = it; menuPopup = 'item'; Sound.click(); });
    });
    if (!inv.length) txt(mt('none'), W / 2, 460, 13, '#8a7a65', { weight: 500 });
    if (pages > 1) {
      txt((invPage + 1) + '/' + pages, W - 70, 392, 12, C.ink, { weight: 900 });
      button(W - 52, 380, 22, 24, '‹', () => { invPage = (invPage - 1 + pages) % pages; }, { size: 14 });
      button(W - 32, 380, 22, 24, '›', () => { invPage = (invPage + 1) % pages; }, { size: 14 });
    }
  }

  // ---- Talents tab
  function drawTalentsTab() {
    screenPanel(mt('tabTalents'));
    TALENTS.forEach((t, i) => {
      const y = 134 + i * 62, lv = Save.data.talents[t.id] || 0, maxed = lv >= t.max, c = talentCost(lv);
      rr(ctx, 16, y, W - 32, 56, 10); ctx.fillStyle = i % 2 ? 'rgba(42,22,12,0.05)' : 'rgba(42,22,12,0.09)'; ctx.fill();
      ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(42, y + 28, 19, 0, TAU); ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
      talentIcon(t.id, 42, y + 28, 22);
      txt(t.name[lang] + '  ' + lv + '/' + t.max, 70, y + 17, fitText(t.name[lang] + '  ' + lv + '/' + t.max, 160, 15), C.redDk, { align: 'left', weight: 900 });
      const cur = lv * t.per, nxt = (lv + 1) * t.per;
      const desc = STAT[t.stat].name[lang] + ' ' + fmtStat(t.stat, cur) + (maxed ? '' : ' → ' + fmtStat(t.stat, nxt));
      txt(desc, 70, y + 38, fitText(desc, 170, 11, 500), '#6a5a45', { align: 'left', weight: 500 });
      button(W - 114, y + 9, 94, 38, maxed ? tr('max') : c + ' ₸', () => buyTalent(t), { disabled: maxed || bank < c, size: 14, col: '#8be07a', col2: '#3d9a36' });
    });
  }

  // ---- Quests tab: daily reward strip, 3 quests, bonus, shop
  function rewardGlyph(rw, x, y) {
    if (rw.item !== undefined) { rr(ctx, x - 11, y - 11, 22, 22, 5); ctx.fillStyle = RARITY[rw.item].col; ctx.fill(); slotIcon('star', x, y, 9, '#fff'); }
    else if (rw.gems) gemIcon(x, y, 8); else coinIcon(x, y, 9);
  }
  const rewardLabel = rw => rw.item !== undefined ? '×1' : rw.gems ? '+' + rw.gems : '+' + rw.coins;
  function dailyStrip(y, x0, tw) {
    const d = Save.data.daily, can = canClaimDaily(), step = tw / 7, w = step - 4;
    const today = d.day % 7, last = d.day > 0 ? (d.day - 1) % 7 : -1;
    DAILY.forEach((rw, i) => {
      const x = x0 + i * step, got = can ? i < today : i <= last, cur = can && i === today;
      rr(ctx, x, y, w, 58, 8); ctx.fillStyle = cur ? '#ffe9a0' : got ? 'rgba(42,22,12,0.15)' : 'rgba(42,22,12,0.07)'; ctx.fill();
      if (cur) { ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.stroke(); }
      txt(mt('day', i + 1), x + w / 2, y + 10, 9, '#6a5a45', { weight: 700 });
      rewardGlyph(rw, x + w / 2, y + 30);
      txt(rewardLabel(rw), x + w / 2, y + 50, fitText(rewardLabel(rw), w - 4, 9, 900), C.ink, { weight: 900 });
      if (got) txt('✓', x + w - 8, y + 9, 12, '#3d9a36', { weight: 900 });
    });
  }
  function drawQuestsTab() {
    screenPanel(mt('tabQuests'));
    txt(mt('daily'), 20, 142, 13, C.redDk, { align: 'left', weight: 900 });
    dailyStrip(152, 16, W - 32);
    if (canClaimDaily()) button(W - 112, 128, 92, 26, mt('claim'), () => openDaily(), { size: 12 });
    txt(mt('questsToday'), 20, 230, 13, C.redDk, { align: 'left', weight: 900 });
    const q = questsFresh();
    q.list.forEach((it, i) => {
      const y = 240 + i * 62, def = QUESTS[it.id], done = questDone(it);
      rr(ctx, 16, y, W - 32, 56, 10); ctx.fillStyle = 'rgba(42,22,12,0.07)'; ctx.fill();
      const text = def.text[lang].replace('{n}', def.n);
      txt(text, 26, y + 16, fitText(text, 200, 13), C.ink, { align: 'left', weight: 700 });
      rr(ctx, 26, y + 32, 150, 10, 5); ctx.fillStyle = 'rgba(42,22,12,0.15)'; ctx.fill();
      rr(ctx, 26, y + 32, Math.max(10, 150 * it.prog / def.n), 10, 5); ctx.fillStyle = done ? '#5fd35a' : C.gold; ctx.fill();
      txt(it.prog + '/' + def.n, 184, y + 37, 10, '#6a5a45', { align: 'left', weight: 900 });
      if (it.claimed) txt('✓ ' + mt('claimed'), W - 66, y + 28, 12, '#3d9a36', { weight: 900 });
      else button(W - 112, y + 10, 90, 36, rewardLabel(def.rw), () => claimQuest(it), { disabled: !done, size: 13, col: def.rw.gems ? '#5fc8de' : C.gold, col2: def.rw.gems ? '#1d7f99' : '#e08a1a' });
      if (!it.claimed) { if (def.rw.gems) gemIcon(W - 104, y + 28, 6); else coinIcon(W - 104, y + 28, 6); }
    });
    const bonusOk = canClaimBonus();
    button(20, 432, W - 40, 34, (q.bonus ? '✓ ' : '') + mt('allQuests'), () => { const it = claimQuestBonus(); if (it) { popupData = { items: [it], gems: 20 }; menuPopup = 'reward'; } }, { disabled: !bonusOk, size: 13, col: '#c99bff', col2: '#7a4fc8' });
    txt(mt('shop'), 20, 486, 13, C.redDk, { align: 'left', weight: 900 });
    button(20, 498, (W - 50) / 2, 52, mt('chest') + '  ' + SHOP.chest, () => { const it = buyChest(); if (it) { popupData = { items: [it], gems: 0 }; menuPopup = 'reward'; } }, { disabled: Save.data.gems < SHOP.chest, size: 14, col: '#c99bff', col2: '#7a4fc8' });
    button(30 + (W - 50) / 2, 498, (W - 50) / 2, 52, '⚡+20  ' + SHOP.energy, () => buyEnergy(), { disabled: Save.data.gems < SHOP.energy, size: 13, col: '#ffd23a', col2: '#d08a10' });
    gemIcon(20 + (W - 50) / 2 - 16, 524, 7); gemIcon(W - 36, 524, 7);
  }

  function openDaily() { const got = claimDaily(); if (got) { popupData = { items: got.item ? [got.item] : [], gems: got.gems, coins: got.coins }; menuPopup = 'reward'; } }

  // ---- popups
  function popupFrame(y, h) {
    ui.push({ x: 0, y: 0, w: W, h: H, fn: null });   // blocks the screen underneath
    overlay(0.65);
    panel(24, y, W - 48, h);
  }
  function drawItemPopup() {
    const it = selItem; if (!it || !itemById(it.id)) { menuPopup = null; return; }
    const R = RARITY[it.r], G = GEAR[it.b];
    popupFrame(126, 380);
    itemCard(it, W / 2 - 44, 150, 88, null);
    txt(G.name[lang], W / 2, 260, fitText(G.name[lang], W - 80, 19), R.col, { weight: 900, stroke: C.ink, lw: 3 });
    txt(R.name[lang] + ' · ' + SLOT_NAME[G.slot][lang] + (isEquipped(it) ? ' · ' + mt('equipped') : ''), W / 2, 284, 12, '#6a5a45', { weight: 700 });
    txt(STAT[G.stat].name[lang] + ' ' + fmtStat(G.stat, itemValue(it)), W / 2, 310, 17, C.ink, { weight: 900 });
    txt(tr('lvl') + ' ' + it.l + ' / ' + itemCap(it), W / 2, 332, 12, '#6a5a45', { weight: 700 });
    const eq = isEquipped(it);
    button(44, 352, (W - 100) / 2, 44, eq ? mt('unequip') : mt('equip'), () => { eq ? unequipItem(it) : equipItem(it); }, { size: 14, col: '#5fc8de', col2: '#1d7f99' });
    const maxed = it.l >= itemCap(it), c = itemUpCost(it);
    button(56 + (W - 100) / 2, 352, (W - 100) / 2, 44, maxed ? tr('max') : mt('upgrade') + ' ' + c, () => upgradeItem(it), { disabled: maxed || bank < c, size: 13, col: '#8be07a', col2: '#3d9a36' });
    if (it.r < RARITY.length - 1) {
      const ok = canMerge(it);
      button(44, 404, W - 88, 40, ok ? mt('merge', RARITY[it.r + 1].name[lang]) : mt('needMerge') + ' (' + (mergeMates(it).length + 1) + '/3)', () => mergeItem(it), { disabled: !ok, size: 12, col: '#c99bff', col2: '#7a4fc8' });
    }
    button(W / 2 - 50, 454, 100, 36, mt('ok'), () => { menuPopup = null; Sound.click(); }, { size: 14 });
  }
  function drawRewardPopup() {
    const d = popupData || { items: [] };
    const h = 150 + (d.coins ? 30 : 0) + (d.gems ? 30 : 0) + (d.items.length ? 104 : 0), top = Math.round((H - h) / 2) - 20;
    popupFrame(top, h);
    txt(mt('rewards'), W / 2, top + 40, 22, C.redDk, { weight: 900 });
    let y = top + 64;
    if (d.coins) { coinIcon(W / 2 - 30, y + 12, 10); txt('+' + d.coins, W / 2 - 14, y + 12, 18, C.ink, { align: 'left', weight: 900 }); y += 30; }
    if (d.gems) { gemIcon(W / 2 - 30, y + 12, 10); txt('+' + d.gems, W / 2 - 14, y + 12, 18, C.ink, { align: 'left', weight: 900 }); y += 30; }
    const n = d.items.length;
    d.items.forEach((it, i) => {
      const s = 70, x = W / 2 - (n * (s + 10) - 10) / 2 + i * (s + 10);
      itemCard(it, x, y + 4, s, null);
      txt(GEAR[it.b].name[lang], x + s / 2, y + s + 16, fitText(GEAR[it.b].name[lang], s + 8, 10), RARITY[it.r].col, { weight: 900, stroke: C.ink, lw: 2.5 });
    });
    button(W / 2 - 70, top + h - 68, 140, 44, mt('ok'), () => { menuPopup = null; popupData = null; Sound.click(); }, { size: 16 });
  }
  function drawEnergyPopup() {
    popupFrame(170, 280);
    boltIcon(W / 2, 214, 22);
    txt(mt('noEnergy'), W / 2, 258, 20, C.redDk, { weight: 900 });
    txt(Save.data.energy.val + '/' + ENERGY_MAX + ' · ' + mt('nextEnergy', fmtTime(energyLeftMs())), W / 2, 286, 13, C.ink, { weight: 700 });
    button(54, 312, W - 108, 48, mt('energyPlus') + '  ' + SHOP.energy, () => { if (buyEnergy()) menuPopup = null; }, { disabled: Save.data.gems < SHOP.energy, size: 15, col: '#ffd23a', col2: '#d08a10' });
    gemIcon(W - 74, 336, 8);
    button(W / 2 - 70, 376, 140, 40, mt('wait'), () => { menuPopup = null; Sound.click(); }, { size: 14, col: '#c9b8a0', col2: '#8a7a64' });
  }
  function drawDailyPopup() {
    popupFrame(170, 260);
    txt(mt('daily'), W / 2, 206, 20, C.redDk, { weight: 900 });
    dailyStrip(226, 36, W - 72);
    button(W / 2 - 80, 310, 160, 48, mt('claim'), () => { menuPopup = null; openDaily(); }, { size: 18 });
    button(W / 2 - 50, 370, 100, 32, '×', () => { menuPopup = null; }, { size: 16, col: '#c9b8a0', col2: '#8a7a64' });
  }

  function drawMenu() {
    energyTick();
    if (!dailyShown && G3.heroSpear) { dailyShown = true; if (canClaimDaily() && !TEST_MODE) menuPopup = 'daily'; }
    const top = ctx.createLinearGradient(0, 0, 0, 200);
    top.addColorStop(0, 'rgba(7,30,38,0.75)'); top.addColorStop(1, 'rgba(7,30,38,0)');
    ctx.fillStyle = top; ctx.fillRect(0, 0, W, 200);
    ornamentBand(ctx, 0, 0, W, 16, C.red, C.gold);
    if (menuTab === 'fight') drawFightTab();
    else if (menuTab === 'gear') drawGearTab();
    else if (menuTab === 'talents') drawTalentsTab();
    else drawQuestsTab();
    resourceBar();
    const tg = (x, w, on, label, fn) => {
      rr(ctx, x, 24, w, 34, 9); ctx.fillStyle = C.ink; ctx.fill();
      rr(ctx, x + 3, 27, w - 6, 28, 7); ctx.fillStyle = on ? C.blueDk : '#5a3a30'; ctx.fill();
      txt(label, x + w / 2, 41.5, fitText(label, w - 8, 14), on ? '#fff' : '#c9a9a0', { weight: 900 });
      ui.push({ x, y: 22, w, h: 38, fn });
    };
    tg(10, 44, lang === 'ru', 'RU', () => { setLang('ru'); Sound.click(); });
    tg(58, 54, lang === 'kz', 'ҚАЗ', () => { setLang('kz'); Sound.click(); });
    tg(116, 44, lang === 'en', 'EN', () => { setLang('en'); Sound.click(); });
    tg(W - 172, 72, true, '⚙ ' + tr('q' + Save.data.settings.quality), cycleQuality);
    tg(W - 96, 40, Sound.music, '♪', () => { Sound.init(); Sound.setMusic(!Sound.music); });
    tg(W - 52, 40, Sound.sfx, '♫', () => { Sound.init(); Sound.setSfx(!Sound.sfx); });
    tabBar();
    if ((G3.loadDone || 0) < (G3.loadTotal || 1)) {
      const k = (G3.loadDone || 0) / (G3.loadTotal || 1), bw = 180, bx = (W - bw) / 2, by = G3.heroSpear ? TAB_Y - 14 : 300;
      if (!G3.heroSpear) txt(tr('loading'), W / 2, by - 16, 15, '#fff', { stroke: C.ink, lw: 4, weight: 900 });
      rr(ctx, bx, by - 3, bw, 6, 3); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill();
      rr(ctx, bx, by - 3, Math.max(6, bw * k), 6, 3); ctx.fillStyle = C.gold; ctx.fill();
    }
    if (menuPopup === 'item') drawItemPopup();
    else if (menuPopup === 'reward') drawRewardPopup();
    else if (menuPopup === 'energy') drawEnergyPopup();
    else if (menuPopup === 'daily') drawDailyPopup();
  }
