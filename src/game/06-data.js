  // =================================================================== data
  const SKILLS = [
    { id: 'multi', max: 3, col: '#f4c430', name: { ru: 'Мультивыстрел', kz: 'Қос жебе', en: 'Multishot' }, desc: { ru: '+1 стрела очередью', kz: 'Қатарынан +1 жебе', en: '+1 arrow per volley' } },
    { id: 'front', max: 3, col: '#f4c430', name: { ru: 'Стрела вперёд', kz: 'Алдыңғы жебе', en: 'Front Arrow' }, desc: { ru: '+1 стрела вперёд', kz: 'Алға +1 жебе', en: '+1 arrow forward' } },
    { id: 'diag', max: 2, col: '#f4c430', name: { ru: 'Диагональные стрелы', kz: 'Қиғаш жебелер', en: 'Diagonal Arrows' }, desc: { ru: '+2 стрелы по диагонали', kz: 'Қиғаш +2 жебе', en: '+2 diagonal arrows' } },
    { id: 'side', max: 2, col: '#f4c430', name: { ru: 'Боковые стрелы', kz: 'Бүйір жебелер', en: 'Side Arrows' }, desc: { ru: 'Стрелы влево и вправо', kz: 'Солға және оңға жебелер', en: 'Arrows to the left and right' } },
    { id: 'rear', max: 1, col: '#f4c430', name: { ru: 'Стрела назад', kz: 'Артқы жебе', en: 'Rear Arrow' }, desc: { ru: 'Стрела летит назад', kz: 'Артқа жебе', en: 'An arrow flies backwards' } },
    { id: 'pierce', max: 2, col: '#7fd6e8', name: { ru: 'Пробивание', kz: 'Тесіп өту', en: 'Piercing' }, desc: { ru: 'Стрелы пробивают врагов', kz: 'Жебелер жауды тесіп өтеді', en: 'Arrows pierce through enemies' } },
    { id: 'rico', max: 3, col: '#7fd6e8', name: { ru: 'Рикошет', kz: 'Рикошет', en: 'Ricochet' }, desc: { ru: 'Стрела перелетает к другому врагу', kz: 'Жебе басқа жауға секіреді', en: 'Arrows bounce to another enemy' } },
    { id: 'wall', max: 2, col: '#7fd6e8', name: { ru: 'Отскок от стен', kz: 'Қабырға секірісі', en: 'Wall Bounce' }, desc: { ru: 'Стрелы отскакивают от стен', kz: 'Жебелер қабырғадан серпіледі', en: 'Arrows bounce off walls' } },
    { id: 'atk', max: 6, col: '#ff7b54', name: { ru: 'Сила батыра', kz: 'Батыр күші', en: 'Batyr\'s Might' }, desc: { ru: 'Урон +25%', kz: 'Шабуыл +25%', en: 'Damage +25%' } },
    { id: 'spd', max: 5, col: '#ff7b54', name: { ru: 'Быстрые руки', kz: 'Шапшаңдық', en: 'Quick Hands' }, desc: { ru: 'Скорость атаки +20%', kz: 'Ату жылдамдығы +20%', en: 'Attack speed +20%' } },
    { id: 'crit', max: 4, col: '#ff7b54', name: { ru: 'Глаз батыра', kz: 'Батыр көзі', en: 'Batyr\'s Eye' }, desc: { ru: 'Шанс крита +10%, сила крита +25%', kz: 'Сыни соққы +10%, күші +25%', en: 'Crit chance +10%, crit damage +25%' } },
    { id: 'hp', max: 6, col: '#8be07a', name: { ru: 'Кумыс', kz: 'Қымыз', en: 'Kumis' }, desc: { ru: 'Макс. здоровье +20% и лечение', kz: 'Денсаулық +20% және емделу', en: 'Max health +20% and heal' } },
    { id: 'blood', max: 3, col: '#8be07a', name: { ru: 'Жажда крови', kz: 'Қанішер', en: 'Bloodthirst' }, desc: { ru: 'Лечение за каждое убийство', kz: 'Әр жеңіс үшін емделу', en: 'Heal on every kill' } },
    { id: 'fire', max: 2, col: '#ff9a3c', name: { ru: 'Огненные стрелы', kz: 'От жебе', en: 'Fire Arrows' }, desc: { ru: 'Стрелы поджигают врагов', kz: 'Жебелер жауды өртейді', en: 'Arrows set enemies on fire' } },
    { id: 'ice', max: 2, col: '#9fd9ff', name: { ru: 'Ледяные стрелы', kz: 'Мұз жебе', en: 'Ice Arrows' }, desc: { ru: 'Стрелы замедляют врагов', kz: 'Жебелер жауды баяулатады', en: 'Arrows slow enemies' } },
    { id: 'orbit', max: 3, col: '#c99bff', name: { ru: 'Тумар-оберег', kz: 'Тұмар', en: 'Tumar Charm' }, desc: { ru: 'Вращающийся оберег жалит врагов', kz: 'Айналатын тұмар жауды шағады', en: 'A spinning charm stings enemies' } },
    { id: 'eagle', max: 3, col: '#c99bff', name: { ru: 'Беркут', kz: 'Бүркіт', en: 'Golden Eagle' }, desc: { ru: 'Беркут-помощник бьёт врагов', kz: 'Бүркіт-көмекші жауға шабуылдайды', en: 'An eagle companion strikes enemies' } },
    { id: 'speed', max: 2, col: '#8be07a', name: { ru: 'Тулпар', kz: 'Тұлпар', en: 'Tulpar' }, desc: { ru: 'Скорость бега +15%', kz: 'Жүгіру жылдамдығы +15%', en: 'Move speed +15%' } },
  ];
  const SKILL = Object.fromEntries(SKILLS.map(s => [s.id, s]));

  // bonuses found in crates or dropped by enemies
  const ITEMS = {
    medkit: { w: 34, col: '#ff4a55', name: { ru: 'Аптечка', kz: 'Дәрі қобдишасы', en: 'Medkit' } },
    bomb: { w: 26, col: '#ff9a2a', name: { ru: 'Бомба', kz: 'Бомба', en: 'Bomb' } },
    shield: { w: 14, col: '#5fc8ff', name: { ru: 'Щит', kz: 'Қалқан', en: 'Shield' } },
    w_triple: { w: 9, col: '#ffd23a', name: { ru: 'Тройной лук', kz: 'Үш жебелі садақ', en: 'Triple Bow' }, weapon: true },
    w_heavy: { w: 8, col: '#ff5a3a', name: { ru: 'Тяжёлые стрелы', kz: 'Ауыр жебелер', en: 'Heavy Arrows' }, weapon: true },
    w_rapid: { w: 9, col: '#3ae0ff', name: { ru: 'Скорострельный лук', kz: 'Шапшаң садақ', en: 'Rapid Bow' }, weapon: true },
  };
  const WEAPON_TIME = 15;
  function randomItem() {
    let tot = 0; for (const k in ITEMS) tot += ITEMS[k].w;
    let r = Math.random() * tot;
    for (const k in ITEMS) { r -= ITEMS[k].w; if (r <= 0) return k; }
    return 'medkit';
  }

  const ENEMY = {
    w: { name: { ru: 'Волк', kz: 'Қасқыр', en: 'Wolf' }, hp: 34, r: 13, speed: 62, dmg: 10, xp: 8, coin: 2, ai: 'wolf' },
    s: { name: { ru: 'Тарантул', kz: 'Бүйі', en: 'Tarantula' }, hp: 16, r: 9, speed: 88, dmg: 9, xp: 4, coin: 1, ai: 'spider' },
    j: { name: { ru: 'Жезтырнак', kz: 'Жезтырнақ', en: 'Zheztyrnak' }, hp: 38, r: 12, speed: 48, dmg: 10, xp: 10, coin: 3, ai: 'shooter' },
    a: { name: { ru: 'Албасты', kz: 'Албасты', en: 'Albasty' }, hp: 50, r: 14, speed: 30, dmg: 12, xp: 12, coin: 3, ai: 'ghost', fly: true },
    m: { name: { ru: 'Мыстан', kz: 'Мыстан', en: 'Mystan' }, hp: 55, r: 13, speed: 0, dmg: 11, xp: 12, coin: 4, ai: 'witch' },
    D: { name: { ru: 'Дэу-великан', kz: 'Дәу', en: 'Dau the Giant' }, hp: 420, r: 28, speed: 46, dmg: 15, xp: 70, coin: 35, ai: 'boss', boss: true,
         pats: ['walk', 'stomp', 'walk', 'charge', 'walk', 'boulders', 'charge'] },
    J: { name: { ru: 'Жалмауыз-кемпир', kz: 'Жалмауыз кемпір', en: 'Zhalmauyz Kempir' }, hp: 750, r: 22, speed: 55, dmg: 15, xp: 90, coin: 45, ai: 'boss', boss: true,
         pats: ['walk', 'spiral', 'teleport', 'summon', 'walk', 'teleport', 'spiral', 'teleport'] },
    A: { name: { ru: 'Айдахар', kz: 'Айдаһар', en: 'Aydahar' }, hp: 1150, r: 30, speed: 42, dmg: 19, xp: 120, coin: 70, ai: 'boss', boss: true,
         pats: ['walk', 'breath', 'charge', 'rings', 'walk', 'wolves', 'breath', 'charge'] },
  };

  // Rooms: the steppe around Astana (the city only on the horizon). Layout legend: '#' small solid prop, 'Y' big solid prop, '~' low prop (blocks walking, not arrows),
  // enemies w s j a m, bosses D J A. Each theme decides what the props look like.
  const ROOM_DEFS = [
    { theme: 'steppe_gold', place: { ru: 'Есильская степь', kz: 'Есіл даласы', en: 'Esil Steppe' }, lm: [['khanshatyr', -16, 26, 1.4]], L: [
      '........', '........', '..s..s..', '........', '.#....#.', '........', '..~~~~..', '..~~~~..',
      '........', '.w....w.', '........', '#..YY..#', '........', '........', '........', '........'] },
    { theme: 'steppe_gold', place: { ru: 'Курган предков', kz: 'Ата-баба қорғаны', en: 'Ancestors\' Barrow' }, lm: [['towers', 18, 30, 1.3]], L: [
      '........', '..j..j..', '........', '#.#..#.#', '........', '....s...', '........', '~~....~~', '~~.Y..~~',
      '........', '.w....w.', '........', '..#..#..', '........', '........', '........', '........', '........'] },
    { theme: 'steppe_gold', place: { ru: 'Долина балбалов', kz: 'Балбалдар алқабы', en: 'Valley of Balbals' }, lm: [], L: [
      '........', '.w....w.', '........', '..#..#..', '..#..#..', '....j...', '.s....s.', '........', 'Y......Y',
      '........', '..~~~~..', '........', '......s.', '........', '#......#', '........', '........', '........'] },
    { theme: 'steppe_gold', place: { ru: 'Аул у реки', kz: 'Өзен жағасындағы ауыл', en: 'Riverside Aul' }, lm: [['khanshatyr', 14, 28, 1.3], ['portal', 5, 1, 0.8]], L: [
      '........', '...a....', '........', '~~~..~~~', '........', '.j....j.', '........', '..#..#..', '........', '...s.s..',
      '........', '#.Y..Y.#', '........', '.w....w.', '........', '..~..~..', '........', '........', '........', '........'] },
    { theme: 'steppe_gold', place: { ru: 'Логово Дэу', kz: 'Дәудің ордасы', en: 'Lair of Dau' }, lm: [['portal', -8, 1, 1.15]], L: [
      '........', '........', '........', '...D....', '........', '........', '#......#', '........',
      '..~..~..', '........', '#......#', '........', '........', '........', '........', '........'] },
    { theme: 'steppe_night', place: { ru: 'Лунная тропа', kz: 'Айлы соқпақ', en: 'Moonlit Trail' }, lm: [['nuralem', -15, 28, 1.4]], L: [
      '........', '.m....m.', '........', '..#..#..', '........', 'w..ss..w', '........', '.#....#.', '........',
      '~~....~~', '........', '..j..j..', '........', '#.Y..Y.#', '........', '........', '........', '........'] },
    { theme: 'steppe_night', place: { ru: 'Туманный перевал', kz: 'Тұманды асу', en: 'Misty Pass' }, lm: [], L: [
      '........', '..a..a..', '........', '#.#..#.#', '........', '..j..j..', '........', '~~~..~~~', '........', '..w..w..',
      '........', '.Y....Y.', '........', '.s.ss.s.', '........', '#......#', '........', '........', '........', '........'] },
    { theme: 'steppe_night', place: { ru: 'Стойбище кочевников', kz: 'Көшпелілер қонысы', en: 'Nomad Camp' }, lm: [['khanshatyr', 16, 30, 1.3]], L: [
      '........', 'm......m', '..####..', '........', '.s.ss.s.', '........', '..Y..Y..', '........', '..j..j..', '........',
      '~~....~~', '........', '.w.ww.w.', '........', '#..##..#', '........', '........', '........', '........', '........'] },
    { theme: 'steppe_night', place: { ru: 'Поле каменных стражей', kz: 'Тас күзетшілер даласы', en: 'Field of Stone Guardians' }, lm: [], L: [
      '........', '...aa...', '........', '.~~..~~.', '.~~..~~.', '..w..w..', '........', '#..m...#', '........', '.ss..ss.', '........',
      '..#..#..', '........', 'j......j', '........', 'Y......Y', '........', '..a..a..', '........', '........', '........', '........'] },
    { theme: 'steppe_night', place: { ru: 'Курган Жалмауыз', kz: 'Жалмауыз қорғаны', en: 'Barrow of Zhalmauyz' }, lm: [['towers', -18, 32, 1.3]], L: [
      '........', '........', '...J....', '........', '..#..#..', '........', '........', '..#..#..', '........',
      '~~....~~', '........', '........', '#......#', '........', '........', '........', '........', '........'] },
    { theme: 'steppe_blood', place: { ru: 'Выжженная земля', kz: 'Күйген жер', en: 'Scorched Land' }, lm: [], L: [
      '........', '.j.mm.j.', '........', '##.##.##', '........', '.w.ww.w.', '........', '##.##.##', '........', '..~~~~..',
      '........', '.s....s.', '........', 'Y.#..#.Y', '........', '........', '........', '........', '........', '........'] },
    { theme: 'steppe_blood', place: { ru: 'Кровавый брод', kz: 'Қанды өткел', en: 'Blood Ford' }, lm: [['akorda', 17, 32, 1.3]], L: [
      '........', 'a..a..a.', '........', '#.##.##.', '........', 'j......j', '...ss...', '.##..##.', '........', '.m....m.', '........',
      '~~.~~.~~', '........', '.w.ww.w.', '........', '#.#..#.#', '........', '..s..s..', '........', '........', '........', '........'] },
    { theme: 'steppe_blood', place: { ru: 'Поле черепов', kz: 'Бас сүйектер даласы', en: 'Field of Skulls' }, lm: [], L: [
      '........', '..w..w..', '.Y.ww.Y.', '........', 'm.~~~~.m', '........', '..j..j..', '........', 'Y..aa..Y', '........', '##.##.##',
      '........', '.s.ss.s.', '........', '..Y..Y..', '........', 'j......j', '........', '........', '........', '........', '........'] },
    { theme: 'steppe_blood', place: { ru: 'Врата Қара түн', kz: 'Қара түн қақпасы', en: 'Gates of Qara Tun' }, lm: [['nuralem', -16, 30, 1.3]], L: [
      '........', '.a.aa.a.', '........', '#.j..j.#', '........', '..Y..Y..', '.s.ss.s.', '........', '..m..m..', '........', '~~....~~',
      '........', '.w.ww.w.', '........', '#.#..#.#', '........', '..j..j..', '........', 'Y......Y', '........', '........', '........'] },
    { theme: 'steppe_blood', place: { ru: 'Логово Айдахара', kz: 'Айдаһар ордасы', en: 'Aydahar\'s Lair' }, lm: [['portal', 0, 2, 1.3]], L: [
      '........', '........', '...A....', '........', '........', '#......#', '........', '........', '~~....~~', '~~....~~',
      '........', '........', '#.Y..Y.#', '........', '........', '........', '........', '........', '........', '........'] },
  ];
  // QARATUN rooms are 1.5x longer: the middle of each layout is repeated once more (its obstacles, and at most two of its
  // monsters, the weakest first; none in rooms 1–3, one in 4–7) between the fight at the north end and the entrance. Boss rooms get the extra stretch empty.
  ROOM_DEFS.forEach((d, ri) => {
    const L = d.L, n = L.length, boss = L.some(r => /[DJA]/.test(r)), k = Math.round(n * 0.5);
    const from = Math.floor(n * 0.2), block = L.slice(from, from + k);
    let left = boss || ri < 3 ? 0 : ri < 7 ? 1 : 2;   // the first rooms stay gentle (no wall in room 2)
    const order = 'swjam';
    const keep = new Set();
    for (const t of order) block.forEach((row, i) => [...row].forEach((ch, j) => { if (ch === t && left > 0) { keep.add(i + ':' + j); left--; } }));
    const extra = block.map((row, i) => [...row].map((ch, j) => /[a-zA-Z]/.test(ch) && !keep.has(i + ':' + j) ? '.' : ch).join(''));
    const at = Math.floor(n * 0.45);
    d.L = [...L.slice(0, at), ...extra, ...L.slice(at)];
  });
  const MENU_ROOM = ['Y......Y', '..Y.....', '........', '......#.', '........', '........', '........', '........', '........', '........', '........', '........', '........'];

  const THEMES = {
    // QARATUN: the steppe around the capital in three hours of the black night
    steppe_gold: { zone: { ru: 'Золотая степь', kz: 'Алтын дала', en: 'Golden Steppe' }, sky: ['#2a2c58', '#ffb070'], sun: '#ffe2bc', sunPos: [-6, 10, -7], sunI: 1.7,
            hemi: ['#e8dcc8', '#4a3a26', 0.5], outer: '#9a7a3e', tuft: ['#8a6a2e', '#d8b060'] },
    steppe_night: { zone: { ru: 'Лунная степь', kz: 'Айлы дала', en: 'Moonlit Steppe' }, sky: ['#060b18', '#34466a'], sun: '#a8b8ff', sunPos: [4, 12, -6], sunI: 1.05,
            hemi: ['#8a9ac8', '#1a2018', 0.6], outer: '#2f3a30', tuft: ['#34442e', '#6a7a58'] },
    steppe_blood: { zone: { ru: 'Кровавое затмение', kz: 'Қанды тұтылу', en: 'Blood Eclipse' }, sky: ['#120406', '#a8301a'], sun: '#ffb49a', sunPos: [5, 11, -7], sunI: 1.1,
            hemi: ['#b89080', '#1e1410', 0.55], outer: '#5a3424', tuft: ['#5a3a22', '#a87a4a'] },
    park: { zone: { ru: 'Парки Астаны', kz: 'Астана саябақтары', en: 'Parks of Astana' }, sky: ['#4f8fd0', '#d8ecf6'], sun: '#fff1dc', sunPos: [-5, 14, 6], sunI: 1.75,
            hemi: ['#e4f4ff', '#6b7a3a', 0.45], outer: '#5f7f3a', tuft: ['#5f8a32', '#9cc25a'] },
    street: { zone: { ru: 'Улицы столицы', kz: 'Елорда көшелері', en: 'Streets of the capital' }, sky: ['#5a76b5', '#f6d9a8'], sun: '#ffdcae', sunPos: [-8, 11, 4], sunI: 1.9,
              hemi: ['#ffe9cc', '#5a5550', 0.45], outer: '#8f8c86', tuft: ['#6d8a3a', '#a5c25a'] },
    office: { zone: { ru: 'Бизнес-центр', kz: 'Бизнес-орталық', en: 'Business center' }, sky: ['#4f8fd0', '#d6e6f2'], sun: '#ffffff', sunPos: [-3, 14, 3], sunI: 1.25,
              hemi: ['#f4f8ff', '#8a8680', 0.8], outer: '#2c2f36', tuft: ['#5f8a32', '#9cc25a'] },
    beach: { zone: { ru: 'Хан Шатыр', kz: 'Хан Шатыр', en: 'Khan Shatyr' }, sky: ['#6b8fc4', '#ffe2b3'], sun: '#ffe0b0', sunPos: [-4, 14, 5], sunI: 1.8,
             hemi: ['#fff0d8', '#8a6a44', 0.5], outer: '#d9b97c', tuft: ['#7a9a3a', '#b5cc5a'] },
  };
  const biome = n => THEMES[ROOM_DEFS[Math.max(0, n - 1)].theme];
  const roomPlace = n => ROOM_DEFS[n - 1].place[lang];


