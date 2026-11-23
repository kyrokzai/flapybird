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
    { id: 'crit', max: 4, col: '#ff7b54', name: { ru: 'Глаз мергена', kz: 'Мерген көз', en: 'Marksman\'s Eye' }, desc: { ru: 'Шанс крита +10%, сила крита +25%', kz: 'Сыни соққы +10%, күші +25%', en: 'Crit chance +10%, crit damage +25%' } },
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
    w: { name: { ru: 'Волк', kz: 'Қасқыр', en: 'Wolf' }, hp: 34, r: 13, speed: 70, dmg: 12, xp: 8, coin: 2, ai: 'wolf' },
    s: { name: { ru: 'Тарантул', kz: 'Бүйі', en: 'Tarantula' }, hp: 16, r: 9, speed: 88, dmg: 9, xp: 4, coin: 1, ai: 'spider' },
    j: { name: { ru: 'Жезтырнак', kz: 'Жезтырнақ', en: 'Zheztyrnak' }, hp: 38, r: 12, speed: 48, dmg: 12, xp: 10, coin: 3, ai: 'shooter' },
    a: { name: { ru: 'Албасты', kz: 'Албасты', en: 'Albasty' }, hp: 50, r: 14, speed: 30, dmg: 12, xp: 12, coin: 3, ai: 'ghost', fly: true },
    m: { name: { ru: 'Мыстан', kz: 'Мыстан', en: 'Mystan' }, hp: 55, r: 13, speed: 0, dmg: 11, xp: 12, coin: 4, ai: 'witch' },
    D: { name: { ru: 'Дэу-великан', kz: 'Дәу', en: 'Dau the Giant' }, hp: 480, r: 28, speed: 46, dmg: 17, xp: 70, coin: 35, ai: 'boss', boss: true,
         pats: ['walk', 'stomp', 'walk', 'charge', 'walk', 'boulders', 'charge'] },
    J: { name: { ru: 'Жалмауыз-кемпир', kz: 'Жалмауыз кемпір', en: 'Zhalmauyz Kempir' }, hp: 750, r: 22, speed: 55, dmg: 15, xp: 90, coin: 45, ai: 'boss', boss: true,
         pats: ['walk', 'spiral', 'teleport', 'summon', 'walk', 'teleport', 'spiral', 'teleport'] },
    A: { name: { ru: 'Айдахар', kz: 'Айдаһар', en: 'Aydahar' }, hp: 1150, r: 30, speed: 42, dmg: 19, xp: 120, coin: 70, ai: 'boss', boss: true,
         pats: ['walk', 'breath', 'charge', 'rings', 'walk', 'wolves', 'breath', 'charge'] },
  };

  // Rooms: real places of Astana. Layout legend: '#' small solid prop, 'Y' big solid prop, '~' low prop (blocks walking, not arrows),
  // enemies w s j a m, bosses D J A. Each theme decides what the props look like.
  const ROOM_DEFS = [
    { theme: 'park', place: { ru: 'Набережная Есиля', kz: 'Есіл жағалауы', en: 'Esil Embankment' }, lm: [['baiterek', 2, 0, 1], ['towers', -9, 6, 0.9]], L: [
      '........', '........', '..s..s..', '........', '.#....#.', '........', '..~~~~..', '..~~~~..',
      '........', '.w....w.', '........', '#..YY..#', '........', '........', '........', '........'] },
    { theme: 'park', place: { ru: 'Парк влюблённых', kz: 'Ғашықтар саябағы', en: 'Lovers\' Park' }, lm: [['khanshatyr', 0, 0, 1]], L: [
      '........', '..j..j..', '........', '#.#..#.#', '........', '...ss...', '........', '~~....~~', '~~.Y..~~',
      '........', '.w....w.', '........', '..#..#..', '........', '........', '........', '........', '........'] },
    { theme: 'park', place: { ru: 'Президентский парк', kz: 'Президент саябағы', en: 'Presidential Park' }, lm: [['pyramid', 0, 0, 1], ['baiterek', 12, 8, 0.8]], L: [
      '........', '.w....w.', '........', '..#..#..', '..#..#..', '....j...', '.s....s.', '........', 'Y......Y',
      '........', '..~~~~..', '........', '.j....s.', '........', '#......#', '........', '........', '........'] },
    { theme: 'park', place: { ru: 'Центральный парк', kz: 'Орталық саябақ', en: 'Central Park' }, lm: [['baiterek', -3, 0, 1], ['khanshatyr', 9, 6, 0.8]], L: [
      '........', '...a....', '........', '~~~..~~~', '........', '.j....j.', '........', '..#..#..', '........', '...s.s..',
      '........', '#.Y..Y.#', '........', '.w....w.', '........', '..~..~..', '........', '........', '........', '........'] },
    { theme: 'park', place: { ru: 'Площадь у Байтерека', kz: 'Бәйтерек алаңы', en: 'Baiterek Square' }, lm: [['baiterek', 0, -4, 1.25]], L: [
      '........', '........', '........', '...D....', '........', '........', '#......#', '........',
      '..~..~..', '........', '#......#', '........', '........', '........', '........', '........'] },
    { theme: 'street', place: { ru: 'Проспект Мангилик Ел', kz: 'Мәңгілік Ел даңғылы', en: 'Mangilik El Avenue' }, lm: [['khanshatyr', 0, 0, 1], ['towers', -10, 4, 1]], L: [
      '........', '.m....m.', '........', '..#..#..', '........', 'w..ss..w', '........', '.#....#.', '........',
      '~~....~~', '........', '..j..j..', '........', '#.Y..Y.#', '........', '........', '........', '........'] },
    { theme: 'street', place: { ru: 'Вокзал «Нурлы жол»', kz: '«Нұрлы жол» вокзалы', en: 'Nurly Zhol Station' }, lm: [['station', 0, 0, 1], ['towers', 11, 6, 0.9]], L: [
      '........', '..a..a..', '........', '#.#..#.#', '........', '..j..j..', '........', '~~~..~~~', '........', '..w..w..',
      '........', '.Y....Y.', '........', '.s.ss.s.', '........', '#......#', '........', '........', '........', '........'] },
    { theme: 'street', place: { ru: 'Площадь у Акорды', kz: 'Ақорда алаңы', en: 'Akorda Square' }, lm: [['akorda', 0, 0, 1]], L: [
      '........', 'm......m', '..####..', '........', '.s.ss.s.', '........', '..Y..Y..', '........', '..j..j..', '........',
      '~~....~~', '........', '.w.ww.w.', '........', '#..##..#', '........', '........', '........', '........', '........'] },
    { theme: 'street', place: { ru: 'Мечеть Хазрет Султан', kz: 'Әзірет Сұлтан мешіті', en: 'Hazrat Sultan Mosque' }, lm: [['mosque', 0, 0, 1]], L: [
      '........', '...aa...', '........', '.~~..~~.', '.~~..~~.', '..w..w..', '........', '#..m...#', '........', '.ss..ss.', '........',
      '..#..#..', '........', 'j......j', '........', 'Y......Y', '........', '..a..a..', '........', '........', '........', '........'] },
    { theme: 'street', place: { ru: 'ЭКСПО, «Нұр Әлем»', kz: 'ЭКСПО, «Нұр Әлем»', en: 'EXPO, Nur Alem' }, lm: [['nuralem', 0, -2, 1.1]], L: [
      '........', '........', '...J....', '........', '..#..#..', '........', '........', '..#..#..', '........',
      '~~....~~', '........', '........', '#......#', '........', '........', '........', '........', '........'] },
    { theme: 'office', place: { ru: 'Изумрудный квартал, 24 этаж', kz: 'Изумруд кварталы, 24-қабат', en: 'Emerald Quarter, 24th floor' }, lm: [['towers', 0, 0, 1.2]], L: [
      '........', '.j.mm.j.', '........', '##.##.##', '........', '.w.ww.w.', '........', '##.##.##', '........', '..~~~~..',
      '........', '.s....s.', '........', 'Y.#..#.Y', '........', '........', '........', '........', '........', '........'] },
    { theme: 'office', place: { ru: 'Опенспейс IT-компании', kz: 'IT-компанияның ашық кеңсесі', en: 'IT company open space' }, lm: [['baiterek', 0, 0, 1], ['towers', -10, 2, 0.9]], L: [
      '........', 'a..a..a.', '........', '#.##.##.', '........', 'j......j', '...ss...', '.##..##.', '........', '.m....m.', '........',
      '~~.~~.~~', '........', '.w.ww.w.', '........', '#.#..#.#', '........', '..s..s..', '........', '........', '........', '........'] },
    { theme: 'office', place: { ru: 'Переговорные и серверная', kz: 'Келіссөз бөлмелері мен серверлік', en: 'Meeting rooms & server room' }, lm: [['nuralem', 6, 4, 0.9], ['towers', -7, 0, 1]], L: [
      '........', '..w..w..', '.Y.ww.Y.', '........', 'm.~~~~.m', '........', '..j..j..', '........', 'Y..aa..Y', '........', '##.##.##',
      '........', '.s.ss.s.', '........', '..Y..Y..', '........', 'j......j', '........', '........', '........', '........', '........'] },
    { theme: 'office', place: { ru: 'ТРЦ «Хан Шатыр»', kz: '«Хан Шатыр» СОО', en: 'Khan Shatyr Mall' }, lm: [['khanshatyr', 0, -2, 1.1]], L: [
      '........', '.a.aa.a.', '........', '#.j..j.#', '........', '..Y..Y..', '.s.ss.s.', '........', '..m..m..', '........', '~~....~~',
      '........', '.w.ww.w.', '........', '#.#..#.#', '........', '..j..j..', '........', 'Y......Y', '........', '........', '........'] },
    { theme: 'beach', place: { ru: 'Пляж «Хан Шатыра»', kz: '«Хан Шатыр» жағажайы', en: 'Khan Shatyr Beach' }, lm: [['khanshatyr', 0, -3, 1.2]], L: [
      '........', '........', '...A....', '........', '........', '#......#', '........', '........', '~~....~~', '~~....~~',
      '........', '........', '#.Y..Y.#', '........', '........', '........', '........', '........', '........', '........'] },
  ];
  const MENU_ROOM = ['Y......Y', '..Y.....', '........', '......#.', '........', '........', '........', '........', '........', '........', '........', '........', '........'];

  const THEMES = {
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


