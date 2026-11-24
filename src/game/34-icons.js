  // =================================================================== painted icons (assets/icons.js: gear, skills, talents as webp data URLs)
  const ICONS = { gear: {}, skill: {}, talent: {} };
  function loadIcons(done) {
    const sc = document.createElement('script'); sc.src = 'assets/icons.js';
    sc.onload = () => {
      const P = window.ICON_PACK || {}; window.ICON_PACK = null;
      for (const kind in ICONS) for (const k in (P[kind] || {})) { const im = new Image(); im.onload = () => { ICONS[kind][k] = im; }; im.src = P[kind][k]; }
      done();
    };
    sc.onerror = () => done();
    document.head.appendChild(sc);
  }
  const iconImg = (kind, id) => ICONS[kind][id] || null;
  // round icon with a gold rim (skills, talents)
  function iconDisc(kind, id, x, y, r) {
    const im = ICONS[kind][id];
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = r * 0.35; ctx.shadowOffsetY = r * 0.08;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = '#121622'; ctx.fill();
    ctx.restore();
    ctx.drawImage(im, x - r, y - r, r * 2, r * 2);
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.lineWidth = Math.max(1.5, r * 0.1); ctx.strokeStyle = goldGrad(y - r, r * 2); ctx.stroke();
  }
