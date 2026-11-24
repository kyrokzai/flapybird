  // =================================================================== state
  let scene = 'menu';       // menu | play | dead | victory
  let modal = null;         // null | levelup | kydyr | pause | revive
  let time = 0, shake = 0;
  let fade = 0, fadeDir = 0, fadeThen = null;
  let banner = null;
  let introT = 0;
  let hitStop = 0, slowT = 0, hurtFlash = 0, lvlT = 0;
  const INTRO_T = 2.6;   // camera fly-over at the start of every room
  const REVIVE_COST = 100, REVIVE_TIME = 7;
  let reviveT = 0;
  // balance simulation (test mode only): a bot drives the hero without rendering
  const SIM = { on: false, mv: { x: 0, y: 0 }, skill: 0.6, noRevive: false, next: 0, dmgBy: {} };
  let choices = [];
  let ui = [];
  let bank = Save.data.coins, best = Save.data.best;
  function saveProgress() { Object.assign(Save.data, { coins: bank, best }); Save.write(); }

  let run = null, player = null;
  let crates = [], thrown = [];
  let obstacles = [], enemies = [], arrows = [], bullets = [], pickups = [], particles = [], texts = [];
  let roomClear = false, gateOpen = 0, clearT = 0, endT = 0;

  const sk = id => (run && run.sk[id]) || 0;
  const baseAtk = () => 10 * (1 + (run && run.S ? run.S.atk : 0));
  const atk = () => baseAtk() * (1 + 0.25 * sk('atk'));
  const fireInterval = () => 0.78 / (1 + 0.2 * sk('spd')) / (1 + (run && run.S ? run.S.aspd : 0)) / (player && player.weapon && player.weapon.kind === 'w_rapid' ? 1.9 : 1);
  const moveSpeed = () => 140 * (1 + 0.15 * sk('speed')) * (player && player.chill > 0 ? 0.72 : 1);   // ice elites chill the batyr
  const upCost = lvl => Math.round(40 * Math.pow(lvl + 1, 1.45) / 10) * 10;
  const xpNeed = lvl => 12 + lvl * 8;

  // menu "play": costs energy (free in test mode); without enough energy the menu shows how to get more
  function startGame(mode) {
    // the arena is entered with a ticket, the story with energy
    if (mode === 'survival') {
      if (!arenaUnlocked()) { scene = 'menu'; menuTab = 'fight'; Sound.click(); return; }
      if (!spendTicket()) { scene = 'menu'; menuTab = 'fight'; menuPopup = 'tickets'; Sound.click(); return; }
      newRun(mode); return;
    }
    if (!spendEnergy()) { scene = 'menu'; menuTab = 'fight'; menuPopup = 'energy'; Sound.click(); return; }
    if (COMIC.ready && !Save.data.introSeen && !TEST_MODE) { scene = 'menu'; playComic(() => newRun(mode)); return; }   // the story begins with the comic, once
    newRun(mode);
  }

  function newRun(mode) {
    const S = statsTotal();   // talents + equipped gear
    const maxHp = Math.round(150 * (1 + S.hp));
    run = { room: 1, level: 1, xp: 0, kills: 0, coins: 0, gems: 0, sk: {}, pendingLv: 0, bombs: 1, S, roomDmg: 0, rewards: null, t: 0, bossKills: 0 };
    player = {
      x: W / 2, y: AY2 - 30, r: 11, hp: maxHp, maxHp, inv: 0, face: -Math.PI / 2,
      fireCd: 0.3, volleys: [], atkAnim: 0, moving: false, walk: 0,
      crit: 0.05 + S.crit, critMul: 2 + S.critDmg, armor: Math.min(0.6, S.armor), orbitA: 0, orbitHits: new Map(),
      eagle: { x: W / 2, y: AY2 - 60, cd: 1, a: 0 }, shield: 0, weapon: null,
    };
    scene = 'play'; modal = null;
    run.mode = mode === 'survival' ? 'survival' : 'story';
    if (run.mode === 'survival') survivalSetup(); else buildRoom(1);
    // talent "ancestral skill": start the run with random skills
    for (let i = 0; i < S.startSkill; i++) { const c = rollChoices(); if (c.length) applySkill(c[Math.floor(Math.random() * c.length)]); }
  }

