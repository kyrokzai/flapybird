  // =================================================================== audio
  const Sound = {
    ac: null, noise: null, master: null, musicGain: null, sfxGain: null,
    music: Save.data.settings.music, sfx: Save.data.settings.sfx,
    plucks: {}, nextNote: 0, step: 0, timer: null, lastPick: 0,
    samples: {}, tracks: {}, packs: [], lastPlay: {}, cur: null,
    init() {
      if (!this.ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try { this.ac = new AC(); } catch (e) { return; }
        const ac = this.ac;
        this.master = ac.createGain(); this.master.gain.value = 0.9; this.master.connect(ac.destination);
        this.sfxGain = ac.createGain(); this.sfxGain.gain.value = this.sfx ? 1 : 0; this.sfxGain.connect(this.master);
        this.ambGain = ac.createGain(); this.ambGain.gain.value = this.sfx ? 1 : 0; this.ambGain.connect(this.master);
        this.musicGain = ac.createGain(); this.musicGain.gain.value = this.music ? 0.32 : 0; this.musicGain.connect(this.master);
        const len = Math.floor(ac.sampleRate * 0.5);
        const buf = ac.createBuffer(1, len, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        this.noise = buf;
        for (const f of NOTE_FREQ) this.plucks[f] = this.karplus(f, 1.1);
        this.nextNote = ac.currentTime + 0.1;
        this.timer = setInterval(() => this.schedule(), 50);
        if (this.ambWant) { const k = this.ambWant; this.ambWant = null; this.setAmbience(k); }
        for (const p of this.packs) this.decodePack(p);
        this.initStream();
      }
      if (this.ac.state === 'suspended') this.ac.resume();
      // every tap retries a stalled track (iOS lets a media element start only inside a gesture)
      if (this.el && this.cur && this.cur.url && this.music && this.el.paused && !document.hidden) this.el.play().catch(() => {});
    },
    // dombra-like plucked string (Karplus–Strong)
    karplus(freq, dur) {
      const ac = this.ac, sr = ac.sampleRate, n = Math.floor(sr * dur);
      const p = Math.max(2, Math.round(sr / freq));
      const ring = new Float32Array(p);
      for (let i = 0; i < p; i++) ring[i] = Math.random() * 2 - 1;
      const buf = ac.createBuffer(1, n, sr), out = buf.getChannelData(0);
      let idx = 0;
      for (let i = 0; i < n; i++) {
        const a = ring[idx], b = ring[(idx + 1) % p];
        ring[idx] = (a + b) * 0.5 * 0.994;
        out[i] = a * (i < 40 ? i / 40 : 1);
        idx = (idx + 1) % p;
      }
      return buf;
    },
    pluck(freq, t, vol) {
      const ac = this.ac;
      const s = ac.createBufferSource(); s.buffer = this.plucks[freq];
      const g = ac.createGain(); g.gain.value = vol;
      s.connect(g); g.connect(this.musicGain);
      s.start(t);
    },
    // ---- recorded sounds and music (assets/sfx.js, assets/music_*.js); the synth stays as the fallback
    addPack(name) {
      const data = name === 'sfx' ? window.SFX_PACK : window['MUSIC_' + name.slice(6).toUpperCase()];
      if (!data) return;
      if (name === 'sfx') window.SFX_PACK = null; else window['MUSIC_' + name.slice(6).toUpperCase()] = null;
      if (name !== 'sfx') {
        // music stays compressed (an mp3 blob played by a media element): decoded PCM of the three themes took ~80 MB
        try {
          const bin = Uint8Array.from(atob(data), c => c.charCodeAt(0));
          this.tracks[name.slice(6)] = URL.createObjectURL(new Blob([bin], { type: 'audio/mpeg' }));
        } catch (e) { /* no blob support: keep the synth */ }
        return;
      }
      const p = { name, data }; this.packs.push(p);
      if (this.ac) this.decodePack(p);
    },
    decodePack(p) {
      if (p.done) return; p.done = true;
      const dec = (b64, fn) => {
        try {
          const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
          const pr = this.ac.decodeAudioData(bin, fn, () => {});
          if (pr && pr.catch) pr.catch(() => {});
        } catch (e) { /* undecodable: keep the synth */ }
      };
      for (const k in p.data) dec(p.data[k], buf => { this.samples[k] = buf; });
      p.data = null;
    },
    // one <audio> element streams the current theme through the music gain (fades stay in Web Audio)
    initStream() {
      try {
        const el = new Audio(); el.loop = true; el.preload = 'auto'; el.setAttribute('playsinline', '');
        this.elGain = this.ac.createGain(); this.elGain.gain.value = 0.0001;
        try { this.ac.createMediaElementSource(el).connect(this.elGain); this.elGain.connect(this.musicGain); this.elWA = true; } catch (e) { this.elWA = false; }
        this.el = el;
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) el.pause();
          else if (this.cur && this.cur.url && this.music) el.play().catch(() => {});
        });
      } catch (e) { this.el = null; }
    },
    fadeEl(to, sec) {
      if (this.elWA) { const g = this.elGain.gain, t = this.ac.currentTime; g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.linearRampToValueAtTime(Math.max(0.0001, to), t + sec); }
      else this.el.volume = clamp(to / 1.7 * (this.music ? 0.32 : 0), 0, 1);
    },
    // play a recorded effect; false when it is not loaded yet (the caller then uses the synth)
    play(name, vol, gap) {
      if (!this.ok() || !this.samples[name]) return false;
      const now = this.ac.currentTime;
      if (gap && now - (this.lastPlay[name] || 0) < gap) return true;
      this.lastPlay[name] = now;
      const s = this.ac.createBufferSource(); s.buffer = this.samples[name];
      s.playbackRate.value = 0.94 + Math.random() * 0.12;
      const g = this.ac.createGain(); g.gain.value = vol;
      s.connect(g); g.connect(this.sfxGain); s.start();
      return true;
    },
    // recorded music for the current mode: fade out, swap the source, fade in; false = no track, use the synth
    musicTrack() {
      const want = this.mode || 'menu', url = this.tracks[want];
      if (!url || !this.el) { if (this.cur) this.stopTrack(); return false; }
      if (!this.cur || this.cur.name !== want) {
        const playing = this.cur && !this.el.paused;
        this.cur = { name: want };
        this.fadeEl(0.0001, playing ? 0.6 : 0.01);
        clearTimeout(this.swapT);
        this.swapT = setTimeout(() => {
          if (!this.cur || this.cur.name !== want) return;
          this.cur.url = url; this.el.src = url;
          if (this.music && !document.hidden) this.el.play().catch(() => {});
          this.fadeEl(1.7, 1.5);
        }, playing ? 650 : 0);
      }
      return true;
    },
    stopTrack() {
      if (!this.cur) return;
      this.cur = null; clearTimeout(this.swapT);
      if (!this.el) return;
      this.fadeEl(0.0001, 1.2);
      this.swapT = setTimeout(() => { if (!this.cur) this.el.pause(); }, 1300);
    },
    schedule() {
      this.ambEvents();
      if (this.ac && this.musicTrack()) { this.nextNote = this.ac.currentTime + 0.1; return; }
      if (!this.ac || !this.music) { if (this.ac) this.nextNote = this.ac.currentTime + 0.1; return; }
      // three themes: calm dombra in the menu, faster dombra with a dauylpaz drum in battle, minor kobyz drone and heavy drums for bosses
      const mode = this.mode || 'menu', mel = mode === 'boss' ? MELODY_BOSS : mode === 'battle' ? MELODY_BATTLE : MELODY;
      const EIGHTH = mode === 'boss' ? 0.118 : mode === 'battle' ? 0.132 : 0.165;
      while (this.nextNote < this.ac.currentTime + 0.25) {
        const i = this.step % mel.length;
        const t = this.nextNote;
        const m = mel[i];
        const down = i % 3 === 0;
        this.pluck(NOTE_FREQ[0], t, down ? 0.16 : 0.09);           // open low string (drone)
        if (m >= 0) this.pluck(NOTE_FREQ[m], t + 0.012, down ? 0.26 : 0.18);
        else this.pluck(NOTE_FREQ[3], t + 0.012, 0.08);
        if (mode !== 'menu') {
          const beat = i % 6;
          if (beat === 0 || (mode === 'boss' && beat === 3)) this.drum(t, mode === 'boss' ? 0.5 : 0.34, 120);
          else if (beat === 4) this.drum(t, 0.16, 190);
          if (mode === 'boss' && i % 12 === 0) this.bow(NOTE_FREQ[m >= 0 ? m % 5 : 0] / 2, t, EIGHTH * 12);
        }
        this.nextNote += EIGHTH;
        this.step++;
      }
    },
    setMode(m) { if (m !== this.mode) { this.mode = m; this.step = 0; } },
    // dauylpaz-like frame drum: pitched thump plus a short skin noise
    drum(t, vol, f) {
      const ac = this.ac, o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.38, t + 0.16);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g); g.connect(this.musicGain); o.start(t); o.stop(t + 0.25);
      const n = ac.createBufferSource(); n.buffer = this.noise;
      const bf = ac.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = 900; bf.Q.value = 0.8;
      const ng = ac.createGain(); ng.gain.setValueAtTime(vol * 0.35, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      n.connect(bf); bf.connect(ng); ng.connect(this.musicGain); n.start(t); n.stop(t + 0.08);
    },
    // kobyz-like bowed drone: two detuned saws through a moving low-pass
    bow(f, t, dur) {
      const ac = this.ac, g = ac.createGain(), lp = ac.createBiquadFilter();
      lp.type = 'lowpass'; lp.Q.value = 4; lp.frequency.setValueAtTime(400, t); lp.frequency.linearRampToValueAtTime(1100, t + dur * 0.5); lp.frequency.linearRampToValueAtTime(500, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06, t + 0.25); g.gain.setValueAtTime(0.06, t + dur - 0.3); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      for (const d of [-4, 5]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; o.connect(lp); o.start(t); o.stop(t + dur + 0.05); }
      lp.connect(g); g.connect(this.musicGain);
    },
    setMusic(on) {
      this.music = on; Save.data.settings.music = on; Save.write(); if (this.musicGain) this.musicGain.gain.value = on ? 0.32 : 0;
      if (this.el && this.cur && this.cur.url) { if (on) { this.el.play().catch(() => {}); if (!this.elWA) this.fadeEl(1.7, 0); } else this.el.pause(); }
    },
    setSfx(on) { this.sfx = on; Save.data.settings.sfx = on; Save.write(); if (this.sfxGain) this.sfxGain.gain.value = on ? 1 : 0; if (this.ambGain) this.ambGain.gain.value = on ? 1 : 0; },
    ok() { return this.ac && this.sfx; },
    tone(type, f0, f1, t0, dur, vol) {
      const ac = this.ac, t = ac.currentTime + t0;
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      o.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t + dur + 0.03);
    },
    hiss(f0, f1, t0, dur, vol, type) {
      const ac = this.ac, t = ac.currentTime + t0;
      const s = ac.createBufferSource(); s.buffer = this.noise;
      const f = ac.createBiquadFilter(); f.type = type || 'bandpass'; f.Q.value = 1;
      f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      s.connect(f); f.connect(g); g.connect(this.sfxGain); s.start(t); s.stop(t + dur + 0.03);
    },
    shoot() { if (this.play('shoot', 0.32, 0.06)) return; if (this.ok()) { this.tone('triangle', 520, 240, 0, 0.08, 0.07); this.hiss(3000, 900, 0, 0.08, 0.12); } },
    hit() { if (this.play('hit', 0.3, 0.05)) return; if (this.ok()) this.tone('square', 260, 130, 0, 0.05, 0.035); },
    kill() { if (this.play('kill', 0.45, 0.05)) return; if (this.ok()) { this.hiss(900, 200, 0, 0.18, 0.25); this.tone('triangle', 330, 90, 0, 0.16, 0.12); } },
    hurt() { buzz(35); if (this.play('hurt', 0.65, 0.15)) return; if (this.ok()) { this.tone('square', 170, 55, 0, 0.22, 0.16); this.hiss(600, 150, 0, 0.2, 0.25, 'lowpass'); } },
    pick(kind) {
      if (kind === 'coin' && this.play('coin', 0.28, 0.06)) return;
      if (!this.ok()) return;
      const now = this.ac.currentTime; if (now - this.lastPick < 0.045) return; this.lastPick = now;
      this.tone('sine', 1250 + Math.random() * 300, 1600, 0, 0.06, 0.04);
    },
    level() { buzz(20); if (this.play('level', 0.55, 0.2)) return; if (this.ok()) [587, 740, 880, 1175].forEach((f, i) => this.tone('triangle', f, f, i * 0.08, 0.22, 0.09)); },
    crate() { buzz(15); if (this.play('crate', 0.6)) return; if (this.ok()) { this.hiss(1800, 300, 0, 0.18, 0.4, 'bandpass'); this.tone('square', 180, 90, 0, 0.12, 0.06); } },
    shield() { if (this.play('shield', 0.5)) return; if (this.ok()) { this.tone('sine', 900, 1400, 0, 0.18, 0.08); this.tone('triangle', 600, 900, 0, 0.25, 0.05); } },
    clear() { if (this.ok()) [523, 659, 784, 1047].forEach((f, i) => { this.tone('triangle', f, f, i * 0.09, 0.35, 0.08); this.tone('sine', f * 2, f * 2, i * 0.09, 0.2, 0.02); }); },
    // looping background ambience per location + occasional events (birds, horns, keyboards, gulls, wind)
    setAmbience(kind) {
      this.ambWant = kind;
      if (!this.ac || (this.amb && this.amb.kind === kind)) return;
      const ac = this.ac;
      if (this.amb) {
        const old = this.amb; old.gain.gain.setTargetAtTime(0, ac.currentTime, 0.4);
        setTimeout(() => old.nodes.forEach(n => { try { if (n.stop) n.stop(); n.disconnect(); } catch (e) { /* already stopped */ } }), 2000);
      }
      this.amb = null;
      if (!kind) return;
      const gain = ac.createGain(); gain.gain.value = 0; gain.connect(this.ambGain); gain.gain.setTargetAtTime(1, ac.currentTime, 0.8);
      const nodes = [];
      const bed = (type, freq, q, vol, lfoHz, lfoDepth) => {
        const s = ac.createBufferSource(); s.buffer = this.noise; s.loop = true;
        const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
        const g = ac.createGain(); g.gain.value = vol;
        s.connect(f); f.connect(g); g.connect(gain); s.start(); nodes.push(s, f, g);
        if (lfoHz) { const o = ac.createOscillator(); o.frequency.value = lfoHz; const og = ac.createGain(); og.gain.value = lfoDepth; o.connect(og); og.connect(g.gain); o.start(); nodes.push(o, og); }
      };
      if (kind === 'park') bed('highpass', 3000, 0.5, 0.012, 0.15, 0.006);
      else if (kind === 'street') { bed('lowpass', 320, 0.7, 0.07, 0.09, 0.025); bed('bandpass', 1200, 0.6, 0.008); }
      else if (kind === 'office') { const o = ac.createOscillator(); o.frequency.value = 110; const g = ac.createGain(); g.gain.value = 0.005; o.connect(g); g.connect(gain); o.start(); nodes.push(o, g); bed('lowpass', 500, 0.5, 0.015); }
      else if (kind === 'beach') bed('lowpass', 700, 0.6, 0.05, 0.11, 0.04);
      else bed('bandpass', 500, 0.8, 0.03, 0.07, 0.02);
      nodes.push(gain);
      this.amb = { kind, gain, nodes };
      this.ambNext = ac.currentTime + 1;
    },
    ambEvents() {
      if (!this.ac || !this.amb || !this.sfx) return;
      const ac = this.ac, now = ac.currentTime;
      if (now < this.ambNext) return;
      const out = this.amb.gain;
      const tone = (type, f0, f1, t0, dur, vol) => {
        const t = now + t0, o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
        g.gain.setValueAtTime(0.0008, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.2); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.02);
      };
      const tick = t0 => {
        const t = now + t0, s = ac.createBufferSource(); s.buffer = this.noise;
        const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2500;
        const g = ac.createGain(); g.gain.setValueAtTime(0.03, t); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.025);
        s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * 0.4); s.stop(t + 0.03);
      };
      switch (this.amb.kind) {
        case 'park': { const n = 2 + Math.floor(Math.random() * 3), b = 2400 + Math.random() * 1200; for (let i = 0; i < n; i++) tone('sine', b, b * 1.35, i * 0.11, 0.08, 0.025); this.ambNext = now + 1.2 + Math.random() * 2.8; break; }
        case 'street': { if (Math.random() < 0.5) { tone('square', 415, 410, 0, 0.2, 0.012); tone('square', 520, 515, 0, 0.2, 0.01); } this.ambNext = now + 5 + Math.random() * 8; break; }
        case 'office': { const n = 4 + Math.floor(Math.random() * 8); for (let i = 0; i < n; i++) tick(i * 0.09 + Math.random() * 0.04); this.ambNext = now + 1.5 + Math.random() * 3; break; }
        case 'beach': { tone('sawtooth', 1400, 900, 0, 0.35, 0.008); tone('sawtooth', 1300, 850, 0.4, 0.3, 0.006); this.ambNext = now + 5 + Math.random() * 6; break; }
        default: { tone('sine', 2300, 1500, 0, 0.9, 0.012); this.ambNext = now + 8 + Math.random() * 6; }
      }
    },
    gate() { if (this.play('gate', 0.55)) return; if (this.ok()) { this.tone('triangle', 392, 784, 0, 0.5, 0.08); this.hiss(400, 2400, 0, 0.5, 0.08); } },
    roar() { if (this.play('roar', 0.75, 0.5)) return; if (this.ok()) { this.tone('sawtooth', 130, 55, 0, 0.8, 0.13); this.hiss(500, 120, 0, 0.8, 0.3, 'lowpass'); } },
    boom() { if (this.play('boom', 0.7, 0.08)) return; if (this.ok()) { this.tone('sine', 90, 35, 0, 0.35, 0.3); this.hiss(500, 80, 0, 0.35, 0.35, 'lowpass'); } },
    chest() { buzz(45); if (!this.play('chest', 0.7)) this.level(); },
    wolf() { this.play('wolf', 0.32, 2.5); },
    click() { if (this.ok()) this.tone('triangle', 660, 880, 0, 0.06, 0.06); },
    magic() { if (this.ok()) this.tone('sine', 900, 400, 0, 0.18, 0.05); },
  };
  // D Dorian, dombra range. Index 0 = open low string.
  const NOTE_FREQ = [146.83, 164.81, 174.61, 196.0, 220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0];
  const MELODY = [
    7, 7, 9, 8, 7, 6, 7, 4, 4, 6, 5, 4,
    4, 4, 6, 7, 6, 4, 5, 4, 3, 4, -1, 4,
    9, 9, 10, 11, 10, 9, 8, 9, 7, 6, 7, 7,
    4, 6, 7, 5, 4, 3, 2, 3, 1, 0, -1, 0,
  ];
  // battle: driving galloping figure (kүй style), D Dorian
  const MELODY_BATTLE = [
    7, 4, 7, 8, 7, 4, 9, 7, 9, 10, 9, 7,
    8, 7, 6, 7, 4, 7, 6, 4, 3, 4, 3, 1,
    7, 4, 7, 8, 7, 4, 10, 9, 10, 11, 10, 9,
    8, 7, 8, 9, 7, 6, 4, 6, 3, 4, -1, 4,
  ];
  // boss: low, insistent, leaning on the minor sixth
  const MELODY_BOSS = [
    4, 4, 2, 4, 6, 4, 2, 1, 2, 4, -1, 4,
    4, 4, 2, 4, 7, 6, 4, 2, 4, 1, 0, -1,
    9, 7, 6, 7, 9, 7, 6, 4, 6, 7, 6, 4,
    4, 2, 1, 2, 4, 2, 1, 0, 1, 0, -1, 0,
  ];

