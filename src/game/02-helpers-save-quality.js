  // =================================================================== helpers
  // one versioned save object; bump SAVE_VERSION and add a step in upgrade() when the format changes
  const SAVE_KEY = 'batyr01.save', SAVE_VERSION = 7;
  const Save = {
    data: null,
    defaults() {
      return {
        v: SAVE_VERSION, coins: 0, gems: 0, best: 0, bestWave: 0, tut: false,
        talents: { atk: 0, hp: 0, armor: 0, magnet: 0, regen: 0, loot: 0, start: 0 },
        // starter gear: a common bow and chapan, already equipped
        gear: { items: [{ id: 1, b: 'bow', r: 0, l: 1 }, { id: 2, b: 'shapan', r: 0, l: 1 }], eq: { weapon: 1, armor: 2 }, next: 3 },
        energy: { val: 20, t: Date.now() },
        daily: { day: 0, last: '' },
        quests: { date: '', list: [], bonus: false },
        settings: { lang: 'ru', music: true, sfx: true, quality: 'auto', autoQuality: null },
        profile: { name: '', avatar: 0, frame: 'gold' },
        stats: { runs: 0, wins: 0, kills: 0, bosses: 0, rooms: 0, coins: 0, time: 0, arenaRuns: 0, wolves: 0, elites: 0, arenaWins: 0, noRevWins: 0, maxLevel: 0, merges: 0, legend: 0 },
        ach: {}, frames: ['gold'], pass: { season: 1, start: 0, claimed: [] }, introSeen: false,
        glory: 0,
        tickets: { n: 1, day: '' },
        runSnap: null,   // the story run as it was at the start of its current room (resumed after the page reloads)
      };
    },
    load() {
      let d = null;
      try { d = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { d = null; }
      this.data = this.upgrade(d && typeof d === 'object' ? d : this.fromOldKeys());
      this.write();
    },
    fromOldKeys() {   // saves made before version 1 (separate mergen.* keys)
      const d = this.defaults(); d.v = 0;
      const g = k => { try { return localStorage.getItem('mergen.' + k); } catch (e) { return null; } };
      for (const k of ['coins', 'best', 'upAtk', 'upHp']) if (g(k) !== null) d[k] = parseInt(g(k), 10) || 0;
      if (g('lang')) d.settings.lang = g('lang');
      if (g('music') !== null) d.settings.music = g('music') === '1';
      if (g('sfx') !== null) d.settings.sfx = g('sfx') === '1';
      if (g('hq') === '0') d.settings.quality = 'medium';
      return d;
    },
    upgrade(d) {
      const def = this.defaults(), out = Object.assign(def, d);
      for (const k of ['settings', 'talents', 'energy', 'daily', 'quests', 'profile', 'stats', 'tickets', 'pass', 'ach']) out[k] = Object.assign(this.defaults()[k], d[k] || {});
      if (!d.gear || !Array.isArray(d.gear.items)) out.gear = this.defaults().gear;
      // v1 → v2: the two shop upgrades become talents (old +8% / +10% steps = two new talent levels each)
      if ((d.v || 0) < 2) {
        out.talents.atk = Math.min(20, (d.upAtk || 0) * 2);
        out.talents.hp = Math.min(20, (d.upHp || 0) * 2);
        delete out.upAtk; delete out.upHp;
      }
      // v2 → v3: first-run tutorial flag; players who already reached a room skip it
      if ((d.v || 0) < 3) out.tut = (d.best || 0) > 0;
      // v3 → v4: survival arena record
      if ((d.v || 0) < 4) out.bestWave = d.bestWave || 0;
      // v4 → v5: profile, lifetime stats, glory (estimated from the records so far), arena tickets
      // v5 → v6: achievements, frames, season pass (counts glory from now on), comic intro flag
      if ((d.v || 0) < 6) { out.pass.start = out.glory || 0; if (!Array.isArray(out.frames)) out.frames = ['gold']; if (out.gear.items.some(i => i.r >= 3)) out.stats.legend = 1; }
      if ((d.v || 0) < 5) { out.glory = (d.best || 0) * 25 + (out.bestWave || 0) * 18; out.stats.rooms = Math.max(0, (d.best || 1) - 1); }
      // v6 → v7: a snapshot of the unfinished story run
      if ((d.v || 0) < 7) out.runSnap = null;
      out.v = SAVE_VERSION;
      return out;
    },
    write() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch (e) { /* private mode: progress lives for this session only */ } },
  };
  Save.load();

  // graphics quality: auto picks by device and drops a step if the frame rate stays low
  const QUALITY = {
    low: { post: false, shadows: false, pr: 1, grass: 0.35, fx: 0.5 },
    medium: { post: false, shadows: true, pr: 1.5, grass: 0.7, fx: 0.8 },
    high: { post: true, shadows: true, pr: 2, grass: 1, fx: 1 },
  };
  const Q_ORDER = ['auto', 'low', 'medium', 'high'];
  function guessQuality() {
    const mob = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const mem = navigator.deviceMemory || 8, cores = navigator.hardwareConcurrency || 8;
    if (mem <= 2 || cores <= 2) return 'low';
    if (mob) return mem <= 4 || cores <= 4 ? 'low' : 'medium';
    return cores <= 4 ? 'medium' : 'high';
  }
  const effectiveQuality = () => { const p = Save.data.settings.quality; return p === 'auto' ? (Save.data.settings.autoQuality || guessQuality()) : (QUALITY[p] ? p : 'medium'); };
  let QL = effectiveQuality(), Q = QUALITY[QL];
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const angTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
  const TAU = Math.PI * 2;

