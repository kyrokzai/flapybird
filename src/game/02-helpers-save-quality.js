  // =================================================================== helpers
  // one versioned save object; bump SAVE_VERSION and add a step in upgrade() when the format changes
  const SAVE_KEY = 'batyr01.save', SAVE_VERSION = 1;
  const Save = {
    data: null,
    defaults() { return { v: SAVE_VERSION, coins: 0, best: 0, upAtk: 0, upHp: 0, settings: { lang: 'ru', music: true, sfx: true, quality: 'auto', autoQuality: null } }; },
    load() {
      let d = null;
      try { d = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { d = null; }
      this.data = this.upgrade(d && typeof d === 'object' ? d : this.fromOldKeys());
      this.write();
    },
    fromOldKeys() {   // saves made before version 1 (separate mergen.* keys)
      const d = this.defaults(), g = k => { try { return localStorage.getItem('mergen.' + k); } catch (e) { return null; } };
      for (const k of ['coins', 'best', 'upAtk', 'upHp']) if (g(k) !== null) d[k] = parseInt(g(k), 10) || 0;
      if (g('lang')) d.settings.lang = g('lang');
      if (g('music') !== null) d.settings.music = g('music') === '1';
      if (g('sfx') !== null) d.settings.sfx = g('sfx') === '1';
      if (g('hq') === '0') d.settings.quality = 'medium';
      return d;
    },
    upgrade(d) {
      const out = Object.assign(this.defaults(), d);
      out.settings = Object.assign(this.defaults().settings, d.settings || {});
      // future format changes go here: if (out.v < 2) { ...; }
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

