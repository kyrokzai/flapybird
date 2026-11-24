  // =================================================================== loop
  let last = performance.now(), acc = 0;
  const perf = { t: 0, frames: 0, checks: 0, done: false };
  function watchPerf(rdt) {
    if (perf.done || Save.data.settings.quality !== 'auto' || document.hidden) return;
    const busy = (G3.loadDone || 0) < (G3.loadTotal || 1) && scene === 'menu';   // model parsing stutters: do not judge yet
    if (busy || rdt >= 100) return;
    perf.t += rdt; perf.frames++;
    if (perf.t < 4000) return;
    const fps = perf.frames * 1000 / perf.t;
    perf.t = 0; perf.frames = 0; perf.checks++;
    if (fps < 32 && QL !== 'low') {
      const lower = QL === 'high' ? 'medium' : 'low';
      Save.data.settings.autoQuality = lower; Save.write(); applyQuality(lower);
    } else if (perf.checks >= 4) perf.done = true;
  }
  function frame(now) {
    const rdt = Math.min(now - last, 100); last = now;
    if (hitStop > 0) hitStop -= rdt / 1000;
    else { if (slowT > 0) slowT -= rdt / 1000; acc += rdt * (slowT > 0 ? 0.3 : 1); }
    while (acc >= DT * 1000) { update(DT); acc -= DT * 1000; }
    render();
    watchPerf(rdt);
    requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => { last = performance.now(); acc = 0; });
  if (document.fonts && document.fonts.load) for (const f of [`800 20px "Montserrat"`, `600 20px "Montserrat"`, `700 20px "Cormorant SC"`, `900 20px "Cinzel"`]) document.fonts.load(f, "БҚӘ01").catch(() => {});
  // installable app (PWA): offline cache + our own "install" button (Chrome's prompt is kept for it)
  let installPrompt = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; });
  window.addEventListener('appinstalled', () => { installPrompt = null; });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !TEST_MODE) { try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) { /* sandboxed frame */ } }
  if (typeof THREE === 'undefined' || !initGL()) { document.getElementById('nogl').style.display = 'flex'; return; }
  // load one model after another, most needed first
  const LOAD_ORDER = ['batyr', 'batyr_rig', 'horse', 'yurt', 'balbal', 'lm_baiterek', 'prop_tree', 'prop_fountain', 'prop_bench', 'lm_towers', 'wolf', 'tarantula', 'lm_khanshatyr', 'zheztyrnak', 'albasty',
    'mystan', 'dau', 'prop_car', 'prop_busstop', 'lm_station', 'lm_akorda', 'lm_mosque', 'lm_nuralem', 'eagle', 'kydyr', 'zhalmauyz', 'aydahar', 'prop_desk', 'prop_server', 'prop_palm', 'prop_umbrella'];
  // menu essentials first (sky, batyr, horse, yurt), then the other panoramas, then everything else
  const LOAD_ALL = [['sky', 'menu'], ['m', 'batyr'], ['m', 'horse'], ['m', 'yurt'], ['m', 'batyr_rig'], ['i', 'icons'], ['c', 'comic'], ['a', 'music_menu'], ['a', 'sfx'],
    ['sky', 'park'], ['a', 'music_battle'], ['a', 'music_boss'], ['sky', 'street'], ['sky', 'office'], ['sky', 'beach'], ...LOAD_ORDER.filter(n => !['batyr', 'batyr_rig', 'horse', 'yurt'].includes(n)).map(n => ['m', n])];
  G3.loadTotal = LOAD_ALL.length; G3.loadDone = 0;
  (function next(i) {
    if (i >= LOAD_ALL.length) return;
    const [k, n] = LOAD_ALL[i], go = () => { G3.loadDone = i + 1; next(i + 1); };
    if (k === 'sky') loadSky(n, go); else if (k === 'a') loadAudio(n, go); else if (k === 'i') loadIcons(go); else if (k === 'c') loadComic(go); else loadModel(n, go);
  })(0);
  function loadAudio(name, done) {
    const sc = document.createElement('script'); sc.src = 'assets/' + name + '.js';
    sc.onload = () => { Sound.addPack(name); done(); }; sc.onerror = () => done();
    document.head.appendChild(sc);
  }
  requestAnimationFrame(frame);

  // hooks for automated tests (room jumping only in #test mode)
  window.Mergen = {
    sim(o) { return TEST_MODE ? simBatch(o || {}) : null; },
    dieNow() { if (TEST_MODE && scene === 'play') { bank = Math.max(bank, REVIVE_COST); player.hp = 0; modal = 'revive'; reviveT = REVIVE_TIME; } },
    give(item) { if (TEST_MODE && player) dropBonus(player.x, player.y - 60, item); },
    get crates() { return crates.filter(c => !c.open).length; }, get elites() { return enemies.filter(e => e.elite).map(e => e.elite); }, get crateList() { return crates.filter(c => !c.open).map(c => ({ x: c.x, y: c.y })); },
    survival() { if (TEST_MODE) newRun('survival'); }, get wave() { return run && run.wave; }, arenaTime(s) { if (TEST_MODE && run) run.timeLeft = s; },
    tp(x, y) { if (TEST_MODE && player) { player.x = x; player.y = y; } }, get bombs() { return run && run.bombs; },
    goto(n) { if (!TEST_MODE) return; if (scene !== 'play') newRun(); run.room = n; buildRoom(n); },
    comic() { if (TEST_MODE) playComic(null); }, toast(t) { toasts.push({ text: t, t: 0 }); },
    tab(t, pop) { if (TEST_MODE) { scene = 'menu'; menuTab = t; menuPopup = pop || null; if (pop === 'item') selItem = gearItems()[0]; } },
    end(won) { if (TEST_MODE && scene === 'play') endRun(!!won); },
    get save() { return TEST_MODE ? Save.data : null; }, get music() { return Sound.mode; }, get prof() { return G3.prof; }, get audio() { return { samples: Object.keys(Sound.samples).length, tracks: Object.keys(Sound.tracks), playing: Sound.cur && Sound.cur.name }; }, get tut() { return Object.assign({ active: tutActive(), intro: introT }, tut); },
    get scene() { return scene; }, get modal() { return modal; },
    get room() { return run && run.room; }, get level() { return run && run.level; },
    get enemies() { return enemies.length; }, get roomClear() { return roomClear; }, get gateOpen() { return gateOpen; },
    get player() { return player && { x: player.x, y: player.y, hp: player.hp, maxHp: player.maxHp }; },
    proj(x, h, y) { return proj(x, h, y); },
    get skills() { return run && Object.assign({}, run.sk); },
    get threats() {
      return {
        bullets: bullets.map(b => ({ x: b.x, y: b.y, vx: b.vx, vy: b.vy })),
        enemies: enemies.filter(e => e.spawn <= 0).map(e => ({ x: e.x, y: e.y, r: e.r, boss: e.boss })),
      };
    },
  };
