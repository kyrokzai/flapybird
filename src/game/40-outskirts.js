  // =================================================================== surroundings: the city past the walls
  // Seen in the fly-over, at the start of a room (the camera shows what lies south of the entrance) and on tall phones.
  // A textured ground instead of a flat colour, the road / park path running on past both walls, trees, bushes and houses.
  const OUT_TILE = 6;   // world units per tile of the outer ground texture
  function outskirtGround(theme) {
    const key = 'outG_' + theme; if (G3[key]) return G3[key];
    const rnd = mulberry32(theme.length * 31 + 7);
    const t = canvasTex(256, 256, (g, w, h) => {
      const blot = (pal, k, r0, r1, a) => {
        for (let i = 0; i < k; i++) {
          const x = rnd() * w, y = rnd() * h, r = r0 + rnd() * (r1 - r0), c = pal[i % pal.length];
          for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
            const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r); gr.addColorStop(0, c + a); gr.addColorStop(1, c + '00');
            g.fillStyle = gr; g.fillRect(x + ox - r, y + oy - r, 2 * r, 2 * r);
          }
        }
      };
      const specks = (k, a, b) => { for (let i = 0; i < k; i++) { g.fillStyle = rnd() < 0.5 ? a : b; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 1.5, 1 + rnd() * 1.5); } };
      if (theme === 'park') {
        // the same greens as the room lawn, so the hedge does not cut the park in two
        g.fillStyle = '#7a983f'; g.fillRect(0, 0, w, h);
        blot(['#6f8c3b', '#86a448', '#69853a', '#90a94e'], 60, 14, 46, '99');
        g.lineWidth = 1;
        for (let i = 0; i < 1400; i++) { const x = rnd() * w, y = rnd() * h; g.strokeStyle = rnd() < 0.6 ? 'rgba(70,110,40,0.55)' : 'rgba(180,210,120,0.45)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 2, y - 2 - rnd() * 3); g.stroke(); }
        for (let i = 0; i < 26; i++) { g.fillStyle = ['#e0313a', '#f5c22e', '#ffffff', '#d85ac8'][i % 4]; g.beginPath(); g.arc(rnd() * w, rnd() * h, 1.2, 0, TAU); g.fill(); }
      } else if (theme === 'street') {
        // light square paving slabs, like the sidewalks in the room
        const s = w / 8; g.fillStyle = '#8f8c86'; g.fillRect(0, 0, w, h);
        for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const v = 168 + Math.floor(rnd() * 22); g.fillStyle = `rgb(${v},${v - 3},${v - 9})`; g.fillRect(x * s + 1, y * s + 1, s - 2, s - 2); }
        specks(1800, 'rgba(255,255,255,0.08)', 'rgba(0,0,0,0.1)');
      } else if (theme === 'office') {
        const s = w / 8;
        for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#5b626d' : '#636a76'; g.fillRect(x * s, y * s, s, s); }
        specks(2000, 'rgba(255,255,255,0.05)', 'rgba(0,0,0,0.07)');
      } else {
        g.fillStyle = '#e2c68e'; g.fillRect(0, 0, w, h);
        blot(['#d8b97c', '#ecd3a0', '#cfae70'], 40, 12, 40, '88');
        specks(3000, 'rgba(255,255,255,0.14)', 'rgba(120,90,40,0.14)');
      }
    }, true);
    t.repeat.set(140 / OUT_TILE, 140 / OUT_TILE);
    return (G3[key] = mat('#ffffff', { map: t, r: theme === 'office' ? 0.8 : 1 }));
  }

  // the road (street) or the winding path (park) carried on past a wall: y0 = start in floor pixels from the north wall, len = length in floor pixels
  function outskirtStrip(theme, n, y0, len) {
    const S = 0.8, AW = ARENA.w;
    const t = canvasTex(Math.round(AW * S), Math.round(len * S), g => {
      g.scale(S, S);
      if (theme === 'street') {
        const r = mulberry32(n * 61 + y0);
        g.fillStyle = '#4a4d52'; g.fillRect(0, 0, AW, len);
        for (let i = 0; i < len * 7; i++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.12)'; g.fillRect(r() * AW, r() * len, 1 + r() * 2, 1 + r() * 2); }
        for (const x0 of [0, AW - 40]) {
          g.fillStyle = '#b9b6ae'; g.fillRect(x0, 0, 40, len);
          g.strokeStyle = 'rgba(80,75,70,0.4)'; g.lineWidth = 1;
          for (let y = 0; y < len; y += 13) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 40, y); g.stroke(); }
          g.fillStyle = '#8f8c86'; g.fillRect(x0 === 0 ? 38 : AW - 40, 0, 2, len);
        }
        g.fillStyle = '#f2c230'; g.fillRect(AW / 2 - 3, 0, 2, len); g.fillRect(AW / 2 + 1, 0, 2, len);
        g.fillStyle = 'rgba(255,255,255,0.85)';
        for (const lx of [100, 220]) for (let y = 6 - ((y0 % 34) + 34) % 34; y < len; y += 34) g.fillRect(lx - 1, y, 2.5, 18);
        // a crossing a little way out, and a stop line
        const zy = y0 < 0 ? len - 150 : 110;
        for (let x = 46; x < AW - 46; x += 16) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillRect(x, zy, 9, 34); }
      } else if (theme === 'park') {
        // only the path: the lawn underneath is the outer ground
        g.lineCap = 'round';
        const path = () => { g.beginPath(); for (let y = -20; y <= len + 20; y += 8) { const x = AW / 2 + Math.sin((y0 + y) / 70 + n) * 60; y === -20 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); };
        g.strokeStyle = '#b9ab8c'; g.lineWidth = 34; path();
        g.strokeStyle = '#d8ccb0'; g.lineWidth = 28; path();
        g.save(); g.setLineDash([6, 7]); g.strokeStyle = 'rgba(120,105,80,0.35)'; g.lineWidth = 26; path(); g.restore();
      } else if (theme === 'office') {
        // the light runner down the middle of the floor, with its gold edging
        g.fillStyle = '#9aa0a8'; g.fillRect(AW / 2 - 34, 0, 68, len);
        g.fillStyle = 'rgba(255,255,255,0.08)'; for (let y = 0; y < len; y += 8) g.fillRect(AW / 2 - 34, y, 68, 1);
        g.fillStyle = '#c9a94a'; g.fillRect(AW / 2 - 35, 0, 2, len); g.fillRect(AW / 2 + 33, 0, 2, len);
      } else {
        // the wooden boardwalk across the sand
        g.fillStyle = '#a77a4a'; g.fillRect(AW / 2 - 22, 0, 44, len);
        g.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < len; y += 12) g.fillRect(AW / 2 - 22, y, 44, 1.5);
      }
    });
    const m = mat('#ffffff', { map: t, r: 1 });
    if (theme !== 'street') m.alphaTest = 0.5;   // only the path / runner / boardwalk is painted, the rest shows the outer ground
    return m;
  }

  function buildOutskirts(R, theme, n, zN, zS) {
    const rnd = mulberry32(n * 7 + 101), k = Q.fx;
    const pathX = z => Math.sin((z - zN) * CELL / 70 + n) * 60 / CELL;   // the park path, in world x, at depth z (continues the room floor)
    const strip = (z0, z1) => {
      const len = (z1 - z0) * CELL, m = outskirtStrip(theme, n, Math.round((z0 - zN) * CELL), len);
      const p = new THREE.Mesh(new THREE.PlaneGeometry(COLS, z1 - z0), m); p.rotation.x = -Math.PI / 2; p.position.set(0, 0.004, (z0 + z1) / 2); p.receiveShadow = true; R.add(p);
    };
    strip(zS, zS + 20); strip(zN - 12, zN - 0.3);

    if (theme === 'park') {
      // birch groves and round bushes on the lawns south and north of the walls, clear of the path
      const trees = [], bush = mat('#3f6f2a', { r: 1, flat: true }), bush2 = mat('#4f8034', { r: 1, flat: true });
      const spot = (z0, z1, xr, gap) => { for (let i = 0; i < 40; i++) { const z = z0 + rnd() * (z1 - z0), x = (rnd() * 2 - 1) * xr; if (Math.abs(x - pathX(z)) > gap) return [x, z]; } return null; };
      for (let i = 0; i < Math.round(26 * k); i++) { const p = spot(zS + 1.2, zS + 18, 13, 1.6); if (p) trees.push({ x: p[0], z: p[1], ry: rnd() * TAU, h: 2.8 + rnd() * 1.8 }); }
      for (let i = 0; i < Math.round(10 * k); i++) { const p = spot(zN - 10, zN - 2.2, 11, 1.8); if (p && Math.abs(p[0]) > 2.6) trees.push({ x: p[0], z: p[1], ry: rnd() * TAU, h: 3 + rnd() * 1.6 }); }
      if (G3.models.prop_birch) R.add(propInstances('prop_birch', trees));
      for (let i = 0; i < Math.round(34 * k); i++) {
        const p = spot(zS + 0.9, zS + 16, 12, 1.2); if (!p) continue;
        const s = 0.22 + rnd() * 0.16;
        R.add(mesh(G3.geo.dodeca, rnd() < 0.5 ? bush : bush2, p[0], s * 0.8, p[1], s));
        if (rnd() < 0.6) R.add(mesh(G3.geo.dodeca, bush, p[0] + s * 0.9, s * 0.6, p[1] + (rnd() - 0.5) * s, s * 0.75));
      }
    } else if (theme === 'street') {
      // blocks of houses along both sides, roofs seen from above
      const walls = ['#c9c2b4', '#8a96a8', '#b8a48c'].map((c, i) => { const t = windowsTex(c, '#fff0c0'); t.wrapS = t.wrapT = THREE.RepeatWrapping; return mat('#ffffff', { map: t, r: 0.6 }); });
      const roof = mat('#5a5f66', { r: 0.9 }), roofEdge = mat('#3f4349', { r: 0.9 });
      for (const s of [-1, 1]) for (let z = zN - 12; z < zS + 20;) {
        const w = 2.6 + rnd() * 2, d = 3 + rnd() * 1.5, h = 3 + rnd() * 6, x = s * (7.2 + d / 2), zc = z + w / 2;
        const geo = new THREE.BoxGeometry(d, h, w), uv = geo.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.max(1, Math.round(w / 1.25)), uv.getY(i) * h / 6);
        const b = new THREE.Mesh(geo, walls[Math.floor(rnd() * 3)]); b.position.set(x, h / 2, zc); b.castShadow = b.receiveShadow = true; R.add(b);
        R.add(mesh(G3.geo.box, roofEdge, x, h + 0.06, zc, d + 0.12, 0.12, w + 0.12));
        R.add(mesh(G3.geo.box, roof, x, h + 0.13, zc, d - 0.3, 0.04, w - 0.3, false));
        z += w + 0.5 + rnd() * 0.8;
      }
      // a few parked cars just past the south wall
      if (G3.models.prop_car) for (const [x, dz] of [[-3.35, 2.2], [3.35, 4.6], [-3.35, 9]]) { const c = propModel('prop_car', 0.95, 'w'); c.position.set(x, 0, zS + dz); c.rotation.y = rnd() < 0.5 ? 0 : Math.PI; R.add(c); }
    } else if (theme === 'beach') {
      const palms = [];
      for (let i = 0; i < Math.round(12 * k); i++) { const x = (rnd() * 2 - 1) * 12, z = zS + 1.5 + rnd() * 14; if (Math.abs(x) > 1.2) palms.push({ x, z, ry: rnd() * TAU, h: 2.4 + rnd() * 1.2 }); }
      if (G3.models.prop_palm) R.add(propInstances('prop_palm', palms));
    }
  }
