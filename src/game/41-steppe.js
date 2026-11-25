  // =================================================================== QARATUN — the steppe in three hours of the black night
  // steppe_gold (rooms 1–5, sunset), steppe_night (6–10, moon and fog), steppe_blood (11–15, red eclipse, glowing cracks).
  // Wooden palisade with torches, banners, standing stones with petroglyphs, yurts, broken carts, bull skulls, dead trees.
  const isSteppe = t => typeof t === 'string' && t.startsWith('steppe');
  const svar = t => t === 'steppe_night' ? 'night' : t === 'steppe_blood' ? 'blood' : 'gold';
  const STP = {
    gold: { base: '#97834e', blots: ['#a89058', '#6e5a30', '#b8a066', '#857244', '#5e5230', '#a0884a'], strokes: ['rgba(90,62,24,0.5)', 'rgba(236,206,130,0.45)'],
      path: ['#5e4630', '#7c6248', '#957c5e'], dots: ['#a83a2a', '#d8a830', '#6a3a2a'], crack: 'rgba(60,40,20,0.5)', glow: null,
      tint: [1.14, 0.92, 0.48], wood: '#6a4a2e', tip: '#8f6e48', stone: '#8a8378', cloth: '#1f4a78', pool: '#ffb060', bush: ['#8a5a2a', '#a83a22', '#6a6a2a'] },
    night: { base: '#3e4c3a', blots: ['#4c5c44', '#2e3a2e', '#58664a', '#283228', '#5c5c46'], strokes: ['rgba(18,28,22,0.55)', 'rgba(150,170,140,0.28)'],
      path: ['#3e3a30', '#57503f', '#6c6552'], dots: ['#9a7ac8', '#b89ad8', '#7a5aa8'], crack: 'rgba(16,20,16,0.5)', glow: null,
      tint: [0.5, 0.64, 0.56], wood: '#4a3a2c', tip: '#6a5a46', stone: '#5c6066', cloth: '#1f4a78', pool: '#ffb060', bush: ['#3a4a32', '#5a4a6a', '#2e3a2a'] },
    blood: { base: '#4e3a2e', blots: ['#5c4434', '#3a2a22', '#6a4e3a', '#2e221c', '#56402e'], strokes: ['rgba(40,20,12,0.55)', 'rgba(220,150,90,0.3)'],
      path: ['#4a3426', '#64483a', '#7a5c48'], dots: ['#5a1a12', '#3a1a10'], crack: 'rgba(20,8,4,0.8)', glow: '#ff4a1a',
      tint: [0.78, 0.56, 0.42], wood: '#3a281c', tip: '#5a4232', stone: '#5a4a46', cloth: '#6a1010', pool: '#ff8a40', bush: ['#4a2a1a', '#3a1a12', '#5a3a22'] },
  };
  const STP_NAME = { gold: 'steppe_gold', night: 'steppe_night', blood: 'steppe_blood' };

  // dry cracked earth: random-walk fissures (shared by the floor, the outer ground and the glowing layer)
  function crackPaths(r, w, h, n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      let x = r() * w, y = r() * h, a = r() * TAU; const pts = [[x, y]], len = 6 + Math.floor(r() * 14);
      for (let k = 0; k < len; k++) { a += (r() - 0.5) * 1.3; const s = 5 + r() * 9; x += Math.cos(a) * s; y += Math.sin(a) * s; pts.push([x, y]); }
      out.push({ pts, w: 0.8 + r() * 1.6 });
      if (r() < 0.5) { const b = pts[Math.floor(pts.length / 2)]; out.push({ pts: [b, [b[0] + (r() - 0.5) * 40, b[1] + (r() - 0.5) * 40]], w: 0.6 }); }
    }
    return out;
  }
  const strokeCracks = (g, cr, style, k) => { g.strokeStyle = style; g.lineCap = 'round'; g.lineJoin = 'round'; for (const c of cr) { g.lineWidth = c.w * (k || 1); g.beginPath(); c.pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); } };
  function steppeGroundPaint(g, w, h, v, r, wrap) {
    const P = STP[v];
    g.fillStyle = P.base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < Math.round(w * h / 900); i++) {
      const x = r() * w, y = r() * h, rad = 14 + r() * 46, c = P.blots[i % P.blots.length];
      for (const ox of wrap ? [-w, 0, w] : [0]) for (const oy of wrap ? [-h, 0, h] : [0]) {
        const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad); gr.addColorStop(0, c + '99'); gr.addColorStop(1, c + '00');
        g.fillStyle = gr; g.fillRect(x + ox - rad, y + oy - rad, 2 * rad, 2 * rad);
      }
    }
    strokeCracks(g, crackPaths(r, w, h, Math.round(w * h / 9000)), P.crack);
    g.lineWidth = 1;
    for (let i = 0; i < Math.round(w * h / 50); i++) {
      const x = r() * w, y = r() * h; g.strokeStyle = r() < 0.55 ? P.strokes[0] : P.strokes[1];
      g.beginPath(); g.moveTo(x - 1.5, y); g.lineTo(x + (r() - 0.5) * 2, y - 3 - r() * 4); g.lineTo(x + 1.5, y); g.stroke();
    }
    for (let i = 0; i < Math.round(w * h / 1600); i++) { g.fillStyle = P.dots[i % P.dots.length]; g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 1.2, 0, TAU); g.fill(); }
    for (let i = 0; i < Math.round(w * h / 700); i++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.25)' : 'rgba(255,240,210,0.18)'; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
  }
  // the winding dirt track: wheel ruts, a darker edge, pebbles
  function steppePath(g, v, xAt, y0, y1) {
    const P = STP[v], path = (dx, wdt, col) => { g.strokeStyle = col; g.lineWidth = wdt; g.beginPath(); for (let y = y0; y <= y1; y += 8) { const x = xAt(y) + dx; y === y0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); };
    g.lineCap = 'round'; g.lineJoin = 'round';
    path(0, 38, P.path[0]); path(0, 31, P.path[1]); path(0, 20, P.path[2]);
    g.save(); g.globalAlpha = 0.45; path(-7, 3, P.path[0]); path(7, 3, P.path[0]); g.restore();
  }
  function steppeFloor(theme, n, obs) {
    const S = 1.6, AW = ARENA.w, AH = ARENA.h, v = svar(theme), r = mulberry32(n * 977 + 5);
    const xAt = y => AW / 2 + Math.sin(y / 70 + n) * 60;
    const cr = v === 'blood' ? crackPaths(mulberry32(n * 31), AW, AH, Math.round(AW * AH / 14000)) : null;
    const tex = canvasTex(Math.round(AW * S), Math.round(AH * S), g => {
      g.scale(S, S);
      steppeGroundPaint(g, AW, AH, v, r, false);
      if (cr) strokeCracks(g, cr, 'rgba(24,6,2,0.85)', 1.8);
      for (const o of obs) {
        const ox = o.x - ARENA.x, oy = o.y - ARENA.y;
        if (o.kind === 'water') { g.fillStyle = v === 'blood' ? 'rgba(20,6,2,0.65)' : 'rgba(40,34,22,0.55)'; g.beginPath(); g.ellipse(ox + 20, oy + 20, 26, 24, 0, 0, TAU); g.fill(); }
        else { g.fillStyle = 'rgba(0,0,0,0.2)'; g.beginPath(); g.ellipse(ox + 20, oy + 22, 21, 17, 0, 0, TAU); g.fill(); }
      }
      steppePath(g, v, xAt, -10, AH + 10);
      const edge = (x, y, w, h, x0, y0, x1, y1) => { const e = g.createLinearGradient(x0, y0, x1, y1); e.addColorStop(0, 'rgba(0,0,0,0.32)'); e.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = e; g.fillRect(x, y, w, h); };
      edge(0, 0, AW, 16, 0, 0, 0, 16); edge(0, 0, 14, AH, 0, 0, 14, 0); edge(AW - 14, 0, 14, AH, AW, 0, AW - 14, 0);
    });
    // eclipse: the same fissures drawn once more as a glowing layer laid over the floor
    G3.stpCracks = cr ? canvasTex(Math.round(AW * 0.8), Math.round(AH * 0.8), g => { g.scale(0.8, 0.8); strokeCracks(g, cr, 'rgba(255,150,80,0.95)', 0.8); g.filter = 'blur(2px)'; strokeCracks(g, cr, 'rgba(255,60,20,0.5)', 2.2); }) : null;
    return tex;
  }
  function steppeOuterTex(theme) {
    const v = svar(theme), t = canvasTex(256, 256, (g, w, h) => steppeGroundPaint(g, w, h, v, mulberry32(v.length * 13 + 3), true), true);
    t.repeat.set(140 / 6, 140 / 6);
    return t;
  }

  // ---- props
  function petroTex(v) {
    const key = 'petro_' + v; if (G3[key]) return G3[key];
    const P = STP[v], r = mulberry32(v.length * 7 + 1);
    return (G3[key] = canvasTex(128, 256, (g, w, h) => {
      g.fillStyle = P.stone; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.1)'; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); }
      for (let i = 0; i < 30; i++) { const x = r() * w, y = r() * h, gr = g.createRadialGradient(x, y, 0, x, y, 20); gr.addColorStop(0, 'rgba(0,0,0,0.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - 20, y - 20, 40, 40); }
      // carved signs: a horse, a sun spiral, a tamga — pale grooves with a dark shadow line
      const carve = fn => { g.save(); g.translate(1, 1.5); g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 3; fn(); g.restore(); g.strokeStyle = v === 'blood' ? 'rgba(255,140,90,0.85)' : 'rgba(235,222,190,0.8)'; g.lineWidth = 2.2; fn(); };
      g.lineCap = 'round'; g.lineJoin = 'round';
      carve(() => { g.beginPath(); g.moveTo(30, 110); g.lineTo(46, 96); g.lineTo(82, 98); g.lineTo(96, 84); g.lineTo(102, 90); g.lineTo(92, 102); g.lineTo(88, 118); g.moveTo(40, 104); g.lineTo(36, 126); g.moveTo(52, 100); g.lineTo(54, 126); g.moveTo(76, 102); g.lineTo(72, 126); g.moveTo(86, 106); g.lineTo(90, 126); g.moveTo(30, 110); g.lineTo(22, 122); g.stroke(); });
      carve(() => { g.beginPath(); for (let a = 0; a < 14; a += 0.2) { const rr = a * 1.9; g.lineTo(64 + Math.cos(a) * rr, 178 + Math.sin(a) * rr); } g.stroke(); });
      carve(() => { g.beginPath(); g.moveTo(64, 30); g.lineTo(64, 66); g.moveTo(48, 40); g.lineTo(64, 52); g.lineTo(80, 40); g.moveTo(52, 66); g.lineTo(76, 66); g.stroke(); });
    }));
  }
  function stoneMat(v) { return mat('#ffffff', { map: petroTex(v), r: 0.92 }); }
  function makeBullSkull(scale, v) {
    const g = new THREE.Group(), bone = mat(v === 'blood' ? '#d8c4a8' : '#e8dcc4', { r: 0.7 }), dark = mat('#2a1e16', { r: 1 });
    g.add(mesh(G3.geo.sphere, bone, 0, 0.1, -0.04, 0.12, 0.09, 0.13));
    g.add(mesh(G3.geo.box, bone, 0, 0.07, 0.11, 0.1, 0.07, 0.14));
    for (const s of [-1, 1]) {
      g.add(mesh(G3.geo.sLow, dark, s * 0.06, 0.12, 0.04, 0.03, 0.03, 0.02));
      const horn = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 6, 12, Math.PI * 0.55), bone);
      horn.position.set(s * 0.1, 0.16, -0.06); horn.rotation.set(0, s > 0 ? 0 : Math.PI, s > 0 ? -0.2 : -0.2); horn.castShadow = true; g.add(horn);
    }
    g.scale.setScalar(scale); return g;
  }
  function makeCartWheel(v) {
    const g = new THREE.Group(), wood = mat(STP[v].wood, { r: 0.85 });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 6, 20), wood); rim.castShadow = true; g.add(rim);
    for (let i = 0; i < 8; i++) { const sp = mesh(G3.geo.box, wood, 0, 0, 0, 0.56, 0.03, 0.03); sp.rotation.z = i * Math.PI / 8; g.add(sp); }
    g.add(mesh(G3.geo.cyl, wood, 0, 0, 0, 0.07, 0.1, 0.07)).rotation.x = Math.PI / 2;
    return g;
  }
  function makeBrokenCart(v, r) {
    const g = new THREE.Group(), wood = mat(STP[v].wood, { r: 0.85 }), plank = mat(STP[v].tip, { r: 0.9 });
    const bed = mesh(G3.geo.box, plank, 0, 0.18, 0, 0.62, 0.06, 0.9); bed.rotation.z = 0.32; bed.rotation.y = 0.2; g.add(bed);
    for (const z of [-0.36, 0, 0.36]) { const p = mesh(G3.geo.box, wood, 0.24, 0.32, z, 0.04, 0.22, 0.05); p.rotation.z = 0.3; g.add(p); }
    const w1 = makeCartWheel(v); w1.position.set(-0.32, 0.3, 0.3); w1.rotation.y = Math.PI / 2 + 0.1; g.add(w1);
    const w2 = makeCartWheel(v); w2.position.set(0.12, 0.04, -0.38); w2.rotation.x = -Math.PI / 2 + 0.08; g.add(w2);
    g.rotation.y = r() * TAU; return g;
  }
  function makeDeadTree(v, r, h) {
    const g = new THREE.Group(), bark = mat(v === 'blood' ? '#2a1a14' : '#3a3228', { r: 1 });
    const limb = (x, y, z, len, rad, ax, az, depth) => {
      const m = mesh(G3.geo.cone, bark, 0, len / 2, 0, rad, len, rad), pv = new THREE.Group();
      pv.position.set(x, y, z); pv.rotation.set(ax, 0, az); pv.add(m); g.add(pv);
      if (depth > 0) for (let i = 0; i < 2 + (r() < 0.4 ? 1 : 0); i++) {
        const t = 0.55 + r() * 0.35, a2 = az + (r() - 0.5) * 1.6, b2 = ax + (r() - 0.5) * 1.2;
        const tip = new THREE.Vector3(0, len * t, 0).applyEuler(new THREE.Euler(ax, 0, az));
        limb(x + tip.x, y + tip.y, z + tip.z, len * (0.55 + r() * 0.2), rad * 0.55, b2, a2, depth - 1);
      }
    };
    limb(0, 0, 0, h * 0.55, 0.09 * h / 2.4, (r() - 0.5) * 0.2, (r() - 0.5) * 0.3, 2);
    return g;
  }
  function makeBush(v, r) {
    const g = new THREE.Group(), cols = STP[v].bush;
    for (let i = 0; i < 3; i++) { const s = 0.14 + r() * 0.12; g.add(mesh(G3.geo.dodeca, mat(cols[(i + Math.floor(r() * 3)) % cols.length], { r: 1, flat: true }), (r() - 0.5) * 0.3, s * 0.8, (r() - 0.5) * 0.3, s, s * 0.85, s)); }
    return g;
  }
  function makeRockLow(v, r) {
    const m = mat(STP[v].stone, { r: 0.95, flat: true }), g = new THREE.Group();
    for (let i = 0; i < 1 + Math.floor(r() * 3); i++) { const s = 0.08 + r() * 0.16; g.add(mesh(G3.geo.dodeca, m, (r() - 0.5) * 0.4, s * 0.5, (r() - 0.5) * 0.4, s * 1.2, s * 0.7, s)); }
    return g;
  }
  function steppeProp(theme, kind, o, cx, cz) {
    const v = svar(theme), r = mulberry32(o.seed * 7 + 13), g = new THREE.Group(); g.position.set(cx, 0, cz);
    if (kind === 'water') {
      if (v === 'blood') {
        // a fissure of embers: dark scorched bed and a pulsing glow
        const bed = new THREE.Mesh(new THREE.CircleGeometry(0.58, 18), mat('#1a0e0a', { r: 1 })); bed.rotation.x = -Math.PI / 2; bed.position.y = 0.02; bed.receiveShadow = true; g.add(bed);
        const lava = new THREE.Mesh(G3.geo.plane, new THREE.MeshBasicMaterial({ map: lavaTex(), color: col('#ff5a20'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
        lava.rotation.x = -Math.PI / 2; lava.rotation.z = r() * TAU; lava.scale.set(0.72, 0.72, 1); lava.position.y = 0.03; g.add(lava);
        (G3.stpAnim = G3.stpAnim || []).push(t => { lava.material.opacity = 0.45 + Math.sin(t * 2.3 + cx + cz) * 0.15; });
      } else {
        if (!G3['pondMat_' + v]) { G3['pondMat_' + v] = mat(v === 'night' ? '#16262e' : '#3a5248', { r: 0.12, m: 0.5 }); }   // dark still water that mirrors the sky
        const shore = new THREE.Mesh(new THREE.CircleGeometry(0.68, 20), mat(v === 'night' ? '#26302a' : '#5a4a30', { r: 1 })); shore.rotation.x = -Math.PI / 2; shore.position.y = 0.015; shore.receiveShadow = true; g.add(shore);
        const w = new THREE.Mesh(new THREE.CircleGeometry(0.6, 20), G3['pondMat_' + v]); w.rotation.x = -Math.PI / 2; w.position.y = 0.03; w.receiveShadow = true; g.add(w);
        if (r() < 0.6) for (let i = 0; i < 5; i++) { const reed = mesh(G3.geo.cyl, mat(v === 'night' ? '#3a4a32' : '#8a7a3a'), -0.42 + r() * 0.84, 0.2, (r() < 0.5 ? -1 : 1) * 0.44, 0.012, 0.32 + r() * 0.2, 0.012); reed.rotation.z = (r() - 0.5) * 0.3; g.add(reed); }
      }
      return g;
    }
    if (kind === 'yurt') {
      const k = r();
      if (v !== 'blood' && k < 0.55) { const y = makeYurt(0, 0, 1.05); y.rotation.y = r() * TAU; g.add(y); }
      else if (k < 0.8 || v !== 'blood') g.add(makeBrokenCart(v, r));
      else { g.add(makeDeadTree(v, r, 2.2)); g.add(makeRockLow(v, r)); }
      return g;
    }
    // stone: a balbal statue, a carved standing stone or a boulder with petroglyphs
    const k = r();
    if (k < 0.22 && G3.models.balbal) { const b = G3.models.balbal.clone(); b.scale.setScalar(1.05); b.rotation.y = (r() - 0.5) * 0.8; g.add(b); }
    else if (k < 0.62) {
      const h = 0.85 + r() * 0.45, st = mesh(G3.geo.box, stoneMat(v), 0, h / 2, 0, 0.36, h, 0.2);
      st.rotation.y = (r() - 0.5) * 0.6; st.rotation.z = (r() - 0.5) * 0.12; g.add(st);
      g.add(mesh(G3.geo.dodeca, mat(STP[v].stone, { r: 1, flat: true }), 0.18, 0.06, 0.12, 0.09, 0.06, 0.08));
    } else {
      const b = mesh(G3.geo.dodeca, stoneMat(v), 0, 0.26, 0, 0.44, 0.32, 0.38); b.rotation.y = r() * TAU; g.add(b);
    }
    if (v === 'blood' && r() < 0.35) { const s = makeBullSkull(0.9, v); s.position.set(0.28, 0, 0.2); s.rotation.y = r() * TAU; g.add(s); }
    g.traverse(o2 => { if (o2.isMesh) { o2.castShadow = true; o2.receiveShadow = true; } });
    return g;
  }
  function lavaTex() {
    if (G3.lavaTex) return G3.lavaTex;
    const r = mulberry32(77);
    return (G3.lavaTex = canvasTex(128, 128, (g, w, h) => {
      const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(255,200,90,0.9)'); gr.addColorStop(0.5, 'rgba(255,80,20,0.45)'); gr.addColorStop(1, 'rgba(255,40,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      strokeCracks(g, crackPaths(r, w, h, 10), 'rgba(255,230,160,0.95)', 1.4);
    }));
  }

  // ---- walls: a palisade of sharpened logs, torches with pools of light, banners on poles
  function bannerTex(v) {
    const key = 'banner_' + v; if (G3[key]) return G3[key];
    return (G3[key] = canvasTex(128, 256, (g, w, h) => {
      g.fillStyle = STP[v].cloth; g.fillRect(0, 0, w, h);
      const sh = g.createLinearGradient(0, 0, w, 0); sh.addColorStop(0, 'rgba(0,0,0,0.35)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.06)'); sh.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = sh; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#d8a83a'; g.lineWidth = 5; g.strokeRect(8, 8, w - 16, h - 40);
      koshkar(g, w / 2, 110, 70, '#e8bb4a', 5);
      g.fillStyle = '#e8bb4a'; g.beginPath(); g.moveTo(w / 2, 168); g.lineTo(w / 2 + 14, 186); g.lineTo(w / 2, 204); g.lineTo(w / 2 - 14, 186); g.closePath(); g.fill();
      // ragged bottom edge
      g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 16) g.lineTo(x, h - 26 - (x / 16 % 2) * 14 - (v === 'blood' ? (x * 7 % 13) : 0)); g.lineTo(w, h); g.closePath(); g.fill();
    }));
  }
  const BANNER_VS = [
    'vec3 transformed = vec3(position);',
    'float k = 0.5 - position.y;',
    'transformed.z += (sin(uT * 2.6 + position.y * 5.0 + modelMatrix[3].x) * 0.05 + sin(uT * 4.3 + position.x * 7.0) * 0.015) * k;',
    'transformed.x += sin(uT * 1.9 + position.y * 3.0) * 0.02 * k;',
  ].join('\n');
  function makeBanner(v, h, w) {
    const g = new THREE.Group(), wood = mat(STP[v].wood, { r: 0.85 }), gold = mat('#d8a83a', { m: 0.7, r: 0.35 });
    g.add(mesh(G3.geo.cyl, wood, 0, h / 2, 0, 0.045, h, 0.045));
    g.add(mesh(G3.geo.box, wood, 0, h - 0.08, 0, w + 0.18, 0.05, 0.05));
    g.add(mesh(G3.geo.cone, gold, 0, h + 0.1, 0, 0.05, 0.2, 0.05));
    const cm = new THREE.MeshStandardMaterial({ map: bannerTex(v), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 });
    windMaterial(cm, BANNER_VS);
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 4, 8), cm); cloth.scale.set(w, w * 2, 1); cloth.position.set(0, h - 0.1 - w, 0.03); cloth.castShadow = true; g.add(cloth);
    return g;
  }
  function makeTorch(v, R, x, z, h) {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    g.add(mesh(G3.geo.cyl, mat(STP[v].wood, { r: 0.85 }), 0, h / 2, 0, 0.05, h, 0.05));
    const bowl = mesh(G3.geo.cone, mat('#3a2e24', { m: 0.6, r: 0.4 }), 0, h + 0.05, 0, 0.14, 0.16, 0.14); bowl.rotation.x = Math.PI; g.add(bowl);
    R.add(g);
    const fl = new THREE.Group(); fl.position.set(x, h + 0.12, z);
    const outer = new THREE.Mesh(G3.geo.cone, new THREE.MeshBasicMaterial({ color: col('#ff8a2a'), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    outer.scale.set(0.1, 0.32, 0.1); outer.position.y = 0.14; fl.add(outer);
    const inner = new THREE.Mesh(G3.geo.cone, new THREE.MeshBasicMaterial({ color: col('#fff0a0'), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    inner.scale.set(0.05, 0.18, 0.05); inner.position.y = 0.09; fl.add(inner);
    const gl = glow(v === 'blood' ? '#ff7a40' : '#ffb050', 1.5, 0.75); gl.position.y = 0.18; fl.add(gl);
    R.add(fl);
    const pool = decal(lampPoolTex(), STP[v].pool, 3.2, v === 'gold' ? 0.22 : 0.42); pool.material.blending = THREE.AdditiveBlending; pool.position.set(x, 0.03, z); R.add(pool);
    const ph = x * 3.1 + z * 1.7;
    (G3.stpAnim = G3.stpAnim || []).push(t => {
      const f = REDUCED_MOTION ? 1 : 1 + Math.sin(t * 13 + ph) * 0.08 + Math.sin(t * 7.3 + ph * 2) * 0.06;
      outer.scale.set(0.1 * (2 - f), 0.32 * f, 0.1 * (2 - f)); inner.scale.y = 0.18 * f;
      gl.material.opacity = 0.6 + (f - 1) * 1.6; pool.material.opacity = (v === 'gold' ? 0.22 : 0.42) * (0.9 + (f - 1) * 0.8);
    });
    return fl;
  }
  function steppeWalls(R, theme, zN, zS) {
    const v = svar(theme), P = STP[v], rnd = mulberry32(run.room * 53 + 7), places = [], dyn = [];
    const pathXs = Math.sin((zS - zN) * CELL / 70 + run.room) * 60 / CELL;   // where the track leaves through the south wall
    const line = (x0, z0, x1, z1) => {
      const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 0.17));
      for (let i = 0; i <= n; i++) { const t = i / n; places.push([x0 + (x1 - x0) * t + (rnd() - 0.5) * 0.03, z0 + (z1 - z0) * t + (rnd() - 0.5) * 0.03, 0.8 + rnd() * 0.4]); }
      for (const y of [0.32, 0.66]) R.add(mesh(G3.geo.box, mat(P.wood, { r: 0.9 }), (x0 + x1) / 2, y, (z0 + z1) / 2, Math.abs(x1 - x0) + 0.05, 0.05, Math.abs(z1 - z0) + 0.05));
    };
    const X = 4.15;
    line(-X, zN - 0.15, -1.25, zN - 0.15); line(1.25, zN - 0.15, X, zN - 0.15);
    line(-X, zS + 0.15, pathXs - 0.75, zS + 0.15); line(pathXs + 0.75, zS + 0.15, X, zS + 0.15);
    line(-X, zN - 0.15, -X, zS + 0.15); line(X, zN - 0.15, X, zS + 0.15);
    // the stakes: shafts and sharpened tips, one instanced mesh each
    const shaftM = mat(P.wood, { r: 0.9 }), tipM = mat(P.tip, { r: 0.85 }), n = places.length;
    const shaft = new THREE.InstancedMesh(G3.geo.cyl, shaftM, n), tip = new THREE.InstancedMesh(G3.geo.cone, tipM, n), d = new THREE.Object3D(), cc = new THREE.Color();
    places.forEach(([x, z, h], i) => {
      const lean = (rnd() - 0.5) * 0.08, lean2 = (rnd() - 0.5) * 0.08;
      d.position.set(x, h / 2, z); d.rotation.set(lean, rnd() * TAU, lean2); d.scale.set(0.058, h, 0.058); d.updateMatrix(); shaft.setMatrixAt(i, d.matrix);
      d.position.set(x + lean2 * -h * 0.5, h + 0.08, z + lean * h * 0.5); d.scale.set(0.058, 0.18, 0.058); d.updateMatrix(); tip.setMatrixAt(i, d.matrix);
      const k = 0.8 + rnd() * 0.35; cc.setRGB(k, k * 0.97, k * 0.92); shaft.setColorAt(i, cc); tip.setColorAt(i, cc);
    });
    for (const im of [shaft, tip]) { im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; R.add(im); }
    // torches at the corners, by the gate and along the sides
    const torches = [[-X, zN - 0.15], [X, zN - 0.15], [-X, zS + 0.15], [X, zS + 0.15], [-1.45, zN - 0.15], [1.45, zN - 0.15]];
    for (let z = zN + 4.6; z < zS - 2.5; z += 4.6) torches.push([-X, z], [X, z]);
    for (const [x, z] of torches) dyn.push(makeTorch(v, R, x, z, 1.25));
    // banners: a pair flanking the gate, more hung along the sides
    for (const s of [-1, 1]) { const b = makeBanner(v, 2.7, 0.55); b.position.set(s * 2.35, 0, zN - 0.55); R.add(b); }
    for (let z = zN + 7, i = 0; z < zS - 4; z += 7.5, i++) { const s = i % 2 ? 1 : -1, b = makeBanner(v, 1.9, 0.4); b.position.set(s * 4.45, 0, z); b.rotation.y = s * Math.PI / 2; R.add(b); }
    // beyond the gate: the great yurt with its door aglow, or — under the eclipse — a bull skull nailed over the gate
    if (v !== 'blood') {
      const y = makeYurt(0, zN - 3.6, 2.7); R.add(y);
      const dg = glow('#ffb050', 2.2, 0.75); dg.position.set(0, 0.6, zN - 2.3); R.add(dg); dyn.push(dg);
      (G3.stpAnim = G3.stpAnim || []).push(t => { dg.material.opacity = 0.6 + Math.sin(t * 5.3) * 0.08 + Math.sin(t * 11) * 0.05; });
    } else {
      const sk = makeBullSkull(2.2, v); sk.position.set(0, 2.25, zN - 0.05); R.add(sk);
      for (const [x, z, h] of [[3.4, zN - 2.6, 3.2], [-5.5, zN - 4.2, 3.8], [6.8, zN - 6, 2.8]]) { const t = makeDeadTree(v, rnd, h); t.position.set(x, 0, z); R.add(t); }
    }
    return dyn;
  }

  // ---- around the arena: scattered yurts, balbals, rocks, bushes, dead trees and skulls (also used by the outskirts)
  function steppeScatter(R, theme, rnd, x0, x1, z0, z1, n, avoid) {
    const v = svar(theme);
    for (let i = 0; i < n; i++) {
      const x = x0 + rnd() * (x1 - x0), z = z0 + rnd() * (z1 - z0);
      if (avoid && avoid(x, z)) continue;
      const k = rnd(); let o;
      if (k < 0.08 && Math.abs(x) > 6.5 && v !== 'blood') { o = makeYurt(0, 0, 1.2 + rnd() * 0.8); o.rotation.y = rnd() * TAU; }
      else if (k < 0.16 && G3.models.balbal) { o = G3.models.balbal.clone(); o.scale.setScalar(1 + rnd() * 0.3); o.rotation.y = rnd() * TAU; }
      else if (k < 0.3) { o = new THREE.Group(); const h = 0.7 + rnd() * 0.6, st = mesh(G3.geo.box, stoneMat(v), 0, h / 2, 0, 0.32, h, 0.18); st.rotation.y = rnd() * TAU; o.add(st); }
      else if (k < 0.5) o = makeRockLow(v, rnd);
      else if (k < 0.72) o = makeBush(v, rnd);
      else if (k < 0.82) { o = makeBullSkull(0.8 + rnd() * 0.4, v); o.rotation.y = rnd() * TAU; }
      else if (k < 0.9 && v !== 'gold') o = makeDeadTree(v, rnd, 2 + rnd() * 1.6);
      else if (k < 0.95) { o = makeCartWheel(v); o.rotation.x = -Math.PI / 2 + 0.15; o.position.y = 0.05; const w = new THREE.Group(); w.add(o); o = w; }
      else o = makeBush(v, rnd);
      o.position.x = x; o.position.z = z; R.add(o);
    }
  }
  function steppeScenery(R, theme, n, zN, zS) {
    const rnd = mulberry32(n * 91 + 5), v = svar(theme);
    const dyn = steppeWalls(R, theme, zN, zS);
    steppeScatter(R, theme, rnd, -13, -4.9, zN - 9, zS + 12, Math.round(26 * Q.fx + 10), null);
    steppeScatter(R, theme, rnd, 4.9, 13, zN - 9, zS + 12, Math.round(26 * Q.fx + 10), null);
    // eclipse: the cracks in the floor glow and pulse
    if (G3.stpCracks) {
      const m = new THREE.MeshBasicMaterial({ map: G3.stpCracks, color: col(STP.blood.glow), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
      const p = new THREE.Mesh(new THREE.PlaneGeometry(COLS, ROWS), m); p.rotation.x = -Math.PI / 2; p.position.set(0, 0.012, (zN + zS) / 2); R.add(p); dyn.push(p);
      (G3.stpAnim = G3.stpAnim || []).push(t => { m.opacity = 0.42 + Math.sin(t * 1.7) * 0.16 + Math.sin(t * 4.1) * 0.05; });
    }
    return dyn;
  }

  // ---- temporary skies painted in code (replaced by the owner's panoramas: assets/sky_steppe_gold|night|blood.js)
  function steppeSkyTex(theme) {
    const v = svar(theme), W2 = 2048, H2 = 1024, hz = 512, r = mulberry32(v.length * 101);
    return canvasTex(W2, H2, g => {
      const sky = { gold: ['#2a2c58', '#7a4a6a', '#e0884a', '#ffc070'], night: ['#03060f', '#0c1630', '#1c2c4c', '#34466a'], blood: ['#080204', '#2a0808', '#6a1410', '#a8301a'] }[v];
      const gr = g.createLinearGradient(0, 0, 0, hz); gr.addColorStop(0, sky[0]); gr.addColorStop(0.45, sky[1]); gr.addColorStop(0.8, sky[2]); gr.addColorStop(1, sky[3]);
      g.fillStyle = gr; g.fillRect(0, 0, W2, hz);
      // below the horizon: the far steppe in haze, so the ground plane fades into the sky without a dark band
      const lo = g.createLinearGradient(0, hz, 0, hz + 120); lo.addColorStop(0, { gold: '#b08a58', night: '#2a3442', blood: '#5a2a1c' }[v]); lo.addColorStop(1, { gold: '#6e5a34', night: '#1a2420', blood: '#2e1a12' }[v]);
      g.fillStyle = lo; g.fillRect(0, hz, W2, H2 - hz);
      const cx = W2 / 2, cy = { gold: hz - 40, night: 300, blood: 280 }[v];
      // the light: low sun, full moon, or a black disc with a burning corona
      const halo = (rad, c0, c1) => { const h = g.createRadialGradient(cx, cy, 0, cx, cy, rad); h.addColorStop(0, c0); h.addColorStop(1, c1); g.fillStyle = h; g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2); };
      if (v === 'gold') { halo(420, 'rgba(255,200,120,0.75)', 'rgba(255,140,60,0)'); halo(60, 'rgba(255,246,210,1)', 'rgba(255,220,150,0)'); g.fillStyle = '#fff4d0'; g.beginPath(); g.arc(cx, cy, 26, 0, TAU); g.fill(); }
      if (v === 'night') { halo(260, 'rgba(160,190,255,0.35)', 'rgba(120,150,230,0)'); g.fillStyle = '#eef2ff'; g.beginPath(); g.arc(cx, cy, 34, 0, TAU); g.fill(); g.fillStyle = 'rgba(150,160,190,0.35)'; for (const [dx, dy, rr] of [[-9, -6, 8], [8, 7, 6], [5, -12, 4]]) { g.beginPath(); g.arc(cx + dx, cy + dy, rr, 0, TAU); g.fill(); } for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`; g.fillRect(r() * W2, r() * hz * 0.7, 1.4, 1.4); } }
      if (v === 'blood') { halo(380, 'rgba(255,60,30,0.55)', 'rgba(160,20,10,0)'); g.strokeStyle = 'rgba(255,120,60,0.95)'; g.lineWidth = 7; g.beginPath(); g.arc(cx, cy, 44, 0, TAU); g.stroke(); g.fillStyle = '#0a0202'; g.beginPath(); g.arc(cx + 6, cy - 3, 41, 0, TAU); g.fill(); }
      // clouds: soft banks lit from the light's side
      for (let i = 0; i < 90; i++) {
        const x = r() * W2, y = hz * (0.12 + r() * 0.68), rx = 60 + r() * 220, ry = 14 + r() * 40;
        const lit = Math.max(0, 1 - Math.abs(x - cx) / (W2 * 0.4));
        const c = v === 'gold' ? [255, 150 + lit * 70, 110 + lit * 40, 0.16 + lit * 0.2] : v === 'night' ? [70 + lit * 60, 90 + lit * 70, 130 + lit * 80, 0.18] : [60 + lit * 120, 14, 10, 0.3];
        for (const ox of [-W2, 0, W2]) { const cg = g.createRadialGradient(x + ox, y, 0, x + ox, y, rx); cg.addColorStop(0, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${c[3]})`); cg.addColorStop(1, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},0)`); g.save(); g.translate(x + ox, y); g.scale(1, ry / rx); g.translate(-(x + ox), -y); g.fillStyle = cg; g.fillRect(x + ox - rx, y - rx, rx * 2, rx * 2); g.restore(); }
      }
      if (v === 'blood') for (let i = 0; i < 6; i++) { let x = r() * W2, y = hz * (0.1 + r() * 0.3); g.strokeStyle = 'rgba(255,70,40,0.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 9; k++) { x += (r() - 0.5) * 70; y += 8 + r() * 18; g.lineTo(x, y); } g.stroke(); }
      // mountain ranges on the horizon, the far one paler, snow on the peaks
      const ridge = (base, amp, colr, snow, seed) => {
        const rr = mulberry32(seed), pts = []; let y = 0;
        for (let x = 0; x <= W2; x += 16) { y += (rr() - 0.5) * amp * 0.5; y = Math.max(-amp, Math.min(amp * 0.25, y)); pts.push([x, base + y - Math.max(0, Math.sin(x / W2 * TAU * 3 + seed) * amp * 0.6)]); }
        pts[pts.length - 1][1] = pts[0][1];
        g.fillStyle = colr; g.beginPath(); g.moveTo(0, hz + 4); for (const [x, yy] of pts) g.lineTo(x, yy); g.lineTo(W2, hz + 4); g.closePath(); g.fill();
        if (snow) { g.fillStyle = snow; for (let i = 1; i < pts.length - 1; i++) if (pts[i][1] < pts[i - 1][1] && pts[i][1] < pts[i + 1][1] && pts[i][1] < base - amp * 0.55) { const [x, yy] = pts[i]; g.beginPath(); g.moveTo(x, yy); g.lineTo(x - 18, yy + 16); g.lineTo(x + 16, yy + 14); g.closePath(); g.fill(); } }
      };
      const mc = { gold: ['#7a5a7a', '#4a3048', 'rgba(255,220,200,0.7)'], night: ['#1c2640', '#0e1424', 'rgba(200,215,240,0.55)'], blood: ['#3a1210', '#1a0806', 'rgba(200,110,90,0.4)'] }[v];
      ridge(hz - 16, 52, mc[0], mc[2], 3); ridge(hz - 2, 26, mc[1], null, 9);
      // haze over the horizon
      const hg = g.createLinearGradient(0, hz - 70, 0, hz + 6); hg.addColorStop(0, 'rgba(0,0,0,0)'); hg.addColorStop(1, { gold: 'rgba(255,170,90,0.45)', night: 'rgba(90,110,150,0.4)', blood: 'rgba(160,40,20,0.45)' }[v]); g.fillStyle = hg; g.fillRect(0, hz - 70, W2, 76);
    });
  }
  function ensureSteppeSky(theme) {
    if (G3.skyTex[theme]) return;
    const t = steppeSkyTex(theme); t.mapping = THREE.EquirectangularReflectionMapping; G3.skyTex[theme] = t;
  }
