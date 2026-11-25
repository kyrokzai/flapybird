  // =================================================================== effects
  function burst(x, y, col, n, spd, size) {
    n = Math.min(n, Math.max(0, Math.round(700 * Q.fx) - particles.length));   // a cap: with many arrows and ricochets the sparks used to pile up
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, s = rand(0.3, 1) * spd;
      particles.push({ x, y, h: rand(0.2, 0.7), vh: rand(0.5, 3), vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.3, 0.7), max: 0.7, col, size: size * rand(0.6, 1.2) });
    }
  }
  function floatText(x, y, t, col, size, h) { if (texts.length > 36) texts.splice(0, texts.length - 36);   // damage numbers are drawn on the 2D canvas: keep the newest few dozen
    texts.push({ x: x + rand(-6, 6), y, h: h || 1.1, rise: 0, t, col, size, life: 0.8, pop: size >= 17 }); }

