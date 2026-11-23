  // ---- characters
  function kit() {
    const mats = [];
    const M = (h, o) => { const m = mat(h, o); mats.push(m); return m; };
    return { mats, M };
  }

  // ---- the batyr: pointed дулыға helmet with mail aventail, fur collar, engraved lamellar armour, cape, bow / spear
  function heroTextures() {
    const lam = canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = '#2e2218'; g.fillRect(0, 0, w, h);
      const rw = 32, rh = 44;
      for (let row = -1; row < h / (rh * 0.78) + 1; row++) for (let i = -1; i < w / rw + 1; i++) {
        const x = i * rw + (row % 2 ? rw / 2 : 0), y = row * rh * 0.78;
        const gr = g.createLinearGradient(x, y, x + rw, y + rh);
        gr.addColorStop(0, '#c49c66'); gr.addColorStop(0.45, '#8a6a46'); gr.addColorStop(1, '#4a3826');
        g.fillStyle = gr; rr(g, x + 2, y + 2, rw - 4, rh - 4, 9); g.fill();
        g.strokeStyle = '#21170f'; g.lineWidth = 2.5; g.stroke();
        g.strokeStyle = 'rgba(40,24,10,0.55)'; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(x + rw / 2, y + 14); g.lineTo(x + rw / 2, y + rh - 10); g.stroke();
        g.fillStyle = '#e6c58a'; g.beginPath(); g.arc(x + rw / 2, y + 8, 2.4, 0, TAU); g.fill();
      }
    }, true);
    const eng = canvasTex(256, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#b4925f'); gr.addColorStop(1, '#7c6141');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const r = mulberry32(11);
      for (let i = 0; i < 1500; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,235,190,0.06)' : 'rgba(30,18,8,0.08)'; g.fillRect(r() * w, r() * h, 2, 2); }
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
        const cx = x * 64 + 32 + (y % 2 ? 32 : 0), cy = y * 64 + 36;
        koshkar(g, cx, cy, 40, 'rgba(45,26,10,0.75)', 3.6);
        koshkar(g, cx - 1, cy - 1, 40, 'rgba(255,232,175,0.35)', 1.2);
      }
    }, true);
    const mail = canvasTex(128, 128, (g, w, h) => {
      g.fillStyle = '#26241f'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#9a958c'; g.lineWidth = 1.6;
      for (let y = 0; y < h + 8; y += 6) for (let x = (y / 6 % 2) * 4; x < w + 8; x += 8) { g.beginPath(); g.arc(x, y, 3.3, 0, TAU); g.stroke(); }
    }, true);
    const fur = canvasTex(128, 128, (g, w, h) => {
      g.fillStyle = '#5c4027'; g.fillRect(0, 0, w, h);
      const r = mulberry32(3);
      for (let i = 0; i < 1100; i++) {
        const x = r() * w, y = r() * h, l = 4 + r() * 9, a = Math.PI / 2 + (r() - 0.5) * 0.9;
        g.strokeStyle = r() < 0.5 ? 'rgba(170,128,82,0.6)' : 'rgba(28,16,8,0.6)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      }
    }, true);
    const cloth = canvasTex(128, 128, (g, w, h) => {
      g.fillStyle = '#5e3c28'; g.fillRect(0, 0, w, h);
      const r = mulberry32(8);
      for (let i = 0; i < 300; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,220,180,0.05)' : 'rgba(0,0,0,0.09)'; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 22); }
      for (let y = 0; y < h; y += 3) { g.fillStyle = 'rgba(0,0,0,0.05)'; g.fillRect(0, y, w, 1); }
    }, true);
    return { lam, eng, mail, fur, cloth };
  }

  function makeHero() {
    const { mats, M } = kit();
    const T = G3.htex || (G3.htex = heroTextures());
    const tx = (t, x, y) => { const c = t.clone(); c.needsUpdate = true; c.repeat.set(x, y); return c; };
    const metal = (tex, rx, ry, o) => { const t = tx(tex, rx, ry); const m = M('#ffffff', Object.assign({ map: t }, o)); m.bumpMap = t; m.bumpScale = o.b || 0.01; return m; };
    const helmM = metal(T.eng, 2, 1, { m: 0.9, r: 0.32, b: 0.006 });
    const plateM = metal(T.eng, 1, 1, { m: 0.85, r: 0.36, b: 0.006 });
    const torsoM = metal(T.lam, 4, 1.3, { m: 0.72, r: 0.45, b: 0.012 });
    const skirtM = metal(T.lam, 5, 0.9, { m: 0.72, r: 0.45, b: 0.012, ds: true });
    const mailM = metal(T.mail, 7, 2, { m: 0.85, r: 0.45, b: 0.006, ds: true });
    const furM = metal(T.fur, 4, 1, { r: 1, b: 0.02 });
    const capeM = M('#ffffff', { map: tx(T.cloth, 2, 2), r: 0.95, ds: true });
    const leather = M('#4a2f1d', { r: 0.7 }), cloth = M('#2c2420', { r: 0.95 }), skin = M('#d6a078', { r: 0.5 }), hair = M('#17110d', { r: 0.85 }),
      gold = M('#d9a441', { m: 1, r: 0.28 }), steel = M('#d0d3d8', { m: 1, r: 0.18 }), wood = M('#5a3418', { r: 0.55 }), red = M('#b0201c', { r: 0.8 }),
      eyeM = M('#120d0a', { r: 0.3 }), white = M('#efe6d6');

    const g = new THREE.Group(), up = new THREE.Group(); g.add(up);
    const legs = [];
    for (const s of [-1, 1]) {
      const pv = new THREE.Group(); pv.position.set(0, 0.36, s * 0.1);
      pv.add(mesh(G3.geo.cyl, cloth, 0, -0.08, 0, 0.075, 0.16, 0.075));
      pv.add(mesh(G3.geo.cyl, leather, 0, -0.25, 0, 0.07, 0.22, 0.07));
      pv.add(mesh(G3.geo.box, leather, 0.04, -0.345, 0, 0.17, 0.05, 0.1));
      g.add(pv); legs.push(pv);
    }
    up.add(mesh(new THREE.CylinderGeometry(0.2, 0.29, 0.28, 22, 1, true), skirtM, 0, 0.36, 0));
    up.add(mesh(new THREE.CylinderGeometry(0.235, 0.2, 0.36, 22), torsoM, 0, 0.66, 0, 1, 1, 0.86));
    for (const s of [-1, 1]) up.add(mesh(G3.geo.sphere, plateM, 0.165, 0.7, s * 0.075, 0.07, 0.085, 0.06));
    up.add(mesh(G3.geo.cyl, leather, 0, 0.49, 0, 0.218, 0.07, 0.19));
    const buckle = mesh(G3.geo.cyl, plateM, 0.215, 0.49, 0, 0.068, 0.025, 0.068); buckle.rotation.z = Math.PI / 2; up.add(buckle);
    for (const s of [-1, 1]) { const p = mesh(G3.geo.dome, plateM, 0, 0.8, s * 0.235, 0.125, 0.095, 0.125); p.rotation.x = s * 0.55; up.add(p); }
    // fur collar
    const fg = new THREE.TorusGeometry(0.19, 0.072, 10, 32);
    const fp = fg.attributes.position;
    for (let i = 0; i < fp.count; i++) {
      const x = fp.getX(i), y = fp.getY(i), z = fp.getZ(i);
      const n = 1 + (Math.sin(x * 61 + y * 37) * Math.cos(z * 53 + x * 17)) * 0.18;
      fp.setXYZ(i, x * (1 + (n - 1) * 0.3), y * (1 + (n - 1) * 0.3), z * n);
    }
    fg.computeVertexNormals();
    const collar = new THREE.Mesh(fg, furM); collar.position.y = 0.845; collar.rotation.x = Math.PI / 2; collar.scale.set(1, 0.9, 1); up.add(collar);
    // head
    up.add(mesh(G3.geo.cyl, skin, 0, 0.89, 0, 0.055, 0.08, 0.055));
    up.add(mesh(G3.geo.sphere, skin, 0.01, 0.995, 0, 0.11, 0.125, 0.105));
    for (const s of [-1, 1]) {
      up.add(mesh(G3.geo.sLow, white, 0.093, 1.012, s * 0.04, 0.018, 0.012, 0.02, false));
      up.add(mesh(G3.geo.sLow, eyeM, 0.1, 1.012, s * 0.04, 0.012, 0.012, 0.012, false));
      const br = mesh(G3.geo.box, hair, 0.1, 1.045, s * 0.042, 0.014, 0.016, 0.055, false); br.rotation.x = s * 0.3; up.add(br);
    }
    const nose = mesh(G3.geo.cone, skin, 0.118, 0.99, 0, 0.022, 0.065, 0.022); nose.rotation.z = -Math.PI / 2 - 0.45; up.add(nose);
    up.add(mesh(G3.geo.sphere, hair, 0.062, 0.92, 0, 0.068, 0.065, 0.082));
    up.add(mesh(G3.geo.box, hair, 0.108, 0.957, 0, 0.016, 0.02, 0.09));
    up.add(mesh(new THREE.CylinderGeometry(0.122, 0.205, 0.21, 26, 1, true, Math.PI / 2 + 0.8, TAU - 1.6), mailM, 0, 0.935, 0));
    const prof = [[0.128, 0], [0.133, 0.03], [0.128, 0.08], [0.11, 0.14], [0.08, 0.19], [0.05, 0.23], [0.025, 0.26], [0.014, 0.3], [0.01, 0.36], [0, 0.4]].map(([a, b]) => new THREE.Vector2(a, b));
    up.add(mesh(new THREE.LatheGeometry(prof, 26), helmM, 0, 1.0, 0));
    const rim = mesh(new THREE.TorusGeometry(0.132, 0.014, 8, 30), gold, 0, 1.012, 0); rim.rotation.x = Math.PI / 2; up.add(rim);
    up.add(mesh(G3.geo.sphere, gold, 0, 1.3, 0, 0.02));
    up.add(mesh(G3.geo.sphere, gold, 0, 1.405, 0, 0.016));
    // cape (vertices animated every frame)
    const capeGeo = new THREE.PlaneGeometry(1, 1, 10, 12);
    const cape = new THREE.Mesh(capeGeo, capeM); cape.castShadow = true; cape.frustumCulled = false; up.add(cape);
    // quiver on the back
    const quiver = new THREE.Group(); quiver.position.set(-0.26, 0.66, 0.1); quiver.rotation.x = -0.35;
    quiver.add(mesh(G3.geo.cyl, leather, 0, 0, 0, 0.05, 0.38, 0.05));
    quiver.add(mesh(G3.geo.cyl, gold, 0, 0.17, 0, 0.053, 0.025, 0.053));
    for (let i = 0; i < 4; i++) quiver.add(mesh(G3.geo.box, i % 2 ? red : white, (i - 1.5) * 0.018, 0.24, (i % 2 - 0.5) * 0.02, 0.012, 0.09, 0.035));
    up.add(quiver);
    // sabre at the left hip
    const sword = new THREE.Group(); sword.position.set(0.04, 0.47, -0.235); sword.rotation.set(0.15, 0, -1.2);
    sword.add(mesh(G3.geo.box, leather, 0, -0.24, 0, 0.05, 0.46, 0.028));
    for (const y of [-0.06, -0.3, -0.46]) sword.add(mesh(G3.geo.box, gold, 0, y, 0, 0.056, 0.03, 0.032));
    sword.add(mesh(G3.geo.box, gold, 0, 0.0, 0, 0.12, 0.022, 0.035));
    sword.add(mesh(G3.geo.cyl, leather, 0, 0.07, 0, 0.018, 0.12, 0.018));
    sword.add(mesh(G3.geo.sphere, gold, 0, 0.14, 0, 0.026));
    up.add(sword);
    // arms
    const arms = {};
    for (const s of [-1, 1]) {
      const pv = new THREE.Group(); pv.position.set(0, 0.79, s * 0.25);
      pv.add(mesh(G3.geo.cyl, cloth, 0, -0.1, 0, 0.056, 0.2, 0.056));
      const fore = new THREE.Group(); fore.position.set(0, -0.2, 0);
      fore.add(mesh(G3.geo.cyl, plateM, 0, -0.08, 0, 0.06, 0.16, 0.06));
      fore.add(mesh(G3.geo.sphere, skin, 0, -0.19, 0, 0.046));
      pv.add(fore); up.add(pv);
      arms[s] = { pv, fore };
    }
    // composite bow (left hand)
    const bow = new THREE.Group(); bow.position.set(0, -0.19, 0);
    const arc = mesh(G3.geo.bow, wood, -0.3, 0, 0); arc.rotation.z = -1.15; bow.add(arc);
    for (const s of [-1, 1]) bow.add(mesh(G3.geo.sphere, gold, -0.3 + 0.3 * Math.cos(1.15), s * 0.3 * Math.sin(1.15), 0, 0.022));
    const sx = -0.3 + 0.3 * Math.cos(1.15);
    const string = mesh(G3.geo.box, white, sx, 0, 0, 0.007, 0.55, 0.007, false); bow.add(string);
    const nock = new THREE.Group();
    const shaft = mesh(G3.geo.cyl, G3.pm.shaft, 0.25, 0, 0, 0.011, 0.5, 0.011); shaft.rotation.z = Math.PI / 2; nock.add(shaft);
    const tip = mesh(G3.geo.cone, G3.pm.tip, 0.52, 0, 0, 0.026, 0.07, 0.026); tip.rotation.z = -Math.PI / 2; nock.add(tip);
    bow.add(nock);
    arms[-1].fore.add(bow);
    // spear with red tassels (right hand, menu pose)
    const spear = new THREE.Group(); spear.position.set(0, -0.19, 0);
    spear.add(mesh(G3.geo.cyl, wood, 0, 0.42, 0, 0.016, 1.78, 0.016));
    spear.add(mesh(G3.geo.cyl, gold, 0, 1.3, 0, 0.022, 0.06, 0.022));
    spear.add(mesh(G3.geo.octa, steel, 0, 1.47, 0, 0.04, 0.17, 0.014));
    const tas = mesh(G3.geo.cone, red, 0, 1.22, 0, 0.045, 0.13, 0.045); tas.rotation.z = Math.PI; spear.add(tas);
    for (let i = 0; i < 3; i++) spear.add(mesh(G3.geo.cyl, red, Math.cos(i * 2.1) * 0.03, 1.12, Math.sin(i * 2.1) * 0.03, 0.009, 0.14, 0.009));
    arms[1].fore.add(spear);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return { g, up, mats, legs, arms, bow, string, nock, sx, spear, cape, capeGeo };
  }

  function animateHero(m, o) {
    const sw = o.moving ? Math.sin(o.walk) : 0;
    m.legs[0].rotation.z = sw * 0.5; m.legs[1].rotation.z = -sw * 0.5;
    m.up.position.y = o.moving ? Math.abs(Math.cos(o.walk)) * 0.03 : 0;
    m.up.rotation.z = o.moving ? -0.1 : 0;
    m.up.scale.y = 1 + Math.sin(time * 2) * 0.006;
    const L = m.arms[-1], R = m.arms[1];
    if (o.menu) {
      m.bow.visible = false; m.spear.visible = true;
      R.pv.rotation.set(0.1, 0, 0.12); R.fore.rotation.set(0, 0, 0.55);
      m.spear.rotation.set(-0.1, 0, -0.67);
      L.pv.rotation.set(-0.35, 0, 0.45); L.fore.rotation.set(0, 0, 0.9);
    } else {
      m.bow.visible = true; m.spear.visible = false;
      const pull = o.pull;
      L.pv.rotation.set(0, 0, 1.42); L.fore.rotation.set(0, 0, 0);
      m.bow.rotation.set(0.25, 0, -1.42);
      R.pv.rotation.set(-0.45, 0, 1.15 - pull * 0.25); R.fore.rotation.set(0, 0, -1.3 - pull * 0.6);
      const px = m.sx - pull * 0.14;
      m.string.position.x = px; m.nock.visible = pull > 0.25; m.nock.position.x = px;
    }
    // cape: hangs from the shoulders, sways and streams back while running
    const p = m.capeGeo.attributes.position, wind = o.moving ? 0.22 : 0.03;
    for (let j = 0; j <= 12; j++) {
      const v = j / 12;
      for (let i = 0; i <= 10; i++) {
        const u = i / 10, a = Math.PI + (u - 0.5) * 2.4;
        const rad = 0.25 + v * 0.13;
        const sway = Math.sin(time * 2.4 + v * 3 + u * 2.5) * 0.03 * v + wind * v * v;
        p.setXYZ(j * 11 + i, Math.cos(a) * rad - sway, 0.84 - v * 0.78, Math.sin(a) * rad * 1.05);
      }
    }
    p.needsUpdate = true;
    m.capeGeo.computeVertexNormals();
  }

  // ---- the batyr 3D model (assets/batyr.js holds the GLB as base64 so it also works from file://)
  // It has no skeleton, so legs and cape are animated in the vertex shader.
  const BATYR_VS = [
    'vec3 transformed = vec3(position);',
    'float legW = (1.0 - smoothstep(0.36, 0.44, transformed.y)) * (1.0 - smoothstep(0.1, 0.15, abs(transformed.x)));',
    'if (legW > 0.0) {',
    '  float a = uSwing * (transformed.x > 0.0 ? 1.0 : -1.0) * legW;',
    '  float dy = transformed.y - 0.42, dz = transformed.z;',
    '  transformed.y = 0.42 + dy * cos(a) - dz * sin(a);',
    '  transformed.z = dy * sin(a) + dz * cos(a);',
    '}',
    'float back = smoothstep(-0.03, -0.12, position.z) * (1.0 - smoothstep(0.72, 0.84, position.y));',
    'transformed.z -= uWind * back * (0.84 - position.y) * 0.5;',
    // archer model only: the bow arm (his left, +x) comes up to a shooting pose
    'float aimW = uBow * smoothstep(0.15, 0.22, position.x) * smoothstep(-0.06, 0.0, position.z);',
    'transformed.z += uAim * 0.22 * aimW;',
    'transformed.y += uAim * 0.05 * aimW;',
  ].join('\n');
