  // =================================================================== menu tabs and meta screens (Battle · Gear · Talents · Quests)
  let menuTab = 'fight', menuPopup = null, popupData = null, selItem = null, invPage = 0, dailyShown = false;
  let TAB_Y = 578;   // top of the tab bar; set each frame from the screen height
  const MSTR = {
    ru: {
      tabFight: 'Бой', tabGear: 'Снаряжение', tabTalents: 'Таланты', tabQuests: 'Задания', bag: 'Сумка', bonuses: 'Бонусы снаряжения и талантов',
      equip: 'НАДЕТЬ', unequip: 'СНЯТЬ', upgrade: 'УЛУЧШИТЬ', merge: 'ОБЪЕДИНИТЬ 3 → {n}', needMerge: 'Для объединения нужно 3 одинаковых', ok: 'ОТЛИЧНО',
      daily: 'Ежедневная награда', day: 'День {n}', claim: 'ЗАБРАТЬ', claimed: 'Получено', questsToday: 'Задания на сегодня', allQuests: 'Все задания: сундук + 20',
      shop: 'Лавка', chest: 'Сундук', energyPlus: 'Энергия +20', noEnergy: 'Мало энергии', nextEnergy: '+1 энергия через {n}', rewards: 'Награды',
      noChest: 'Дойдите до 5-й комнаты, чтобы получить сундук', tutMove: 'Проведите пальцем — батыр пойдёт', tutStop: 'Остановитесь — батыр стреляет сам!', tutGood: 'Отлично! Зачистите комнату', tagline: 'Восстание древнего зла', resume: 'Продолжить · комната {n}', lootSaved: 'Добыча прошлого забега: +{n} ₸', wave: 'Волна', sec: 'с', survival: 'Арена выживания', survSub: 'волны без конца', arena: 'АРЕНА', waveClear: 'ВОЛНА ОТБИТА!', waveClearSub: 'Монеты на поле — соберите', arenaName: 'Астана Арена · выживание', arenaRec: 'арена: волна {n}', noChestSurv: 'Каждые 5 волн — сундук', install: 'Установить на телефон', wavesDone: 'Отбито волн', installTitle: 'Установить игру', inst_chrome: 'Нажмите меню ⋮ вверху справа в Chrome|Выберите «Установить приложение» или «Добавить на главный экран»|Подтвердите «Установить» — значок QARATUN появится на экране', inst_samsung: 'Нажмите меню ≡ внизу справа|Выберите «Добавить страницу на» → «Главный экран»|Значок QARATUN появится на экране', inst_ios: 'Откройте игру в Safari|Нажмите «Поделиться» (квадрат со стрелкой)|Выберите «На экран Домой» → «Добавить»', inst_inapp: 'Вы открыли игру внутри мессенджера|Нажмите ⋮ и выберите «Открыть в Chrome»|В Chrome нажмите эту кнопку ещё раз', defaultName: 'Батыр', profile: 'Профиль', rating: 'Рейтинг', glory: 'славы', tapAvatar: 'нажмите, чтобы сменить', rename: 'ИМЯ', enterName: 'Имя батыра (до 16 букв)', toNext: 'ещё {n}', you: 'вы', stRuns: 'Забегов', stWins: 'Побед', stKills: 'Врагов повержено', stBosses: 'Боссов', stRooms: 'Комнат пройдено', stCoins: 'Монет собрано', stBest: 'Лучшая глава', stWave: 'Лучшая волна', stArena: 'Арен сыграно', stTime: 'Время в игре', hShort: 'ч', mShort: 'мин', ratingNote: 'Слава копится за каждый забег. Обгоните героев эпоса! Таблица с друзьями появится в онлайн-версии.', tickets: 'Билеты на арену', ticket: 'билет', ticketHow: 'Один билет — каждый день бесплатно, ещё по одному за каждого босса в главе и за все ежедневные задания.', buyTicket: 'Билет', arenaLocked: 'Арена откроется после победы над Дәу', arenaWin: 'АРЕНА ОКОНЧЕНА', arenaWinText: 'Батыр отбил волн: {n}', tabPass: 'Жол', pass: 'Жол', season: 'сезон', passNext: 'ещё {n} славы до следующей награды', passDone: 'Все награды сезона открыты!', claimAll: 'ЗАБРАТЬ ВСЁ', newSeason: 'НОВЫЙ СЕЗОН', achievements: 'Достижения', frame: 'РАМКА', intro: 'ИСТОРИЯ', next: 'Далее', toBattle: 'В БОЙ!', skip: 'Пропустить', emptySlot: 'пусто', equipped: 'надето', bagFull: 'Сумка полна', none: 'Пока ничего', newItem: 'Новый предмет!', wait: 'Подождать',
    },
    kz: {
      tabFight: 'Шайқас', tabGear: 'Жабдық', tabTalents: 'Таланттар', tabQuests: 'Тапсырмалар', bag: 'Қоржын', bonuses: 'Жабдық пен таланттар бонусы',
      equip: 'КИЮ', unequip: 'ШЕШУ', upgrade: 'ЖАҚСАРТУ', merge: '3 → {n} БІРІКТІРУ', needMerge: 'Біріктіру үшін 3 бірдей зат керек', ok: 'ТАМАША',
      daily: 'Күнделікті сыйлық', day: '{n}-күн', claim: 'АЛУ', claimed: 'Алынды', questsToday: 'Бүгінгі тапсырмалар', allQuests: 'Барлық тапсырма: сандық + 20',
      shop: 'Дүкен', chest: 'Сандық', energyPlus: 'Қуат +20', noEnergy: 'Қуат аз', nextEnergy: '+1 қуат {n} кейін', rewards: 'Сыйлықтар',
      noChest: 'Сандық алу үшін 5-бөлмеге жетіңіз', tutMove: 'Саусақпен жүргізіңіз — батыр жүреді', tutStop: 'Тоқтаңыз — батыр өзі атады!', tutGood: 'Тамаша! Бөлмені тазартыңыз', tagline: 'Ежелгі зұлымдық оянды', resume: 'Жалғастыру · {n}-бөлме', lootSaved: 'Өткен жорықтың олжасы: +{n} ₸', wave: 'Толқын', sec: 'с', survival: 'Тірі қалу аренасы', survSub: 'шексіз толқындар', arena: 'АРЕНА', waveClear: 'ТОЛҚЫН ТОЙТАРЫЛДЫ!', waveClearSub: 'Алаңдағы тиындарды жинаңыз', arenaName: 'Астана Арена · тірі қалу', arenaRec: 'арена: {n}-толқын', noChestSurv: 'Әр 5 толқын — сандық', install: 'Телефонға орнату', wavesDone: 'Тойтарылған толқын', installTitle: 'Ойынды орнату', inst_chrome: 'Chrome-да жоғарғы оң жақтағы ⋮ мәзірін басыңыз|«Қолданбаны орнату» немесе «Басты экранға қосу» таңдаңыз|«Орнату» басыңыз — QARATUN белгішесі экранда пайда болады', inst_samsung: 'Төменгі оң жақтағы ≡ мәзірін басыңыз|«Бетті қосу» → «Басты экран» таңдаңыз|QARATUN белгішесі экранда пайда болады', inst_ios: 'Ойынды Safari-де ашыңыз|«Бөлісу» батырмасын басыңыз|«Басты экранға» → «Қосу» таңдаңыз', inst_inapp: 'Ойын мессенджер ішінде ашылған|⋮ басып, «Chrome-да ашу» таңдаңыз|Chrome-да осы батырманы қайта басыңыз', defaultName: 'Батыр', profile: 'Профиль', rating: 'Рейтинг', glory: 'даңқ', tapAvatar: 'ауыстыру үшін басыңыз', rename: 'ЕСІМ', enterName: 'Батыр есімі (16 әріпке дейін)', toNext: 'тағы {n}', you: 'сіз', stRuns: 'Жорықтар', stWins: 'Жеңістер', stKills: 'Жеңілген жаулар', stBosses: 'Бастар', stRooms: 'Өтілген бөлмелер', stCoins: 'Жиналған тиын', stBest: 'Үздік тарау', stWave: 'Үздік толқын', stArena: 'Ареналар', stTime: 'Ойын уақыты', hShort: 'сағ', mShort: 'мин', ratingNote: 'Даңқ әр жорықта жиналады. Эпос батырларын озыңыз! Достармен кесте онлайн нұсқада болады.', tickets: 'Арена билеттері', ticket: 'билет', ticketHow: 'Күн сайын бір билет тегін, тағы біреуі — тараудағы әр басты жеңгені үшін және барлық күнделікті тапсырма үшін.', buyTicket: 'Билет', arenaLocked: 'Арена Дәуді жеңгеннен кейін ашылады', arenaWin: 'АРЕНА АЯҚТАЛДЫ', arenaWinText: 'Батыр тойтарған толқындар: {n}', tabPass: 'Жол', pass: 'Жол', season: 'маусым', passNext: 'келесі сыйлыққа тағы {n} даңқ', passDone: 'Маусымның барлық сыйлығы ашық!', claimAll: 'БӘРІН АЛУ', newSeason: 'ЖАҢА МАУСЫМ', achievements: 'Жетістіктер', frame: 'ЖАҚТАУ', intro: 'ТАРИХ', next: 'Әрі қарай', toBattle: 'ШАЙҚАСҚА!', skip: 'Өткізу', emptySlot: 'бос', equipped: 'киілген', bagFull: 'Қоржын толы', none: 'Әзірге ештеңе жоқ', newItem: 'Жаңа зат!', wait: 'Күту',
    },
    en: {
      tabFight: 'Battle', tabGear: 'Gear', tabTalents: 'Talents', tabQuests: 'Quests', bag: 'Bag', bonuses: 'Gear and talent bonuses',
      equip: 'EQUIP', unequip: 'UNEQUIP', upgrade: 'UPGRADE', merge: 'MERGE 3 → {n}', needMerge: 'Merging needs 3 identical items', ok: 'GREAT',
      daily: 'Daily reward', day: 'Day {n}', claim: 'CLAIM', claimed: 'Claimed', questsToday: "Today's quests", allQuests: 'All quests: chest + 20',
      shop: 'Shop', chest: 'Chest', energyPlus: 'Energy +20', noEnergy: 'Not enough energy', nextEnergy: '+1 energy in {n}', rewards: 'Rewards',
      noChest: 'Reach room 5 to earn a chest', tutMove: 'Swipe to move the batyr', tutStop: 'Stop — the batyr shoots by himself!', tutGood: 'Great! Clear the room', tagline: 'Rise of the ancient evil', resume: 'Continue · room {n}', lootSaved: 'Last run\'s loot: +{n} ₸', wave: 'Wave', sec: 's', survival: 'Survival Arena', survSub: 'endless waves', arena: 'ARENA', waveClear: 'WAVE CLEARED!', waveClearSub: 'Coins on the pitch — grab them', arenaName: 'Astana Arena · survival', arenaRec: 'arena: wave {n}', noChestSurv: 'A chest every 5 waves', install: 'Install the app', wavesDone: 'Waves survived', installTitle: 'Install the game', inst_chrome: 'Tap the ⋮ menu at the top right in Chrome|Choose “Install app” or “Add to Home screen”|Confirm “Install” — the QARATUN icon appears on your screen', inst_samsung: 'Tap the ≡ menu at the bottom right|Choose “Add page to” → “Home screen”|The QARATUN icon appears on your screen', inst_ios: 'Open the game in Safari|Tap Share (the square with an arrow)|Choose “Add to Home Screen” → “Add”', inst_inapp: 'The game is open inside a messenger|Tap ⋮ and choose “Open in Chrome”|In Chrome, tap this button again', defaultName: 'Batyr', profile: 'Profile', rating: 'Rating', glory: 'glory', tapAvatar: 'tap to change', rename: 'NAME', enterName: 'Batyr name (up to 16 letters)', toNext: '{n} more', you: 'you', stRuns: 'Runs', stWins: 'Wins', stKills: 'Monsters slain', stBosses: 'Bosses', stRooms: 'Rooms cleared', stCoins: 'Coins collected', stBest: 'Best chapter', stWave: 'Best wave', stArena: 'Arenas played', stTime: 'Time played', hShort: 'h', mShort: 'min', ratingNote: 'Glory builds up with every run. Overtake the heroes of the epics! A table with friends comes with the online version.', tickets: 'Arena tickets', ticket: 'ticket', ticketHow: 'One free ticket every day, plus one for each boss in the chapter and one for finishing all daily quests.', buyTicket: 'Ticket', arenaLocked: 'The arena opens after you defeat Dau', arenaWin: 'ARENA OVER', arenaWinText: 'Waves held off by the batyr: {n}', tabPass: 'Road', pass: 'Road', season: 'season', passNext: '{n} glory to the next reward', passDone: 'All season rewards unlocked!', claimAll: 'CLAIM ALL', newSeason: 'NEW SEASON', achievements: 'Achievements', frame: 'FRAME', intro: 'STORY', next: 'Next', toBattle: 'TO BATTLE!', skip: 'Skip', emptySlot: 'empty', equipped: 'equipped', bagFull: 'Bag is full', none: 'Nothing yet', newItem: 'New item!', wait: 'Wait',
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
    if (iconImg('talent', id)) { iconDisc('talent', id, x, y, s * 0.9); return; }
    const k = TALENT_ICON[id];
    if (k === 'heart') heart(x, y + 1, s * 0.5, id === 'regen' ? '#7cf07a' : '#ff5a5f');
    else if (k === 'coin') coinIcon(x, y, s * 0.55);
    else slotIcon(k, x, y, s, '#f4c430');
  }

  function itemCard(it, x, y, s, onTap) {
    const R = RARITY[it.r];
    rr(ctx, x, y, s, s, 9); ctx.fillStyle = '#0a0d14'; ctx.fill();
    const g = ctx.createLinearGradient(0, y, 0, y + s); g.addColorStop(0, R.col); g.addColorStop(1, 'rgba(12,15,24,0.96)');
    rr(ctx, x + 2, y + 2, s - 4, s - 4, 7); ctx.fillStyle = g; ctx.fill();
    rr(ctx, x + 1, y + 1, s - 2, s - 2, 8); ctx.strokeStyle = it.r >= 2 ? R.col : 'rgba(220,183,94,0.55)'; ctx.lineWidth = 1.3; ctx.stroke();
    const gi = iconImg('gear', it.b);
    if (gi) { const p = s * 0.08; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = s * 0.08; ctx.shadowOffsetY = s * 0.03; ctx.drawImage(gi, x + p, y + p * 0.7, s - p * 2, s - p * 2); ctx.restore(); }
    else slotIcon(GEAR[it.b].slot, x + s / 2, y + s / 2 - 3, s * 0.36, '#fff');
    txt(tr('lvl') + it.l, x + s - 5, y + s - 9, Math.max(9, s * 0.17), '#fff', { align: 'right', stroke: C.ink, lw: 3, weight: 900 });
    if (isEquipped(it)) { ctx.fillStyle = '#7cf07a'; ctx.beginPath(); ctx.arc(x + 9, y + 9, 5.5, 0, TAU); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke(); }
    if (canMerge(it)) { ctx.fillStyle = '#ff5a3a'; ctx.beginPath(); ctx.arc(x + s - 8, y + 8, 4.5, 0, TAU); ctx.fill(); }
    if (onTap) ui.push({ x, y, w: s, h: s, fn: onTap });
  }

  function screenPanel(title) {
    panel(8, 102, W - 16, TAB_Y - SAFE.t - 114);
    txt(title, W / 2, 126, 22, T.gold, { f: 'head', weight: 700 });
  }

  // ---- Gear tab
  function drawGearTab() {
    screenPanel(mt('tabGear'));
    SLOTS.forEach((slot, i) => {
      const x = 38 + (i % 3) * 102, y = 132 + Math.floor(i / 3) * 96, s = 78;
      const it = equippedIn(slot);
      if (it) itemCard(it, x, y, s, () => { selItem = it; menuPopup = 'item'; Sound.click(); });
      else {
        rr(ctx, x, y, s, s, 9); ctx.fillStyle = 'rgba(255,236,200,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,236,200,0.3)'; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
        slotIcon(slot, x + s / 2, y + s / 2 - 4, 26, 'rgba(255,236,200,0.25)');
      }
      txt(SLOT_NAME[slot][lang], x + s / 2, y + s + 9, 10, T.muted, { weight: 700 });
    });
    const S = statsTotal(), parts = [];
    for (const k of ['atk', 'aspd', 'hp', 'armor', 'crit', 'critDmg', 'magnet', 'regen', 'loot']) if (S[k] > 0) parts.push(STAT[k].name[lang] + ' ' + fmtStat(k, S[k]));
    txt(mt('bonuses'), W / 2, 340, 11, T.muted, { weight: 700 });
    wrap(parts.join(' · ') || mt('none'), W / 2, 356, W - 50, 14, 11, T.text, { weight: 700 });
    const inv = gearItems().filter(it => !isEquipped(it)).sort((a, b) => b.r - a.r || b.l - a.l || SLOTS.indexOf(GEAR[a.b].slot) - SLOTS.indexOf(GEAR[b.b].slot));
    const per = 10, pages = Math.max(1, Math.ceil(inv.length / per));
    invPage = clamp(invPage, 0, pages - 1);
    txt(mt('bag') + ' ' + gearItems().length + '/' + INV_MAX, 22, 392, 13, T.gold, { align: 'left', weight: 900 });
    inv.slice(invPage * per, invPage * per + per).forEach((it, i) => {
      itemCard(it, 19 + (i % 5) * 66, 404 + Math.floor(i / 5) * 66, 58, () => { selItem = it; menuPopup = 'item'; Sound.click(); });
    });
    if (!inv.length) txt(mt('none'), W / 2, 460, 13, T.dim, { weight: 500 });
    if (pages > 1) {
      txt((invPage + 1) + '/' + pages, W - 70, 392, 12, T.text, { weight: 900 });
      button(W - 52, 380, 22, 24, '‹', () => { invPage = (invPage - 1 + pages) % pages; }, { size: 14 });
      button(W - 32, 380, 22, 24, '›', () => { invPage = (invPage + 1) % pages; }, { size: 14 });
    }
  }

  // ---- Talents tab
  function drawTalentsTab() {
    screenPanel(mt('tabTalents'));
    TALENTS.forEach((t, i) => {
      const y = 134 + i * 62, lv = Save.data.talents[t.id] || 0, maxed = lv >= t.max, c = talentCost(lv);
      rr(ctx, 16, y, W - 32, 56, 10); ctx.fillStyle = i % 2 ? 'rgba(255,236,200,0.05)' : 'rgba(255,236,200,0.09)'; ctx.fill();
      ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(42, y + 28, 19, 0, TAU); ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
      talentIcon(t.id, 42, y + 28, 22);
      txt(t.name[lang] + '  ' + lv + '/' + t.max, 70, y + 17, fitText(t.name[lang] + '  ' + lv + '/' + t.max, 160, 15), T.gold, { align: 'left', weight: 900 });
      const cur = lv * t.per, nxt = (lv + 1) * t.per;
      const desc = STAT[t.stat].name[lang] + ' ' + fmtStat(t.stat, cur) + (maxed ? '' : ' → ' + fmtStat(t.stat, nxt));
      txt(desc, 70, y + 38, fitText(desc, 170, 11, 500), T.muted, { align: 'left', weight: 500 });
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
      rr(ctx, x, y, w, 58, 8); ctx.fillStyle = cur ? 'rgba(220,183,94,0.25)' : got ? 'rgba(255,236,200,0.15)' : 'rgba(255,236,200,0.07)'; ctx.fill();
      if (cur) { ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.stroke(); }
      txt(mt('day', i + 1), x + w / 2, y + 10, 9, T.muted, { weight: 700 });
      rewardGlyph(rw, x + w / 2, y + 30);
      txt(rewardLabel(rw), x + w / 2, y + 50, fitText(rewardLabel(rw), w - 4, 9, 900), T.text, { weight: 900 });
      if (got) txt('✓', x + w - 7, y + 40, 11, '#86d873', { weight: 900 });
    });
  }
  function drawQuestsTab() {
    screenPanel(mt('tabQuests'));
    txt(mt('daily'), 20, 142, 13, T.gold, { align: 'left', weight: 900 });
    dailyStrip(152, 16, W - 32);
    if (canClaimDaily()) button(W - 112, 128, 92, 26, mt('claim'), () => openDaily(), { size: 12 });
    txt(mt('questsToday'), 20, 230, 13, T.gold, { align: 'left', weight: 900 });
    const q = questsFresh();
    q.list.forEach((it, i) => {
      const y = 240 + i * 62, def = QUESTS[it.id], done = questDone(it);
      rr(ctx, 16, y, W - 32, 56, 10); ctx.fillStyle = 'rgba(255,236,200,0.07)'; ctx.fill();
      const text = def.text[lang].replace('{n}', def.n);
      txt(text, 26, y + 16, fitText(text, 200, 13), T.text, { align: 'left', weight: 700 });
      rr(ctx, 26, y + 32, 150, 10, 5); ctx.fillStyle = 'rgba(255,236,200,0.15)'; ctx.fill();
      rr(ctx, 26, y + 32, Math.max(10, 150 * it.prog / def.n), 10, 5); ctx.fillStyle = done ? '#5fd35a' : C.gold; ctx.fill();
      txt(it.prog + '/' + def.n, 184, y + 37, 10, T.muted, { align: 'left', weight: 900 });
      if (it.claimed) txt('✓ ' + mt('claimed'), W - 66, y + 28, 12, '#86d873', { weight: 900 });
      else button(W - 112, y + 10, 90, 36, rewardLabel(def.rw), () => claimQuest(it), { disabled: !done, size: 13, col: def.rw.gems ? '#5fc8de' : C.gold, col2: def.rw.gems ? '#1d7f99' : '#e08a1a' });
      if (!it.claimed) { if (def.rw.gems) gemIcon(W - 104, y + 28, 6); else coinIcon(W - 104, y + 28, 6); }
    });
    const bonusOk = canClaimBonus();
    button(20, 432, W - 40, 34, (q.bonus ? '✓ ' : '') + mt('allQuests'), () => { const it = claimQuestBonus(); if (it) { popupData = { items: [it], gems: 20 }; menuPopup = 'reward'; } }, { disabled: !bonusOk, size: 13, col: '#c99bff', col2: '#7a4fc8' });
    txt(mt('shop'), 20, 486, 13, T.gold, { align: 'left', weight: 900 });
    button(20, 498, (W - 50) / 2, 52, mt('chest') + '  ' + SHOP.chest, () => { const it = buyChest(); if (it) { popupData = { items: [it], gems: 0 }; menuPopup = 'reward'; } }, { disabled: Save.data.gems < SHOP.chest, size: 14, col: '#c99bff', col2: '#7a4fc8' });
    button(30 + (W - 50) / 2, 498, (W - 50) / 2, 52, '⚡+20  ' + SHOP.energy, () => buyEnergy(), { disabled: Save.data.gems < SHOP.energy, size: 13, col: '#ffd23a', col2: '#d08a10' });
    gemIcon(20 + (W - 50) / 2 - 16, 524, 7); gemIcon(W - 36, 524, 7);
  }

  function openDaily() { const got = claimDaily(); if (got) { popupData = { items: got.item ? [got.item] : [], gems: got.gems, coins: got.coins }; menuPopup = 'reward'; } }

  // ---- popups
  function popupFrame(y, h) {
    panel(24, y, W - 48, h);
  }
  function drawItemPopup() {
    const it = selItem; if (!it || !itemById(it.id)) { menuPopup = null; return; }
    const R = RARITY[it.r], G = GEAR[it.b];
    popupFrame(126, 380);
    itemCard(it, W / 2 - 44, 150, 88, null);
    txt(G.name[lang], W / 2, 260, fitText(G.name[lang], W - 80, 19), R.col, { weight: 900, stroke: C.ink, lw: 3 });
    txt(R.name[lang] + ' · ' + SLOT_NAME[G.slot][lang] + (isEquipped(it) ? ' · ' + mt('equipped') : ''), W / 2, 284, 12, T.muted, { weight: 700 });
    txt(STAT[G.stat].name[lang] + ' ' + fmtStat(G.stat, itemValue(it)), W / 2, 310, 17, T.text, { weight: 900 });
    txt(tr('lvl') + ' ' + it.l + ' / ' + itemCap(it), W / 2, 332, 12, T.muted, { weight: 700 });
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
    if (!d.t0) d.t0 = pNow;
    const hasItems = d.items.length > 0, chestT = hasItems ? 0.85 : 0, t = since(d.t0) - chestT;
    const best = d.items.reduce((m, it) => Math.max(m, it.r), 0), bcol = RARITY[best].col;
    const h = 150 + (d.coins ? 30 : 0) + (d.gems ? 30 : 0) + (hasItems ? 120 : 0), top = Math.round((H - h) / 2) - 20;
    if (t < 0) {
      // closed chest shakes harder and glows in the colour of the best item inside; tap to open at once
      const k = since(d.t0) / chestT, sh = Math.sin(pNow / 30) * k * 6;
      rays(W / 2, H / 2 - 10, 90 + k * 60, bcol, k * 0.7, pNow / 900);
      drawChest(W / 2 + sh, H / 2 - 10, 62 + k * 6, bcol, 0);
      ui.push({ x: 0, y: 0, w: W, h: H, fn: () => { d.t0 -= chestT * 1000; } });
      return;
    }
    if (hasItems && !d.burst) { d.burst = true; Sound.chest(); }
    if (hasItems && best >= 1) rays(W / 2, top + h - 120, 150, bcol, 0.55, pNow / 1400);
    panel(24, top, W - 48, h);
    txt(mt('rewards'), W / 2, top + 40, 22, T.gold, { weight: 900 });
    let y = top + 64;
    if (d.coins) { coinIcon(W / 2 - 30, y + 12, 10); txt('+' + countUp(d.coins, t / 0.7), W / 2 - 14, y + 12, 18, T.text, { align: 'left', weight: 900 }); y += 30; }
    if (d.gems) { gemIcon(W / 2 - 30, y + 12, 10); txt('+' + countUp(d.gems, t / 0.7), W / 2 - 14, y + 12, 18, T.text, { align: 'left', weight: 900 }); y += 30; }
    const n = d.items.length;
    d.items.forEach((it, i) => {
      const s = 74, x = W / 2 - (n * (s + 10) - 10) / 2 + i * (s + 10), k = easeBack((t - i * 0.14) / 0.32);
      if (k <= 0) return;
      ctx.save(); ctx.translate(x + s / 2, y + 6 + s / 2); ctx.scale(k, k); ctx.translate(-(x + s / 2), -(y + 6 + s / 2));
      if (it.r >= 2) { ctx.shadowColor = RARITY[it.r].col; ctx.shadowBlur = 18 + Math.sin(pNow / 200) * 6; }
      itemCard(it, x, y + 6, s, null);
      ctx.restore();
      txt(GEAR[it.b].name[lang], x + s / 2, y + s + 20, fitText(GEAR[it.b].name[lang], s + 8, 10), RARITY[it.r].col, { weight: 900, stroke: C.ink, lw: 2.5 });
      txt(RARITY[it.r].name[lang], x + s / 2, y + s + 34, 9, T.muted, { weight: 700 });
    });
    // white flash right after the chest bursts
    if (hasItems && t < 0.3) { ctx.fillStyle = `rgba(255,250,230,${(1 - t / 0.3) * 0.8})`; ctx.fillRect(0, 0, W, H); }
    button(W / 2 - 70, top + h - 62, 140, 44, mt('ok'), () => { menuPopup = null; popupData = null; Sound.click(); }, { size: 16 });
  }
  function drawEnergyPopup() {
    popupFrame(170, 280);
    boltIcon(W / 2, 214, 22);
    txt(mt('noEnergy'), W / 2, 258, 20, T.gold, { weight: 900 });
    txt(Save.data.energy.val + '/' + ENERGY_MAX + ' · ' + mt('nextEnergy', fmtTime(energyLeftMs())), W / 2, 286, 13, T.text, { weight: 700 });
    button(54, 312, W - 108, 48, mt('energyPlus') + '  ' + SHOP.energy, () => { if (buyEnergy()) menuPopup = null; }, { disabled: Save.data.gems < SHOP.energy, size: 15, col: '#ffd23a', col2: '#d08a10' });
    gemIcon(W - 74, 336, 8);
    button(W / 2 - 70, 376, 140, 40, mt('wait'), () => { menuPopup = null; Sound.click(); }, { size: 14, col: '#c9b8a0', col2: '#8a7a64' });
  }
  function drawDailyPopup() {
    popupFrame(170, 260);
    txt(mt('daily'), W / 2, 206, 20, T.gold, { weight: 900 });
    dailyStrip(226, 36, W - 72);
    button(W / 2 - 80, 310, 160, 48, mt('claim'), () => { menuPopup = null; openDaily(); }, { size: 18 });
    button(W / 2 - 50, 370, 100, 32, '×', () => { menuPopup = null; }, { size: 16, col: '#c9b8a0', col2: '#8a7a64' });
  }
