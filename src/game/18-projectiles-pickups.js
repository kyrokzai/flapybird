  // ---- projectiles & pickups
  function makeArrowModel(a) {
    const g = new THREE.Group();
    if (a.kind === 'feather') {
      const f = mesh(G3.geo.cone, G3.pm.feather, 0, 0, 0, 0.05, 0.3, 0.015); f.rotation.z = -Math.PI / 2; g.add(f);
      g.add(glow('#ffd36a', 0.45, 0.6));
    } else {
      const sh = mesh(G3.geo.cyl, G3.pm.shaft, 0, 0, 0, 0.014, 0.5, 0.014); sh.rotation.z = Math.PI / 2; g.add(sh);
      const tp = mesh(G3.geo.cone, G3.pm.tip, 0.28, 0, 0, 0.032, 0.09, 0.032); tp.rotation.z = -Math.PI / 2; g.add(tp);
      for (const s of [-1, 1]) g.add(mesh(G3.geo.box, G3.pm.fletch, -0.22, 0, s * 0.022, 0.1, 0.04, 0.008, false));
      const tr2 = glow('#fff2c0', 0.35, 0.45); tr2.position.x = -0.05; g.add(tr2);
      const trail = new THREE.Mesh(G3.geo.plane, G3.pm['trail' + (a.heavy ? 'H' : a.fire ? 'F' : a.ice ? 'I' : '')] || (G3.pm['trail' + (a.heavy ? 'H' : a.fire ? 'F' : a.ice ? 'I' : '')] = new THREE.MeshBasicMaterial({ map: lifeTextures().trail, color: col(a.heavy ? '#ff5030' : a.fire ? '#ffa040' : a.ice ? '#a0e8ff' : '#fff0c0'), transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending })));
      trail.rotation.x = -Math.PI / 2; trail.scale.set(0.9, 0.09, 1); trail.position.x = -0.62; g.add(trail);
      g.scale.setScalar(a.heavy ? 1.75 : 1.35);
      if (a.fire) { const gl = glow('#ff8a20', 0.6, 0.9); gl.position.x = 0.1; g.add(gl); }
      if (a.ice) { const gl = glow('#8fe0ff', 0.55, 0.9); gl.position.x = 0.1; g.add(gl); }
    }
    return { g };
  }
  function makeBulletModel(b) {
    const g = new THREE.Group(), s = b.r / CELL * 1.35;
    switch (b.kind) {
      case 'claw': { const c = mesh(G3.geo.cone, G3.pm.claw, 0, 0, 0, 0.05, 0.24, 0.035); c.rotation.z = -Math.PI / 2; g.add(c); g.add(glow('#ff9a3a', 0.35, 0.5)); break; }
      case 'rock': case 'boulder': g.add(mesh(G3.geo.dodeca, b.kind === 'rock' ? G3.pm.rock : G3.pm.boulder, 0, 0, 0, s)); break;
      default: {
        const pmat = G3.pm[b.kind] || G3.pm.magic;
        g.add(mesh(G3.geo.sLow, pmat, 0, 0, 0, s, s, s, false));
        g.add(glow(b.kind === 'fire' ? '#ff6a10' : b.kind === 'ghost' ? '#7fb8ff' : '#9a40ff', s * 3.2, 0.6));
      }
    }
    return { g };
  }
  // ---- loot beacons: a column of light and a pulsing ground ring say "pick me up" from across the room
  function lootBeam(hex, h, r) {
    if (!G3.beamTex) G3.beamTex = canvasTex(4, 64, (g, w, hh) => {
      const gr = g.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0.9)');
      g.fillStyle = gr; g.fillRect(0, 0, w, hh);
    });
    const geo = new THREE.CylinderGeometry(r * 0.55, r, h, 14, 1, true).translate(0, h / 2, 0);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: G3.beamTex, color: col(hex), transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    m.renderOrder = 3;
    return m;
  }
  // dark soft disc under loot so the bright ring reads on light grass and sand
  function lootShadow(size) {
    if (!G3.lootShadowTex) G3.lootShadowTex = canvasTex(128, 128, (g, w, h) => {
      const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    const d = decal(G3.lootShadowTex, '#ffffff', size, 0.55); d.position.y = 0.012; return d;
  }
  function makeBonusModel(item) {
    const g = new THREE.Group(), it = ITEMS[item];
    const ring = decal(G3.ringTex, it.col, 1.15, 1); ring.userData.ground = true; g.add(ring);
    const body = new THREE.Group(); body.scale.setScalar(1.6); g.add(body); g.userData.body = body;
    if (item === 'medkit') {
      body.add(mesh(G3.geo.box, mat('#f4f4f0', { r: 0.4 }), 0, 0, 0, 0.26, 0.17, 0.2));
      const red = mat('#ff2a32', { e: '#ff1a20', ei: 1.1 });
      body.add(mesh(G3.geo.box, red, 0, 0.087, 0, 0.16, 0.01, 0.05)); body.add(mesh(G3.geo.box, red, 0, 0.087, 0, 0.05, 0.01, 0.16));
      body.add(mesh(G3.geo.box, red, 0.131, 0, 0, 0.01, 0.1, 0.035)); body.add(mesh(G3.geo.box, red, 0.131, 0, 0, 0.01, 0.035, 0.1));
      body.add(mesh(G3.geo.box, mat('#c8c8c4'), 0, 0.1, 0, 0.08, 0.03, 0.03));
    } else if (item === 'bomb') {
      body.add(mesh(G3.geo.sphere, mat('#1e1e22', { m: 0.6, r: 0.3 }), 0, 0, 0, 0.13));
      body.add(mesh(G3.geo.cyl, mat('#8a6a44'), 0.06, 0.14, 0, 0.015, 0.08, 0.015));
      const sp = glow('#ffb040', 0.3, 0.9); sp.position.set(0.07, 0.19, 0); body.add(sp); g.userData.spark = sp;
    } else if (item === 'shield') {
      const d = mesh(G3.geo.cyl, mat('#2f7fd0', { m: 0.6, r: 0.3 }), 0, 0, 0, 0.17, 0.035, 0.17); d.rotation.x = Math.PI / 2; body.add(d);
      const rim = mesh(G3.geo.ring, mat('#f0c040', { m: 0.9, r: 0.25 }), 0, 0, 0, 0.17, 0.17, 0.17); body.add(rim);
      body.add(mesh(G3.geo.sphere, mat('#f0c040', { m: 0.9, r: 0.25 }), 0, 0, 0.025, 0.04));
    } else {
      const bow = mesh(G3.geo.bow, mat('#c89a40', { m: 0.7, r: 0.3, e: it.col, ei: 0.35 }), 0, 0, 0, 0.7, 0.7, 0.7); bow.rotation.z = -1.15; body.add(bow);
      const ar = mesh(G3.geo.cyl, mat(it.col, { e: it.col, ei: 0.8 }), 0.05, 0, 0, 0.012, 0.46, 0.012); ar.rotation.z = Math.PI / 2; body.add(ar);
    }
    const gl = glow(it.col, 1.25, 0.6); g.add(gl);
    const beam = lootBeam(it.col, 1.7, 0.26); g.add(beam); g.userData.beam = beam;
    g.add(lootShadow(1.5));
    return g;
  }
  function makeCrateModel() {
    if (!G3.crateTex) G3.crateTex = canvasTex(128, 128, (g, w, h) => {
      g.fillStyle = '#8a5a2e'; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 32) { g.fillStyle = y % 64 ? '#9a6a38' : '#7e5028'; g.fillRect(4, y + 3, w - 8, 26); }
      g.strokeStyle = '#4a2e14'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4);
      g.beginPath(); g.moveTo(8, 8); g.lineTo(w - 8, h - 8); g.stroke();
      koshkar(g, w / 2, h / 2 + 4, 36, '#f0c040', 4);
    });
    const g = new THREE.Group(), box = new THREE.Group(); box.scale.setScalar(1.3); g.add(box);
    box.add(mesh(G3.geo.box, mat('#ffffff', { map: G3.crateTex, r: 0.8, e: '#3a2208', ei: 0.35 }), 0, 0.22, 0, 0.44, 0.44, 0.44));
    const gold = mat('#f0c040', { m: 0.9, r: 0.3, e: '#a8740f', ei: 0.35 });
    for (const y of [0.04, 0.4]) box.add(mesh(G3.geo.box, gold, 0, y, 0, 0.46, 0.04, 0.46));
    const gl = glow('#ffd24a', 1.4, 0.4); gl.position.y = 0.35; g.add(gl); g.userData.glow = gl;
    // gold ring on the ground, a beam of light and a bobbing marker above
    g.add(lootShadow(1.7));
    const ring = decal(G3.ringTex, '#ffd24a', 1.25, 1); g.add(ring); g.userData.ring = ring;
    const beam = lootBeam('#ffcf5a', 1.6, 0.36); g.add(beam); g.userData.beam = beam;
    const mk = mesh(G3.geo.octa, mat('#ffd24a', { m: 0.6, r: 0.25, e: '#ffb020', ei: 1.2 }), 0, 0, 0, 0.13, 0.22, 0.13);
    const mg = new THREE.Group(); mg.add(mk); mg.add(glow('#ffd24a', 0.55, 0.8)); mg.position.y = 0.95; g.add(mg); g.userData.marker = mg;
    return { g };
  }

  function makePickupModel(p) {
    if (p.kind === 'bonus') return { g: makeBonusModel(p.item), bonus: true };
    const g = new THREE.Group();
    if (p.kind === 'xp') { g.add(mesh(G3.geo.octa, G3.pm.xp, 0, 0, 0, 0.08, 0.12, 0.08)); g.add(glow('#5fe8ff', 0.4, 0.55)); }
    else if (p.kind === 'coin') {
      // a proper tenge coin: thick gold disc, bright rim, the ₸ stamped on both faces, warm glow
      if (!G3.coinFace) G3.coinFace = canvasTex(64, 64, (c, w, h) => {
        c.fillStyle = '#f2c23a'; c.beginPath(); c.arc(w / 2, h / 2, w / 2, 0, TAU); c.fill();
        c.strokeStyle = '#a8740f'; c.lineWidth = 4; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 6, 0, TAU); c.stroke();
        c.fillStyle = '#8a5a08'; c.font = `900 34px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('₸', w / 2, h / 2 + 2);
      });
      const coin = new THREE.Group();
      const body = mesh(G3.geo.cyl, G3.pm.coin, 0, 0, 0, 0.17, 0.045, 0.17); body.rotation.x = Math.PI / 2; coin.add(body);
      if (!G3.pm.coinFaceM) G3.pm.coinFaceM = new THREE.MeshStandardMaterial({ map: G3.coinFace, metalness: 0.85, roughness: 0.25, emissive: col('#7a5200'), emissiveIntensity: 0.5, transparent: true });
      for (const s of [-1, 1]) { const f = new THREE.Mesh(G3.geo.plane, G3.pm.coinFaceM); f.scale.set(0.33, 0.33, 1); f.position.z = s * 0.024; if (s < 0) f.rotation.y = Math.PI; coin.add(f); }
      const rim = mesh(G3.geo.ring, G3.pm.coinRim, 0, 0, 0, 0.17, 0.17, 0.17); coin.add(rim);
      g.add(coin); g.add(glow('#ffd24a', 0.75, 0.55));
    }
    else {
      const h = new THREE.Group(); h.scale.setScalar(1.5); g.add(h);
      for (const s of [-1, 1]) h.add(mesh(G3.geo.sLow, G3.pm.heart, 0, 0.04, s * 0.05, 0.065));
      const c = mesh(G3.geo.cone, G3.pm.heart, 0, -0.06, 0, 0.1, 0.14, 0.1); c.rotation.z = Math.PI; h.add(c);
      g.add(glow('#ff5a6a', 0.8, 0.65));
    }
    return { g };
  }

  // enemies do not vanish: they flash, squash and shrink away for a moment after dying
  function syncEnemies(list, dt) {
    const seen = new Set();
    for (const e of list) {
      let m = G3.ents.get(e);
      if (!m) { m = makeEnemyModel(e); G3.ents.set(e, m); G3.dyn.add(m.g); }
      updateEnemyModel(e, m); seen.add(e);
    }
    for (const [e, m] of G3.ents) {
      if (seen.has(e)) continue;
      if (scene !== 'menu' && m.dying === undefined && e.dead) { m.dying = 0.32; setFlash(m, true); m.ring.material.opacity = 0; m.warn.material.opacity = 0; if (m.shadow) m.shadow.visible = false; if (m.threat) m.threat.visible = false; if (m.aura) { m.aura.visible = false; m.auraGlow.visible = false; } if (m.ward) m.ward.visible = false; }
      if (m.dying !== undefined && m.dying > 0) {
        m.dying -= dt;
        const k = clamp(m.dying / 0.32, 0, 1);
        m.body.scale.set(MS * (1 + (1 - k) * 0.5) * k, MS * k * 0.7 + 0.001, MS * (1 + (1 - k) * 0.5) * k);
        m.g.rotation.y += dt * 9; m.g.position.y = (1 - k) * 0.25;
        continue;
      }
      G3.dyn.remove(m.g); disposeTree(m.g); G3.ents.delete(e);
    }
  }

  function syncList(list, map, make, upd) {
    const seen = new Set();
    for (const o of list) {
      let m = map.get(o);
      if (!m) { m = make(o); map.set(o, m); G3.dyn.add(m.g); }
      upd(o, m); seen.add(o);
    }
    for (const [o, m] of map) if (!seen.has(o)) { G3.dyn.remove(m.g); if (m.mats) disposeTree(m.g); map.delete(o); }
  }

