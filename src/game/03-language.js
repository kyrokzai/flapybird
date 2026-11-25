  // =================================================================== language
  let lang = ['ru', 'kz', 'en'].includes(Save.data.settings.lang) ? Save.data.settings.lang : 'ru';
  const STR = {
    ru: {
      play: 'ИГРАТЬ', room: 'КОМНАТА', boss: 'Босс',
      levelUp: 'НОВЫЙ УРОВЕНЬ!', choose: 'Уровень {n} — выберите навык',
      kydyr: 'КЫДЫР-АТА', kydyrText: 'Старец Кыдыр встречает батыра в степи и предлагает дар',
      heal: 'ЛЕЧЕНИЕ · +40% здоровья', bless: 'БЛАГОСЛОВЕНИЕ · навык', blessGot: 'Благословение',
      pause: 'ПАУЗА', noSkills: 'Навыков пока нет', resume: 'ПРОДОЛЖИТЬ', music: 'Музыка', sfx: 'Звуки',
      on: 'вкл', off: 'выкл', toMenu: 'В МЕНЮ',
      victory: 'ПОБЕДА!', victoryText: 'Степь свободна от чудищ', dead: 'БАТЫР ПАЛ', deadText: 'Попробуйте ещё раз',
      sRoom: 'Комната', sLevel: 'Уровень', sKills: 'Убито врагов', sCoins: 'Монеты', sBest: 'Рекорд', roomWord: 'комната',
      again: 'ЕЩЁ РАЗ', menu: 'В меню',
      upAtk: 'Сила', upAtkD: 'Атака +8%', upHp: 'Здоровье', upHpD: 'Здоровье +10%', lvl: 'ур.', max: 'МАКС',
      clear: 'КОМНАТА ЗАЧИЩЕНА!', clearSub: 'Идите к воротам', blocked: 'Блок!', loading: 'Загрузка…',
      best: 'Рекорд: комната {n} / 20', hint: 'Двигайтесь пальцем · стойте, чтобы стрелять',
      graphics: 'Графика', qauto: 'Авто', qlow: 'Низкая', qmedium: 'Средняя', qhigh: 'Высокая',
      revive: 'ВОСКРЕСНУТЬ?', reviveText: 'Батыр ещё может подняться!', reviveBtn: 'ВОСКРЕСНУТЬ · {n} ₸', reviveNeed: 'Нужно {n} ₸', reviveNo: 'Отказаться',
    },
    kz: {
      play: 'ОЙНАУ', room: 'БӨЛМЕ', boss: 'Босс',
      levelUp: 'ДЕҢГЕЙ ЖОҒАРЫЛАДЫ!', choose: '{n}-деңгей — дағдыны таңдаңыз',
      kydyr: 'ҚЫДЫР АТА', kydyrText: 'Қыдыр ата батырды далада кездестіріп, сый ұсынады',
      heal: 'САУЫҒУ · +40% денсаулық', bless: 'БАТА · кездейсоқ дағды', blessGot: 'Бата',
      pause: 'ҮЗІЛІС', noSkills: 'Әзірге дағды жоқ', resume: 'ЖАЛҒАСТЫРУ', music: 'Музыка', sfx: 'Дыбыстар',
      on: 'қосулы', off: 'өшірулі', toMenu: 'МӘЗІРГЕ',
      victory: 'ЖЕҢІС!', victoryText: 'Дала құбыжықтардан тазарды', dead: 'БАТЫР ҚҰЛАДЫ', deadText: 'Тағы байқап көріңіз',
      sRoom: 'Бөлме', sLevel: 'Деңгей', sKills: 'Жеңілген жау', sCoins: 'Тиын', sBest: 'Рекорд', roomWord: 'бөлме',
      again: 'ТАҒЫ ДА', menu: 'Мәзір',
      upAtk: 'Күш', upAtkD: 'Шабуыл +8%', upHp: 'Денсаулық', upHpD: 'Денсаулық +10%', lvl: 'дең.', max: 'МАКС',
      clear: 'БӨЛМЕ ТАЗАРТЫЛДЫ!', clearSub: 'Қақпаға барыңыз', blocked: 'Қорғалды!', loading: 'Жүктелуде…',
      best: 'Рекорд: {n}-бөлме / 20', hint: 'Саусақпен жүріңіз · тоқтасаңыз, атасыз',
      graphics: 'Графика', qauto: 'Авто', qlow: 'Төмен', qmedium: 'Орта', qhigh: 'Жоғары',
      revive: 'ҚАЙТА ТҰРУ?', reviveText: 'Батыр әлі де тұра алады!', reviveBtn: 'ҚАЙТА ТҰРУ · {n} ₸', reviveNeed: '{n} ₸ керек', reviveNo: 'Бас тарту',
    },
    en: {
      play: 'PLAY', room: 'ROOM', boss: 'Boss',
      levelUp: 'LEVEL UP!', choose: 'Level {n} — choose a skill',
      kydyr: 'KYDYR ATA', kydyrText: 'The elder Kydyr meets the batyr on the steppe and offers a gift',
      heal: 'HEALING · +40% health', bless: 'BLESSING · random skill', blessGot: 'Blessing',
      pause: 'PAUSE', noSkills: 'No skills yet', resume: 'RESUME', music: 'Music', sfx: 'Sounds',
      on: 'on', off: 'off', toMenu: 'MAIN MENU',
      victory: 'VICTORY!', victoryText: 'The steppe is free of monsters', dead: 'THE BATYR HAS FALLEN', deadText: 'Try again',
      sRoom: 'Room', sLevel: 'Level', sKills: 'Enemies defeated', sCoins: 'Coins', sBest: 'Best', roomWord: 'room',
      again: 'PLAY AGAIN', menu: 'Menu',
      upAtk: 'Might', upAtkD: 'Attack +8%', upHp: 'Health', upHpD: 'Health +10%', lvl: 'lv.', max: 'MAX',
      clear: 'ROOM CLEARED!', clearSub: 'Head to the gate', blocked: 'Blocked!', loading: 'Loading…',
      best: 'Best: room {n} / 20', hint: 'Drag to move · stand still to shoot',
      graphics: 'Graphics', qauto: 'Auto', qlow: 'Low', qmedium: 'Medium', qhigh: 'High',
      revive: 'REVIVE?', reviveText: 'The batyr can still rise!', reviveBtn: 'REVIVE · {n} ₸', reviveNeed: 'Need {n} ₸', reviveNo: 'No thanks',
    },
  };
  const tr = (k, n) => { const s = STR[lang][k] || STR.ru[k] || k; return n === undefined ? s : s.replace('{n}', n); };
  function setLang(l) { lang = l; Save.data.settings.lang = l; Save.write(); document.documentElement.lang = l === 'kz' ? 'kk' : l; document.title = 'QARATUN'; }
  setLang(lang);

