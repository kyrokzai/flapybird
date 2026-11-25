  // =================================================================== Astana 3D: floors, props, walls and landmarks per theme
  function themeFloor(theme, n, obs) {
    if (isSteppe(theme)) return steppeFloor(theme, n, obs);
    const S = 1.6, AW = ARENA.w, AH = ARENA.h;
    return canvasTex(Math.round(AW * S), Math.round(AH * S), (g) => {
      g.scale(S, S);
      const r = mulberry32(n * 977 + 3);
      const noise = (k, a, b) => { for (let i = 0; i < k; i++) { g.fillStyle = r() < 0.5 ? a : b; g.fillRect(r() * AW, r() * AH, 1 + r() * 2, 1 + r() * 2); } };
      if (theme === 'park') {
        const gr = g.createLinearGradient(0, 0, 0, AH); gr.addColorStop(0, '#6f8c3b'); gr.addColorStop(1, '#83a046');
        g.fillStyle = gr; g.fillRect(0, 0, AW, AH);
        for (let i = 0; i < 40; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'; g.beginPath(); g.ellipse(r() * AW, r() * AH, 20 + r() * 40, 10 + r() * 20, r() * 3, 0, TAU); g.fill(); }
        // winding paved path from the entrance to the gate
        g.lineCap = 'round';
        const path = () => { g.beginPath(); for (let y = AH; y >= 0; y -= 8) { const x = AW / 2 + Math.sin(y / 70 + n) * 60; y === AH ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); };
        g.strokeStyle = '#b9ab8c'; g.lineWidth = 34; path();
        g.strokeStyle = '#d8ccb0'; g.lineWidth = 28; path();
        g.save(); g.setLineDash([6, 7]); g.strokeStyle = 'rgba(120,105,80,0.35)'; g.lineWidth = 26; path(); g.restore();
        g.lineCap = 'round';
        for (let i = 0; i < 420; i++) { const x = r() * AW, y = r() * AH; g.strokeStyle = r() < 0.6 ? '#5f8a32' : '#a8c868'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 2, y - 4); g.lineTo(x, y); g.lineTo(x + 2, y - 4.5); g.stroke(); }
        for (let i = 0; i < 50; i++) { g.fillStyle = ['#e0313a', '#f5c22e', '#ffffff', '#d85ac8'][Math.floor(r() * 4)]; g.beginPath(); g.arc(r() * AW, r() * AH, 1.8 + r(), 0, TAU); g.fill(); }
      } else if (theme === 'street') {
        g.fillStyle = '#4a4d52'; g.fillRect(0, 0, AW, AH);
        noise(2200, 'rgba(255,255,255,0.06)', 'rgba(0,0,0,0.12)');
        // sidewalks on both sides
        for (const x0 of [0, AW - 40]) {
          g.fillStyle = '#b9b6ae'; g.fillRect(x0, 0, 40, AH);
          g.strokeStyle = 'rgba(80,75,70,0.4)'; g.lineWidth = 1;
          for (let y = 0; y < AH; y += 13) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 40, y); g.stroke(); }
          for (let y = 0; y < AH; y += 26) { g.beginPath(); g.moveTo(x0 + 20, y); g.lineTo(x0 + 20, y + 13); g.stroke(); }
          g.fillStyle = '#8f8c86'; g.fillRect(x0 === 0 ? 38 : AW - 40, 0, 2, AH);
        }
        g.fillStyle = '#f2c230'; g.fillRect(AW / 2 - 3, 0, 2, AH); g.fillRect(AW / 2 + 1, 0, 2, AH);
        g.fillStyle = 'rgba(255,255,255,0.85)';
        for (const lx of [100, 220]) for (let y = 6; y < AH; y += 34) g.fillRect(lx - 1, y, 2.5, 18);
        for (const zy of [70, AH - 140]) for (let x = 46; x < AW - 46; x += 16) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillRect(x, zy, 9, 34); }
        for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(50 + r() * (AW - 100), r() * AH, 8 + r() * 10, 5 + r() * 6, r() * 3, 0, TAU); g.fill(); }
        for (let i = 0; i < 3; i++) { const x = 60 + r() * (AW - 120), y = r() * AH; g.fillStyle = '#3a3c40'; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill(); g.strokeStyle = '#5a5c60'; g.lineWidth = 1; g.stroke(); }
      } else if (theme === 'office') {
        for (let y = 0; y < AH; y += 20) for (let x = 0; x < AW; x += 20) { g.fillStyle = ((x + y) / 20) % 2 ? '#5f6672' : '#676f7c'; g.fillRect(x, y, 20, 20); }
        noise(2600, 'rgba(255,255,255,0.05)', 'rgba(0,0,0,0.07)');
        g.fillStyle = '#9aa0a8'; g.fillRect(AW / 2 - 34, 0, 68, AH);
        g.fillStyle = 'rgba(255,255,255,0.08)'; for (let y = 0; y < AH; y += 8) g.fillRect(AW / 2 - 34, y, 68, 1);
        g.strokeStyle = '#c9a94a'; g.lineWidth = 2; g.strokeRect(AW / 2 - 34, -2, 68, AH + 4);
        for (let y = 60; y < AH; y += 160) { g.fillStyle = 'rgba(255,240,200,0.06)'; g.beginPath(); g.ellipse(AW / 2, y, 140, 50, 0, 0, TAU); g.fill(); }
      } else {
        const gr = g.createLinearGradient(0, 0, 0, AH); gr.addColorStop(0, '#e9cf98'); gr.addColorStop(1, '#dcbc80');
        g.fillStyle = gr; g.fillRect(0, 0, AW, AH);
        noise(3000, 'rgba(255,255,255,0.12)', 'rgba(120,90,40,0.12)');
        g.strokeStyle = 'rgba(160,120,60,0.25)'; g.lineWidth = 1.5;
        for (let y = 10; y < AH; y += 22) { g.beginPath(); for (let x = 0; x <= AW; x += 10) g.lineTo(x, y + Math.sin(x / 25 + y) * 3); g.stroke(); }
        g.fillStyle = '#a77a4a'; g.fillRect(AW / 2 - 22, 0, 44, AH);
        g.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < AH; y += 12) g.fillRect(AW / 2 - 22, y, 44, 1.5);
      }
      for (const o of obs) {
        const ox = o.x - ARENA.x, oy = o.y - ARENA.y;
        if (o.kind === 'water' && (theme === 'park' || theme === 'beach')) { g.fillStyle = theme === 'beach' ? '#f2f2f0' : '#b8a678'; g.fillRect(ox - 5, oy - 5, CELL + 10, CELL + 10); }
        else if (o.kind !== 'water') { g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); g.ellipse(ox + 20, oy + 22, 21, 17, 0, 0, TAU); g.fill(); }
      }
      const edge = (x, y, w, h, x0, y0, x1, y1) => { const e = g.createLinearGradient(x0, y0, x1, y1); e.addColorStop(0, 'rgba(0,0,0,0.3)'); e.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = e; g.fillRect(x, y, w, h); };
      edge(0, 0, AW, 16, 0, 0, 0, 16); edge(0, 0, 14, AH, 0, 0, 14, 0); edge(AW - 14, 0, 14, AH, AW, 0, AW - 14, 0);
    });
  }

  // --- props
  function themeProp(theme, kind, o, cx, cz) {
    const r = mulberry32(o.seed * 7 + 13);
    const g = new THREE.Group(); g.position.set(cx, 0, cz);
    const add = (geo, m, x, y, z, sx, sy, sz) => { const me = mesh(geo, m, x, y, z, sx, sy, sz); me.receiveShadow = true; g.add(me); return me; };
    const M = (h, o2) => mat(h, o2);
    if (isSteppe(theme)) return steppeProp(theme, kind, o, cx, cz);
    if (kind === 'water') {
      if (theme === 'park' || theme === 'beach') {
        const w = new THREE.Mesh(G3.geo.plane, G3.waterMat); w.rotation.x = -Math.PI / 2; w.position.y = 0.03; w.receiveShadow = true; g.add(w);
        if (theme === 'park' && r() < 0.5) for (let i = 0; i < 4; i++) { const reed = add(G3.geo.cyl, M('#5e7a2e'), -0.4 + r() * 0.2 + i * 0.05, 0.2, -0.42, 0.012, 0.4 + r() * 0.2, 0.012); reed.rotation.z = (r() - 0.5) * 0.3; }
        if (theme === 'beach' && r() < 0.4) add(G3.geo.cyl, M('#ff6a4a'), (r() - 0.5) * 0.5, 0.06, (r() - 0.5) * 0.5, 0.14, 0.05, 0.14);
      } else if (theme === 'street') {
        add(G3.geo.box, M('#a9a59c'), 0, 0.08, 0, 0.92, 0.16, 0.92);
        add(G3.geo.box, M('#4a3322', { r: 1 }), 0, 0.165, 0, 0.82, 0.02, 0.82);
        for (let i = 0; i < 12; i++) {
          const x = (r() - 0.5) * 0.7, z = (r() - 0.5) * 0.7;
          add(G3.geo.cyl, M('#4d7a2a'), x, 0.24, z, 0.01, 0.14, 0.01);
          add(G3.geo.sLow, M(['#e0313a', '#f5c22e', '#ff7aa8'][i % 3], { e: '#300', ei: 0.2 }), x, 0.33, z, 0.04, 0.055, 0.04);
        }
      } else {
        add(G3.geo.box, M('#7a5232', { r: 0.6 }), 0, 0.18, 0, 0.94, 0.36, 0.3);
        for (let i = 0; i < 5; i++) add(G3.geo.sphere, M('#3f7a32', { r: 0.9 }), -0.36 + i * 0.18, 0.42, 0, 0.11, 0.1, 0.11);
      }
      return g;
    }
    const big = kind === 'yurt';
    if (theme === 'park') {
      if (big) {
        const v = r();
        if (v < 0.35) G3.fountains.push([cx, cz]);
        if (v < 0.35 && G3.models.prop_fountain) g.add(propModel('prop_fountain', 0.98, 'w'));
        else if (v < 0.35) { // fountain
          add(G3.geo.cyl, M('#cfc6b6', { r: 0.7 }), 0, 0.12, 0, 0.47, 0.24, 0.47);
          const w = add(G3.geo.cyl, G3.waterMat, 0, 0.23, 0, 0.42, 0.02, 0.42);
          add(G3.geo.cyl, M('#cfc6b6'), 0, 0.45, 0, 0.07, 0.5, 0.07);
          add(G3.geo.cyl, M('#cfc6b6'), 0, 0.7, 0, 0.2, 0.05, 0.2);
          const jet = glow('#bfe6ff', 0.9, 0.7); jet.position.y = 0.85; g.add(jet);
          w.castShadow = false;
        } else if (v < 0.6) { // gazebo / беседка
          const wood = M('#8a5a32', { r: 0.6 });
          for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; add(G3.geo.cyl, wood, Math.cos(a) * 0.38, 0.35, Math.sin(a) * 0.38, 0.03, 0.7, 0.03); }
          const roof = add(G3.geo.cone4, M('#2f6b5a', { r: 0.6 }), 0, 0.88, 0, 0.6, 0.35, 0.6); roof.rotation.y = Math.PI / 6;
          add(G3.geo.cyl, M('#c8b48a'), 0, 0.03, 0, 0.45, 0.06, 0.45);
        } else { const y = makeYurt(0, 0); g.add(y); }
      } else {
        const v = r();
        if (v < 0.2 && G3.models.balbal) { const b = G3.models.balbal.clone(); b.scale.setScalar(1.05); g.add(b); }
        else if (v < 0.55 && G3.models.prop_birch && r() < 0.55) { const t = propModel('prop_birch', 2.2 + r() * 0.6, 'h'); t.rotation.y = r() * TAU; g.add(t); }
        else if (v < 0.55 && G3.models.prop_tree) { const t = propModel('prop_tree', 1.5 + r() * 0.5, 'h'); t.rotation.y = r() * TAU; g.add(t); }
        else if (v < 0.55) { // tree
          add(G3.geo.cyl, M('#6b4a2e'), 0, 0.3, 0, 0.07, 0.6, 0.07);
          const leaf = M(r() < 0.5 ? '#4f7f35' : '#5f9440', { r: 0.9, flat: true });
          for (let i = 0; i < 4; i++) add(G3.geo.dodeca, leaf, (r() - 0.5) * 0.3, 0.75 + r() * 0.25, (r() - 0.5) * 0.3, 0.28 + r() * 0.1);
        } else if (v < 0.8 && G3.models.prop_bench) { const bm = propModel('prop_bench', 0.9, 'w'); bm.rotation.y = r() < 0.5 ? 0 : Math.PI / 2; g.add(bm);
        } else if (v < 0.8) { // bench
          const wood = M('#a0683a', { r: 0.6 }), iron = M('#2a2a2a', { m: 0.6, r: 0.5 });
          for (const z of [-0.06, 0, 0.06]) add(G3.geo.box, wood, 0, 0.22, z, 0.8, 0.03, 0.05);
          add(G3.geo.box, wood, 0, 0.38, -0.12, 0.8, 0.12, 0.03);
          for (const x of [-0.35, 0.35]) add(G3.geo.box, iron, x, 0.11, 0, 0.04, 0.22, 0.26);
          g.rotation.y = r() < 0.5 ? 0 : Math.PI / 2;
        } else { // bush + lamp
          const b = M('#3f6f2a', { r: 1, flat: true });
          add(G3.geo.dodeca, b, -0.12, 0.2, 0, 0.26); add(G3.geo.dodeca, b, 0.14, 0.17, 0.08, 0.22);
          add(G3.geo.cyl, M('#2a2a2a', { m: 0.6 }), 0.25, 0.55, -0.25, 0.025, 1.1, 0.025);
          const l = add(G3.geo.sphere, M('#fff6d8', { e: '#ffe9a0', ei: 1.2 }), 0.25, 1.12, -0.25, 0.07); l.castShadow = false;
        }
      }
    } else if (theme === 'street') {
      if (big) {
        if (r() < 0.6 && G3.models.prop_busstop) { g.add(propModel('prop_busstop', 0.98, 'w')); }
        else if (r() < 0.6) { // bus stop
          const steel = M('#5d6670', { m: 0.7, r: 0.4 }), glass = M('#9fd3ee', { op: 0.35, r: 0.05, m: 0.3 });
          add(G3.geo.box, steel, 0, 0.82, 0, 0.95, 0.05, 0.5);
          add(G3.geo.box, glass, 0, 0.42, -0.22, 0.9, 0.78, 0.02);
          for (const x of [-0.45, 0.45]) add(G3.geo.box, steel, x, 0.42, -0.22, 0.04, 0.84, 0.04);
          add(G3.geo.box, M('#ffffff', { map: G3.wallTex, e: '#402010', ei: 0.4 }), 0.47, 0.45, 0.02, 0.03, 0.5, 0.4);
          add(G3.geo.box, M('#8a5a32'), 0, 0.22, -0.12, 0.7, 0.04, 0.16);
        } else { // monument on a pedestal
          add(G3.geo.box, M('#8d8a84', { r: 0.6 }), 0, 0.25, 0, 0.6, 0.5, 0.6);
          add(G3.geo.box, M('#a8a49c', { r: 0.6 }), 0, 0.53, 0, 0.5, 0.06, 0.5);
          const gold = M('#e0b04a', { m: 1, r: 0.25 });
          add(G3.geo.cyl, gold, 0, 0.85, 0, 0.08, 0.55, 0.08); add(G3.geo.sphere, gold, 0, 1.18, 0, 0.1);
          const w = add(G3.geo.box, gold, 0, 0.98, 0, 0.5, 0.04, 0.06); w.rotation.z = 0.3;
        }
      } else {
        const v = r();
        if (v < 0.65 && G3.models.prop_car) { const cm = propModel('prop_car', 0.95, 'w'); cm.rotation.y = Math.PI / 2 + (r() < 0.5 ? 0 : Math.PI) + (r() - 0.5) * 0.25; g.add(cm); }
        else if (v < 0.65) { // car
          const colors = ['#d8dbe0', '#1f2a3a', '#b8262e', '#e8e3d6', '#2f5f9a', '#3a3a3a', '#f2c230'];
          const paint = M(colors[Math.floor(r() * colors.length)], { m: 0.6, r: 0.3 }), glass = M('#1c2633', { m: 0.5, r: 0.1 }), tyre = M('#151515');
          const car = new THREE.Group();
          car.add(mesh(G3.geo.box, paint, 0, 0.19, 0, 0.44, 0.17, 0.86));
          car.add(mesh(G3.geo.box, glass, 0, 0.33, -0.04, 0.38, 0.14, 0.44));
          car.add(mesh(G3.geo.box, paint, 0, 0.405, -0.04, 0.36, 0.02, 0.4));
          for (const x of [-0.22, 0.22]) for (const z of [-0.28, 0.28]) { const w = mesh(G3.geo.cyl, tyre, x, 0.1, z, 0.1, 0.06, 0.1); w.rotation.z = Math.PI / 2; car.add(w); }
          for (const x of [-0.14, 0.14]) car.add(mesh(G3.geo.box, M('#fff8d8', { e: '#ffe9a0', ei: 1 }), x, 0.2, 0.43, 0.08, 0.04, 0.01, false));
          car.rotation.y = (r() < 0.5 ? 0 : Math.PI) + (r() - 0.5) * 0.25;
          car.traverse(m2 => { if (m2.isMesh) m2.receiveShadow = true; });
          g.add(car);
        } else if (v < 0.85) { // kiosk
          add(G3.geo.box, M('#2f6fa8', { r: 0.5 }), 0, 0.3, 0, 0.62, 0.6, 0.5);
          add(G3.geo.box, M('#f2c230'), 0, 0.64, 0, 0.7, 0.08, 0.58);
          add(G3.geo.box, M('#bfe6ff', { e: '#406080', ei: 0.4 }), 0, 0.36, 0.26, 0.5, 0.24, 0.01);
        } else { // planter with a tree and bollards
          add(G3.geo.box, M('#a9a59c'), 0, 0.15, 0, 0.6, 0.3, 0.6);
          add(G3.geo.cyl, M('#6b4a2e'), 0, 0.5, 0, 0.05, 0.5, 0.05);
          add(G3.geo.dodeca, M('#4f7f35', { flat: true }), 0, 0.85, 0, 0.3);
        }
      }
    } else if (theme === 'office') {
      if (big) {
        const v = r();
        if (v < 0.4 && G3.models.prop_server) { const sm = propModel('prop_server', 1.25, 'h'); sm.rotation.y = r() < 0.5 ? 0 : Math.PI; g.add(sm); }
        else if (v < 0.4) { // server racks
          for (const x of [-0.22, 0.22]) {
            add(G3.geo.box, M('#1b1e24', { m: 0.4, r: 0.4 }), x, 0.55, 0, 0.4, 1.1, 0.45);
            for (let k = 0; k < 6; k++) add(G3.geo.box, M(k % 3 ? '#3fd06a' : '#3fa0ff', { e: k % 3 ? '#20ff60' : '#2080ff', ei: 1.6 }), x - 0.12, 0.2 + k * 0.15, 0.226, 0.06, 0.012, 0.005).castShadow = false;
          }
        } else if (v < 0.75) { // meeting table
          const t = add(G3.geo.cyl, M('#5a3a24', { r: 0.4 }), 0, 0.36, 0, 0.45, 0.04, 0.32); t.scale.set(0.47, 0.04, 0.34);
          add(G3.geo.cyl, M('#8a8f96', { m: 0.7 }), 0, 0.18, 0, 0.05, 0.36, 0.05);
          for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; add(G3.geo.box, M('#2a2f38'), Math.cos(a) * 0.48, 0.2, Math.sin(a) * 0.36, 0.14, 0.04, 0.14); add(G3.geo.box, M('#2a2f38'), Math.cos(a) * 0.56, 0.32, Math.sin(a) * 0.42, 0.04, 0.2, 0.14).rotation.y = -a; }
        } else { // sofa + coffee table
          const fabric = M('#3f5f8a', { r: 0.95 });
          add(G3.geo.box, fabric, 0, 0.14, -0.15, 0.9, 0.2, 0.35); add(G3.geo.box, fabric, 0, 0.32, -0.32, 0.9, 0.3, 0.1);
          for (const x of [-0.45, 0.45]) add(G3.geo.box, fabric, x, 0.24, -0.18, 0.08, 0.2, 0.38);
          add(G3.geo.box, M('#d8d2c8', { r: 0.3 }), 0, 0.15, 0.25, 0.5, 0.04, 0.26);
        }
      } else {
        const v = r();
        if (v < 0.65 && G3.models.prop_desk) { const dm2 = propModel('prop_desk', 0.92, 'w'); dm2.rotation.y = r() < 0.5 ? 0 : Math.PI; g.add(dm2); }
        else if (v < 0.65) { // workstation
          const desk = new THREE.Group();
          desk.add(mesh(G3.geo.box, M('#eceae6', { r: 0.4 }), 0, 0.38, 0, 0.86, 0.04, 0.5));
          for (const x of [-0.4, 0.4]) desk.add(mesh(G3.geo.box, M('#8a8f96', { m: 0.7 }), x, 0.19, 0, 0.03, 0.38, 0.46));
          desk.add(mesh(G3.geo.box, M('#14161a', { m: 0.4 }), 0, 0.55, -0.15, 0.36, 0.22, 0.02));
          desk.add(mesh(G3.geo.box, M('#5fb4ff', { e: '#3a8fe0', ei: 1.3 }), 0, 0.55, -0.138, 0.33, 0.19, 0.002, false));
          desk.add(mesh(G3.geo.box, M('#2a2d33'), 0, 0.405, 0.05, 0.26, 0.01, 0.09));
          desk.add(mesh(G3.geo.cyl, M('#2a2f38'), 0, 0.22, 0.32, 0.13, 0.05, 0.13));
          desk.add(mesh(G3.geo.box, M('#2a2f38'), 0, 0.38, 0.44, 0.24, 0.28, 0.04));
          if (r() < 0.5) desk.add(mesh(G3.geo.cyl, M('#d0e8f8', { r: 0.2 }), 0.3, 0.44, 0.05, 0.03, 0.08, 0.03));
          desk.rotation.y = r() < 0.5 ? 0 : Math.PI;
          desk.traverse(m2 => { if (m2.isMesh) m2.receiveShadow = true; });
          g.add(desk);
        } else if (v < 0.85) { // potted plant
          add(G3.geo.cyl, M('#e8e2d8', { r: 0.4 }), 0, 0.16, 0, 0.14, 0.32, 0.14);
          const leaf = M('#3f8a3a', { r: 0.8 });
          for (let i = 0; i < 7; i++) { const l = add(G3.geo.cone, leaf, Math.cos(i) * 0.08, 0.55, Math.sin(i) * 0.08, 0.05, 0.5, 0.02); l.rotation.set(Math.sin(i) * 0.5, i, Math.cos(i) * 0.5); }
        } else { // copier / cabinet
          add(G3.geo.box, M('#d8d8d4', { r: 0.5 }), 0, 0.35, 0, 0.5, 0.7, 0.45);
          add(G3.geo.box, M('#3a3f46'), 0, 0.72, 0, 0.46, 0.04, 0.4);
          for (let k = 0; k < 3; k++) add(G3.geo.box, M('#bdbdb8'), 0, 0.15 + k * 0.18, 0.226, 0.44, 0.015, 0.005);
        }
      }
    } else { // beach
      if (big && G3.models.prop_umbrella) { const u = propModel('prop_umbrella', 1.25, 'h'); u.rotation.y = r() * TAU; g.add(u); }
      else if (big) { // beach umbrella with a table
        add(G3.geo.cyl, M('#e8e2d6'), 0, 0.5, 0, 0.025, 1.0, 0.025);
        const um = canvasTex(64, 8, (c, w2) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e8463a'; c.fillRect(i * w2 / 8, 0, w2 / 8, 8); } }, true);
        add(new THREE.ConeGeometry(0.6, 0.3, 16, 1, true), M('#ffffff', { map: um, ds: true }), 0, 1.05, 0);
        add(G3.geo.cyl, M('#f4efe6'), 0, 0.36, 0, 0.3, 0.03, 0.3);
      } else if (r() < 0.6 && G3.models.prop_palm) { const p = propModel('prop_palm', 2.0 + r() * 0.5, 'h'); p.rotation.y = r() * TAU; g.add(p);
      } else if (r() < 0.6) { // palm tree
        const trunk = M('#8a6a44', { r: 0.9 });
        let x = 0, y = 0;
        for (let i = 0; i < 6; i++) { add(G3.geo.cyl, trunk, x, y + 0.11, 0, 0.06 - i * 0.004, 0.22, 0.06 - i * 0.004); x += 0.035; y += 0.2; }
        const leaf = M('#3f8a3a', { ds: true, r: 0.8 });
        for (let i = 0; i < 7; i++) { const l = add(G3.geo.plane, leaf, x + Math.cos(i * 0.9) * 0.3, y + 0.05, Math.sin(i * 0.9) * 0.3, 0.7, 0.16, 1); l.rotation.set(-Math.PI / 2 + 0.5, 0, i * 0.9); }
      } else { // sun lounger
        add(G3.geo.box, M('#f4efe6'), 0, 0.12, 0, 0.32, 0.04, 0.8);
        add(G3.geo.box, M('#f4efe6'), 0, 0.25, -0.33, 0.32, 0.04, 0.25).rotation.x = 0.8;
        add(G3.geo.box, M(['#3aa0d8', '#f2c230', '#e8463a'][Math.floor(r() * 3)]), 0, 0.145, 0.05, 0.28, 0.01, 0.5);
        g.rotation.y = (r() - 0.5) * 0.6;
      }
    }
    return g;
  }

  // --- landmarks of Astana (seen in the camera fly-over at the start of each room)
  function windowsTex(base, lit) {
    return canvasTex(64, 128, (g, w, h) => {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      const r = mulberry32(base.length * 7);
      for (let y = 4; y < h; y += 8) for (let x = 3; x < w; x += 8) { g.fillStyle = r() < 0.35 ? lit : 'rgba(255,255,255,0.18)'; g.fillRect(x, y, 5, 5); }
    }, true);
  }
  // generated landmark models are normalised to ~1 unit around the origin: scale to a real-looking height and stand them on the ground
  const LM_HEIGHT = { portal: 10, baiterek: 14, khanshatyr: 14, nuralem: 9, akorda: 9, station: 5.5 };
  function landmarkModel(kind) {
    if (kind === 'towers' && G3.models.lm_towers) {
      // a cluster of emerald skyscrapers of different heights
      const src = G3.models.lm_towers, box = new THREE.Box3().setFromObject(src), g = new THREE.Group(), r = mulberry32(5);
      for (let i = 0; i < 6; i++) {
        const k = (8 + r() * 9) / (box.max.y - box.min.y), m = src.clone();
        m.scale.setScalar(k); m.position.set((i - 2.5) * 3.4 + r(), -box.min.y * k, -r() * 4); m.rotation.y = r() * TAU;
        m.traverse(o => { if (o.isMesh) o.castShadow = false; });
        g.add(m);
      }
      return g;
    }
    const src = G3.models['lm_' + kind];
    if (!src) return null;
    const m = src.clone();
    const box = new THREE.Box3().setFromObject(src), k = LM_HEIGHT[kind] / (box.max.y - box.min.y);
    m.scale.setScalar(k); m.position.y = -box.min.y * k;
    m.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
    const g = new THREE.Group(); g.add(m);
    return g;
  }
  // small generated props, normalised the same way: fit to a height ('h') or a footprint width ('w')
  function propModel(name, size, by) {
    const src = G3.models[name], box = new THREE.Box3().setFromObject(src);
    const k = by === 'w' ? size / Math.max(box.max.x - box.min.x, box.max.z - box.min.z) : size / (box.max.y - box.min.y);
    const m = src.clone(); m.scale.setScalar(k); m.position.y = -box.min.y * k;
    m.traverse(o => { if (o.isMesh) o.receiveShadow = true; });
    const g = new THREE.Group(); g.add(m);
    return g;
  }

  // many copies of one model, one draw call per mesh (hedges, railings, street lamps). Each place is
  // { x, z, ry, w, h, l }: world size across (model x), up (y) and along (model z); a missing size keeps the proportions.
  // pivot: model-space [x, z] that lands on (x, z); by default the middle of the bounding box.
  function propInstances(name, places, pivot) {
    const src = G3.models[name]; if (!src || !places.length) return null;
    src.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(src), bs = box.getSize(new THREE.Vector3());
    const px = pivot ? pivot[0] : (box.min.x + box.max.x) / 2, pz = pivot ? pivot[1] : (box.min.z + box.max.z) / 2;
    const g = new THREE.Group(), base = new THREE.Matrix4().makeTranslation(-px, -box.min.y, -pz), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    const mats = places.map(p => {
      const k = p.h ? p.h / bs.y : p.l ? p.l / bs.z : p.w / bs.x;
      const sc = new THREE.Vector3(p.w ? p.w / bs.x : k, p.h ? p.h / bs.y : k, p.l ? p.l / bs.z : k);
      return new THREE.Matrix4().compose(new THREE.Vector3(p.x, p.y || 0, p.z), q.setFromAxisAngle(up, p.ry || 0).clone(), sc).multiply(base);
    });
    src.traverse(o => {
      if (!o.isMesh) return;
      const im = new THREE.InstancedMesh(o.geometry, o.material, places.length);
      mats.forEach((m, i) => im.setMatrixAt(i, m4.multiplyMatrices(m, o.matrixWorld)));
      im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;   // the base bounding sphere does not cover the instances
      g.add(im);
    });
    return g;
  }

  // 360° panoramas (equirectangular) drawn on a sphere that follows the camera; also used for metal reflections
  const SKY_KEYS = { park: 'SKY_PARK', menu: 'SKY_MENU', street: 'SKY_STREET', office: 'SKY_OFFICE', beach: 'SKY_BEACH', steppe_gold: 'SKY_STEPPE_GOLD', steppe_night: 'SKY_STEPPE_NIGHT', steppe_blood: 'SKY_STEPPE_BLOOD' };
  function loadSky(name, done) {
    const key = SKY_KEYS[name];
    const go = () => {
      if (!window[key]) { done && done(); return; }
      new THREE.TextureLoader().load(window[key], tex => {
        window[key] = null;
        tex.encoding = THREE.sRGBEncoding; tex.mapping = THREE.EquirectangularReflectionMapping;
        G3.skyTex[name] = tex; G3.dirty = true; done && done();
      }, undefined, () => done && done());
    };
    if (window[key]) go();
    else { const sc = document.createElement('script'); sc.src = 'assets/sky_' + name + '.js'; sc.onload = go; sc.onerror = () => done && done(); document.head.appendChild(sc); }
  }
  function setPano(name, yaw) {
    const tex = name && G3.skyTex[name];
    if (!G3.pano) {
      G3.pano = new THREE.Mesh(new THREE.SphereGeometry(88, 64, 32), new THREE.MeshBasicMaterial({ side: THREE.BackSide, depthWrite: false, fog: false }));
      G3.pano.renderOrder = -1; G3.pano.frustumCulled = false; G3.pano.scale.x = -1; G3.scene.add(G3.pano);
    }
    G3.pano.visible = !!tex; G3.sky.visible = !tex;
    if (!tex) return false;
    G3.pano.material.map = name === 'menu' ? blurredTex(tex, name) : tex; G3.pano.material.color.setScalar(name === 'menu' ? 0.62 : 1.35); G3.pano.material.needsUpdate = true;
    G3.pano.rotation.y = yaw || 0;
    const rt = G3.pmrem.fromEquirectangular(tex);
    if (G3.envRT) G3.envRT.dispose();
    G3.envRT = rt;
    for (const m of G3.metalMats) { if (!m.envMap) m.needsUpdate = true; m.envMap = rt.texture; }
    return true;
  }

  function landmark(kind) {
    const g = new THREE.Group();
    const white = mat('#f2f1ec', { r: 0.5 }), gold = mat('#ffcf5a', { m: 1, r: 0.18, e: '#6a3a00', ei: 0.25 });
    const glassBlue = mat('#7fb4e0', { m: 0.85, r: 0.08 });
    const add = (geo, m, x, y, z, sx, sy, sz) => { const me = mesh(geo, m, x, y, z, sx, sy, sz); g.add(me); return me; };
    switch (kind) {
      case 'baiterek': {
        add(G3.geo.cyl, mat('#d8d4ca'), 0, 0.3, 0, 2.6, 0.6, 2.6);
        add(new THREE.CylinderGeometry(0.42, 0.8, 9.5, 18), white, 0, 5.3, 0);
        for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; const b = add(G3.geo.cyl, white, Math.cos(a) * 0.95, 10.6, Math.sin(a) * 0.95, 0.07, 2.6, 0.07); b.rotation.set(Math.sin(a) * 0.75, 0, -Math.cos(a) * 0.75); }
        add(G3.geo.sphere, gold, 0, 12.2, 0, 1.35);
        const gl = glow('#ffd36a', 6, 0.35); gl.position.y = 12.2; g.add(gl);
        break;
      }
      case 'khanshatyr': {
        const geo = new THREE.ConeGeometry(7, 13, 28, 8, true);
        const p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) { const y = p.getY(i) + 6.5; p.setX(i, p.getX(i) + y * 0.12); }
        geo.computeVertexNormals();
        const net = canvasTex(128, 128, (c) => { c.fillStyle = '#efe4bd'; c.fillRect(0, 0, 128, 128); c.strokeStyle = 'rgba(140,120,80,0.5)'; c.lineWidth = 2; for (let i = 0; i <= 128; i += 16) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 128); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(128, i); c.stroke(); } }, true);
        net.repeat.set(8, 4);
        const tent = new THREE.Mesh(geo, mat('#ffffff', { map: net, r: 0.4, ds: true, e: '#5a4a20', ei: 0.25 })); tent.position.y = 6.5; tent.castShadow = true; g.add(tent);
        add(G3.geo.cyl, white, 1.56, 13.8, 0, 0.12, 2.2, 0.12);
        add(G3.geo.cyl, mat('#cfc6b6'), 0, 0.4, 0, 7.2, 0.8, 7.2);
        break;
      }
      case 'nuralem': {
        const grid = canvasTex(256, 128, (c) => { c.fillStyle = '#5f9ad0'; c.fillRect(0, 0, 256, 128); c.strokeStyle = 'rgba(230,245,255,0.7)'; c.lineWidth = 2; for (let i = 0; i <= 256; i += 16) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 128); c.stroke(); } for (let i = 0; i <= 128; i += 12) { c.beginPath(); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); } });
        add(G3.geo.sphere, mat('#ffffff', { map: grid, m: 0.8, r: 0.1, e: '#103050', ei: 0.4 }), 0, 4.6, 0, 4);
        add(G3.geo.cyl, mat('#cfd4da', { m: 0.5 }), 0, 0.4, 0, 3.2, 0.8, 3.2);
        add(G3.geo.cyl, mat('#cfd4da', { m: 0.5 }), 0, 0.9, 0, 1.2, 1, 1.2);
        break;
      }
      case 'pyramid': {
        const p = add(G3.geo.cone4, mat('#d8cdb8', { r: 0.6, flat: true }), 0, 3.6, 0, 6, 7.2, 6); p.rotation.y = Math.PI / 4;
        const t = add(G3.geo.cone4, mat('#6fb0e0', { m: 0.8, r: 0.1, e: '#1a4a7a', ei: 0.4 }), 0, 6.45, 0, 1.6, 1.5, 1.6); t.rotation.y = Math.PI / 4;
        break;
      }
      case 'akorda': {
        add(G3.geo.box, white, 0, 1.4, 0, 11, 2.8, 4);
        for (let i = -5; i <= 5; i++) add(G3.geo.cyl, mat('#e6e2d8'), i * 0.9, 1.4, 2.05, 0.14, 2.6, 0.14);
        add(G3.geo.box, white, 0, 3.2, 0, 4, 0.9, 3);
        add(G3.geo.cyl, white, 0, 4.1, 0, 1.6, 1.0, 1.6);
        add(G3.geo.dome, mat('#3f7fd0', { m: 0.5, r: 0.3 }), 0, 4.6, 0, 1.7, 1.9, 1.7);
        add(G3.geo.cyl, gold, 0, 7.1, 0, 0.1, 1.4, 0.1); add(G3.geo.sphere, gold, 0, 7.9, 0, 0.3);
        break;
      }
      case 'station': {
        add(G3.geo.box, mat('#ffffff', { map: windowsTex('#4a6f9a', '#ffe9b0'), m: 0.4, r: 0.2 }), 0, 1.6, 0, 14, 3.2, 4);
        const roof = add(new THREE.CylinderGeometry(2.4, 2.4, 14, 24, 1, false, 0, Math.PI), mat('#bcd8ee', { m: 0.7, r: 0.15 }), 0, 3.2, 0); roof.rotation.z = Math.PI / 2;
        break;
      }
      case 'towers': {
        const r = mulberry32(5);
        for (let i = 0; i < 6; i++) {
          const h = 7 + r() * 9, w = 1.6 + r() * 1.2, emerald = i % 2 === 0;
          const t = add(G3.geo.box, mat('#ffffff', { map: windowsTex(emerald ? '#2f7a6a' : '#5a6f8a', '#fff0c0'), m: 0.5, r: 0.15 }), (i - 2.5) * 3.2 + r(), h / 2, -r() * 4, w, h, w);
          t.material.map.repeat.set(1, h / 6);
          if (emerald) { const c = add(G3.geo.cone4, mat('#3f9a88', { m: 0.6, r: 0.2 }), t.position.x, h + 1.2, t.position.z, w * 0.72, 2.4, w * 0.72); c.rotation.y = Math.PI / 4; }
        }
        break;
      }
    }
    g.traverse(o => { if (o.isMesh) o.castShadow = false; });
    return g;
  }

  // --- walls and gate per theme
  function themeWalls(R, theme, zN, zS) {
    const len = zS - zN, zc = (zN + zS) / 2;
    const hedge = theme === 'park' && G3.models.prop_hedge, fence = theme === 'street' && G3.models.prop_fence, runs = [];
    // the owner's hedge / railing models are laid end to end along the wall, stretched a little so the pieces meet exactly
    const lay = (L, alongX, x, z, piece, w, h, y) => {
      const n = Math.max(1, Math.round(L / piece)), l = L / n;
      for (let i = 0; i < n; i++) { const t = -L / 2 + l * (i + 0.5); runs.push({ x: x + (alongX ? t : 0), y, z: z + (alongX ? 0 : t), ry: alongX ? Math.PI / 2 : 0, w, h, l: l * 1.02 }); }
    };
    const seg = (L, alongX, x, z) => {
      if (isSteppe(theme)) return;   // the palisade is built by steppeWalls
      if (hedge) lay(L, alongX, x, z, 2.1, 0.42, 0.62);
      else if (fence) {
        const curb = mesh(G3.geo.box, mat('#b8b4ac', { r: 0.7 }), x, 0.1, z, alongX ? L : 0.3, 0.2, alongX ? 0.3 : L); curb.receiveShadow = true; R.add(curb);
        lay(L, alongX, x, z, 1.3, 0.16, 0.6, 0.2);
      } else if (theme === 'park' || theme === 'beach') {
        const h = theme === 'park' ? 0.55 : 0.35;
        const m = theme === 'park' ? mat('#3f6a2c', { r: 1, flat: true }) : mat('#f2efe8', { r: 0.6 });
        const b = mesh(G3.geo.box, m, x, h / 2, z, alongX ? L : 0.32, h, alongX ? 0.32 : L); b.receiveShadow = true; R.add(b);
        if (theme === 'park') { const top = mesh(G3.geo.box, mat('#5a8a3a', { r: 1 }), x, h + 0.02, z, alongX ? L : 0.34, 0.06, alongX ? 0.34 : L); R.add(top); }
      } else if (theme === 'street') {
        const curb = mesh(G3.geo.box, mat('#b8b4ac', { r: 0.7 }), x, 0.1, z, alongX ? L : 0.3, 0.2, alongX ? 0.3 : L); curb.receiveShadow = true; R.add(curb);
        const iron = mat('#2f3338', { m: 0.7, r: 0.4 });
        R.add(mesh(G3.geo.box, iron, x, 0.55, z, alongX ? L : 0.04, 0.04, alongX ? 0.04 : L));
        for (let t = -L / 2; t <= L / 2 + 0.01; t += 0.5) R.add(mesh(G3.geo.cyl, iron, x + (alongX ? t : 0), 0.38, z + (alongX ? 0 : t), 0.02, 0.36, 0.02));
      } else {
        const w = mesh(G3.geo.box, mat('#e8e6e0', { r: 0.8 }), x, 0.5, z, alongX ? L : 0.24, 1.0, alongX ? 0.24 : L); w.receiveShadow = true; R.add(w);
        R.add(mesh(G3.geo.box, mat('#6a4a30'), x, 0.06, z, alongX ? L + 0.02 : 0.26, 0.12, alongX ? 0.26 : L + 0.02));
      }
    };
    seg(3.6, true, -2.55, zN - 0.15); seg(3.6, true, 2.55, zN - 0.15); seg(8.6, true, 0, zS + 0.15);
    seg(len, false, -4.15, zc); seg(len, false, 4.15, zc);
    if (runs.length) R.add(propInstances(hedge ? 'prop_hedge' : 'prop_fence', runs));
    // gate
    G3.doors = [];
    if (theme === 'steppe_blood' && G3.models.stp_gate) steppeSkullGate(R, zN);
    else if (theme !== 'office' && G3.models.prop_gate) {
      // the owner's carved wooden gate: a static frame with the crest, and two leaves hinged on the posts
      const src = G3.models.prop_gate; src.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(src), k = 2.2 / (box.max.z - box.min.z);
      const root = new THREE.Group(); root.position.set(0, -box.min.y * k, zN - 0.15); root.rotation.y = Math.PI / 2; root.scale.setScalar(k); R.add(root);
      src.traverse(o => {
        if (!o.isMesh) return;
        const m = new THREE.Mesh(o.geometry, o.material); m.applyMatrix4(o.matrixWorld); m.castShadow = true; m.receiveShadow = true;
        if (o.name !== 'doorL' && o.name !== 'doorR') { root.add(m); return; }
        const sx = o.name === 'doorL' ? -1 : 1, hx = -0.015, hz = sx * 0.315;   // hinge line on the inner face of the post
        const pv = new THREE.Group(); pv.position.set(hx, 0, hz); m.position.x -= hx; m.position.z -= hz; pv.add(m); root.add(pv);
        G3.doors.push({ pv, sx });
      });
    } else if (theme === 'office') {
      const steel = mat('#9aa2ac', { m: 0.85, r: 0.3 });
      R.add(mesh(G3.geo.box, steel, 0, 1.12, zN - 0.15, 1.8, 0.24, 0.3));
      for (const sx of [-1, 1]) R.add(mesh(G3.geo.box, steel, sx * 0.84, 0.56, zN - 0.15, 0.14, 1.12, 0.3));
      const doorM = mat('#c9ced6', { m: 0.9, r: 0.25 });
      for (const sx of [-1, 1]) {
        const pv = new THREE.Group(); pv.position.set(sx * 0.75, 0, zN - 0.15);
        pv.add(mesh(G3.geo.box, doorM, -sx * 0.375, 0.5, 0, 0.74, 0.98, 0.05)); R.add(pv); G3.doors.push({ pv, sx, slide: true });
      }
      const ind = mesh(G3.geo.box, mat('#3fd06a', { e: '#20ff60', ei: 1.5 }), 0, 1.12, zN, 0.3, 0.08, 0.02, false); R.add(ind);
    } else {
      const post = mat('#8a3a1e', { r: 0.6 }), gold = mat('#f0c040', { r: 0.3, m: 0.75 });
      for (const sx of [-1, 1]) { R.add(mesh(G3.geo.cyl, post, sx * 0.86, 0.65, zN - 0.15, 0.13, 1.3, 0.13)); R.add(mesh(G3.geo.sphere, gold, sx * 0.86, 1.36, zN - 0.15, 0.1)); }
      const lt = G3.wallTex.clone(); lt.needsUpdate = true; lt.repeat.set(2, 1);
      R.add(mesh(G3.geo.box, mat('#ffffff', { map: lt }), 0, 1.32, zN - 0.15, 2.1, 0.3, 0.3));
      R.add(mesh(G3.geo.ring, gold, 0, 1.62, zN - 0.15, 0.2, 0.2, 0.2));
      for (const sx of [-1, 1]) {
        const pv = new THREE.Group(); pv.position.set(sx * 0.75, 0, zN - 0.15);
        pv.add(mesh(G3.geo.box, mat('#ffffff', { map: G3.doorTex, r: 0.7 }), -sx * 0.375, 0.5, 0, 0.75, 0.98, 0.07)); R.add(pv); G3.doors.push({ pv, sx });
      }
    }
    G3.gateGlow = glow('#ffe7a0', 2.4, 0); G3.gateGlow.position.set(0, 0.6, zN - 0.25); R.add(G3.gateGlow);
    G3.gateBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.95, 1, 24, 1, true), new THREE.MeshBasicMaterial({ map: lifeTextures().beam, color: col('#ffe7a0'), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    G3.gateBeam.scale.y = 6; G3.gateBeam.position.set(0, 3, zN - 0.2); R.add(G3.gateBeam);
  }

  const PANO_YAW = { park: -0.19, menu: -Math.PI / 2 + 0.55, street: -Math.PI / 2, office: -Math.PI / 2, beach: -Math.PI / 2, steppe_gold: -Math.PI / 2, steppe_night: -Math.PI / 2, steppe_blood: -Math.PI / 2 };   // image centre faces the gate
  function grassMaterial() { const m = new THREE.MeshStandardMaterial({ roughness: 1 }); windMaterial(m, WIND_GRASS); return m; }
  function build3D() {
    const menu = scene === 'menu';
    const key = menu ? 'menu' : 'room' + run.room;
    if (!G3.dirty && G3.built === key) return;
    G3.dirty = false; G3.built = key;
    disposeTree(G3.room);
    G3.room.clear();
    const R = G3.room;
    if (menu) {
      const b = THEMES.park, rnd = mulberry32(80);
      G3.scene.background = null;
      setSky('#34446c', '#f2a35a', '#4a3a2c', new THREE.Vector3(-0.38, 0.07, -1), '#ffc06e');
      const menuPano = setPano('menu', PANO_YAW.menu);
      G3.sun.position.set(-7, 5.5, -12); G3.sun.target.position.set(0, 0, 0); G3.sun.color = col('#ffc27a'); G3.sun.intensity = 2.3;
      G3.fill.intensity = 2.7; G3.fill.color = col('#ffe6c8'); G3.fill.position.set(-3.5, 4.5, 12); G3.hemi.intensity = 0.7; G3.hemi.color = col('#ffd9b0'); G3.hemi.groundColor = col('#4a3a2a');
      const gt = groundTex(true); gt.repeat.set(30, 30);
      const outer = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ map: gt, roughness: 1, color: col('#9aa07a') })); outer.rotation.x = -Math.PI / 2; outer.position.y = -0.01; outer.receiveShadow = true; R.add(outer);
      // dense tufts around the batyr, thinning out with distance; low near the camera so they frame without hiding him
      const nb = Math.round(750 * Q.grass);
      R.add(makeGrassField(nb, r => {
        const x = (r() - 0.5) * 16, z = -7 + r() * 14;
        if (Math.abs(x) > 1.7 + (7.4 - z) * 0.22) return null;   // outside the close-up view: no point drawing it
        const dHero = Math.hypot(x, (z - 1.4) * 1.3);
        if (dHero < 0.75) return null;
        const short = dHero < 1.8 ? 0.45 + (dHero - 0.75) * 0.5 : 1;   // short grass at his boots
        if (r() > 0.35 + 0.65 * Math.exp(-Math.abs(z - 1.4) / 4.5)) return null;
        const near = z > 3.2 ? 0.55 + (6.5 - z) * 0.1 : 1;
        return [x, z, (0.75 + r() * 0.55) * Math.max(0.45, near) * short];
      }, true, 80));
      for (const o of MENU_OBS) R.add(o.kind === 'yurt' ? makeYurt(X3(o.x + 20), Z3(o.y + 20)) : makeRock(o, X3(o.x + 20), Z3(o.y + 20)));
      for (const [x, z, s] of [[-2.6, -4.2, 1.6], [2.8, -3.2, 1.3], [-3.4, 3.6, 1.2]]) R.add(makeYurt(x, z, s));
      if (G3.models.prop_birch) for (const [x, z, h, ry] of [[-2.6, -8.5, 4.4, 0.4], [2.4, -10, 5, 2.1], [-3.8, -12, 5.4, 1.2]]) { const t = propModel('prop_birch', h, 'h'); t.position.set(x, 0, z); t.rotation.y = ry; R.add(t); }
      buildMenuScenery(R, menuPano);
      if (G3.models.horse) {
        const h = G3.models.horse.clone(); h.scale.setScalar(1.95); h.position.set(1.25, 0, -0.6); h.rotation.y = 0.35;
        if (!G3.horseUni) G3.horseUni = { uT: { value: 0 } };
        h.traverse(o => {
          if (!o.isMesh || o.material.userData.horse) return;
          o.material.userData.horse = true;
          o.material.onBeforeCompile = sh => { Object.assign(sh.uniforms, G3.horseUni); sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', HORSE_VS); };
          o.material.needsUpdate = true;
        });
        R.add(h);
      }
      G3.doors = []; G3.gateGlow = null; G3.gateBeam = null;
      buildLife(R, 'menu', -6, 6, true);
      G3.mood = null;
      Sound.setAmbience('menu');
      return;
    }
    G3.fountains = []; G3.stpAnim = []; G3.stpDyn = []; G3.stpCracks = null;
    const n = run.room, def = ROOM_DEFS[n - 1], th = THEMES[def.theme], theme = def.theme;
    const zN = Z3(ARENA.y), zS = Z3(AY2), zc = (zN + zS) / 2, rnd = mulberry32(n * 71 + 9);
    G3.scene.background = null;
    setSky(th.sky[0], th.sky[1], th.outer, new THREE.Vector3(-0.4, 0.55, 0.45), th.sun);
    if (isSteppe(theme)) ensureSteppeSky(theme);   // painted stand-in until the panorama file exists
    const pano = setPano(theme, PANO_YAW[theme]);
    G3.sun.color = col(th.sun); G3.sun.intensity = th.sunI; G3.fill.intensity = 0;
    G3.hemi.color = col(th.hemi[0]); G3.hemi.groundColor = col(th.hemi[1]); G3.hemi.intensity = th.hemi[2];
    G3.themeSun = th.sunPos;

    const outer = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), def.arena ? mat(th.outer, { r: 1 }) : outskirtGround(theme));
    outer.rotation.x = -Math.PI / 2; outer.position.set(0, -0.01, zN - 20); outer.receiveShadow = true; R.add(outer);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(COLS, ROWS), mat('#ffffff', { map: def.arena ? pitchTex(ROWS) : themeFloor(theme, n, obstacles), r: theme === 'office' ? 0.85 : 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.z = zc; ground.receiveShadow = true; R.add(ground);

    buildRoomGrass(R, theme, n, zN, zS);

    themeWalls(R, theme, zN, zS);
    for (const o of obstacles) R.add(def.arena ? arenaProp(o) : themeProp(theme, o.kind, o, X3(o.x + o.w / 2), Z3(o.y + o.h / 2)));

    // scenery beside the arena
    const lamps = [];
    if (def.arena) buildArenaScenery(R, zN, zS);
    else if (isSteppe(theme)) G3.stpDyn = steppeScenery(R, theme, n, zN, zS);
    else for (let z = zN - 8; z < zS + 12; z += 2.2) for (const s of [-1, 1]) {
      const x = s * (5 + rnd() * 2.5);
      if (theme === 'park' && G3.models.prop_birch && rnd() < 0.45) { const t = propModel('prop_birch', 3 + rnd() * 1.4, 'h'); t.position.set(x + s * 0.6, 0, z + rnd()); t.rotation.y = rnd() * TAU; R.add(t); }
      else if (theme === 'park') R.add(themeProp('park', 'stone', { seed: Math.floor(rnd() * 1e5) }, x, z + rnd()));
      else if (theme === 'street' && G3.models.prop_lamp) { lamps.push({ x: s * 4.75, z, ry: s < 0 ? 0 : Math.PI, h: 2.5 }); R.add(mesh(G3.geo.cyl, mat('#fff6d8', { e: '#ffe9a0', ei: 1.6 }), s * 4.75 - s * 0.26, 2.37, z, 0.09, 0.02, 0.09, false)); }
      else if (theme === 'street') { const p = mesh(G3.geo.cyl, mat('#2f3338', { m: 0.7 }), s * 4.7, 1.0, z, 0.04, 2.0, 0.04); R.add(p); const l = mesh(G3.geo.sphere, mat('#fff6d8', { e: '#ffe9a0', ei: 1.2 }), s * 4.55, 2.0, z, 0.1); R.add(l); }
      else if (theme === 'beach') R.add(themeProp('beach', 'stone', { seed: Math.floor(rnd() * 1e5) * 3 }, x, z));
    }
    if (lamps.length) R.add(propInstances('prop_lamp', lamps, [0.049, 0.0948]));
    if (!def.arena) buildOutskirts(R, theme, n, zN, zS);
    // landmarks to the north, seen in the fly-over
    if (!(pano && theme === 'beach')) for (const [kind, x, dz, s] of def.lm) { const lm = landmarkModel(kind) || landmark(kind); lm.position.set(x, 0, zN - 16 - dz); lm.scale.multiplyScalar(s); R.add(lm); }
    const city = mulberry32(n * 13);
    if (!pano) for (let i = 0; i < 10; i++) {
      const h = 3 + city() * 7, x = -26 + i * 5.5 + city() * 2, z = zN - 26 - city() * 10;
      const b = mesh(G3.geo.box, mat('#ffffff', { map: windowsTex(city() < 0.5 ? '#8a96a8' : '#c8c0b0', '#fff0c0'), r: 0.5 }), x, h / 2, z, 2.5, h, 2.5, false);
      b.material.map.repeat.set(1, h / 6); R.add(b);
    }
    mergeStatic(R, [...(G3.doors || []).map(d => d.pv), G3.gateGlow, G3.gateBeam, ...(G3.stpDyn || [])]);
    buildLife(R, theme, zN, zS, false);
    for (const f of G3.stpAnim) G3.life.upd.push(f);   // torch flames, glowing cracks, the yurt door
    applyMood(R, n, theme, zN, zS);
    if (!def.arena) addCivilians(R, n, theme, zN, zS);
    Sound.setAmbience(theme);
  }


