  // =================================================================== atmosphere: time of day per room, contact shadows, lamps, mist, room grass, loot flying to the HUD
  // Each room gets a mood that matches its panorama: morning and day in the parks, golden hour → night along the avenue,
  // the office from day to evening, warm beach light, the arena under floodlights.
  // sun: colour, sunI: × theme intensity, hemi: [sky, ground, intensity], pano: [tint, brightness], grade: [exposure, saturation, tint], lamps, mist, light (hero lantern)
  const MOODS = {
    1: { name: 'morning', sun: '#ffe2bc', sunI: 0.92, hemi: ['#eef4ff', '#5a6a3a', 0.5], pano: ['#ffe8d0', 1], grade: [0.84, 1.16, '#fff8f0'], mist: 0.06 },
    2: { name: 'day' }, 3: { name: 'day' },
    4: { name: 'afternoon', sun: '#ffe0b4', sunI: 0.95, pano: ['#fff0d8', 1], grade: [0.81, 1.17, '#fffaf2'] },
    5: { name: 'golden', sun: '#ffcf96', sunI: 1.0, hemi: ['#f4ecff', '#5a4a2a', 0.45], pano: ['#ffd6a8', 0.95], grade: [0.8, 1.15, '#fff4e8'] },
    6: { name: 'golden', sun: '#ffc68a', sunI: 0.95, grade: [0.8, 1.2, '#fff0dc'] },
    7: { name: 'sunset', sun: '#ff9a5c', sunI: 0.85, hemi: ['#ffc0a0', '#4a3a3a', 0.5], pano: ['#ffb088', 0.9], grade: [0.8, 1.22, '#ffe4d2'], lamps: '#ffd890' },
    8: { name: 'dusk', sun: '#d88070', sunI: 0.6, hemi: ['#8a90c8', '#352c3c', 0.6], pano: ['#a0a4d8', 0.62], grade: [0.86, 1.1, '#efeeff'], lamps: '#ffd890', mist: 0.05, light: '#ffcf8a' },
    9: { name: 'night', sun: '#a4b4ff', sunI: 0.45, hemi: ['#7a86c8', '#1c1c28', 0.58], pano: ['#6a74b8', 0.42], grade: [0.95, 1.02, '#e8ebff'], lamps: '#ffd890', mist: 0.06, light: '#ffcf8a' },
    10: { name: 'neon', sun: '#a89cff', sunI: 0.45, hemi: ['#8478d0', '#1a1430', 0.6], pano: ['#7a70c8', 0.45], grade: [0.95, 1.08, '#f2ecff'], lamps: 'neon', mist: 0.05, light: '#c8b0ff' },
    11: { name: 'day' }, 12: { name: 'day' },
    13: { name: 'evening', sun: '#ffc890', sunI: 0.8, hemi: ['#ffe2c0', '#6a5a48', 0.85], pano: ['#ffb890', 0.75], grade: [0.82, 1.12, '#fff0e0'] },
    14: { name: 'night office', sun: '#b0c0ff', sunI: 0.55, hemi: ['#ffe8cc', '#5a4a3a', 0.95], pano: ['#5a6aa8', 0.45], grade: [0.86, 1.08, '#fff2e4'], light: '#ffd8a0' },
    15: { name: 'beach', sun: '#ffd09a', sunI: 1.0, pano: ['#fff0d8', 1], grade: [0.8, 1.2, '#fff4e4'] },
    16: { name: 'floodlights', sun: '#f2f5ff', sunI: 0.95, hemi: ['#c8d4ff', '#24342a', 0.65], pano: ['#5a68a8', 0.42], grade: [0.9, 1.12, '#f2f4ff'], mist: 0.03 },
  };
  const moodOf = n => MOODS[n] || {};

  function applyMood(R, n, theme, zN, zS) {
    const m = moodOf(n);
    G3.mood = m;
    if (m.sun) G3.sun.color = col(m.sun);
    if (m.sunI) G3.sun.intensity *= m.sunI;
    if (m.hemi) { G3.hemi.color = col(m.hemi[0]); G3.hemi.groundColor = col(m.hemi[1]); G3.hemi.intensity = m.hemi[2]; }
    if (m.pano && G3.pano && G3.pano.visible) { G3.pano.material.color.setScalar(1.35 * m.pano[1]).multiply(col(m.pano[0])); }
    // street lamps glow at dusk and night, with warm pools of light on the ground
    if (m.lamps && theme === 'street') {
      const pool = lampPoolTex();
      let i = 0;
      for (let z = zN; z < zS; z += 2.2) for (const s of [-1, 1]) {
        const c = m.lamps === 'neon' ? (i++ % 2 ? '#3fe8ff' : '#ff5ad8') : m.lamps;
        const g = glow(c, 2.4, 0.85); g.position.set(s * 4.55, 2.0, z); R.add(g);
        const d = decal(pool, c, 3.0, m.lamps === 'neon' ? 0.3 : 0.42); d.material.blending = THREE.AdditiveBlending; d.position.set(s * 4.1, 0.03, z); R.add(d);
      }
    }
    // low drifting mist on cool mornings and at night
    if (m.mist && Q.fx > 0.5) {
      const tex = mistTex();
      for (let k = 0; k < 5; k++) {
        const p = new THREE.Mesh(G3.geo.plane, new THREE.MeshBasicMaterial({ map: tex, color: col(n >= 8 && n <= 10 ? '#aab4ff' : '#ffffff'), transparent: true, opacity: m.mist, depthWrite: false }));
        p.rotation.x = -Math.PI / 2; p.scale.set(9, 6, 1);
        const z0 = zN + (zS - zN) * (k + 0.5) / 5;
        p.position.set(0, 0.12 + k * 0.02, z0); R.add(p);
        if (G3.life) G3.life.upd.push(t => { p.position.x = Math.sin(t * 0.05 + k * 1.7) * 2.2; p.material.opacity = m.mist * (0.7 + 0.3 * Math.sin(t * 0.3 + k)); });
      }
    }
  }
  function lampPoolTex() {
    if (G3.lampPool) return G3.lampPool;
    return (G3.lampPool = canvasTex(128, 128, (g, w, h) => {
      const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }));
  }
  function mistTex() {
    if (G3.mistTex) return G3.mistTex;
    const rnd = mulberry32(77);
    return (G3.mistTex = canvasTex(256, 256, (g, w, h) => {
      for (let i = 0; i < 40; i++) {
        const x = w * (0.15 + rnd() * 0.7), y = h * (0.15 + rnd() * 0.7), r = 30 + rnd() * 60;
        const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.16)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
      }
    }));
  }

  // ---- soft contact shadows under the batyr and every monster (they also ground things when shadow maps are off)
  function blobTex() {
    if (G3.blobTex) return G3.blobTex;
    return (G3.blobTex = canvasTex(128, 128, (g, w, h) => {
      const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,0.85)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }));
  }
  function blobShadow(size, op) { const d = decal(blobTex(), '#ffffff', size, op === undefined ? 0.42 : op); d.position.y = 0.012; d.renderOrder = 1; return d; }

  // the batyr's shadow and, at night, a warm lantern glow that travels with him
  function syncHeroAtmosphere(menu) {
    if (!G3.heroBlob) { G3.heroBlob = blobShadow(1.25, 0.45); G3.dyn.add(G3.heroBlob); }
    const play = !menu && (scene === 'play' || scene === 'dead' || scene === 'victory');
    G3.heroBlob.visible = play;
    if (play) G3.heroBlob.position.set(X3(player.x), 0.012, Z3(player.y));
    const m = G3.mood || {}, want = play && m.light && QL !== 'low';
    if (want && !G3.heroLight) { G3.heroLight = new THREE.PointLight(0xffcf8a, 0, 7, 1.6); G3.dyn.add(G3.heroLight); }
    if (G3.heroLight) {
      G3.heroLight.visible = !!want;
      if (want) { G3.heroLight.color = col(m.light); G3.heroLight.intensity = 1.4 + Math.sin(G3.rt * 7) * 0.05; G3.heroLight.position.set(X3(player.x), 1.6, Z3(player.y) + 0.3); }
    }
  }

  // ---- grass tufts in park rooms (and dune grass on the beach): dense along the hedges, sparse on the lawn, never on the path
  function buildRoomGrass(R, theme, n, zN, zS) {
    if (theme !== 'park' && theme !== 'beach') return;
    const beach = theme === 'beach', nb = Math.round((beach ? 160 : 700) * Q.grass);
    const pathX = py => W / 2 + Math.sin((py - ARENA.y) / 70 + n) * 60;
    const field = makeGrassField(nb, r => {
      const edge = r() < (beach ? 0.8 : 0.55);
      const x = edge ? (r() < 0.5 ? -1 : 1) * (3.55 + r() * 0.45) : (r() - 0.5) * 7.6, z = zN + 0.2 + r() * (zS - zN - 0.4);
      const px = x * CELL + W / 2, py = z * CELL + ACY;
      if (obstacles.some(o => px > o.x - 6 && px < o.x + o.w + 6 && py > o.y - 6 && py < o.y + o.h + 6)) return null;
      if (!beach && Math.abs(px - pathX(py)) < 26) return null;
      return [x, z, edge ? 0.75 + r() * 0.4 : 0.45 + r() * 0.3];
    }, beach, n * 13 + 1);
    R.add(field);
  }

  // ---- coins and XP crystals fly from where they were picked up into the HUD; the counter pulses when they land
  const flyers = [];
  let coinPulse = 0, xpPulse = 0;
  function flyToHud(p) {
    if (flyers.length > 24 || (p.kind !== 'coin' && p.kind !== 'xp')) return;
    const s = proj(p.x, 0.3, p.y);
    flyers.push({ kind: p.kind, x0: s.x, y0: s.y, t: 0, dur: 0.42 + Math.random() * 0.12 });
  }
  function drawFlyers(dt) {
    coinPulse = Math.max(0, coinPulse - dt * 3); xpPulse = Math.max(0, xpPulse - dt * 3);
    for (const f of flyers) {
      f.t += dt;
      const k = clamp(f.t / f.dur, 0, 1), e = k * k * (3 - 2 * k);
      const tx = f.kind === 'coin' ? 20 : 50 + 250 * clamp(run.xp / xpNeed(run.level), 0, 1), ty = (f.kind === 'coin' ? 49 : 22) + SAFE.t;
      const x = f.x0 + (tx - f.x0) * e, y = f.y0 + (ty - f.y0) * e - Math.sin(k * Math.PI) * 60;
      if (f.kind === 'coin') coinIcon(x, y, 5.5 + (1 - k) * 2);
      else { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, 7); g.addColorStop(0, 'rgba(160,250,255,1)'); g.addColorStop(1, 'rgba(60,200,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - 7, y - 7, 14, 14); ctx.restore(); }
      if (k >= 1) { f.done = true; if (f.kind === 'coin') coinPulse = 1; else xpPulse = 1; }
    }
    for (let i = flyers.length - 1; i >= 0; i--) if (flyers[i].done) flyers.splice(i, 1);
  }
