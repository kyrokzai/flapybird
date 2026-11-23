  // =================================================================== audio
  const Sound = {
    ac: null, noise: null, master: null, musicGain: null, sfxGain: null,
    music: Save.data.settings.music, sfx: Save.data.settings.sfx,
    plucks: {}, nextNote: 0, step: 0, timer: null, lastPick: 0,
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
      }
      if (this.ac.state === 'suspended') this.ac.resume();
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
    schedule() {
      this.ambEvents();
      if (!this.ac || !this.music) { if (this.ac) this.nextNote = this.ac.currentTime + 0.1; return; }
      const EIGHTH = 0.165;
      while (this.nextNote < this.ac.currentTime + 0.25) {
        const i = this.step % MELODY.length;
        const t = this.nextNote;
        const m = MELODY[i];
        const down = i % 3 === 0;
        this.pluck(NOTE_FREQ[0], t, down ? 0.16 : 0.09);           // open low string (drone)
        if (m >= 0) this.pluck(NOTE_FREQ[m], t + 0.012, down ? 0.26 : 0.18);
        else this.pluck(NOTE_FREQ[3], t + 0.012, 0.08);
        this.nextNote += EIGHTH;
        this.step++;
      }
    },
    setMusic(on) { this.music = on; Save.data.settings.music = on; Save.write(); if (this.musicGain) this.musicGain.gain.value = on ? 0.32 : 0; },
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
    shoot() { if (this.ok()) { this.tone('triangle', 520, 240, 0, 0.08, 0.07); this.hiss(3000, 900, 0, 0.08, 0.12); } },
    hit() { if (this.ok()) this.tone('square', 260, 130, 0, 0.05, 0.035); },
    kill() { if (this.ok()) { this.hiss(900, 200, 0, 0.18, 0.25); this.tone('triangle', 330, 90, 0, 0.16, 0.12); } },
    hurt() { if (this.ok()) { this.tone('square', 170, 55, 0, 0.22, 0.16); this.hiss(600, 150, 0, 0.2, 0.25, 'lowpass'); } },
    pick() {
      if (!this.ok()) return;
      const now = this.ac.currentTime; if (now - this.lastPick < 0.045) return; this.lastPick = now;
      this.tone('sine', 1250 + Math.random() * 300, 1600, 0, 0.06, 0.04);
    },
    level() { if (this.ok()) [587, 740, 880, 1175].forEach((f, i) => this.tone('triangle', f, f, i * 0.08, 0.22, 0.09)); },
    crate() { if (this.ok()) { this.hiss(1800, 300, 0, 0.18, 0.4, 'bandpass'); this.tone('square', 180, 90, 0, 0.12, 0.06); } },
    shield() { if (this.ok()) { this.tone('sine', 900, 1400, 0, 0.18, 0.08); this.tone('triangle', 600, 900, 0, 0.25, 0.05); } },
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
    gate() { if (this.ok()) { this.tone('triangle', 392, 784, 0, 0.5, 0.08); this.hiss(400, 2400, 0, 0.5, 0.08); } },
    roar() { if (this.ok()) { this.tone('sawtooth', 130, 55, 0, 0.8, 0.13); this.hiss(500, 120, 0, 0.8, 0.3, 'lowpass'); } },
    boom() { if (this.ok()) { this.tone('sine', 90, 35, 0, 0.35, 0.3); this.hiss(500, 80, 0, 0.35, 0.35, 'lowpass'); } },
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

