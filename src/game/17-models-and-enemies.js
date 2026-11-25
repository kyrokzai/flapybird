  // ---- 3D models supplied as assets/<name>.js (GLB in base64, so the game also runs from file://)
  const MODEL_KEYS = { batyr: 'BATYR_GLB', kydyr: 'KYDYR_GLB', eagle: 'EAGLE_GLB', batyr_bow: 'BATYR_BOW_GLB', batyr_rig: 'BATYR_RIG_GLB', hero: 'HERO_GLB', yurt: 'YURT_GLB', balbal: 'BALBAL_GLB', horse: 'HORSE_GLB',
    prop_palm: 'PROP_PALM_GLB', prop_umbrella: 'PROP_UMBRELLA_GLB', prop_fountain: 'PROP_FOUNTAIN_GLB', prop_tree: 'PROP_TREE_GLB', prop_birch: 'PROP_BIRCH_GLB', lm_portal: 'LM_PORTAL_GLB', civ_woman: 'CIV_WOMAN_GLB',
    stp_palisade: 'STP_PALISADE_GLB', stp_torch: 'STP_TORCH_GLB', stp_banner: 'STP_BANNER_GLB', stp_gate: 'STP_GATE_GLB', stp_yurtbig: 'STP_YURTBIG_GLB', stp_boulder: 'STP_BOULDER_GLB', stp_menhir: 'STP_MENHIR_GLB', stp_tamga: 'STP_TAMGA_GLB', stp_cart: 'STP_CART_GLB', stp_deadtree: 'STP_DEADTREE_GLB', stp_bush: 'STP_BUSH_GLB', stp_skull: 'STP_SKULL_GLB', stp_bones: 'STP_BONES_GLB', stp_wheel: 'STP_WHEEL_GLB', stp_cauldron: 'STP_CAULDRON_GLB',
    prop_gate: 'PROP_GATE_GLB', prop_chest: 'PROP_CHEST_GLB', prop_fence: 'PROP_FENCE_GLB', prop_hedge: 'PROP_HEDGE_GLB', prop_lamp: 'PROP_LAMP_GLB',
    lm_baiterek: 'LM_BAITEREK_GLB', lm_khanshatyr: 'LM_KHANSHATYR_GLB', lm_nuralem: 'LM_NURALEM_GLB', lm_akorda: 'LM_AKORDA_GLB', lm_station: 'LM_STATION_GLB', lm_towers: 'LM_TOWERS_GLB',
    prop_desk: 'PROP_DESK_GLB', prop_server: 'PROP_SERVER_GLB', prop_bench: 'PROP_BENCH_GLB', prop_busstop: 'PROP_BUSSTOP_GLB', prop_car: 'PROP_CAR_GLB', aydahar: 'AYDAHAR_GLB', zhalmauyz: 'ZHALMAUYZ_GLB', dau: 'DAU_GLB', albasty: 'ALBASTY_GLB', mystan: 'MYSTAN_GLB', zheztyrnak: 'ZHEZ_GLB', wolf: 'WOLF_GLB', tarantula: 'TARANTULA_GLB' };
  function loadModel(name, done) {
    const key = MODEL_KEYS[name];
    const go = () => {
      if (!window[key] || !THREE.GLTFLoader || G3.models[name]) { if (done) done(); return; }
      try {
        const bin = Uint8Array.from(atob(window[key]), c => c.charCodeAt(0)).buffer;
        window[key] = null;
        const loader = new THREE.GLTFLoader();
        if (window.MeshoptDecoder) loader.setMeshoptDecoder(window.MeshoptDecoder);   // meshopt-compressed models (the menu batyr)
        loader.parse(bin, '', gltf => {
          G3.models[name] = gltf.scene; gltf.scene.userData.clips = gltf.animations;
          gltf.scene.traverse(o => { if (o.isMesh) { o.userData.keep = true; o.castShadow = true; G3.metalMats.add(o.material); if (G3.envRT) o.material.envMap = G3.envRT.texture; o.material.envMapIntensity = 0.7; } });
          if (name === 'batyr') { G3.batyrScene = gltf.scene; const an = G3.r ? Math.min(8, G3.r.capabilities.getMaxAnisotropy()) : 1; gltf.scene.traverse(o => { if (o.isMesh) for (const t of [o.material.map, o.material.normalMap]) if (t) { t.anisotropy = an; t.needsUpdate = true; } }); }
          if (name === 'kydyr') makeKydyrPortrait();
          if (name === 'prop_tree' || name === 'prop_palm' || name === 'prop_birch') gltf.scene.traverse(o => { if (o.isMesh) windMaterial(o.material, WIND_TREE); });
          if (name === 'yurt' || name === 'balbal' || name === 'horse' || name.startsWith('lm_') || name.startsWith('prop_') || name.startsWith('civ_') || name.startsWith('stp_')) G3.dirty = true;
          if (done) done();
        }, () => { if (done) done(); });
      } catch (e) { if (done) done(); }
    };
    if (window[key]) go();
    else { const sc = document.createElement('script'); sc.src = 'assets/' + name + '.js'; sc.onload = go; sc.onerror = () => done && done(); document.head.appendChild(sc); }
  }

  // portrait of Қыдыр ата for the 2D dialog: render the model once into a texture and copy it to a canvas
  function makeKydyrPortrait() {
    const r = G3.r, w = 240, h = 300;
    const rt = new THREE.WebGLRenderTarget(w, h); rt.texture.encoding = THREE.sRGBEncoding;
    const sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight(0xfff4e0, 0x6a5a48, 1.0));
    const d = new THREE.DirectionalLight(0xffe6c0, 1.4); d.position.set(1.5, 2.5, 3); sc.add(d);
    sc.add(G3.models.kydyr.clone());
    const cam = new THREE.PerspectiveCamera(26, w / h, 0.05, 20); cam.position.set(0.4, 0.62, 2.45); cam.lookAt(0, 0.49, 0);
    const prevRT = r.getRenderTarget(), prevC = r.getClearColor(new THREE.Color()), prevA = r.getClearAlpha();
    r.setRenderTarget(rt); r.setClearColor(0x000000, 0); r.clear(); r.render(sc, cam);
    const px = new Uint8Array(w * h * 4); r.readRenderTargetPixels(rt, 0, 0, w, h, px);
    r.setRenderTarget(prevRT); r.setClearColor(prevC, prevA);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'), id = g.createImageData(w, h);
    for (let y = 0; y < h; y++) id.data.set(px.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
    g.putImageData(id, 0, 0);
    G3.kydyrImg = c; rt.dispose();
  }

  // the eagle model has no skeleton either: wings flap in the vertex shader (shared uniform for every eagle)
  const EAGLE_VS = [
    'vec3 transformed = vec3(position);',
    'float s = position.x > 0.0 ? 1.0 : -1.0;',
    'float a = uFlap * s * smoothstep(0.05, 0.2, abs(position.x));',
    'float x0 = 0.06 * s, y0 = 0.3, dx = position.x - x0, dy = position.y - y0;',
    'transformed.x = x0 + dx * cos(a) - dy * sin(a);',
    'transformed.y = y0 + dx * sin(a) + dy * cos(a);',
  ].join('\n');
  // Айдаһар model: wings flap, legs step and the tail sways in the vertex shader
  const DRAGON_VS = [
    'vec3 transformed = vec3(position);',
    'float lw = 1.0 - smoothstep(0.1, 0.2, position.y);',
    'float pair = (position.z > 0.0 ? 1.0 : -1.0) * (position.x > 0.0 ? 1.0 : -1.0);',
    'transformed.x += (0.2 - position.y) * sin(uWalk * pair) * lw;',
    'float ww = smoothstep(0.1, 0.2, abs(position.z)) * smoothstep(0.22, 0.3, position.y);',
    'if (ww > 0.0) {',
    '  float s = position.z > 0.0 ? 1.0 : -1.0, a = uFlap * s * ww;',
    '  float z0 = 0.09 * s, y0 = 0.32, dz = position.z - z0, dy = position.y - y0;',
    '  transformed.z = z0 + dz * cos(a) - dy * sin(a);',
    '  transformed.y = y0 + dz * sin(a) + dy * cos(a);',
    '}',
    'float tw = smoothstep(-0.12, -0.3, position.x);',
    'transformed.z += sin(uT * 3.0 + position.x * 9.0) * 0.18 * tw * (-position.x - 0.12);',
  ].join('\n');
  function addDragonModel(body) {
    const m = G3.models.aydahar.clone();
    m.scale.setScalar(2.6);
    if (!G3.dragonUni) G3.dragonUni = { uFlap: { value: 0 }, uWalk: { value: 0 }, uT: { value: 0 } };
    m.traverse(o => {
      if (!o.isMesh || o.material.userData.dragon) return;
      o.material.userData.dragon = true;
      o.material.onBeforeCompile = sh => {
        Object.assign(sh.uniforms, G3.dragonUni);
        sh.vertexShader = 'uniform float uFlap;\nuniform float uWalk;\nuniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', DRAGON_VS);
      };
      o.material.needsUpdate = true;
    });
    body.add(m);
    const fire = glow('#ff8a20', 1.2, 0); fire.position.set(1.25, 1.0, 0); body.add(fire);
    return fire;
  }

  // Жалмауыз кемпір model: ragged hem ripples, clawed hands twitch (faster while casting)
  const HAG_VS = [
    'vec3 transformed = vec3(position);',
    'float hem = 1.0 - smoothstep(0.0, 0.5, position.y);',
    'transformed.x += sin(uT * 3.0 + position.y * 12.0 + position.z * 6.0) * 0.014 * hem;',
    'transformed.z += cos(uT * 2.5 + position.y * 10.0 + position.x * 6.0) * 0.014 * hem;',
    'float arm = smoothstep(0.62, 0.82, position.y) * smoothstep(0.12, 0.24, abs(position.x));',
    'transformed.y += sin(uT * uArm + (position.x > 0.0 ? 0.0 : 1.7)) * 0.035 * arm;',
    'transformed.x += cos(uT * uArm * 0.8 + (position.x > 0.0 ? 0.0 : 1.7)) * 0.02 * arm;',
  ].join('\n');
  function addHagModel(body) {
    const m = G3.models.zhalmauyz.clone();
    m.rotation.y = Math.PI / 2; m.scale.setScalar(1.7);
    if (!G3.hagUni) G3.hagUni = { uT: { value: 0 }, uArm: { value: 4 } };
    m.traverse(o => {
      if (!o.isMesh || o.material.userData.hag) return;
      o.material.userData.hag = true;
      o.material.onBeforeCompile = sh => {
        Object.assign(sh.uniforms, G3.hagUni);
        sh.vertexShader = 'uniform float uT;\nuniform float uArm;\n' + sh.vertexShader.replace('#include <begin_vertex>', HAG_VS);
      };
      o.material.needsUpdate = true;
    });
    body.add(m);
    const aura = glow('#b060ff', 2.2, 0); aura.position.y = 1.0; body.add(aura);
    return aura;
  }

  // Дәу model: legs step and the club arm swings up before a stomp or a charge
  const DAU_VS = [
    'vec3 transformed = vec3(position);',
    'float legW = (1.0 - smoothstep(0.3, 0.4, position.y)) * (1.0 - smoothstep(0.2, 0.26, abs(position.x)));',
    'if (legW > 0.0) {',
    '  float a = uSwing * (position.x > 0.0 ? 1.0 : -1.0) * legW;',
    '  float dy = position.y - 0.38, dz = position.z;',
    '  transformed.y = 0.38 + dy * cos(a) - dz * sin(a);',
    '  transformed.z = dy * sin(a) + dz * cos(a);',
    '}',
    'float cw = smoothstep(-0.2, -0.28, position.x) * (1.0 - smoothstep(0.74, 0.8, position.y));',
    'if (cw > 0.0) {',
    '  float a = uClub * cw, dy = transformed.y - 0.72, dz = transformed.z;',
    '  transformed.y = 0.72 + dy * cos(a) - dz * sin(a);',
    '  transformed.z = dy * sin(a) + dz * cos(a);',
    '}',
  ].join('\n');
  function addDauModel(body) {
    const m = G3.models.dau.clone();
    m.rotation.y = Math.PI / 2; m.scale.setScalar(1.9);
    if (!G3.dauUni) G3.dauUni = { uSwing: { value: 0 }, uClub: { value: 0 } };
    m.traverse(o => {
      if (!o.isMesh || o.material.userData.dau) return;
      o.material.userData.dau = true;
      o.material.onBeforeCompile = sh => {
        Object.assign(sh.uniforms, G3.dauUni);
        sh.vertexShader = 'uniform float uSwing;\nuniform float uClub;\n' + sh.vertexShader.replace('#include <begin_vertex>', DAU_VS);
      };
      o.material.needsUpdate = true;
    });
    body.add(m);
  }

  // Албасты model: tendrils and hair stream; each ghost gets its own phase from its world position
  const GHOST_VS = [
    'vec3 transformed = vec3(position);',
    'vec3 wp = modelMatrix[3].xyz; float ph = wp.x * 1.7 + wp.z * 1.3;',
    'float low = 1.0 - smoothstep(0.0, 0.5, position.y);',
    'transformed.x += sin(uT * 2.6 + position.y * 11.0 + ph) * 0.035 * low;',
    'transformed.z += cos(uT * 2.1 + position.y * 9.0 + ph) * 0.035 * low;',
    'float hair = smoothstep(0.55, 0.9, position.y) * smoothstep(0.0, -0.08, position.z);',
    'transformed.z -= (0.5 + 0.5 * sin(uT * 3.0 + position.y * 8.0 + ph)) * 0.03 * hair;',
    'float arm = smoothstep(0.18, 0.28, abs(position.x)) * smoothstep(0.45, 0.6, position.y);',
    'transformed.y += sin(uT * 2.0 + ph + (position.x > 0.0 ? 0.0 : 2.0)) * 0.025 * arm;',
  ].join('\n');
  function addGhostModel(body) {
    const m = G3.models.albasty.clone();
    m.rotation.y = Math.PI / 2; m.scale.setScalar(1.6);   // witches stand taller than the wolves
    if (!G3.ghostUni) G3.ghostUni = { uT: { value: 0 } };
    m.traverse(o => {
      if (!o.isMesh || o.material.userData.ghost) return;
      const mt = o.material; mt.userData.ghost = true;
      mt.transparent = true; mt.opacity = 0.88; mt.depthWrite = true;
      mt.emissive = col('#5f8fc0'); mt.emissiveIntensity = 0.35;
      mt.onBeforeCompile = sh => { Object.assign(sh.uniforms, G3.ghostUni); sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', GHOST_VS); };
      mt.needsUpdate = true;
    });
    body.add(m);
    const gl = glow('#9fd0ff', 2, 0.35); gl.position.y = 0.9; body.add(gl);
  }

  // Жезтырнақ model: hair and hem sway, arms lift forward before she throws her copper claws.
  // Each one gets its own material copy so the aim pose is per enemy (textures and shader program are shared).
  const ZHEZ_VS = [
    'vec3 transformed = vec3(position);',
    'float hem = 1.0 - smoothstep(0.0, 0.35, position.y);',
    'transformed.x += sin(uT * 2.4 + position.y * 12.0 + uPh) * 0.012 * hem;',
    'float hair = smoothstep(0.3, 0.85, position.y) * smoothstep(-0.02, -0.08, position.z);',
    'transformed.z -= (0.5 + 0.5 * sin(uT * 2.8 + position.y * 9.0 + uPh)) * 0.025 * hair;',
    'float arm = smoothstep(0.15, 0.2, abs(position.x)) * smoothstep(0.25, 0.35, position.y) * (1.0 - smoothstep(0.7, 0.76, position.y));',
    'if (arm > 0.0) {',
    '  float a = (-uAim * 1.25 + sin(uT * 2.0 + uPh) * 0.06) * arm, dy = transformed.y - 0.72, dz = transformed.z;',
    '  transformed.y = 0.72 + dy * cos(a) - dz * sin(a);',
    '  transformed.z = dy * sin(a) + dz * cos(a);',
    '}',
  ].join('\n');
  function addZhezModel(body) {
    const m = G3.models.zheztyrnak.clone();
    m.rotation.y = Math.PI / 2; m.scale.setScalar(1.55);
    const uni = { uT: { value: 0 }, uAim: { value: 0 }, uPh: { value: Math.random() * 6 } };
    m.traverse(o => {
      if (!o.isMesh) return;
      const mt = o.material.clone();
      mt.onBeforeCompile = sh => { Object.assign(sh.uniforms, uni); sh.vertexShader = 'uniform float uT;\nuniform float uAim;\nuniform float uPh;\n' + sh.vertexShader.replace('#include <begin_vertex>', ZHEZ_VS); };
      o.material = mt;
    });
    body.add(m);
    return uni;
  }

  // Қасқыр model: diagonal-pair gallop and a swinging tail (own material copy per wolf for its own gait)
  const WOLF_VS = [
    'vec3 transformed = vec3(position);',
    'float legW = 1.0 - smoothstep(0.2, 0.3, position.y);',
    'float pair = (position.x > 0.0 ? 1.0 : -1.0) * (position.z > 0.0 ? 1.0 : -1.0);',
    'transformed.z += (0.3 - position.y) * sin(uRun * pair) * legW;',
    'float tail = smoothstep(-0.28, -0.38, position.z);',
    'transformed.x += sin(uT * 7.0 + uPh) * 0.09 * tail * (-position.z - 0.28) * 4.0;',
  ].join('\n');
  function addWolfModel(body) {
    const m = G3.models.wolf.clone();
    m.rotation.y = Math.PI / 2; m.scale.setScalar(1.1);
    const uni = { uT: { value: 0 }, uRun: { value: 0 }, uPh: { value: Math.random() * 6 } };
    m.traverse(o => {
      if (!o.isMesh) return;
      const mt = o.material.clone();
      mt.onBeforeCompile = sh => { Object.assign(sh.uniforms, uni); sh.vertexShader = 'uniform float uT;\nuniform float uRun;\nuniform float uPh;\n' + sh.vertexShader.replace('#include <begin_vertex>', WOLF_VS); };
      o.material = mt;
    });
    body.add(m);
    return uni;
  }

  // Бүйі model: the eight legs ripple in a wave (own material copy per spider for its own rhythm)
  const SPIDER_VS = [
    'vec3 transformed = vec3(position);',
    'float leg = smoothstep(0.13, 0.24, abs(position.x));',
    'float w = sin(uT * uSp + position.z * 9.0 + (position.x > 0.0 ? 0.0 : 3.1416) + uPh);',
    'transformed.z += w * 0.045 * leg;',
    'transformed.y += max(0.0, w) * 0.025 * leg * smoothstep(0.0, 0.12, position.y + 0.02);',
  ].join('\n');
  function addSpiderModel(body) {
    const m = G3.models.tarantula.clone();
    m.rotation.y = Math.PI / 2; m.scale.setScalar(0.66);
    const uni = { uT: { value: 0 }, uSp: { value: 6 }, uPh: { value: Math.random() * 6 } };
    m.traverse(o => {
      if (!o.isMesh) return;
      const mt = o.material.clone();
      mt.onBeforeCompile = sh => { Object.assign(sh.uniforms, uni); sh.vertexShader = 'uniform float uT;\nuniform float uSp;\nuniform float uPh;\n' + sh.vertexShader.replace('#include <begin_vertex>', SPIDER_VS); };
      o.material = mt;
    });
    body.add(m);
    return uni;
  }

  // Мыстан model: cloak hem sways (own phase per witch from its position), the staff orb pulses brighter before a cast
  const WITCH_VS = [
    'vec3 transformed = vec3(position);',
    'vec3 wp = modelMatrix[3].xyz; float ph = wp.x * 1.3 + wp.z * 1.9;',
    'float hem = 1.0 - smoothstep(0.0, 0.4, position.y);',
    'transformed.x += sin(uT * 2.2 + position.y * 10.0 + ph) * 0.012 * hem;',
    'transformed.z += cos(uT * 1.9 + position.y * 9.0 + ph) * 0.012 * hem;',
    'float hand = smoothstep(0.12, 0.2, position.x) * smoothstep(0.3, 0.4, position.y) * (1.0 - smoothstep(0.62, 0.7, position.y));',
    'transformed.y += sin(uT * 3.0 + ph) * 0.02 * hand;',
  ].join('\n');
  function addWitchModel(body) {
    const m = G3.models.mystan.clone();
    m.rotation.y = Math.PI / 2; m.scale.setScalar(1.55);
    if (!G3.witchUni) G3.witchUni = { uT: { value: 0 } };
    m.traverse(o => {
      if (!o.isMesh || o.material.userData.witch) return;
      o.material.userData.witch = true;
      o.material.onBeforeCompile = sh => { Object.assign(sh.uniforms, G3.witchUni); sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', WITCH_VS); };
      o.material.needsUpdate = true;
    });
    body.add(m);
    const orb = glow('#c070ff', 0.95, 0.8); orb.position.set(0, 1.39, 0.46); body.add(orb);
    return orb;
  }

  // Тұлпар in the menu: the tail swishes and the head nods now and then
  const HORSE_VS = [
    'vec3 transformed = vec3(position);',
    'float tail = smoothstep(0.36, 0.44, position.x) * smoothstep(0.15, 0.3, position.y);',
    'transformed.z += sin(uT * 2.3) * 0.06 * tail * (0.62 - position.y) * 3.0;',
    'float head = smoothstep(-0.28, -0.36, position.x) * smoothstep(0.38, 0.48, position.y);',
    'float nod = max(0.0, sin(uT * 0.9)) * 0.25 * head, dx = position.x + 0.3, dy = position.y - 0.5;',
    'transformed.x = mix(transformed.x, -0.3 + dx * cos(nod) - dy * sin(nod), head);',
    'transformed.y = mix(transformed.y, 0.5 + dx * sin(nod) + dy * cos(nod), head);',
  ].join('\n');

  function makeEagleModel() {
    const g = new THREE.Group(), m = G3.models.eagle.clone();
    m.rotation.y = Math.PI / 2; m.scale.setScalar(0.78); m.position.y = -0.22;
    if (!G3.eagleUni) G3.eagleUni = { uFlap: { value: 0 } };
    m.traverse(o => {
      if (!o.isMesh || o.material.userData.eagle) return;
      o.material.userData.eagle = true;
      o.material.onBeforeCompile = sh => { sh.uniforms.uFlap = G3.eagleUni.uFlap; sh.vertexShader = 'uniform float uFlap;\n' + sh.vertexShader.replace('#include <begin_vertex>', EAGLE_VS); };
      o.material.needsUpdate = true;
    });
    g.add(m);
    return { g, wings: [], model: true };
  }

  function makeBatyr(model, bow) {
    const g = new THREE.Group(), up = new THREE.Group(); g.add(up);
    model.rotation.y = Math.PI / 2; model.scale.setScalar(1.64);
    const uni = { uSwing: { value: 0 }, uWind: { value: 0 }, uAim: { value: 0 }, uBow: { value: bow ? 1 : 0 } };
    model.traverse(o => {
      if (!o.isMesh) return;
      o.castShadow = true;
      const m = o.material;
      G3.metalMats.add(m); if (G3.envRT) m.envMap = G3.envRT.texture;
      m.onBeforeCompile = sh => {
        Object.assign(sh.uniforms, uni);
        sh.vertexShader = 'uniform float uSwing;\nuniform float uWind;\nuniform float uAim;\nuniform float uBow;\n' + sh.vertexShader.replace('#include <begin_vertex>', BATYR_VS);
      };
    });
    up.add(model);
    return { g, up, uni, batyr: true, bow, mats: [] };
  }
  // archer batyr with a real skeleton (auto-rigged): idle, run, aim loop (part of the archery clip), hit, death
  function makeBatyrRig(model, tripo) {
    const g = new THREE.Group(), up = new THREE.Group(); g.add(up);
    // tripo: the owner's comic warrior (assets/hero.js), Tripo skeleton; so far only a run clip, the rest is posed in code
    model.rotation.y = Math.PI / 2; model.scale.setScalar(tripo ? 1.75 : 0.9);
    model.traverse(o => { if (o.isMesh) { o.frustumCulled = false; o.castShadow = true; } });
    up.add(model);
    const clips = model.userData.clips || [], mixer = new THREE.AnimationMixer(model), act = {}, m0 = {};
    for (const c of clips) act[c.name] = mixer.clipAction(c);
    const shot = clips.find(c => c.name === 'shot');
    if (shot) act.aim = mixer.clipAction(THREE.AnimationUtils.subclip(shot, 'aim', 60, 111, 30));
    for (const k of ['hit', 'death']) if (act[k]) { act[k].setLoop(THREE.LoopOnce, 1); act[k].clampWhenFinished = true; }
    if (act.aim) act.aim.timeScale = 1.5;
    const run = clips.find(c => c.name === 'run');
    if (!act.idle && run) { act.idle = mixer.clipAction(THREE.AnimationUtils.subclip(run, 'idle', 15, 16, 30)); m0.pose = true; }   // the most upright frame of the run as a standing pose
    if (m0.pose && !act.shot) {
      // no archery clip yet: the arms are posed from code (see archerPose) and a bow is put in the left hand
      const b = n => model.getObjectByName(n);
      m0.bones = { LU: b('L_Upperarm'), LF: b('L_Forearm'), LH: b('L_Hand'), RU: b('R_Upperarm'), RF: b('R_Forearm'), RH: b('R_Hand'),
        LT: b('L_Thigh'), LC: b('L_Calf'), LFt: b('L_Foot'), LTo: b('L_ToeBase'), RT: b('R_Thigh'), RC: b('R_Calf'), RFt: b('R_Foot'), RTo: b('R_ToeBase') };
      if (Object.values(m0.bones).every(Boolean)) { m0.bow = makeHandBow(); up.add(m0.bow.g); m0.aimW = 0; m0.aimK = 0; } else m0.bones = null;
    }
    if (act.idle) act.idle.play();
    return Object.assign(m0, { g, up, rig: true, mixer, act, cur: 'idle', hitT: 0, lastHp: null, deadK: 0 });
  }
  function animateRig(m, o) {
    const dt = Math.min(0.05, o.dt || 1 / 60);
    if (o.hp !== undefined) {
      if (m.lastHp !== null && o.hp < m.lastHp - 0.5 && o.hp > 0 && !o.moving) m.hitT = 0.5;
      m.lastHp = o.hp;
    }
    if (m.hitT > 0) m.hitT -= dt;
    const aim = !o.menu && enemies.some(e => e.spawn <= 0);
    let want = o.dead ? 'death' : o.moving ? 'run' : m.hitT > 0 ? 'hit' : aim ? 'aim' : 'idle';
    if (o.menu && o.clip && m.act[o.clip]) want = o.clip;
    if (!m.act[want]) want = 'idle';
    if (want !== m.cur && m.act[want]) {
      const from = m.act[m.cur], to = m.act[want];
      to.reset(); to.setEffectiveWeight(1); to.play();
      if (from) from.crossFadeTo(to, want === 'hit' ? 0.08 : want === 'death' ? 0.12 : o.menu ? 0.35 : 0.2, false);
      m.cur = want;
    }
    if (m.act.run) m.act.run.timeScale = o.runK || 1.15;
    m.mixer.update(dt);
    if (m.pose) {
      // clips the warrior does not have yet: breathing while standing, a flinch on a hit, a fall on death
      const still = !o.moving && !o.dead;
      m.up.scale.y = still && !REDUCED_MOTION ? 1 + Math.sin(time * 2.2) * 0.012 : 1;
      m.deadK = o.dead ? Math.min(1, m.deadK + dt * 2.5) : 0;
      const fl = m.hitT > 0 ? Math.sin((0.5 - m.hitT) / 0.5 * Math.PI) * 0.22 : 0;
      m.up.rotation.z = -fl + m.deadK * m.deadK * 1.45;
      m.up.position.y = m.deadK * 0.12;
      if (m.bones) archerPose(m, o, dt);
    }
  }

  // ---- archer pose from code, for a rig that only has a run clip.
  // Each arm bone is turned so it points along a direction given in the hero's own frame (+x forward, +y up, +z his right),
  // so the bones' local axes do not matter. Weight w blends from the clip pose to the archer pose.
  const AP = {
    LU: [1, 0.15, -0.3], LF: [1, 0.12, -0.05],                                    // bow arm straight ahead
    RUdrawn: [-0.35, 0.12, 1], RFdrawn: [0.75, 0.08, -0.65],                     // string hand at the cheek
    RUbow: [0.85, 0.1, 0.45], RFbow: [1, 0.1, -0.3],                             // hand at the bow, taking an arrow
    RUfree: [-0.6, 0.1, 1], RFfree: [-0.2, 0.1, 1],                              // follow-through right after the release
    LT: [0.08, -1, -0.16], LC: [0.02, -1, -0.12], RT: [-0.08, -1, 0.16], RC: [-0.02, -1, 0.12],   // feet apart, knees straight
    LUrest: [0.12, -1, -0.32], LFrest: [0.25, -1, -0.12], RUrest: [0.12, -1, 0.32], RFrest: [0.25, -1, 0.12],   // arms hanging, menu stance
    LUlow: [0.5, -0.85, -0.2], LFlow: [0.7, -0.6, 0], RUlow: [0.1, -1, 0.25], RFlow: [0.3, -0.9, 0.1],   // bow lowered, nothing to shoot
  };
  const _pa = new THREE.Vector3(), _pb = new THREE.Vector3(), _pd = new THREE.Vector3(), _pq = new THREE.Quaternion(), _pw = new THREE.Quaternion(), _pp = new THREE.Quaternion(), _gq = new THREE.Quaternion(), _idq = new THREE.Quaternion();
  const mixDir = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  function pointBone(bone, child, dir, w) {
    bone.getWorldPosition(_pa); child.getWorldPosition(_pb);
    _pd.set(dir[0], dir[1], dir[2]).normalize().applyQuaternion(_gq);
    _pq.setFromUnitVectors(_pb.sub(_pa).normalize(), _pd);
    if (w < 1) _pq.slerp(_idq, 1 - w);
    bone.getWorldQuaternion(_pw); bone.parent.getWorldQuaternion(_pp);
    bone.quaternion.copy(_pp.invert().multiply(_pq.multiply(_pw)));
    bone.updateMatrixWorld(true);
  }
  function standLegs(m, w) {
    const B = m.bones;
    pointBone(B.LT, B.LC, AP.LT, w); pointBone(B.LC, B.LFt, AP.LC, w); pointBone(B.RT, B.RC, AP.RT, w); pointBone(B.RC, B.RFt, AP.RC, w);
    m.g.getWorldPosition(_pb); B.LFt.getWorldPosition(_pa); let low = _pa.y; B.RFt.getWorldPosition(_pa); low = Math.min(low, _pa.y);
    if (m.footY === undefined) m.footY = 0.06;   // ankle height above the ground
    m.up.position.y += (m.footY - (low - _pb.y)) / m.g.scale.y * w;
    m.g.updateMatrixWorld(true);
  }
  function archerPose(m, o, dt) {
    const B = m.bones;
    if (o.menu) {
      // main menu: the clip the player picked plays as is; "stance" is the borrowed run frame straightened into a calm pose
      m.bow.g.visible = false;
      m.menuW = (m.menuW || 0) + ((m.cur === 'idle' ? 1 : 0) - (m.menuW || 0)) * Math.min(1, dt * 8);
      if (m.menuW < 0.02) return;
      m.g.updateMatrixWorld(true); m.g.getWorldQuaternion(_gq);
      standLegs(m, m.menuW);
      for (const [b, c, d] of [[B.LU, B.LF, AP.LUrest], [B.LF, B.LH, AP.LFrest], [B.RU, B.RF, AP.RUrest], [B.RF, B.RH, AP.RFrest]]) pointBone(b, c, d, m.menuW);
      return;
    }
    const ready = !o.moving && !o.dead;
    m.aimW += ((ready ? 1 : 0) - m.aimW) * Math.min(1, dt * 12);
    m.aimK += ((enemies.some(e => e.spawn <= 0) ? 1 : 0) - m.aimK) * Math.min(1, dt * 6);
    m.bow.g.visible = m.aimW > 0.4;
    if (m.aimW < 0.02) return;
    m.g.updateMatrixWorld(true); m.g.getWorldQuaternion(_gq);
    // shot cycle: release → hand back to the bow → draw to the cheek (t runs 0..1 over the shot animation)
    const t = o.shot > 0 ? 1 - o.shot : 1;
    let ru, rf, draw;
    if (t < 0.25) { const k = t / 0.25; ru = mixDir(AP.RUfree, AP.RUfree, k); rf = AP.RFfree; draw = 0; }
    else if (t < 0.55) { const k = (t - 0.25) / 0.3; ru = mixDir(AP.RUfree, AP.RUbow, k); rf = mixDir(AP.RFfree, AP.RFbow, k); draw = 0; }
    else { const k = (t - 0.55) / 0.45; ru = mixDir(AP.RUbow, AP.RUdrawn, k); rf = mixDir(AP.RFbow, AP.RFdrawn, k); draw = k; }
    const a = m.aimK, w = m.aimW;
    standLegs(m, w);   // stand on both feet (the borrowed run frame has a knee up), soles back on the ground
    pointBone(B.LU, B.LF, mixDir(AP.LUlow, AP.LU, a), w); pointBone(B.LF, B.LH, mixDir(AP.LFlow, AP.LF, a), w);
    pointBone(B.RU, B.RF, mixDir(AP.RUlow, ru, a), w); pointBone(B.RF, B.RH, mixDir(AP.RFlow, rf, a), w);
    // the bow sits in the left hand, the string follows the right hand while drawing
    const bw = m.bow; B.LH.getWorldPosition(_pa); m.up.worldToLocal(_pa); bw.g.position.copy(_pa);
    bw.g.rotation.set(-0.12, 0, -(1 - a) * 1.1);
    bw.g.updateMatrixWorld(true);
    B.RH.getWorldPosition(_pb); bw.g.worldToLocal(_pb);
    const d = draw * a, sp = bw.str.geometry.attributes.position;
    sp.setXYZ(1, bw.tipX + (_pb.x - bw.tipX) * d, _pb.y * d, _pb.z * d); sp.needsUpdate = true;
  }
  function makeHandBow() {
    const g = new THREE.Group(), R = 0.49, arc = 1.9;
    const limb = new THREE.Mesh(new THREE.TorusGeometry(R, 0.016, 6, 28, arc), mat('#6b3f1f', { r: 0.55 }));
    limb.rotation.z = -arc / 2; limb.position.x = -R; limb.castShadow = true; g.add(limb);
    g.add(mesh(G3.geo.sphere, mat('#e0b040', { m: 0.8, r: 0.3 }), 0, 0, 0, 0.035, 0.07, 0.035));
    const tipX = -R * (1 - Math.cos(arc / 2)), tipY = R * Math.sin(arc / 2);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([tipX, tipY, 0, tipX, 0, 0, tipX, -tipY, 0], 3));
    const str = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: col('#efe6cc') })); str.frustumCulled = false; g.add(str);
    return { g, str, tipX };
  }
  function animateBatyr(m, o) {
    m.uni.uSwing.value = o.moving ? Math.sin(o.walk) * 0.55 : 0;
    m.uni.uWind.value = o.moving ? 0.35 : 0.05 + Math.sin(time * 1.7) * 0.04;
    m.up.position.y = o.moving ? Math.abs(Math.cos(o.walk)) * 0.03 : 0;
    m.up.rotation.z = o.moving ? -0.08 : (m.bow ? 0 : -(o.pull || 0) * 0.07);
    const aim = !o.menu && !o.moving && enemies.some(e => e.spawn <= 0) ? 1 : 0;
    m.uni.uAim.value += (aim - m.uni.uAim.value) * 0.2;
    m.up.scale.y = 1 + Math.sin(time * 2) * 0.005;
  }

  function addLegs(g, M, hexCol, pts, r, len) {
    const legs = [];
    const m = M(hexCol);
    for (const [x, y, z] of pts) {
      const pv = new THREE.Group(); pv.position.set(x, y, z);
      pv.add(mesh(G3.geo.cyl, m, 0, -len / 2, 0, r, len, r)); g.add(pv); legs.push(pv);
    }
    return legs;
  }

  // rim light on characters: at dusk and at night dark fur and cloaks get a pale edge so they read against the dark road.
  // One shared uniform, set per room by applyMood (black in daylight = no effect).
  function addRim(mt) {
    if (!mt || Array.isArray(mt) || !mt.isMeshStandardMaterial || mt.userData.rim) return;
    mt.userData.rim = true;
    if (!G3.rimUni) G3.rimUni = { uRimCol: { value: new THREE.Color(0) } };
    const prev = mt.onBeforeCompile, prevKey = prev === THREE.Material.prototype.onBeforeCompile ? '' : prev.toString();
    mt.onBeforeCompile = (sh, r) => {
      prev.call(mt, sh, r);
      Object.assign(sh.uniforms, G3.rimUni);
      sh.fragmentShader = 'uniform vec3 uRimCol;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n  totalEmissiveRadiance += uRimCol * pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 3.0);');
    };
    mt.customProgramCacheKey = () => prevKey + '|rim';   // the wrapped shaders differ per enemy kind: keep their programs apart
    mt.needsUpdate = true;
  }
  function makeEnemyModel(e) {
    const { mats, M } = kit();
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const m = { g, body, mats, type: e.type, yaw: -e.face, legs: [], extra: {} };
    const eyes = (hex, pts, s) => { const em = M(hex, { e: hex, ei: 2 }); for (const p of pts) body.add(mesh(G3.geo.sLow, em, p[0], p[1], p[2], s, s, s, false)); };
    switch (e.type) {
      case 'w': {
        if (G3.models.wolf) { m.extra.model = true; m.extra.uni = addWolfModel(body); break; }
        const fur = M('#8d929b', { r: 0.9 }), dark = M('#62666e', { r: 0.9 }), light = M('#c3c6cc', { r: 0.9 }), black = M('#111');
        body.add(mesh(G3.geo.sphere, fur, 0, 0.38, 0, 0.36, 0.19, 0.17));
        body.add(mesh(G3.geo.sphere, light, 0.2, 0.4, 0, 0.18, 0.18, 0.15));
        body.add(mesh(G3.geo.sphere, fur, 0.38, 0.52, 0, 0.15, 0.13, 0.13));
        const sn = mesh(G3.geo.cone, dark, 0.55, 0.49, 0, 0.07, 0.2, 0.065); sn.rotation.z = -Math.PI / 2; body.add(sn);
        body.add(mesh(G3.geo.sLow, black, 0.65, 0.49, 0, 0.03));
        for (const s of [-1, 1]) body.add(mesh(G3.geo.cone4, dark, 0.35, 0.67, s * 0.075, 0.045, 0.12, 0.045));
        eyes('#ff3b2f', [[0.49, 0.55, 0.06], [0.49, 0.55, -0.06]], 0.024);
        const tail = new THREE.Group(); tail.position.set(-0.32, 0.44, 0);
        const tm = mesh(G3.geo.cone, fur, -0.15, 0.06, 0, 0.075, 0.36, 0.075); tm.rotation.z = 1.2; tail.add(tm); body.add(tail); m.extra.tail = tail;
        m.legs = addLegs(body, M, '#5f636b', [[0.2, 0.32, 0.09], [0.2, 0.32, -0.09], [-0.2, 0.32, 0.09], [-0.2, 0.32, -0.09]], 0.045, 0.32);
        break;
      }
      case 's': {
        if (G3.models.tarantula) { m.extra.model = true; m.extra.uni = addSpiderModel(body); break; }
        const shell = M('#4a2d1b', { r: 0.5 }), head = M('#5b3a24', { r: 0.6 }), legc = M('#2a1a10');
        body.add(mesh(G3.geo.sphere, shell, -0.14, 0.21, 0, 0.2, 0.16, 0.18));
        const sp = M('#ff8a2a', { e: '#ff6a00', ei: 0.6 });
        body.add(mesh(G3.geo.sLow, sp, -0.12, 0.36, 0, 0.05, 0.02, 0.05), mesh(G3.geo.sLow, sp, -0.24, 0.32, 0, 0.04, 0.02, 0.04));
        body.add(mesh(G3.geo.sphere, head, 0.1, 0.18, 0, 0.12));
        eyes('#ff3a2a', [[0.2, 0.22, 0.04], [0.2, 0.22, -0.04], [0.19, 0.25, 0.02], [0.19, 0.25, -0.02]], 0.018);
        for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
          const pv = new THREE.Group(); pv.position.set(0.12 - i * 0.07, 0.2, s * 0.08);
          const leg = mesh(G3.geo.cyl, legc, 0, 0, s * 0.17, 0.016, 0.36, 0.016); leg.rotation.x = Math.PI / 2; pv.add(leg);
          pv.rotation.y = (i - 1.5) * 0.45 * s; pv.rotation.x = s * 0.55; pv.userData = { base: pv.rotation.y, s, i };
          body.add(pv); m.legs.push(pv);
        }
        break;
      }
      case 'j': {
        if (G3.models.zheztyrnak) { m.extra.model = true; m.extra.uni = addZhezModel(body); break; }
        const dress = M('#b0222c', { r: 0.6 }), gold = M('#e8b830', { r: 0.3, m: 0.7 }), skin = M('#efe2d2'), hair = M('#120e14', { r: 0.5 }), copper = M('#e08a3a', { r: 0.25, m: 0.9 });
        body.add(mesh(G3.geo.cone, dress, 0, 0.32, 0, 0.27, 0.62, 0.27));
        const hm = mesh(G3.geo.hem, gold, 0, 0.04, 0, 0.92, 0.92, 0.92); hm.rotation.x = Math.PI / 2; body.add(hm);
        body.add(mesh(G3.geo.cyl, dress, 0, 0.66, 0, 0.1, 0.2, 0.1));
        body.add(mesh(G3.geo.sphere, skin, 0.01, 0.86, 0, 0.135));
        body.add(mesh(G3.geo.sphere, hair, -0.03, 0.89, 0, 0.15, 0.15, 0.155));
        const lh = mesh(G3.geo.cone, hair, -0.1, 0.56, 0, 0.14, 0.6, 0.16); lh.rotation.z = Math.PI; body.add(lh);
        eyes('#ffcf3a', [[0.125, 0.87, 0.05], [0.125, 0.87, -0.05]], 0.022);
        m.extra.arms = [];
        for (const s of [-1, 1]) {
          const pv = new THREE.Group(); pv.position.set(0, 0.72, s * 0.14);
          pv.add(mesh(G3.geo.cyl, skin, 0, -0.14, 0, 0.035, 0.28, 0.035));
          for (let c = -1; c <= 1; c++) { const cl = mesh(G3.geo.cone, copper, 0.07, -0.3, c * 0.03, 0.016, 0.18, 0.016); cl.rotation.z = -1.2; pv.add(cl); }
          body.add(pv); m.extra.arms.push(pv);
        }
        break;
      }
      case 'a': {
        if (G3.models.albasty) { m.extra.model = true; addGhostModel(body); break; }
        const sheet = M('#dbe7f1', { op: 0.78, e: '#8fb8e0', ei: 0.35, ds: true, r: 0.6 }), hollow = M('#1b2433'), hair = M('#f7fbff', { op: 0.85, e: '#ffffff', ei: 0.3 });
        const gb = mesh(G3.geo.ghost, sheet, 0, 0, 0, 1, 1, 1); body.add(gb);
        body.add(mesh(G3.geo.sphere, hair, -0.05, 0.86, 0, 0.2, 0.17, 0.21));
        for (const s of [-1, 1]) body.add(mesh(G3.geo.sLow, hollow, 0.23, 0.76, s * 0.08, 0.035, 0.05, 0.035, false));
        body.add(mesh(G3.geo.sLow, hollow, 0.25, 0.62, 0, 0.03, 0.05, 0.04, false));
        const gl = glow('#a8d0ff', 1.1, 0.35); gl.position.y = 0.55; body.add(gl);
        break;
      }
      case 'm': {
        if (G3.models.mystan) { m.extra.model = true; m.extra.orb = addWitchModel(body); break; }
        const cloak = M('#3d5a3a', { r: 0.9 }), hood = M('#253a24', { r: 0.9 }), face = M('#c9d48f'), wood = M('#5a3a1e'), gold = M('#d8b040', { m: 0.6, r: 0.4 });
        body.add(mesh(G3.geo.cone, cloak, 0, 0.38, 0, 0.3, 0.76, 0.3));
        const hm = mesh(G3.geo.hem, gold, 0, 0.04, 0, 1.03, 1.03, 1.03); hm.rotation.x = Math.PI / 2; body.add(hm);
        body.add(mesh(G3.geo.cone, hood, -0.02, 0.9, 0, 0.17, 0.34, 0.17));
        body.add(mesh(G3.geo.sphere, face, 0.08, 0.74, 0, 0.1));
        const nose = mesh(G3.geo.cone, face, 0.19, 0.72, 0, 0.025, 0.09, 0.025); nose.rotation.z = -1.9; body.add(nose);
        eyes('#e04cff', [[0.16, 0.77, 0.04], [0.16, 0.77, -0.04]], 0.02);
        body.add(mesh(G3.geo.cyl, wood, 0.06, 0.5, 0.3, 0.025, 1.0, 0.025));
        const orb = mesh(G3.geo.sphere, M('#e0a8ff', { e: '#b050ff', ei: 2 }), 0.06, 1.05, 0.3, 0.07, 0.07, 0.07, false); body.add(orb);
        const og = glow('#c070ff', 0.7, 0.8); og.position.set(0.06, 1.05, 0.3); body.add(og); m.extra.orb = og;
        break;
      }
      case 'D': {
        if (G3.models.dau) { m.extra.model = true; addDauModel(body); break; }
        const skin = M('#c98b5c', { r: 0.75 }), belly = M('#dca078'), leather = M('#6b4220', { r: 0.9 }), wood = M('#5c3a1c', { r: 0.8 }),
          white = M('#f6f1e8'), ivory = M('#efe2c4'), dark = M('#24160e'), steel = M('#9a9a9a', { m: 0.8, r: 0.35 });
        m.legs = addLegs(body, M, '#8a5634', [[0, 0.48, 0.26], [0, 0.48, -0.26]], 0.14, 0.48);
        body.add(mesh(G3.geo.sphere, skin, 0, 0.92, 0, 0.6, 0.56, 0.56));
        body.add(mesh(G3.geo.sphere, belly, 0.24, 0.82, 0, 0.42, 0.42, 0.44));
        body.add(mesh(G3.geo.cyl, leather, 0, 0.5, 0, 0.58, 0.24, 0.58));
        body.add(mesh(G3.geo.sphere, skin, 0.12, 1.56, 0, 0.3));
        body.add(mesh(G3.geo.sphere, white, 0.36, 1.6, 0, 0.12));
        body.add(mesh(G3.geo.sphere, M('#ff2d2d', { e: '#ff1a1a', ei: 1.6 }), 0.46, 1.6, 0, 0.06, 0.06, 0.06, false));
        const brow = mesh(G3.geo.box, dark, 0.4, 1.74, 0, 0.06, 0.05, 0.3); brow.rotation.x = 0; body.add(brow);
        body.add(mesh(G3.geo.cone, ivory, 0.06, 1.94, 0, 0.07, 0.32, 0.07));
        body.add(mesh(G3.geo.sphere, dark, 0.3, 1.36, 0, 0.18, 0.13, 0.24));
        for (const s of [-1, 1]) { const arm = mesh(G3.geo.cyl, skin, 0.05, 1.05, s * 0.62, 0.11, 0.55, 0.11); arm.rotation.x = s * 0.35; body.add(arm); }
        const club = new THREE.Group(); club.position.set(0.2, 0.82, 0.7);
        const cm = mesh(G3.geo.cone, wood, 0.0, 0.45, 0, 0.16, 1.0, 0.16); cm.rotation.z = Math.PI; club.add(cm);
        for (let i = 0; i < 5; i++) { const sp = mesh(G3.geo.cone, steel, Math.cos(i * 1.3) * 0.12, 0.65 + i * 0.07, Math.sin(i * 1.3) * 0.12, 0.03, 0.1, 0.03); sp.rotation.set(Math.sin(i * 1.3) * 1.4, 0, -Math.cos(i * 1.3) * 1.4); club.add(sp); }
        body.add(club); m.extra.club = club;
        break;
      }
      case 'J': {
        if (G3.models.zhalmauyz) { m.extra.model = true; m.extra.aura = addHagModel(body); break; }
        const robe = M('#4a2b63', { r: 0.85 }), gold = M('#e8b830', { r: 0.3, m: 0.7 }), skin = M('#b5c08a'), hair = M('#c4c9c9', { r: 0.9 }), copper = M('#e08a3a', { r: 0.25, m: 0.9 }), dark = M('#2a0d0d');
        body.add(mesh(G3.geo.cone, robe, 0, 0.72, 0, 0.55, 1.44, 0.55));
        const hm = mesh(G3.geo.hem, gold, 0, 0.06, 0, 1.88, 1.88, 1.88); hm.rotation.x = Math.PI / 2; body.add(hm);
        body.add(mesh(G3.geo.sphere, robe, 0, 1.32, 0, 0.36, 0.2, 0.36));
        body.add(mesh(G3.geo.sphere, skin, 0.05, 1.6, 0, 0.24));
        const hairG = new THREE.Group(); hairG.position.set(0, 1.62, 0);
        for (let i = 0; i < 16; i++) {
          const a = i / 16 * TAU, sp = mesh(G3.geo.cone, hair, -0.05 + Math.cos(a) * 0.12, Math.sin(a) * 0.2 + 0.06, Math.sin(a + 1) * 0.2, 0.06, 0.38, 0.06);
          sp.lookAt(new THREE.Vector3(Math.cos(a) * 3 - 2, Math.sin(a) * 4 + 1.6, Math.sin(a + 1) * 4)); sp.rotateX(Math.PI / 2); hairG.add(sp);
        }
        body.add(hairG);
        eyes('#ffe23a', [[0.24, 1.66, 0.08], [0.24, 1.66, -0.08]], 0.04);
        const nose = mesh(G3.geo.cone, skin, 0.3, 1.58, 0, 0.04, 0.16, 0.04); nose.rotation.z = -1.9; body.add(nose);
        body.add(mesh(G3.geo.box, dark, 0.27, 1.48, 0, 0.04, 0.05, 0.14));
        m.extra.arms = [];
        for (const s of [-1, 1]) {
          const pv = new THREE.Group(); pv.position.set(0, 1.28, s * 0.32);
          const arm = mesh(G3.geo.cyl, robe, 0.1, -0.12, s * 0.15, 0.08, 0.45, 0.08); arm.rotation.x = s * 1.0; pv.add(arm);
          for (let c = -1; c <= 1; c++) { const cl = mesh(G3.geo.cone, copper, 0.2 + c * 0.02, -0.28, s * 0.38 + c * 0.05, 0.025, 0.26, 0.025); cl.rotation.z = -1.3; pv.add(cl); }
          body.add(pv); m.extra.arms.push(pv);
        }
        break;
      }
      case 'A': {
        if (G3.models.aydahar) { m.extra.model = true; m.extra.fire = addDragonModel(body); break; }
        const scale = M('#3b9a5b', { r: 0.55, m: 0.1 }), belly = M('#e2c25a', { r: 0.7 }), dark = M('#2b6a40', { r: 0.6 }), horn = M('#efe2c4'), wingm = M('#2f7d4a', { ds: true, r: 0.7 });
        m.legs = addLegs(body, M, '#2b6a40', [[0.35, 0.42, 0.3], [0.35, 0.42, -0.3], [-0.35, 0.42, 0.3], [-0.35, 0.42, -0.3]], 0.1, 0.42);
        body.add(mesh(G3.geo.sphere, scale, 0, 0.8, 0, 0.75, 0.45, 0.5));
        body.add(mesh(G3.geo.sphere, belly, 0.08, 0.66, 0, 0.6, 0.32, 0.42));
        for (let i = 0; i < 6; i++) body.add(mesh(G3.geo.cone, dark, 0.4 - i * 0.17, 1.22 - Math.abs(i - 2) * 0.03, 0, 0.06, 0.18, 0.06));
        const neck = mesh(G3.geo.cyl, scale, 0.68, 1.06, 0, 0.16, 0.55, 0.16); neck.rotation.z = -0.85; body.add(neck);
        const head = new THREE.Group(); head.position.set(0.95, 1.28, 0);
        head.add(mesh(G3.geo.sphere, scale, 0, 0, 0, 0.3, 0.2, 0.22));
        head.add(mesh(G3.geo.box, scale, 0.24, -0.05, 0, 0.26, 0.12, 0.18));
        for (const s of [-1, 1]) {
          const h = mesh(G3.geo.cone, horn, -0.18, 0.18, s * 0.1, 0.04, 0.26, 0.04); h.rotation.set(s * 0.3, 0, 0.9); head.add(h);
          head.add(mesh(G3.geo.sLow, M('#ffd22e', { e: '#ffb000', ei: 2 }), 0.12, 0.08, s * 0.13, 0.04, 0.03, 0.03, false));
        }
        const fireG = glow('#ff8a20', 0.9, 0); fireG.position.set(0.42, -0.05, 0); head.add(fireG); m.extra.fire = fireG;
        body.add(head); m.extra.head = head;
        m.extra.tail = [];
        for (let i = 0; i < 7; i++) {
          const seg = mesh(G3.geo.sphere, i % 2 ? dark : scale, -0.72 - i * 0.2, 0.7 - i * 0.07, 0, 0.17 - i * 0.02, 0.13 - i * 0.015, 0.15 - i * 0.018);
          body.add(seg); m.extra.tail.push(seg);
        }
        m.extra.wings = [];
        for (const s of [-1, 1]) {
          const pv = new THREE.Group(); pv.position.set(0.05, 1.05, s * 0.3);
          const wg = new THREE.Mesh(G3.geo.wing, wingm); wg.scale.setScalar(1.55); wg.rotation.x = s > 0 ? Math.PI / 2 : -Math.PI / 2; wg.castShadow = true;
          pv.add(wg); body.add(pv); m.extra.wings.push({ pv, s });
        }
        break;
      }
    }
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; addRim(o.material); } });
    m.ring = decal(G3.ringTex, '#ffe28a', 1.6, 0); g.add(m.ring);
    m.warn = decal(G3.ringTex, '#ff3b2f', e.r / CELL * 3.2, 0); g.add(m.warn);
    m.burn = glow('#ff8a20', 0.7, 0); m.burn.position.y = MODEL_H[e.type] * 0.6; g.add(m.burn);
    m.slow = glow('#8fe0ff', 1.0, 0); m.slow.position.y = MODEL_H[e.type] * 0.4; g.add(m.slow);
    m.shadow = blobShadow((e.boss ? 2.6 : 1.2) * (e.r / 13) * 0.9, e.fly ? 0.3 : 0.42); m.g.add(m.shadow);
    if (!e.boss) addEliteVisuals(e, m);
    return m;
  }

  function setFlash(m, on) {
    if (m.flashOn === on) return;
    m.flashOn = on;
    for (const mt of m.mats) {
      if (on) { mt.emissive.setRGB(1, 1, 1); mt.emissiveIntensity = 0.6; }
      else { mt.emissive.copy(mt.userData.e); mt.emissiveIntensity = mt.userData.ei; }
    }
  }

  function updateEnemyModel(e, m) {
    m.g.position.set(X3(e.x), 0, Z3(e.y));
    const toP = angTo(e, player);
    const want = ['j', 'm', 'a', 'J', 'D'].includes(e.type) ? toP : e.face;
    let d = -want - m.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); m.yaw += d * 0.18;
    m.g.rotation.y = m.yaw;
    const t = e.spawn > 0 ? 1 - e.spawn / 0.9 : 1;
    m.body.scale.setScalar((0.25 + 0.75 * t) * MS);
    const pu = e.punch || 0; if (pu > 0) { m.body.scale.x *= 1 + pu * 0.22; m.body.scale.z *= 1 + pu * 0.22; m.body.scale.y *= 1 - pu * 0.16; }
    for (const l of m.legs) l.visible = t > 0.6;
    m.ring.material.opacity = e.spawn > 0 ? 0.9 * (1 - t) : 0; m.ring.rotation.z = time * 2;
    m.warn.material.opacity = e.wind ? 0.45 + Math.sin(time * 18) * 0.25 : 0;
    m.burn.material.opacity = e.burn > 0 ? 0.6 + Math.sin(time * 25) * 0.25 : 0;
    m.slow.material.opacity = e.slow > 0 ? 0.45 : 0;
    updateEliteVisuals(e, m);
    setFlash(m, e.flash > 0);
    const moving = Math.hypot(e.vx, e.vy) > 5, a = e.anim;
    switch (e.type) {
      case 'w':
        if (m.extra.model) {
          const u = m.extra.uni; u.uT.value = time;
          const sp = e.st === 'dash' ? 22 : 15;
          u.uRun.value = moving ? Math.sin(a * sp + u.uPh.value) * 0.55 : 0;
          m.body.position.y = e.wind ? -0.06 : (moving ? Math.abs(Math.sin(a * sp)) * 0.03 : 0);
          m.body.rotation.z = e.st === 'dash' ? -0.08 : 0;
          break;
        }
        m.legs.forEach((l, i) => { l.rotation.z = moving ? Math.sin(a * 15 + (i % 3 ? 0 : Math.PI)) * 0.7 : 0; });
        m.extra.tail.rotation.y = Math.sin(a * 9) * 0.4;
        m.body.position.y = e.wind ? -0.06 : 0;
        break;
      case 's':
        if (m.extra.model) { const u = m.extra.uni; u.uT.value = time; u.uSp.value = moving ? 20 : 4; break; }
        m.legs.forEach(l => { l.rotation.y = l.userData.base + Math.sin(a * 22 + l.userData.i * 1.7 + (l.userData.s > 0 ? 1 : 0)) * 0.3; });
        break;
      case 'j':
        if (m.extra.model) {
          const u = m.extra.uni; u.uT.value = time;
          u.uAim.value += ((e.st === 'aim' ? 1 : 0) - u.uAim.value) * 0.2;
          m.body.position.y = Math.sin(a * 3) * 0.015;
          break;
        }
        m.extra.arms.forEach((pv, i) => { pv.rotation.z = e.st === 'aim' ? -1.35 : Math.sin(a * 3 + i) * 0.25; });
        m.body.position.y = Math.sin(a * 3) * 0.02;
        break;
      case 'a':
        if (m.extra.model) { G3.ghostUni.uT.value = time; m.body.position.y = 0.12 + Math.sin(a * 2.4) * 0.07; break; }
        m.body.position.y = 0.3 + Math.sin(a * 3) * 0.08; break;
      case 'm':
        if (m.extra.model) { G3.witchUni.uT.value = time; const charge = e.cd < 0.6 ? 1 - e.cd / 0.6 : 0; m.extra.orb.material.opacity = 0.55 + Math.sin(a * 5) * 0.2 + charge * 0.45; m.extra.orb.scale.setScalar(0.8 + charge * 0.7); break; }
        m.extra.orb.material.opacity = 0.6 + Math.sin(a * 5) * 0.3; break;
      case 'D':
        if (m.extra.model) {
          G3.dauUni.uSwing.value = moving ? Math.sin(a * 7) * 0.4 : 0;
          const want = e.wind ? -1.5 : Math.sin(a * 3) * 0.08;
          G3.dauUni.uClub.value += (want - G3.dauUni.uClub.value) * 0.25;
          m.body.position.y = moving ? Math.abs(Math.sin(a * 7)) * 0.04 : 0;
          break;
        }
        m.legs.forEach((l, i) => { l.rotation.z = moving ? Math.sin(a * 8 + i * Math.PI) * 0.5 : 0; });
        m.extra.club.rotation.z = e.wind ? 1.1 + Math.sin(time * 30) * 0.05 : Math.sin(a * 4) * 0.15;
        m.body.position.y = moving ? Math.abs(Math.sin(a * 8)) * 0.05 : 0;
        break;
      case 'J':
        if (m.extra.model) {
          G3.hagUni.uT.value = a; G3.hagUni.uArm.value = e.wind ? 22 : 4;
          m.extra.aura.material.opacity = e.wind ? 0.55 + Math.sin(time * 20) * 0.15 : 0.15;
          m.body.position.y = Math.sin(a * 2) * 0.05 + 0.06;
          break;
        }
        m.extra.arms.forEach((pv, i) => { pv.rotation.z = e.wind ? -1.1 : Math.sin(a * 3 + i * 2) * 0.3; });
        m.body.position.y = Math.sin(a * 2) * 0.05 + 0.05;
        break;
      case 'A':
        if (m.extra.model) {
          G3.dragonUni.uFlap.value = Math.sin(a * 4.5) * 0.5 - 0.1;
          G3.dragonUni.uWalk.value = moving ? Math.sin(a * 8) * 0.45 : 0;
          G3.dragonUni.uT.value = a;
          m.extra.fire.material.opacity = e.wind ? 0.95 : 0;
          m.body.rotation.z = e.wind ? 0.08 : 0;
          break;
        }
        m.legs.forEach((l, i) => { l.rotation.z = moving ? Math.sin(a * 9 + (i % 3 ? 0 : Math.PI)) * 0.5 : 0; });
        m.extra.wings.forEach(({ pv, s }) => { pv.rotation.x = s * (Math.sin(a * 5) * 0.45 - 0.15); });
        m.extra.tail.forEach((seg, i) => { seg.position.z = Math.sin(a * 4 - i * 0.6) * 0.05 * i; });
        m.extra.fire.material.opacity = e.wind ? 0.9 : 0;
        m.extra.head.rotation.z = e.wind ? -0.25 : 0;
        break;
    }
  }

  function makeEagle() {
    const g = new THREE.Group(), brown = mat('#7a4a1e', { r: 0.8 }), cream = mat('#f4e3b5'), gold = mat('#f4c430', { m: 0.6, r: 0.3 });
    g.add(mesh(G3.geo.sphere, brown, 0, 0, 0, 0.16, 0.09, 0.1));
    g.add(mesh(G3.geo.sphere, cream, 0.15, 0.04, 0, 0.07));
    const bk = mesh(G3.geo.cone, gold, 0.23, 0.03, 0, 0.025, 0.07, 0.025); bk.rotation.z = -Math.PI / 2; g.add(bk);
    g.add(mesh(G3.geo.box, brown, -0.2, 0, 0, 0.14, 0.015, 0.1));
    const wings = [];
    for (const s of [-1, 1]) { const pv = new THREE.Group(); pv.position.set(0, 0.03, s * 0.06); pv.add(mesh(G3.geo.box, brown, 0, 0, s * 0.18, 0.16, 0.015, 0.36)); g.add(pv); wings.push({ pv, s }); }
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return { g, wings };
  }

