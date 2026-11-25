  // =================================================================== townsfolk behind the fences: they wave to the batyr for help and cheer when a room is cleared
  function addCivilians(R, n, theme, zN, zS) {
    if (!G3.models.civ_woman || theme === 'office' || isSteppe(theme) || Q.fx < 0.5) return;
    const rnd = mulberry32(n * 53 + 3);
    // two by the gate (behind the north wall, facing the batyr) and one or two along the side fences
    const spots = [[-(1.5 + rnd() * 1.2), zN - 0.75, -Math.PI / 2], [1.5 + rnd() * 1.2, zN - 0.75, -Math.PI / 2]];
    if (theme === 'street') for (const s of [-1, 1]) spots.push([s * 4.45, zN + 2 + rnd() * (zS - zN - 5), (s > 0 ? Math.PI : 0) + s * 0.5]);
    // a couple of birches frame the gate in the parks
    if (theme === 'park' && G3.models.prop_birch) for (const s of [-1, 1]) { const t = propModel('prop_birch', 3.4 + rnd(), 'h'); t.position.set(s * (3.3 + rnd() * 0.6), 0, zN - 1.6 - rnd()); t.rotation.y = rnd() * TAU; R.add(t); }
    for (const [x, z, base0] of spots) {
      const c = propModel('civ_woman', 1.55 + rnd() * 0.12, 'h'), base = base0 + (rnd() - 0.5) * 0.4;
      c.position.set(x, 0, z); c.rotation.y = base;
      c.traverse(o => { if (o.isMesh) o.castShadow = true; });
      const sh = blobShadow(0.9, 0.35); sh.position.set(x, 0.012, z); R.add(sh);
      R.add(c);
      const ph = rnd() * 10;
      if (G3.life) G3.life.upd.push(t => {
        // nervous sway while the monsters are around, happy jumps once the room is clear
        if (roomClear) { c.position.y = Math.abs(Math.sin(t * 7 + ph)) * 0.14; c.rotation.y = base + Math.sin(t * 3 + ph) * 0.25; }
        else { c.position.y = 0; c.rotation.y = base + Math.sin(t * 1.6 + ph) * 0.12; c.rotation.z = Math.sin(t * 2.3 + ph) * 0.03; }
      });
    }
  }
