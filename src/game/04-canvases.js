  // =================================================================== canvases
  const wrapEl = document.getElementById('wrap');
  const canvas = document.getElementById('game');
  const glCanvas = document.getElementById('gl');
  const ctx = canvas.getContext('2d');
  let K = 1, cssW = W, cssH = H;
  function resize() {
    const iw = window.innerWidth, ih = window.innerHeight, oldH = H;
    H = Math.round(Math.min(860, Math.max(640, W * ih / iw)));
    const scale = Math.min(iw / W, ih / H);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = Math.floor(W * scale); cssH = Math.floor(H * scale);
    // safe-area insets only matter where the canvas reaches the screen edge
    const cs = getComputedStyle(document.documentElement), off = (ih - cssH) / 2;
    SAFE.t = Math.max(0, (parseFloat(cs.getPropertyValue('--sat')) || 0) - off) / scale;
    SAFE.b = Math.max(0, (parseFloat(cs.getPropertyValue('--sab')) || 0) - off) / scale;
    wrapEl.style.width = cssW + 'px'; wrapEl.style.height = cssH + 'px';
    for (const c of [canvas, glCanvas]) { c.style.width = cssW + 'px'; c.style.height = cssH + 'px'; }
    canvas.width = Math.round(W * scale * dpr);
    canvas.height = Math.round(H * scale * dpr);
    K = canvas.width / W;
    if (G3.cam && oldH !== H) fitCamera();
    if (G3.r) {
      const pr = G3.usePost ? Math.min(dpr, 1.6, Q.pr) : Math.min(dpr, Q.pr);
      G3.r.setPixelRatio(pr); G3.r.setSize(cssW, cssH, false);
      if (G3.composer) {
        G3.composer.setPixelRatio(pr); G3.composer.setSize(cssW, cssH);
        G3.fxaa.material.uniforms.resolution.value.set(1 / (cssW * pr), 1 / (cssH * pr));
      }
    }
  }
  window.addEventListener('resize', () => resize());

  function rr(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  // Қошқар мүйіз — the ram-horn ornament
  function koshkar(g, x, y, s, color, lw) {
    const r = s * 0.3;
    g.save();
    g.strokeStyle = color; g.lineWidth = lw || s * 0.13; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(x, y + s * 0.5); g.lineTo(x, y);
    g.arc(x + r, y, r, Math.PI, TAU);
    g.arc(x + r * 1.5, y, r * 0.5, 0, Math.PI);
    g.arc(x + r * 1.25, y, r * 0.25, Math.PI, TAU);
    g.moveTo(x, y);
    g.arc(x - r, y, r, 0, Math.PI, true);
    g.arc(x - r * 1.5, y, r * 0.5, Math.PI, 0, true);
    g.arc(x - r * 1.25, y, r * 0.25, 0, Math.PI, true);
    g.stroke();
    g.restore();
  }

  function ornamentBand(g, x, y, w, h, bg, fg) {
    g.fillStyle = bg; g.fillRect(x, y, w, h);
    g.fillStyle = fg; g.fillRect(x, y + 1, w, 1.2); g.fillRect(x, y + h - 2.2, w, 1.2);
    const n = Math.max(1, Math.floor(w / (h * 1.5)));
    const step = w / n;
    for (let i = 0; i < n; i++) koshkar(g, x + step * (i + 0.5), y + h * 0.48, h * 0.62, fg, h * 0.08);
  }

