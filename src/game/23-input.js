  // =================================================================== input
  function toLogical(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    canvas.focus({ preventScroll: true });
    Sound.init();
    const p = toLogical(e);
    for (let i = ui.length - 1; i >= 0; i--) {
      const b = ui[i];
      if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) { if (b.fn) b.fn(); return; }
    }
    if (scene === 'play' && !modal && introT > 0.35) { introT = 0.35; return; }
    if (scene === 'play' && !modal) {
      joy.active = true; joy.id = e.pointerId; joy.ox = joy.x = p.x; joy.oy = joy.y = p.y;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    }
  });
  canvas.addEventListener('pointermove', e => { if (joy.active && e.pointerId === joy.id) { const p = toLogical(e); joy.x = p.x; joy.y = p.y; } });
  const endJoy = e => { if (e.pointerId === joy.id) { joy.active = false; joy.id = null; } };
  canvas.addEventListener('pointerup', endJoy);
  canvas.addEventListener('pointercancel', endJoy);
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    keys.add(e.code);
    Sound.init();
    if ((e.code === 'Escape' || e.code === 'KeyP') && scene === 'play') { modal = modal === 'pause' ? null : (modal || 'pause'); }
    if (e.code === 'KeyE' || e.code === 'KeyB') throwBomb();
    if (e.code === 'Enter' || e.code === 'Space') {
      if (scene === 'menu') newRun();
      else if ((scene === 'dead' || scene === 'victory') && endT > 0.8) newRun();
    }
    if (modal === 'levelup' && ['Digit1', 'Digit2', 'Digit3'].includes(e.code)) pickCard(+e.code.slice(-1) - 1);
  });
  window.addEventListener('keyup', e => keys.delete(e.code));
  window.addEventListener('blur', () => { keys.clear(); joy.active = false; if (scene === 'play' && !modal) modal = 'pause'; });

