  // =================================================================== meta progression: gear, chests, talents, energy, daily rewards, quests
  const RARITY = [
    { col: '#b9b6ad', mul: 1, cap: 10, w: 70, name: { ru: 'Обычный', kz: 'Қарапайым', en: 'Common' } },
    { col: '#4aa8ff', mul: 1.7, cap: 20, w: 25, name: { ru: 'Редкий', kz: 'Сирек', en: 'Rare' } },
    { col: '#b45aff', mul: 2.6, cap: 30, w: 4.5, name: { ru: 'Эпический', kz: 'Эпикалық', en: 'Epic' } },
    { col: '#ffb020', mul: 4, cap: 40, w: 0.5, name: { ru: 'Легендарный', kz: 'Аңыздық', en: 'Legendary' } },
  ];
  const SLOTS = ['weapon', 'helmet', 'armor', 'belt', 'ring', 'amulet'];
  const SLOT_NAME = {
    weapon: { ru: 'Оружие', kz: 'Қару', en: 'Weapon' }, helmet: { ru: 'Шлем', kz: 'Дулыға', en: 'Helmet' },
    armor: { ru: 'Доспех', kz: 'Сауыт', en: 'Armour' }, belt: { ru: 'Пояс', kz: 'Белбеу', en: 'Belt' },
    ring: { ru: 'Кольцо', kz: 'Жүзік', en: 'Ring' }, amulet: { ru: 'Амулет', kz: 'Тұмар', en: 'Amulet' },
  };
  const STAT = {
    atk: { pct: true, name: { ru: 'Атака', kz: 'Шабуыл', en: 'Attack' } },
    aspd: { pct: true, name: { ru: 'Скорость атаки', kz: 'Ату жылдамдығы', en: 'Attack speed' } },
    hp: { pct: true, name: { ru: 'Здоровье', kz: 'Денсаулық', en: 'Health' } },
    armor: { pct: true, name: { ru: 'Защита', kz: 'Қорғаныс', en: 'Defence' } },
    crit: { pct: true, name: { ru: 'Шанс крита', kz: 'Сыни соққы', en: 'Crit chance' } },
    critDmg: { pct: true, name: { ru: 'Сила крита', kz: 'Сыни күш', en: 'Crit damage' } },
    magnet: { pct: true, name: { ru: 'Магнит', kz: 'Магнит', en: 'Magnet' } },
    regen: { pct: true, name: { ru: 'Лечение за комнату', kz: 'Бөлмеден соң емделу', en: 'Heal per room' } },
    loot: { pct: true, name: { ru: 'Монеты', kz: 'Тиын', en: 'Coins' } },
    startSkill: { pct: false, name: { ru: 'Навыков на старте', kz: 'Бастапқы дағды', en: 'Starting skills' } },
  };
  const GEAR = {
    bow: { slot: 'weapon', stat: 'atk', v: 0.06, name: { ru: 'Батырский лук', kz: 'Батыр садағы', en: "Batyr's Bow" } },
    swiftbow: { slot: 'weapon', stat: 'aspd', v: 0.05, name: { ru: 'Лёгкий лук', kz: 'Жеңіл садақ', en: 'Swift Bow' } },
    dulyga: { slot: 'helmet', stat: 'hp', v: 0.05, name: { ru: 'Дулыга', kz: 'Дулыға', en: 'Dulyga Helmet' } },
    borik: { slot: 'helmet', stat: 'armor', v: 0.025, name: { ru: 'Меховой бөрік', kz: 'Бөрік', en: 'Fur Borik' } },
    shapan: { slot: 'armor', stat: 'hp', v: 0.07, name: { ru: 'Стёганый шапан', kz: 'Шапан', en: 'Quilted Chapan' } },
    saut: { slot: 'armor', stat: 'armor', v: 0.03, name: { ru: 'Пластинчатый доспех', kz: 'Сауыт', en: 'Lamellar Armour' } },
    beldik: { slot: 'belt', stat: 'hp', v: 0.04, name: { ru: 'Кожаный пояс', kz: 'Белдік', en: 'Leather Belt' } },
    kemer: { slot: 'belt', stat: 'magnet', v: 0.15, name: { ru: 'Пояс с подсумками', kz: 'Кемер', en: 'Pouch Belt' } },
    zhuzik: { slot: 'ring', stat: 'crit', v: 0.02, name: { ru: 'Серебряное кольцо', kz: 'Күміс жүзік', en: 'Silver Ring' } },
    tas: { slot: 'ring', stat: 'critDmg', v: 0.08, name: { ru: 'Кольцо с бирюзой', kz: 'Көгілдір жүзік', en: 'Turquoise Ring' } },
    tumar: { slot: 'amulet', stat: 'regen', v: 0.02, name: { ru: 'Тумар', kz: 'Тұмар', en: 'Tumar Amulet' } },
    alka: { slot: 'amulet', stat: 'loot', v: 0.06, name: { ru: 'Ожерелье-алқа', kz: 'Алқа', en: 'Alka Necklace' } },
  };
  const GEAR_KEYS = Object.keys(GEAR);
  const INV_MAX = 60;

  const itemValue = it => GEAR[it.b].v * RARITY[it.r].mul * (1 + 0.1 * (it.l - 1));
  const itemCap = it => RARITY[it.r].cap;
  const itemUpCost = it => Math.round(20 * Math.pow(it.l + 1, 1.35) * (1 + it.r * 0.6) / 10) * 10;
  const fmtStat = (stat, v) => STAT[stat].pct ? '+' + (Math.round(v * 1000) / 10) + '%' : '+' + v;
  const gearItems = () => Save.data.gear.items;
  const itemById = id => gearItems().find(it => it.id === id);
  const equippedIn = slot => itemById(Save.data.gear.eq[slot]);
  const isEquipped = it => Save.data.gear.eq[GEAR[it.b].slot] === it.id;

  function rollItem(minR, luck) {
    const ws = RARITY.map((r, i) => i < (minR || 0) ? 0 : r.w * (i > 0 ? (luck || 1) : 1));
    let t = ws.reduce((a, b) => a + b, 0), x = Math.random() * t, r = 0;
    for (; r < ws.length - 1; r++) { x -= ws[r]; if (x <= 0) break; }
    return { b: GEAR_KEYS[Math.floor(Math.random() * GEAR_KEYS.length)], r, l: 1 };
  }
  function addItem(it) {
    const g = Save.data.gear;
    if (g.items.length >= INV_MAX) { bank += 30 * (it.r + 1); return null; }   // full bag: sold for coins
    const item = { id: g.next++, b: it.b, r: it.r, l: it.l || 1 };
    g.items.push(item);
    // fill an empty slot automatically so new players feel the upgrade at once
    if (!g.eq[GEAR[item.b].slot]) g.eq[GEAR[item.b].slot] = item.id;
    return item;
  }
  function equipItem(it) { Save.data.gear.eq[GEAR[it.b].slot] = it.id; Save.write(); Sound.click(); }
  function unequipItem(it) { if (isEquipped(it)) delete Save.data.gear.eq[GEAR[it.b].slot]; Save.write(); Sound.click(); }
  function upgradeItem(it) {
    const c = itemUpCost(it);
    if (it.l >= itemCap(it) || bank < c) return false;
    bank -= c; it.l++; saveProgress(); Sound.level();
    return true;
  }
  // three items of the same kind and rarity merge into one of the next rarity
  const mergeMates = it => gearItems().filter(o => o.id !== it.id && o.b === it.b && o.r === it.r);
  const canMerge = it => it.r < RARITY.length - 1 && mergeMates(it).length >= 2;
  function mergeItem(it) {
    if (!canMerge(it)) return null;
    const mates = mergeMates(it).sort((a, b) => isEquipped(b) - isEquipped(a) || a.l - b.l).slice(0, 2);
    const g = Save.data.gear, wasEq = [it, ...mates].some(isEquipped);
    it.r++; it.l = Math.max(it.l, ...mates.map(m => m.l));
    g.items = g.items.filter(o => !mates.includes(o));
    if (wasEq) g.eq[GEAR[it.b].slot] = it.id;
    Save.write(); Sound.level();
    return it;
  }

  // ---- talents (permanent upgrades for coins)
  const TALENTS = [
    { id: 'atk', stat: 'atk', per: 0.04, max: 20, name: { ru: 'Сила', kz: 'Күш', en: 'Might' } },
    { id: 'hp', stat: 'hp', per: 0.05, max: 20, name: { ru: 'Здоровье', kz: 'Денсаулық', en: 'Vitality' } },
    { id: 'armor', stat: 'armor', per: 0.02, max: 10, name: { ru: 'Закалка', kz: 'Шынығу', en: 'Toughness' } },
    { id: 'magnet', stat: 'magnet', per: 0.2, max: 5, name: { ru: 'Магнит', kz: 'Магнит', en: 'Magnet' } },
    { id: 'regen', stat: 'regen', per: 0.01, max: 10, name: { ru: 'Передышка', kz: 'Тынығу', en: 'Second Wind' } },
    { id: 'loot', stat: 'loot', per: 0.05, max: 10, name: { ru: 'Добыча', kz: 'Олжа', en: 'Loot' } },
    { id: 'start', stat: 'startSkill', per: 1, max: 3, name: { ru: 'Опыт предков', kz: 'Ата тәжірибесі', en: 'Ancestral Skill' } },
  ];
  const talentCost = lv => upCost(lv) * (lv >= 10 ? 2 : 1);
  function buyTalent(t) {
    const lv = Save.data.talents[t.id] || 0, c = talentCost(lv);
    if (lv >= t.max || bank < c) return false;
    bank -= c; Save.data.talents[t.id] = lv + 1; saveProgress(); Sound.level();
    return true;
  }

  function statsTotal() {
    const S = { atk: 0, aspd: 0, hp: 0, armor: 0, crit: 0, critDmg: 0, magnet: 0, regen: 0, loot: 0, startSkill: 0 };
    for (const t of TALENTS) S[t.stat] += (Save.data.talents[t.id] || 0) * t.per;
    for (const slot of SLOTS) { const it = equippedIn(slot); if (it) S[GEAR[it.b].stat] += itemValue(it); }
    return S;
  }

  // ---- energy: 5 per run, +1 every 12 minutes up to 20 (can go above with purchases)
  const ENERGY_MAX = 20, RUN_COST = 5, REGEN_MS = 12 * 60 * 1000;
  function energyTick() {
    const e = Save.data.energy, now = Date.now();
    if (e.val >= ENERGY_MAX) { e.t = now; return; }
    const n = Math.floor((now - e.t) / REGEN_MS);
    if (n > 0) { e.val = Math.min(ENERGY_MAX, e.val + n); e.t = e.val >= ENERGY_MAX ? now : e.t + n * REGEN_MS; Save.write(); }
  }
  const energyLeftMs = () => Math.max(0, REGEN_MS - (Date.now() - Save.data.energy.t));
  function spendEnergy() {
    if (TEST_MODE) return true;
    energyTick();
    const e = Save.data.energy;
    if (e.val < RUN_COST) return false;
    if (e.val >= ENERGY_MAX) e.t = Date.now();
    e.val -= RUN_COST; Save.write();
    return true;
  }
  const fmtTime = ms => { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  // ---- shop (gems)
  const SHOP = { chest: 60, energy: 30 };
  function buyChest() { if (Save.data.gems < SHOP.chest) return null; Save.data.gems -= SHOP.chest; const it = addItem(rollItem(0, 2)); saveProgress(); Sound.level(); return it; }
  function buyEnergy() { if (Save.data.gems < SHOP.energy) return false; Save.data.gems -= SHOP.energy; Save.data.energy.val = Math.min(99, Save.data.energy.val + 20); Save.write(); Sound.level(); return true; }

  // ---- daily login reward (7-day cycle, one claim per calendar day)
  const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  const DAILY = [{ coins: 100 }, { gems: 10 }, { item: 0 }, { coins: 300 }, { gems: 20 }, { item: 1 }, { gems: 50, item: 2 }];
  const canClaimDaily = () => Save.data.daily.last !== todayStr();
  function claimDaily() {
    if (!canClaimDaily()) return null;
    const d = Save.data.daily, rw = DAILY[d.day % 7], got = { coins: rw.coins || 0, gems: rw.gems || 0, item: null };
    bank += got.coins; Save.data.gems += got.gems;
    if (rw.item !== undefined) got.item = addItem(rollItem(rw.item));
    d.day++; d.last = todayStr(); saveProgress(); Sound.level();
    return got;
  }

  // ---- daily quests (3 per day, reset at local midnight)
  const QUESTS = {
    kill: { n: 40, rw: { gems: 15 }, text: { ru: 'Победите {n} врагов', kz: '{n} жауды жеңіңіз', en: 'Defeat {n} enemies' } },
    wolf: { n: 15, rw: { coins: 200 }, text: { ru: 'Победите {n} волков', kz: '{n} қасқырды жеңіңіз', en: 'Defeat {n} wolves' } },
    room: { n: 8, rw: { gems: 15 }, text: { ru: 'Пройдите {n} комнат', kz: '{n} бөлмеден өтіңіз', en: 'Clear {n} rooms' } },
    crate: { n: 3, rw: { coins: 200 }, text: { ru: 'Откройте {n} ящика', kz: '{n} жәшік ашыңыз', en: 'Open {n} crates' } },
    nohit: { n: 2, rw: { gems: 20 }, text: { ru: 'Пройдите {n} комнаты без урона', kz: '{n} бөлмеден зақымсыз өтіңіз', en: 'Clear {n} rooms without damage' } },
    bomb: { n: 3, rw: { coins: 150 }, text: { ru: 'Бросьте {n} бомбы', kz: '{n} бомба лақтырыңыз', en: 'Throw {n} bombs' } },
    boss: { n: 1, rw: { gems: 25 }, text: { ru: 'Победите босса', kz: 'Боссты жеңіңіз', en: 'Defeat a boss' } },
    coins: { n: 300, rw: { gems: 15 }, text: { ru: 'Соберите {n} ₸ в забегах', kz: 'Жолда {n} ₸ жинаңыз', en: 'Collect {n} ₸ in runs' } },
    level: { n: 8, rw: { coins: 250 }, text: { ru: 'Достигните {n} уровня за забег', kz: 'Бір жолда {n}-деңгейге жетіңіз', en: 'Reach level {n} in a run' }, max: true },
  };
  function questsFresh() {
    const q = Save.data.quests;
    if (q.date === todayStr() && q.list.length === 3) return q;
    const keys = Object.keys(QUESTS).sort(() => Math.random() - 0.5).slice(0, 3);
    q.date = todayStr(); q.list = keys.map(id => ({ id, prog: 0, claimed: false })); q.bonus = false;
    Save.write();
    return q;
  }
  function questEvent(id, n) {
    if (SIM.on) return;
    const q = questsFresh();
    for (const it of q.list) {
      if (it.id !== id || it.claimed) continue;
      const def = QUESTS[id], before = it.prog;
      it.prog = Math.min(def.n, def.max ? Math.max(it.prog, n || 0) : it.prog + (n === undefined ? 1 : n));
      if (before < def.n && it.prog >= def.n) { Save.write(); floatText(player.x, player.y, '✔ ' + def.text[lang].replace('{n}', def.n), '#7cf07a', 13, 2.6); }
    }
  }
  const questDone = it => it.prog >= QUESTS[it.id].n;
  function claimQuest(it) {
    if (!questDone(it) || it.claimed) return false;
    const rw = QUESTS[it.id].rw;
    it.claimed = true; bank += rw.coins || 0; Save.data.gems += rw.gems || 0; saveProgress(); Sound.level();
    return true;
  }
  const canClaimBonus = () => { const q = questsFresh(); return !q.bonus && q.list.every(it => it.claimed); };
  function claimQuestBonus() {
    if (!canClaimBonus()) return null;
    const q = Save.data.quests; q.bonus = true; Save.data.gems += 20; addTicket(1);
    const it = addItem(rollItem(1)); saveProgress(); Sound.level();
    return it;
  }
  const questsReady = () => { const q = questsFresh(); return q.list.filter(it => questDone(it) && !it.claimed).length + (canClaimBonus() ? 1 : 0); };

  // ---- rewards at the end of a run: chests by progress (opened at once), gems for bosses and victory
  function runRewards(won) {
    const chests = won ? [1, 0] : run.room >= 10 ? [0, 0] : run.room >= 5 ? [0] : [];
    const items = [];
    for (const minR of chests) { const it = addItem(rollItem(minR)); if (it) items.push(it); }
    const gems = run.gems + (won ? 10 : 0);
    Save.data.gems += gems;
    run.rewards = { items, gems };
  }
