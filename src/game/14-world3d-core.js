  // =================================================================== 3D world (Three.js)
  const G3 = {
    r: null, dirty: true, built: '', fountains: [], life: null, rt: 0, hero: null, eagle: null, charms: [], metalMats: new Set(), models: {}, skyTex: {}, skyData: {},
    ents: new Map(), arrowsM: new Map(), bulletsM: new Map(), pickM: new Map(), aimM: new Map(),
  };
  const colorCache = new Map();
  const col = h => new THREE.Color(h).convertSRGBToLinear();
  const colC = h => { let c = colorCache.get(h); if (!c) { c = col(h); colorCache.set(h, c); } return c; };

  function mat(hex, o) {
    o = o || {};
    const m = new THREE.MeshStandardMaterial({
      color: col(hex), roughness: o.r !== undefined ? o.r : 0.8, metalness: o.m || 0, flatShading: !!o.flat,
      emissive: o.e ? col(o.e) : new THREE.Color(0), emissiveIntensity: o.ei !== undefined ? o.ei : 1,
      transparent: o.op !== undefined, opacity: o.op !== undefined ? o.op : 1,
      side: o.ds ? THREE.DoubleSide : THREE.FrontSide, map: o.map || null, depthWrite: o.dw !== false,
    });
    m.userData.e = m.emissive.clone(); m.userData.ei = m.emissiveIntensity;
    if ((o.m || 0) >= 0.5) { G3.metalMats.add(m); if (G3.envRT) m.envMap = G3.envRT.texture; }
    return m;
  }
  function mesh(geo, m, x, y, z, sx, sy, sz, cast) {
    const me = new THREE.Mesh(geo, m);
    me.position.set(x || 0, y || 0, z || 0);
    if (sx !== undefined) me.scale.set(sx, sy === undefined ? sx : sy, sz === undefined ? sx : sz);
    me.castShadow = cast !== false;
    return me;
  }
  function canvasTex(w, h, draw, repeat) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = G3.r ? Math.min(8, G3.r.capabilities.getMaxAnisotropy()) : 1;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }
  // the same, sharing one material per colour and opacity (for things that come and go by the hundred, like enemy shots)
  function glowShared(hex, size, op) {
    const k = hex + '|' + (op === undefined ? 1 : op);
    G3.glowMats = G3.glowMats || {};
    const m = G3.glowMats[k] || (G3.glowMats[k] = new THREE.SpriteMaterial({ map: G3.glowTex, color: col(hex), transparent: true, opacity: op === undefined ? 1 : op, depthWrite: false, blending: THREE.AdditiveBlending }));
    const s = new THREE.Sprite(m); s.scale.set(size, size, 1); return s;
  }
  function glow(hex, size, op) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: G3.glowTex, color: col(hex), transparent: true, opacity: op === undefined ? 1 : op, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.set(size, size, 1);
    return s;
  }
  function decal(tex, hex, size, op) {
    const m = new THREE.MeshBasicMaterial({ map: tex, color: col(hex), transparent: true, opacity: op === undefined ? 1 : op, depthWrite: false });
    const d = new THREE.Mesh(G3.geo.plane, m);
    d.rotation.x = -Math.PI / 2; d.scale.set(size, size, 1); d.position.y = 0.02;
    return d;
  }

  // final colour pass: ACES tone mapping, sRGB, a touch of saturation/contrast and a vignette
  const GRADE_SHADER = {
    uniforms: { tDiffuse: { value: null }, exposure: { value: 1.2 }, vign: { value: 0.42 }, sat: { value: 1.1 }, contrast: { value: 1.06 }, tint: { value: new THREE.Color(1, 1, 1) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: [
      'uniform sampler2D tDiffuse; uniform float exposure, vign, sat, contrast; uniform vec3 tint; varying vec2 vUv;',
      'vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }',
      'void main(){',
      '  vec3 c = aces(texture2D(tDiffuse, vUv).rgb * exposure);',
      '  c = pow(c, vec3(1.0 / 2.2));',
      '  float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(vec3(l), c, sat);',
      '  c = (c - 0.5) * contrast + 0.5;',
      '  c *= tint;',
      '  vec2 q = vUv - 0.5; c *= 1.0 - vign * dot(q, q) * 1.6;',
      '  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);',
      '}'].join('\n'),
  };

  function makeSky() {
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new THREE.Color() }, mid: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 0.2, -1) }, sunCol: { value: new THREE.Color() } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: [
        'uniform vec3 top, mid, bot, sunCol, sunDir; varying vec3 vDir;',
        'void main(){',
        '  vec3 d = normalize(vDir); float h = d.y;',
        '  vec3 c = h > 0.0 ? mix(mid, top, pow(smoothstep(0.0, 0.65, h), 0.75)) : mix(mid, bot, smoothstep(0.0, -0.2, h));',
        '  float s = max(dot(d, normalize(sunDir)), 0.0);',
        '  c += sunCol * (pow(s, 700.0) * 8.0 + pow(s, 14.0) * 0.55 + pow(s, 3.0) * 0.18);',
        '  gl_FragColor = linearToOutputTexel(vec4(c, 1.0));',
        '}'].join('\n'),
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(95, 32, 16), m);
    sky.frustumCulled = false; sky.renderOrder = -1;
    return sky;
  }
  function setSky(top, midC, bot, sunDir, sunCol) {
    const u = G3.sky.material.uniforms;
    u.top.value.copy(col(top)); u.mid.value.copy(col(midC)); u.bot.value.copy(col(bot));
    u.sunDir.value.copy(sunDir).normalize(); u.sunCol.value.copy(col(sunCol));
    G3.scene.fog.color.copy(col(midC));
    // environment map for reflections on metal (helmet, armour, coins)
    const es = new THREE.Scene(); const sk = new THREE.Mesh(G3.sky.geometry, G3.sky.material); es.add(sk);
    const rt = G3.pmrem.fromScene(es, 0.03);
    if (G3.envRT) G3.envRT.dispose();
    G3.envRT = rt;
    for (const m of G3.metalMats) { if (!m.envMap) m.needsUpdate = true; m.envMap = rt.texture; }
  }

  function applyQuality(level) {
    QL = level; Q = QUALITY[level];
    const r = G3.r; if (!r) return;
    G3.usePost = Q.post && !!G3.composer;
    if (G3.usePost) { r.outputEncoding = THREE.LinearEncoding; r.toneMapping = THREE.NoToneMapping; }
    else { r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0; }
    r.shadowMap.enabled = Q.shadows; if (G3.sun) G3.sun.castShadow = Q.shadows;
    if (G3.scene) G3.scene.traverse(o => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) m.needsUpdate = true; });
    resize(); G3.dirty = true;
  }
  function cycleQuality() {
    const p = Save.data.settings.quality, next = Q_ORDER[(Q_ORDER.indexOf(p) + 1) % Q_ORDER.length];
    Save.data.settings.quality = next; Save.write();
    applyQuality(effectiveQuality()); Sound.click();
  }
  function setQuality(q) { Save.data.settings.quality = q; Save.write(); applyQuality(effectiveQuality()); }
  const qualityLabel = () => tr('q' + Save.data.settings.quality) + (Save.data.settings.quality === 'auto' ? ' · ' + tr('q' + QL) : '');

  function initGL() {
    let r;
    try {
      r = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: QL !== 'low', powerPreference: 'high-performance' });
    } catch (e) { return false; }
    G3.r = r;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    G3.canPost = !!THREE.EffectComposer && !!THREE.UnrealBloomPass;
    const sc = G3.scene = new THREE.Scene();
    G3.cam = new THREE.PerspectiveCamera(30, W / H, 0.5, 140);
    G3.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7); sc.add(G3.hemi);
    const sun = G3.sun = new THREE.DirectionalLight(0xffffff, 1.75);
    sun.position.set(-5, 14, 6); sun.castShadow = true;
    const sm = Math.min(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ? 1024 : 2048, r.capabilities.maxTextureSize);   // phones: a quarter of the shadow-map memory
    sun.shadow.mapSize.set(sm, sm);
    Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 11, bottom: -11, near: 2, far: 40 });
    sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.025; sun.shadow.radius = 3;
    sc.add(sun); sc.add(sun.target);
    G3.fill = new THREE.DirectionalLight(0xffd2a0, 0); G3.fill.position.set(4, 3, 12); sc.add(G3.fill);
    sc.fog = new THREE.Fog(0xffffff, 30, 70);
    G3.sky = makeSky(); sc.add(G3.sky);
    G3.pmrem = new THREE.PMREMGenerator(r);

    const bow = new THREE.TorusGeometry(0.3, 0.022, 6, 24, 2.3);
    const ws = new THREE.Shape();
    ws.moveTo(0, 0); ws.lineTo(-0.15, 0.95); ws.quadraticCurveTo(-0.32, 0.62, -0.58, 0.78);
    ws.quadraticCurveTo(-0.6, 0.45, -0.92, 0.45); ws.quadraticCurveTo(-0.62, 0.18, -0.48, 0); ws.lineTo(0, 0);
    const ghostPts = [[0, 1.0], [0.17, 0.97], [0.26, 0.86], [0.29, 0.66], [0.28, 0.42], [0.32, 0.18], [0.37, 0]].map(([a, b]) => new THREE.Vector2(a, b));
    G3.geo = {
      sphere: new THREE.SphereGeometry(1, 20, 14), sLow: new THREE.SphereGeometry(1, 10, 8),
      cyl: new THREE.CylinderGeometry(1, 1, 1, 14), cone: new THREE.ConeGeometry(1, 1, 14), cone4: new THREE.ConeGeometry(1, 1, 4),
      box: new THREE.BoxGeometry(1, 1, 1), octa: new THREE.OctahedronGeometry(1, 0), tetra: new THREE.TetrahedronGeometry(1, 0),
      dodeca: new THREE.DodecahedronGeometry(1, 0), plane: new THREE.PlaneGeometry(1, 1),
      chapan: new THREE.CylinderGeometry(0.17, 0.29, 0.48, 18), hat: new THREE.CylinderGeometry(0.12, 0.17, 0.16, 18),
      hem: new THREE.TorusGeometry(0.285, 0.028, 8, 28), collar: new THREE.TorusGeometry(0.14, 0.03, 8, 20),
      brim: new THREE.TorusGeometry(0.17, 0.03, 8, 24), band: new THREE.TorusGeometry(0.152, 0.012, 6, 24),
      bow, wing: new THREE.ShapeGeometry(ws), ghost: new THREE.LatheGeometry(ghostPts, 20),
      ring: new THREE.TorusGeometry(1, 0.08, 8, 32), dome: new THREE.SphereGeometry(1, 22, 10, 0, TAU, 0, Math.PI / 2),
      blade: new THREE.ConeGeometry(0.028, 0.18, 4).translate(0, 0.09, 0),
    };
    G3.shared = new Set(Object.values(G3.geo));
    G3.glowTex = canvasTex(64, 64, (g) => {
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    });
    G3.ringTex = canvasTex(256, 256, (g) => {
      g.strokeStyle = '#fff'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 112, 0, TAU); g.stroke();
      g.lineWidth = 4; g.beginPath(); g.arc(128, 128, 90, 0, TAU); g.stroke();
      for (let i = 0; i < 8; i++) { g.save(); g.translate(128, 128); g.rotate(i * TAU / 8); koshkar(g, 0, -100, 26, '#fff', 5); g.restore(); }
    });
    G3.wallTex = canvasTex(256, 64, (g, w, h) => ornamentBand(g, 0, 0, w, h, C.red, C.gold), true);
    G3.doorTex = canvasTex(128, 160, (g, w, h) => {
      g.fillStyle = '#9e3a1f'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#e2b23a'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
      koshkar(g, w / 2, h * 0.36, 54, '#e2b23a', 7);
      koshkar(g, w / 2, h * 0.72, 34, '#e2b23a', 5);
    });
    G3.waterTex = canvasTex(128, 128, (g) => {
      g.fillStyle = '#3f8fb4'; g.fillRect(0, 0, 128, 128);
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2;
      const r2 = mulberry32(4);
      for (let i = 0; i < 14; i++) { const x = r2() * 128, y = r2() * 128; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 8, y - 3, x + 16, y); g.stroke(); }
    }, true);
    G3.waterMat = mat('#ffffff', { map: G3.waterTex, r: 0.12, m: 0.25, op: 0.9 });

    if (G3.canPost) {
      const rt = new THREE.WebGLRenderTarget(W, H, { type: r.capabilities.isWebGL2 ? THREE.HalfFloatType : THREE.UnsignedByteType });
      const comp = G3.composer = new THREE.EffectComposer(r, rt);
      comp.addPass(new THREE.RenderPass(sc, G3.cam));
      G3.bloom = new THREE.UnrealBloomPass(new THREE.Vector2(W, H), 0.55, 0.55, 0.88);
      comp.addPass(G3.bloom);
      G3.grade = new THREE.ShaderPass(GRADE_SHADER); comp.addPass(G3.grade);
      G3.fxaa = new THREE.ShaderPass(THREE.FXAAShader); comp.addPass(G3.fxaa);
    }
    G3.room = new THREE.Group(); G3.dyn = new THREE.Group();
    applyQuality(QL);
    sc.add(G3.room, G3.dyn);

    // particles
    const MAXP = 900;
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAXP * 3), 3));
    pg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MAXP * 3), 3));
    G3.pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.2, map: G3.glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    G3.pts.frustumCulled = false; G3.MAXP = MAXP;
    sc.add(G3.pts);

    // shared projectile materials
    G3.pm = {
      shaft: mat('#7a4419', { r: 0.6 }), tip: mat('#cfd3d8', { r: 0.3, m: 0.8 }), fletch: mat('#c0392b'),
      feather: mat('#f0b83a', { e: '#a86a00', ei: 0.6, r: 0.4 }),
      claw: mat('#e08a3a', { r: 0.3, m: 0.85, e: '#7a3a00', ei: 0.4 }),
      magic: mat('#d6a8ff', { e: '#9b4dff', ei: 1.6 }), ghost: mat('#eef7ff', { e: '#8fc3ff', ei: 1.2 }),
      fire: mat('#ffd38a', { e: '#ff6a10', ei: 2 }), rock: mat('#9a7a55', { flat: true }), boulder: mat('#8e8577', { flat: true }),
      xp: mat('#7ff0ff', { e: '#1fb8d8', ei: 1.1, r: 0.2, m: 0.3 }), coin: mat('#ffd34d', { r: 0.22, m: 0.95, e: '#b07a10', ei: 0.65 }), coinRim: mat('#fff0a8', { r: 0.2, m: 1, e: '#c08a18', ei: 0.8 }),
      heart: mat('#ff4a55', { e: '#a8001a', ei: 0.5, r: 0.4 }), charm: mat('#e7ccff', { e: '#a060ff', ei: 1.3 }),
      aim: new THREE.MeshBasicMaterial({ color: col('#ff3b2f'), transparent: true, opacity: 0.45, depthWrite: false }),
    };
    resize();
    fitCamera();
    return true;
  }

  // ---- camera: fit the whole arena under the HUD, tilted like a classic top-down mobile shooter
  const _v = new THREE.Vector3();
  function proj3(x3, y3, z3) { _v.set(x3, y3, z3).project(G3.cam); return { x: (_v.x + 1) / 2 * W, y: (1 - _v.y) / 2 * H }; }
  const proj = (x, h, y) => proj3(X3(x), h, Z3(y));
  function placeCam(d, tz, el) { const c = G3.cam; c.position.set(0, Math.sin(el) * d, tz + Math.cos(el) * d); c.lookAt(0, 0, tz); c.updateMatrixWorld(); }
  function fitCamera() {
    const el = 1.2, c = G3.cam;
    // keep the horizontal view of the 360×640 layout on taller screens: they simply see more vertically
    G3.baseFov = 2 * Math.atan(Math.tan(15 * Math.PI / 180) * H / 640) * 180 / Math.PI;
    c.aspect = W / H; c.fov = G3.baseFov; c.updateProjectionMatrix();
    for (let d = 12; d < 80; d += 0.25) {
      let lo = -8, hi = 8;
      for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; placeCam(d, m, el); if (proj3(0, 0, -6.5).y < 100 + SAFE.t) hi = m; else lo = m; }   // the far edge sits just below the HUD (and the notch)
      const tz = (lo + hi) / 2; placeCam(d, tz, el);
      const bl = proj3(-4.05, 0, 6.6), br = proj3(4.05, 0, 6.6);
      if (bl.y <= H - 8 && bl.x >= 0 && br.x <= W) { G3.camBase = { d, tz, el }; return; }
    }
    G3.camBase = { d: 30, tz: 0, el };
  }

  function disposeTree(obj) {
    obj.traverse(o => {
      if (o.userData.keep) return;
      if (o.geometry && !G3.shared.has(o.geometry)) o.geometry.dispose();
      const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      for (const m of ms) {
        if (m.map && m.map !== G3.glowTex && m.map !== G3.ringTex && m.map !== G3.waterTex && m.map !== G3.doorTex) m.map.dispose();
        if (m !== G3.waterMat && !Object.values(G3.pm).includes(m)) { m.dispose(); G3.metalMats.delete(m); }
      }
    });
  }

  // ---- static room geometry
  function obstaclesFrom(L) {
    const out = [];
    for (let r = 0; r < L.length; r++) for (let c = 0; c < COLS; c++) {
      const ch = L[r][c], x = ARENA.x + c * CELL, y = ARENA.y + r * CELL;
      if (ch === '#') out.push({ x, y, w: CELL, h: CELL, kind: 'stone', seed: r * 31 + c * 7 + 5 });
      else if (ch === 'Y') out.push({ x, y, w: CELL, h: CELL, kind: 'yurt', seed: r * 13 + c });
      else if (ch === '~') out.push({ x, y, w: CELL, h: CELL, kind: 'water', seed: r * 17 + c });
    }
    return out;
  }
  const MENU_OBS = obstaclesFrom(MENU_ROOM);

  function wallBox(len, alongX, x, z) {
    const h = 0.45, th = 0.3;
    const t = G3.wallTex.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(len / 0.9)), 1);
    const side = mat('#ffffff', { map: t, r: 0.85 }), top = mat('#e0b23a', { r: 0.35, m: 0.6 }), end = mat(C.red);
    const geo = new THREE.BoxGeometry(alongX ? len : th, h, alongX ? th : len);
    const mats = alongX ? [end, end, top, end, side, side] : [side, side, top, end, end, end];
    const m = new THREE.Mesh(geo, mats); m.position.set(x, h / 2, z); m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  function makeRock(o, cx, cz) {
    const r = mulberry32(o.seed);
    const g = new THREE.Group();
    if (r() < 0.35 && G3.models.balbal) {
      const b = G3.models.balbal.clone(); b.scale.setScalar(1.05); b.rotation.y = (r() - 0.5) * 0.5;
      b.traverse(o => { if (o.isMesh) o.receiveShadow = true; });
      g.add(b); g.position.set(cx, 0, cz); return g;
    }
    if (r() < 0.35) {
      // балбал тас — ancient steppe stone statue
      const stone = mat('#9a958a', { flat: true, r: 0.95 }), dark = mat('#4a463f');
      g.add(mesh(G3.geo.cyl, stone, 0, 0.06, 0, 0.36, 0.12, 0.3));
      const body = mesh(new THREE.CylinderGeometry(0.19, 0.24, 0.72, 8), stone, 0, 0.48, 0); g.add(body);
      g.add(mesh(G3.geo.sLow, stone, 0, 0.94, 0, 0.19, 0.22, 0.17));
      for (const sx of [-1, 1]) g.add(mesh(G3.geo.box, dark, sx * 0.07, 0.99, 0.16, 0.08, 0.02, 0.02, false));
      g.add(mesh(G3.geo.box, dark, 0, 0.93, 0.17, 0.02, 0.07, 0.02, false));
      g.add(mesh(G3.geo.box, dark, 0, 0.86, 0.16, 0.14, 0.022, 0.02, false));
      const cup = mesh(G3.geo.cyl, stone, 0.02, 0.5, 0.2, 0.07, 0.1, 0.05); g.add(cup);
      g.rotation.y = (r() - 0.5) * 0.5;
    } else {
      const geo = new THREE.IcosahedronGeometry(0.42, 1);
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i);
        const h = Math.sin(vx * 12.9 + vy * 78.2 + vz * 37.7 + o.seed) * 43758.5453;
        const k = 0.82 + (h - Math.floor(h)) * 0.32;
        p.setXYZ(i, vx * k, vy * k * 0.78, vz * k);
      }
      geo.computeVertexNormals();
      const rock = new THREE.Mesh(geo, mat('#8b8780', { flat: true, r: 0.95 }));
      rock.position.y = 0.29; rock.scale.setScalar(1.12); rock.castShadow = rock.receiveShadow = true; rock.rotation.y = r() * 3;
      g.add(rock);
      for (let i = 0; i < 2; i++) {
        const s = mesh(G3.geo.dodeca, mat('#7d7971', { flat: true }), (r() - 0.5) * 0.7, 0.06, 0.3 + r() * 0.15, 0.09 + r() * 0.05);
        s.rotation.set(r() * 3, r() * 3, 0); g.add(s);
      }
    }
    g.position.set(cx, 0, cz);
    return g;
  }

  function makeYurt(cx, cz, s) {
    if (G3.models.yurt) {
      const y = G3.models.yurt.clone(); y.scale.setScalar(0.95 * (s || 1)); y.position.set(cx, 0, cz);
      y.traverse(o => { if (o.isMesh) o.receiveShadow = true; });
      return y;
    }
    const g = new THREE.Group();
    const felt = mat('#efe4cc', { r: 0.95 }), roof = mat('#f8f0de', { r: 0.95 }), wood = mat('#a8703a', { r: 0.6 });
    const bandTex = G3.wallTex.clone(); bandTex.needsUpdate = true; bandTex.repeat.set(5, 1);
    g.add(mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.4, 28), felt, 0, 0.2, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.465, 0.465, 0.12, 28, 1, true), mat('#ffffff', { map: bandTex }), 0, 0.3, 0));
    const dome = mesh(G3.geo.dome, roof, 0, 0.39, 0, 0.475, 0.3, 0.475); g.add(dome);
    g.add(mesh(G3.geo.cyl, mat('#d9cfb8'), 0, 0.39, 0, 0.47, 0.02, 0.47));
    const shan = mesh(G3.geo.ring, wood, 0, 0.69, 0, 0.1, 0.1, 0.1); shan.rotation.x = Math.PI / 2; g.add(shan);
    for (const a of [0.6, -0.6]) { const bar = mesh(G3.geo.box, wood, 0, 0.7, 0, 0.2, 0.025, 0.025); bar.rotation.y = a; g.add(bar); }
    const door = mesh(G3.geo.box, mat('#ffffff', { map: G3.doorTex }), 0, 0.17, 0.45, 0.2, 0.32, 0.04); g.add(door);
    g.add(mesh(G3.geo.box, wood, 0, 0.34, 0.46, 0.25, 0.03, 0.05));
    g.position.set(cx, 0, cz); g.scale.setScalar(s || 1);
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  }

  // cinematic menu backdrop: sunset mountains, a lake, pine forest and a rock for the batyr
  function buildMenuScenery(R, pano) {
    if (!pano) {
    const rnd = mulberry32(42);
    const rockA = mat('#8d6b55', { flat: true, r: 0.9 }), rockB = mat('#6e5245', { flat: true, r: 0.9 }), snow = mat('#efe2d6', { flat: true, r: 0.7 });
    for (let i = 0; i < 12; i++) {
      const h = 7 + rnd() * 11, rad = 5 + rnd() * 6;
      const geo = new THREE.ConeGeometry(rad, h, 8, 4);
      const p = geo.attributes.position;
      for (let k = 0; k < p.count; k++) {
        const y = p.getY(k); if (y < -h / 2 + 0.01) continue;
        const q = Math.sin(p.getX(k) * 3.1 + p.getZ(k) * 1.7 + i) * 43758.5; const f = q - Math.floor(q);
        p.setXYZ(k, p.getX(k) * (0.85 + f * 0.3), y + (f - 0.5) * h * 0.08, p.getZ(k) * (0.85 + f * 0.3));
      }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, i % 2 ? rockA : rockB);
      m.position.set(-40 + i * 7.2 + rnd() * 3, h / 2 - 0.6, -34 - rnd() * 16); m.rotation.y = rnd() * 3;
      R.add(m);
      if (h > 12) { const cap = mesh(G3.geo.cone, snow, m.position.x, m.position.y + h * 0.36, m.position.z, rad * 0.25, h * 0.28, rad * 0.25, false); cap.rotation.y = m.rotation.y; R.add(cap); }
    }
    const hill = mat('#3e4f31', { r: 1 });
    for (let i = 0; i < 8; i++) R.add(mesh(G3.geo.sphere, hill, -24 + i * 7 + rnd() * 2, -1.4, -17 - rnd() * 5, 5.5 + rnd() * 2, 2.6 + rnd() * 1.2, 3.2, false));
    const lake = new THREE.Mesh(new THREE.PlaneGeometry(26, 12), mat('#2a4763', { m: 0.55, r: 0.06 }));
    lake.rotation.x = -Math.PI / 2; lake.position.set(-3, 0.02, -11); R.add(lake);
    const pine = new THREE.ConeGeometry(0.45, 1.7, 7).translate(0, 0.85, 0);
    const N = 190, pines = new THREE.InstancedMesh(pine, new THREE.MeshStandardMaterial({ roughness: 0.95 }), N);
    const dm = new THREE.Object3D(), cc = new THREE.Color();
    let k = 0;
    for (let i = 0; i < N * 3 && k < N; i++) {
      const x = (rnd() - 0.5) * 44, z = -5 - rnd() * 17;
      if (x > -16 && x < 10 && z < -5 && z > -17) continue;
      if (Math.abs(x) < 3.5 && z > -8) continue;
      dm.position.set(x, 0, z); dm.rotation.y = rnd() * 3; dm.scale.setScalar(0.8 + rnd() * 1.6); dm.updateMatrix();
      pines.setMatrixAt(k, dm.matrix); cc.copy(colC(rnd() < 0.5 ? '#2c4a2e' : '#24402a')); pines.setColorAt(k, cc); k++;
    }
    pines.count = k; pines.castShadow = true; R.add(pines);
    }
    // weathered flat stone under the batyr: smooth noise, darker in the cracks, moss toward the ground
    const geo = new THREE.IcosahedronGeometry(1, 4);
    const rp = geo.attributes.position, cols = [];
    const nz = (x, y, z) => Math.sin(x * 3.1 + y * 1.7) * Math.cos(z * 2.3 - x) * 0.5 + Math.sin(x * 7.3 + z * 5.1 + y * 3.3) * 0.18;
    for (let i = 0; i < rp.count; i++) {
      const x = rp.getX(i), y = rp.getY(i), z = rp.getZ(i), f = 1 + nz(x, y, z) * 0.16;
      rp.setXYZ(i, x * f, y * f, z * f);
      const c = colC(y < -0.1 ? '#55603a' : '#8a7b6a').clone().multiplyScalar(0.85 + nz(z * 2, x * 2, y * 2) * 0.3);
      cols.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    const rock = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 }));
    rock.position.set(0, -0.1, 1.4); rock.scale.set(0.95, 0.3, 0.72); rock.castShadow = rock.receiveShadow = true; R.add(rock);
  }

