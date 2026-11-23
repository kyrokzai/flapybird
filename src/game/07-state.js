  // =================================================================== state
  let scene = 'menu';       // menu | play | dead | victory
  let modal = null;         // null | levelup | kydyr | pause
  let time = 0, shake = 0;
  let fade = 0, fadeDir = 0, fadeThen = null;
  let banner = null;
  let introT = 0;
  let hitStop = 0, slowT = 0, hurtFlash = 0, lvlT = 0;
  const INTRO_T = 2.6;   // camera fly-over at the start of every room
  let choices = [];
  let ui = [];
  let bank = Save.data.coins, best = Save.data.best, upAtk = Save.data.upAtk, upHp = Save.data.upHp;
  function saveProgress() { Object.assign(Save.data, { coins: bank, best, upAtk, upHp }); Save.write(); }

  let run = null, player = null;
  let crates = [], thrown = [];
  let obstacles = [], enemies = [], arrows = [], bullets = [], pickups = [], particles = [], texts = [];
  let roomClear = false, gateOpen = 0, clearT = 0, endT = 0;

  const sk = id => (run && run.sk[id]) || 0;
  const baseAtk = () => 10 * (1 + 0.08 * upAtk);
  const atk = () => baseAtk() * (1 + 0.25 * sk('atk'));
  const fireInterval = () => 0.78 / (1 + 0.2 * sk('spd')) / (player && player.weapon && player.weapon.kind === 'w_rapid' ? 1.9 : 1);
  const moveSpeed = () => 140 * (1 + 0.15 * sk('speed'));
  const upCost = lvl => Math.round(40 * Math.pow(lvl + 1, 1.45) / 10) * 10;
  const xpNeed = lvl => 12 + lvl * 8;

  function newRun() {
    const maxHp = Math.round(150 * (1 + 0.1 * upHp));
    run = { room: 1, level: 1, xp: 0, kills: 0, coins: 0, sk: {}, pendingLv: 0, bombs: 1 };
    player = {
      x: W / 2, y: AY2 - 30, r: 11, hp: maxHp, maxHp, inv: 0, face: -Math.PI / 2,
      fireCd: 0.3, volleys: [], atkAnim: 0, moving: false, walk: 0,
      crit: 0.05, critMul: 2, orbitA: 0, orbitHits: new Map(),
      eagle: { x: W / 2, y: AY2 - 60, cd: 1, a: 0 }, shield: 0, weapon: null,
    };
    scene = 'play'; modal = null;
    buildRoom(1);
  }

