  // ---- per-frame sync & render
  function render3D() {
    const now3 = performance.now(), fdt = Math.min(0.05, (now3 - (G3.lastT || now3)) / 1000); G3.lastT = now3; G3.rt += fdt;
    build3D();
    G3.windUni.uT.value = G3.rt;
    if (G3.life) for (const u of G3.life.upd) u(G3.rt, fdt);
    tickFx(fdt); updateFx3D(fdt);
    const menu = scene === 'menu';
    if (G3.wasMenu !== menu) { G3.wasMenu = menu; resize(); }
    // camera
    const c = G3.cam;
    if (menu) {
      // close-up portrait of the batyr: slow small orbit around him, camera a little below his chest (heroic angle)
      const a = Math.sin(time * 0.18) * 0.16, dist = MENU_CAM.dist;
      const mf = 2 * Math.atan(Math.tan(MENU_CAM.fov * Math.PI / 360) * H / 640) * 180 / Math.PI;
      if (c.fov !== mf) { c.fov = mf; c.updateProjectionMatrix(); }
      c.position.set(Math.sin(a) * dist, MENU_CAM.y, 1.4 + Math.cos(a) * dist); c.lookAt(0, MENU_CAM.look, 1.4); c.updateMatrixWorld();
      G3.scene.fog.near = 18; G3.scene.fog.far = 95;
    } else {
      const bf = G3.baseFov || 30;
      if (introT <= 0 && c.fov !== bf) { c.fov = bf; c.updateProjectionMatrix(); }
      const cb = G3.camBase, top = cb.tz, bottom = cb.tz + Math.max(0, ROWS - 13);
      const want = clamp(cb.tz + Z3(player.y) - (Z3(ARENA.y) + 8.5), top, bottom);
      if (G3.camRoom !== run.room) { G3.camRoom = run.room; G3.camTz = bottom; }
      G3.camTz += (want - G3.camTz) * (introT > 0 ? 1 : 0.08);
      placeCam(cb.d, G3.camTz, cb.el);
      G3.scene.fog.near = cb.d + 12; G3.scene.fog.far = cb.d + 70;
      if (introT > 0) {
        // start low behind the hero, looking at the landmark beyond the gate, then sweep down into the game view
        const k = clamp((INTRO_T - introT - 0.6) / (INTRO_T - 0.9), 0, 1), e2 = k * k * (3 - 2 * k);
        const zN = Z3(ARENA.y), zS = Z3(AY2);
        const p0 = new THREE.Vector3(1.6, 2.9, zS + 2.6), t0 = new THREE.Vector3(0, 6, zN - 16);
        const p1 = c.position.clone(), t1 = new THREE.Vector3(0, 0, G3.camTz);
        c.fov = 58 - (58 - bf) * e2; c.updateProjectionMatrix();
        c.position.lerpVectors(p0, p1, e2); c.lookAt(t0.lerp(t1, e2)); c.updateMatrixWorld();
        G3.scene.fog.near = 40 - e2 * (40 - cb.d - 12); G3.scene.fog.far = 140 - e2 * (140 - cb.d - 70);
      }
      const sp = G3.themeSun || [-5, 14, 6];
      G3.sun.position.set(sp[0], sp[1], sp[2] + G3.camTz); G3.sun.target.position.set(0, 0, G3.camTz); G3.sun.target.updateMatrixWorld();
      if (shake > 0) { c.position.x += rand(-1, 1) * shake * 0.012; c.position.y += rand(-1, 1) * shake * 0.012; }
    }
    if (G3.pano) G3.pano.position.set(c.position.x, 0, c.position.z);
    // hero
    // spearman batyr poses in the menu, the archer batyr fights; the procedural hero is the fallback
    // the menu batyr: the owner's rigged comic warrior with his dances (assets/batyr.js); an older static model still works
    if (G3.models.batyr && !G3.heroSpear) { const rigged = (G3.models.batyr.userData.clips || []).length > 0; G3.heroSpear = rigged ? makeBatyrRig(G3.models.batyr, true) : makeBatyr(G3.models.batyr, false); G3.dyn.add(G3.heroSpear.g); }
    if (G3.models.hero && !G3.heroBow) { G3.heroBow = makeBatyrRig(G3.models.hero, true); G3.dyn.add(G3.heroBow.g); }
    if (G3.models.batyr_rig && !G3.heroBow) { G3.heroBow = makeBatyrRig(G3.models.batyr_rig); G3.dyn.add(G3.heroBow.g); }
    if (G3.models.batyr_bow && !G3.heroBow) { G3.heroBow = makeBatyr(G3.models.batyr_bow, true); G3.dyn.add(G3.heroBow.g); }
    if (!G3.heroProc) { G3.heroProc = makeHero(); G3.dyn.add(G3.heroProc.g); G3.heroRing = decal(G3.ringTex, '#5fd3ff', 0.95, 0.55); G3.dyn.add(G3.heroRing); }
    G3.hero = menu ? (G3.heroSpear || G3.heroBow || G3.heroProc) : (G3.heroBow || G3.heroSpear || G3.heroProc);
    for (const h of [G3.heroSpear, G3.heroBow, G3.heroProc]) if (h && h !== G3.hero) h.g.visible = false;
    G3.heroRing.visible = !menu && scene === 'play';
    if (G3.heroRing.visible) { G3.heroRing.position.set(X3(player.x), 0.025, Z3(player.y)); G3.heroRing.rotation.z = time * 0.8; }
    const hm = G3.hero;
    if (menu) {
      hm.g.visible = !!G3.heroSpear; hm.g.position.set(0, 0.2, 1.4); hm.g.scale.setScalar(1);
      hm.g.rotation.y = -(Math.PI / 2 - 0.15);
      (hm.rig ? animateRig : hm.batyr ? animateBatyr : animateHero)(hm, { menu: true, moving: false, pull: 0, dt: fdt, clip: menuAnimId() });
    } else {
      hm.g.visible = (hm.rig || scene !== 'dead') && !(player.inv > 0 && player.hp > 0 && Math.floor(time * 20) % 2 === 0);
      hm.g.position.set(X3(player.x), 0, Z3(player.y)); hm.g.scale.setScalar(1.18);
      hm.g.rotation.y = -player.face;
      (hm.rig ? animateRig : hm.batyr ? animateBatyr : animateHero)(hm, { dt: fdt, hp: player.hp, dead: player.hp <= 0, moving: player.moving, walk: player.walk, shot: player.atkAnim > 0 ? player.atkAnim / 0.18 : 0, pull: player.atkAnim > 0 ? 1 - player.atkAnim / 0.18 : (player.moving ? 0 : 0.35) });
    }
    syncHeroAtmosphere(menu);
    const ens = menu ? [] : enemies;
    syncEnemies(ens, fdt);
    syncList(menu ? [] : arrows, G3.arrowsM, makeArrowModel, (a, m) => { m.g.position.set(X3(a.x), 0.55, Z3(a.y)); m.g.rotation.y = -a.ang; });
    syncList(menu ? [] : bullets, G3.bulletsM, makeBulletModel, (b, m) => {
      m.g.position.set(X3(b.x), b.kind === 'boulder' ? 0.35 : 0.45, Z3(b.y));
      if (b.kind === 'claw') m.g.rotation.y = -Math.atan2(b.vy, b.vx); else { m.g.rotation.y += 0.15; m.g.rotation.x += 0.1; }
    });
    syncList(menu ? [] : pickups, G3.pickM, makePickupModel, (p, m) => {
      if (m.bonus) {
        m.g.position.set(X3(p.x), 0, Z3(p.y));
        const b = m.g.userData.body; b.position.y = 0.36 + Math.sin(G3.rt * 3 + p.x) * 0.06; b.rotation.y = G3.rt * 1.6;
        m.g.children[0].rotation.z = G3.rt; m.g.children[0].position.y = 0.03;
        if (m.g.userData.spark) m.g.userData.spark.material.opacity = 0.6 + Math.random() * 0.4;
        m.g.children[2].position.y = 0.5;
        const pu = 1 + Math.sin(G3.rt * 4 + p.x) * 0.12;
        m.g.children[0].scale.set(1.15 * pu, 1.15 * pu, 1); m.g.children[0].rotation.z = G3.rt * 0.8;
        if (m.g.userData.beam) m.g.userData.beam.material.opacity = 0.4 + Math.sin(G3.rt * 3 + p.y) * 0.15;
        return;
      }
      m.g.position.set(X3(p.x), 0.22 + Math.sin(time * 5 + p.x) * 0.05, Z3(p.y)); m.g.rotation.y = time * 3 + p.x;
    });
    syncList(menu ? [] : crates.filter(c => !c.open), G3.crateM || (G3.crateM = new Map()), makeCrateModel, (c, m) => {
      const u = m.g.userData, t = G3.rt * 3 + c.x;
      m.g.position.set(X3(c.x), 0, Z3(c.y)); u.glow.material.opacity = 0.3 + Math.sin(t) * 0.12;
      const pu = 1 + Math.sin(t * 1.3) * 0.14; u.ring.scale.set(1.25 * pu, 1.25 * pu, 1); u.ring.material.opacity = 0.75 + Math.sin(t * 1.3) * 0.25; u.ring.rotation.z = G3.rt * 0.7;
      u.beam.material.opacity = 0.32 + Math.sin(t) * 0.12;
      u.marker.position.y = 0.98 + Math.sin(t * 1.2) * 0.08; u.marker.rotation.y = G3.rt * 2.2;
    });
    syncList(menu ? [] : thrown, G3.bombM || (G3.bombM = new Map()), () => ({ g: makeBonusModel('bomb').children[1].parent }), (b, m) => {
      const k = b.t; m.g.position.set(X3(b.x0 + (b.x1 - b.x0) * k), 0, Z3(b.y0 + (b.y1 - b.y0) * k));
      m.g.userData.body.position.y = 0.4 + 4 * k * (1 - k) * 1.6; m.g.userData.body.rotation.z = k * 8; m.g.children[0].visible = false; if (m.g.userData.beam) m.g.userData.beam.visible = false; m.g.userData.body.scale.setScalar(1);
    });
    if (!G3.shieldBubble) {
      G3.shieldBubble = new THREE.Mesh(G3.geo.sphere, new THREE.MeshBasicMaterial({ color: col('#5fc8ff'), transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }));
      G3.dyn.add(G3.shieldBubble);
    }
    G3.shieldBubble.visible = !menu && scene === 'play' && player.shield > 0;
    if (G3.shieldBubble.visible) { G3.shieldBubble.position.set(X3(player.x), 0.75, Z3(player.y)); G3.shieldBubble.scale.setScalar(0.85 + Math.sin(G3.rt * 4) * 0.03); G3.shieldBubble.material.opacity = 0.16 + player.shield * 0.06; }
    const aims = menu ? [] : enemies.filter(e => e.type === 'j' && e.st === 'aim' && e.spawn <= 0);
    syncList(aims, G3.aimM, () => { const pl = new THREE.Mesh(G3.geo.plane, G3.pm.aim); pl.rotation.x = -Math.PI / 2; const g = new THREE.Group(); pl.position.x = 1.5; pl.scale.set(3, 0.06, 1); g.add(pl); return { g }; },
      (e, m) => { m.g.position.set(X3(e.x), 0.04, Z3(e.y)); m.g.rotation.y = -e.aimA; });

    // charms
    const no = menu ? 0 : sk('orbit');
    while (G3.charms.length < 3) { const g = new THREE.Group(); g.add(mesh(G3.geo.tetra, G3.pm.charm, 0, 0, 0, 0.1)); g.add(glow('#c080ff', 0.6, 0.8)); G3.dyn.add(g); G3.charms.push(g); }
    G3.charms.forEach((g, i) => {
      g.visible = i < no && scene === 'play';
      if (g.visible) { const a = player.orbitA + i * TAU / no; g.position.set(X3(player.x + Math.cos(a) * 44), 0.55, Z3(player.y + Math.sin(a) * 44)); g.rotation.y = time * 4; g.rotation.x = time * 3; }
    });
    // eagle
    if (G3.models.eagle && (!G3.eagle || !G3.eagle.model)) { if (G3.eagle) G3.dyn.remove(G3.eagle.g); G3.eagle = makeEagleModel(); G3.dyn.add(G3.eagle.g); }
    if (!G3.eagle) { G3.eagle = makeEagle(); G3.dyn.add(G3.eagle.g); }
    if (G3.horseUni) G3.horseUni.uT.value = time;
    if (G3.eagleUni) G3.eagleUni.uFlap.value = Math.sin(time * 8) * 0.55;
    if (G3.models.eagle && !G3.menuEagle) { G3.menuEagle = makeEagleModel(); G3.menuEagle.g.scale.setScalar(1.3); G3.dyn.add(G3.menuEagle.g); }
    if (G3.menuEagle) {
      G3.menuEagle.g.visible = menu;
      if (menu) { const t = time * 0.45; G3.menuEagle.g.position.set(Math.cos(t) * 2.6, 1.95 + Math.sin(t * 2) * 0.2, -1.2 + Math.sin(t) * 1.4); G3.menuEagle.g.rotation.set(0, -(t + Math.PI / 2), -0.35); }
    }
    // Қыдыр ата waits by the gate after the rooms where he appears
    if (G3.models.kydyr && !G3.kydyr3D) {
      const kg = new THREE.Group(), km = G3.models.kydyr.clone(); km.scale.setScalar(1.45); kg.add(km);
      const kl = glow('#ffe9a8', 2.2, 0.55); kl.position.y = 0.9; kg.add(kl);
      G3.kydyr3D = kg; G3.dyn.add(kg);
    }
    if (G3.kydyr3D) {
      const show = !menu && scene === 'play' && roomClear && KYDYR_AFTER.includes(run.room) && run.room < TOTAL_ROOMS;
      G3.kydyr3D.visible = show;
      if (show) { const k = clamp(clearT / 0.8, 0, 1); G3.kydyr3D.position.set(X3(GATE_X + 66), 0, Z3(ARENA.y + 34)); G3.kydyr3D.scale.setScalar(0.3 + 0.7 * k); G3.kydyr3D.rotation.y = -0.35; }
    }
    const eg = G3.eagle;
    eg.g.visible = !menu && scene === 'play' && sk('eagle') > 0;
    if (eg.g.visible) {
      eg.g.position.set(X3(player.eagle.x), 1.45 + Math.sin(time * 2) * 0.08, Z3(player.eagle.y));
      eg.g.rotation.y = -player.face;
      eg.wings.forEach(({ pv, s }) => { pv.rotation.x = s * Math.sin(time * 12) * 0.6; });
      if (eg.model) eg.g.rotation.z = -0.15;
    }
    // gate & water
    if (G3.gateBeam) G3.gateBeam.material.opacity = gateOpen * (0.42 + Math.sin(G3.rt * 3) * 0.1);
    if (G3.doors) for (const d of G3.doors) { if (d.slide) d.pv.position.x = d.sx * (0.75 + gateOpen * 0.72); else d.pv.rotation.y = d.sx * -gateOpen * 1.55; }
    if (G3.gateGlow) G3.gateGlow.material.opacity = gateOpen * (0.75 + Math.sin(time * 4) * 0.15);
    G3.waterTex.offset.set(time * 0.03, time * 0.015);

    // particles
    const pos = G3.pts.geometry.attributes.position, pc = G3.pts.geometry.attributes.color;
    const nP = Math.min(G3.MAXP, menu ? 0 : particles.length);
    for (let i = 0; i < nP; i++) {
      const p = particles[i], cc = colC(p.col), f = clamp(p.life / p.max, 0, 1);
      pos.setXYZ(i, X3(p.x), p.h, Z3(p.y));
      pc.setXYZ(i, cc.r * f, cc.g * f, cc.b * f);
    }
    G3.pts.geometry.setDrawRange(0, nP);
    pos.needsUpdate = true; pc.needsUpdate = true;

    if (G3.usePost) {
      const gm = !menu && G3.mood && G3.mood.grade;
      G3.grade.uniforms.exposure.value = menu ? (G3.skyTex.menu ? 1.0 : 1.2) : (gm ? gm[0] : 0.8);
      G3.grade.uniforms.sat.value = menu ? 1.1 : (gm ? gm[1] : 1.18);
      G3.grade.uniforms.tint.value.copy(gm ? col(gm[2]) : col('#ffffff'));
      G3.bloom.threshold = menu ? 0.97 : 1.5;
      G3.composer.render();
    } else G3.r.render(G3.scene, G3.cam);
  }

