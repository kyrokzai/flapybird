  // =================================================================== life: ambient motion around the arena + combat effects
  G3.windUni = { uT: { value: 0 } };
  const WIND_GRASS = [
    'vec3 transformed = vec3(position);',
    '#ifdef USE_INSTANCING',
    'float ph = instanceMatrix[3].x * 1.7 + instanceMatrix[3].z * 1.3;',
    '#else',
    'float ph = 0.0;',
    '#endif',
    'float bend = position.y / 0.18;',
    'transformed.x += (sin(uT * 2.2 + ph) * 0.05 + sin(uT * 5.1 + ph * 2.0) * 0.015) * bend;',
    'transformed.z += cos(uT * 1.7 + ph) * 0.03 * bend;',
  ].join('\n');
  const WIND_TREE = [
    'vec3 transformed = vec3(position);',
    'vec3 wp = modelMatrix[3].xyz; float ph = wp.x * 0.9 + wp.z * 0.7;',
    'float k = smoothstep(-0.15, 0.48, position.y);',
    'transformed.x += sin(uT * 1.6 + ph) * 0.022 * k;',
    'transformed.z += cos(uT * 1.2 + ph) * 0.016 * k;',
  ].join('\n');
  function windMaterial(mt, code) {
    if (mt.userData.wind) return;
    mt.userData.wind = true;
    mt.onBeforeCompile = sh => { sh.uniforms.uT = G3.windUni.uT; sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', code); };
    mt.needsUpdate = true;
  }

  function softTex(draw, size) { return canvasTex(size || 64, size || 64, draw); }
  function lifeTextures() {
    if (G3.lifeTex) return G3.lifeTex;
    const trail = canvasTex(128, 16, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,1)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const v = g.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.5, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)');
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = v; g.fillRect(0, 0, w, h);
    });
    const clouds = canvasTex(256, 256, (g) => {
      const r = mulberry32(77);
      for (let i = 0; i < 9; i++) {
        const x = r() * 256, y = r() * 256, rad = 40 + r() * 50;
        for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) {
          const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad);
          gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = gr; g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2);
        }
      }
    }, true);
    const beam = canvasTex(16, 128, (g, w, h) => {
      const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    G3.lifeTex = { trail, clouds, beam };
    return G3.lifeTex;
  }

  function makeBird(shadowOnly) {
    const g = new THREE.Group(), m = mat('#2a2622', { r: 0.9 });
    // over the arena only the shadow is wanted (seen from above the bird itself reads as a dark plank)
    if (shadowOnly) { m.colorWrite = false; m.depthWrite = false; }
    g.add(mesh(G3.geo.box, m, 0, 0, 0, 0.22, 0.05, 0.06));
    const wings = [];
    for (const s of [-1, 1]) { const pv = new THREE.Group(); pv.position.z = s * 0.03; pv.add(mesh(G3.geo.box, m, 0, 0, s * 0.17, 0.12, 0.015, 0.34)); g.add(pv); wings.push({ pv, s }); }
    return { g, wings };
  }
  function makePerson(rnd, theme) {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const skins = ['#e8c0a0', '#d6a078', '#c48a62', '#f0d0b0'];
    const shirts = theme === 'office' ? ['#2a3a5a', '#3a3a40', '#f2f2f2', '#5a6a80'] : theme === 'beach' ? ['#ff6a4a', '#2fa0d8', '#f2c230', '#ffffff'] : ['#d84a3a', '#3a7ac8', '#f2c230', '#4aa860', '#ffffff', '#8a5ad0', '#202428'];
    const pants = theme === 'beach' ? ['#2a6aa8', '#e8463a', '#2a2a2a'] : ['#2a2f3a', '#3a4a6a', '#5a4a3a', '#1a1a1a'];
    const pick = a => a[Math.floor(rnd() * a.length)];
    const skin = mat(pick(skins)), shirt = mat(pick(shirts), { r: 0.8 }), pant = mat(pick(pants)), hair = mat(pick(['#1a120c', '#3a2414', '#6a4a2a', '#c8a060']));
    const legs = [];
    for (const s of [-1, 1]) { const pv = new THREE.Group(); pv.position.set(0, 0.34, s * 0.05); pv.add(mesh(G3.geo.cyl, pant, 0, -0.17, 0, 0.035, 0.34, 0.035)); body.add(pv); legs.push(pv); }
    body.add(mesh(G3.geo.cyl, shirt, 0, 0.5, 0, 0.09, 0.34, 0.07));
    body.add(mesh(G3.geo.sphere, skin, 0, 0.74, 0, 0.075));
    body.add(mesh(G3.geo.sphere, hair, -0.01, 0.775, 0, 0.078, 0.05, 0.078));
    const arms = [];
    for (const s of [-1, 1]) { const pv = new THREE.Group(); pv.position.set(0, 0.64, s * 0.11); pv.add(mesh(G3.geo.cyl, shirt, 0, -0.13, 0, 0.025, 0.26, 0.025)); body.add(pv); arms.push(pv); }
    g.scale.setScalar(1.15 + rnd() * 0.15);
    return { g, legs, arms, body };
  }

  // everything that moves on its own; rebuilt with the room and updated every frame
  function buildLife(R, theme, zN, zS, menu) {
    const T = lifeTextures(), rnd = mulberry32(menu ? 5 : run.room * 31 + 7);
    const life = G3.life = { upd: [] };
    const outdoor = theme !== 'office';
    const zc = (zN + zS) / 2, len = zS - zN;

    // birds circling high above: their shadows sweep across the arena
    if (menu) for (let f = 0; f < 1; f++) {
      const flock = [];
      const n = 5 + Math.floor(rnd() * 3), cx = (rnd() - 0.5) * 4, cz = menu ? -6 : zc + (rnd() - 0.5) * len * 0.5;
      const rad = menu ? 7 : 2.6 + rnd() * 2.6, y = menu ? 3.4 + f : 5 + rnd() * 2, sp = (0.12 + rnd() * 0.06) * (rnd() < 0.5 ? -1 : 1), ph = rnd() * TAU;
      for (let i = 0; i < n; i++) { const b = makeBird(!menu); b.g.scale.setScalar(menu ? 1 : 1.7); b.off = [(i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.35, Math.ceil(i / 2) * -0.45, rnd() * 3]; R.add(b.g); flock.push(b); }
      life.upd.push(t => {
        const a = ph + t * sp;
        const dir = Math.sign(sp);
        for (const b of flock) {
          const aa = a + b.off[1] * 0.05 * dir;
          b.g.position.set(cx + Math.cos(aa) * (rad + b.off[0]), y + Math.sin(t * 1.3 + b.off[2]) * 0.15, cz + Math.sin(aa) * (rad + b.off[0]));
          b.g.rotation.y = -aa - dir * Math.PI / 2;
          for (const w of b.wings) w.pv.rotation.x = w.s * Math.sin(t * 9 + b.off[2]) * 0.6;
        }
      });
    }
    // butterflies + falling leaves (park and menu)
    if (theme === 'park' && !menu) {
      const cols = ['#ffd23a', '#ffffff', '#ff8ac8', '#7ad0ff', '#ff9a3a'];
      for (let i = 0; i < (menu ? 6 : 9); i++) {
        const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: col(cols[i % cols.length]), side: THREE.DoubleSide });
        const wings = [];
        for (const s of [-1, 1]) { const pv = new THREE.Group(); const w = new THREE.Mesh(G3.geo.plane, m); w.scale.set(menu ? 0.07 : 0.2, menu ? 0.055 : 0.16, 1); w.position.z = s * (menu ? 0.035 : 0.1); w.rotation.x = -Math.PI / 2; pv.add(w); g.add(pv); wings.push({ pv, s }); }
        R.add(g);
        const ox = (rnd() - 0.5) * (menu ? 6 : 7), oz = menu ? 1 + rnd() * 3 : zN + rnd() * len, ph = rnd() * 10, sp = 0.4 + rnd() * 0.4;
        life.upd.push(t => {
          const tt = t * sp + ph;
          g.position.set(ox + Math.sin(tt * 0.9) * 1.2, 0.5 + Math.sin(tt * 2.3) * 0.25 + 0.3, oz + Math.cos(tt * 0.7) * 1.2);
          g.rotation.y = -tt * 0.9;
          for (const w of wings) w.pv.rotation.x = w.s * (0.2 + Math.abs(Math.sin(t * 18 + ph)) * 1.1);
        });
      }
    }
    if (theme === 'park' && !menu) {
      const leafM = [mat('#8fbf4a', { ds: true }), mat('#d8b040', { ds: true }), mat('#6a9a3a', { ds: true })];
      for (let i = 0; i < 26; i++) {
        const l = new THREE.Mesh(G3.geo.plane, leafM[i % 3]); l.scale.set(0.13, 0.09, 1); R.add(l);
        const s = { x: 0, z: 0, y: 0, ph: rnd() * 10, sp: 0.35 + rnd() * 0.3 };
        const reset = top => { s.x = (rnd() - 0.5) * 8; s.z = zN + rnd() * len; s.y = top ? 2.5 + rnd() * 1.5 : rnd() * 3.5; };
        reset(false);
        life.upd.push((t, dt) => {
          s.y -= s.sp * dt; if (s.y < 0.02) reset(true);
          l.position.set(s.x + Math.sin(t * 1.5 + s.ph) * 0.3, s.y, s.z + Math.cos(t * 1.1 + s.ph) * 0.2);
          l.rotation.set(t * 2 + s.ph, t * 1.3, t * 1.7);
        });
      }
    }
    // floating pollen / dust in the light
    {
      const N = Math.round(140 * Q.fx), geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3), seeds = [];
      for (let i = 0; i < N; i++) seeds.push([(rnd() - 0.5) * 9, rnd() * 2.6, menu ? rnd() * 8 - 2 : zN + rnd() * len, rnd() * 10]);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pc = { park: '#fff3b0', street: '#ffd9a0', office: '#ffffff', beach: '#fff0c8', steppe_gold: '#ffcf8a', steppe_night: '#d8f5a0', steppe_blood: '#ff6a2a', steppe_dark: '#a898ff' }[theme] || '#ffd9a0';   // steppe: golden dust, fireflies, embers
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: menu ? 0.08 : 0.16, map: G3.glowTex, color: col(pc), transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }));
      pts.frustumCulled = false; R.add(pts);
      life.upd.push(t => {
        for (let i = 0; i < N; i++) {
          const s = seeds[i];
          pos[i * 3] = s[0] + Math.sin(t * 0.3 + s[3]) * 0.5;
          pos[i * 3 + 1] = 0.15 + ((s[1] + t * 0.08 + s[3]) % 2.6);
          pos[i * 3 + 2] = s[2] + Math.cos(t * 0.25 + s[3]) * 0.5;
        }
        geo.attributes.position.needsUpdate = true;
      });
    }
    if (menu) return;
    // cloud shadows drifting over the ground
    if (outdoor) {
      const t2 = T.clouds.clone(); t2.needsUpdate = true; t2.repeat.set(len / 14, len / 14);
      const cs = new THREE.Mesh(new THREE.PlaneGeometry(12, len + 6), new THREE.MeshBasicMaterial({ map: t2, color: 0x000000, transparent: true, opacity: 0.34, depthWrite: false }));
      cs.rotation.x = -Math.PI / 2; cs.position.set(0, 0.015, zc); R.add(cs);
      life.upd.push(t => t2.offset.set(t * 0.012, t * 0.02));
    }
    // fountain spray
    if (G3.fountains.length) {
      const per = 46, N = per * G3.fountains.length, geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.07, map: G3.glowTex, color: col('#cfeaff'), transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }));
      pts.frustumCulled = false; R.add(pts);
      const fs = G3.fountains.slice();
      life.upd.push(t => {
        let k = 0;
        for (const [fx, fz] of fs) for (let i = 0; i < per; i++) {
          const p = (t * 0.9 + i / per) % 1, a = i * 2.39996, r = p * 0.33;
          pos[k++] = fx + Math.cos(a) * r; pos[k++] = 0.42 + 0.9 * p - 1.05 * p * p; pos[k++] = fz + Math.sin(a) * r;
        }
        geo.attributes.position.needsUpdate = true;
      });
    }
    // traffic on the roads beside the street arena
    if (theme === 'street') {
      const road = canvasTex(64, 256, (g, w, h) => { g.fillStyle = '#44474c'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.8)'; for (let y = 0; y < h; y += 32) g.fillRect(w / 2 - 1, y, 2, 16); }, true);
      road.repeat.set(1, (len + 30) / 4);
      for (const s of [-1, 1]) { const rd = new THREE.Mesh(new THREE.PlaneGeometry(2.6, len + 30), mat('#ffffff', { map: road, r: 0.9 })); rd.rotation.x = -Math.PI / 2; rd.position.set(s * 6.3, 0.005, zc - 8); rd.receiveShadow = true; R.add(rd); }
      const carCols = ['#d8dbe0', '#1f2a3a', '#b8262e', '#2f5f9a', '#3a3a3a', '#f2c230'];
      for (let i = 0; i < 8; i++) {
        const lane = i % 4, x = [-6.9, -5.7, 5.7, 6.9][lane], dir = lane < 2 ? -1 : 1;
        let car;
        if (G3.models.prop_car) { car = propModel('prop_car', 0.95, 'w'); car.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2; }
        else {
          car = new THREE.Group(); const paint = mat(carCols[i % carCols.length], { m: 0.6, r: 0.3 });
          car.add(mesh(G3.geo.box, paint, 0, 0.19, 0, 0.44, 0.17, 0.86)); car.add(mesh(G3.geo.box, mat('#1c2633', { m: 0.5, r: 0.1 }), 0, 0.33, -0.04, 0.38, 0.14, 0.44));
        }
        R.add(car);
        const sp = 2.2 + rnd() * 1.6, span = len + 26, z0 = rnd() * span;
        life.upd.push(t => { const z = ((z0 + t * sp) % span); car.position.set(x, 0, dir > 0 ? zN - 18 + z : zS + 8 - z); });
      }
    }
    // people walking past outside the walls (not in the steppe)
    if (!isSteppe(theme)) {
      const n = theme === 'office' ? 4 : 8;
      for (let i = 0; i < n; i++) {
        const p = makePerson(rnd, theme); R.add(p.g);
        const s = i % 2 ? 1 : -1, x = s * (theme === 'street' ? 4.75 : 4.85 + rnd() * 0.5), dir = rnd() < 0.5 ? -1 : 1;
        const sp = 0.5 + rnd() * 0.5, span = len + 10, z0 = rnd() * span, ph = rnd() * 10;
        p.g.rotation.y = dir > 0 ? -Math.PI / 2 : Math.PI / 2;
        life.upd.push(t => {
          const z = (z0 + t * sp) % span;
          p.g.position.set(x, 0, dir > 0 ? zN - 5 + z : zS + 5 - z);
          const w = Math.sin(t * sp * 9 + ph);
          p.legs[0].rotation.z = w * 0.5; p.legs[1].rotation.z = -w * 0.5;
          p.arms[0].rotation.z = -w * 0.4; p.arms[1].rotation.z = w * 0.4;
          p.body.position.y = Math.abs(Math.cos(t * sp * 9 + ph)) * 0.03;
        });
      }
    }
  }

  // ---- transient effects (rings, light pillars, wisps) in world coordinates
  let fx = [];
  function addFx(kind, x, y, o) { fx.push(Object.assign({ kind, x, y, t: 0, max: 0.5, col: '#ffe08a', size: 1 }, o || {})); }
  function updateFx3D(dt) {
    if (!G3.fxPool) G3.fxPool = [];
    // a bounded pool with one shared beam geometry: late in a run there are many effects at once, and each used to bring its own
    if (!G3.fxBeamGeo) G3.fxBeamGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 20, 1, true);
    while (G3.fxPool.length < Math.min(fx.length, 48)) {
      const ring = decal(G3.ringTex, '#ffffff', 1, 0); ring.material.blending = THREE.AdditiveBlending;
      const pillar = new THREE.Mesh(G3.fxBeamGeo, new THREE.MeshBasicMaterial({ map: lifeTextures().beam, color: 0xffffff, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
      const wisp = glow('#ffffff', 1, 0);
      G3.dyn.add(ring, pillar, wisp); G3.fxPool.push({ ring, pillar, wisp });
    }
    for (let i = 0; i < G3.fxPool.length; i++) {
      const f = fx[i], p = G3.fxPool[i];
      p.ring.visible = p.pillar.visible = p.wisp.visible = false;
      if (!f) continue;
      const k = clamp(f.t / f.max, 0, 1), fade = 1 - k;
      if (f.kind === 'ring') {
        p.ring.visible = true; p.ring.material.color.copy(colC(f.col)); p.ring.material.opacity = fade * 0.9;
        const s = f.size * (0.3 + k * 1.7); p.ring.scale.set(s, s, 1); p.ring.position.set(X3(f.x), 0.04, Z3(f.y));
      } else if (f.kind === 'pillar') {
        p.pillar.visible = true; p.pillar.material.color.copy(colC(f.col)); p.pillar.material.opacity = Math.sin(k * Math.PI) * 0.9;
        p.pillar.scale.set(f.size * (1 - k * 0.4), 3.2, f.size * (1 - k * 0.4)); p.pillar.position.set(X3(f.x), 1.6, Z3(f.y)); p.pillar.rotation.y += dt * 3;
      } else if (f.kind === 'wisp') {
        p.wisp.visible = true; p.wisp.material.color.copy(colC(f.col)); p.wisp.material.opacity = fade * 0.8;
        p.wisp.scale.setScalar(f.size * (0.5 + k * 0.5)); p.wisp.position.set(X3(f.x), 0.5 + k * 1.6, Z3(f.y));
      }
    }
  }
  function tickFx(dt) { for (const f of fx) f.t += dt; fx = fx.filter(f => f.t < f.max); }


