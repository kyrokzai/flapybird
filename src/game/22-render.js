  // =================================================================== render
  function render() {
    render3D();
    ui = [];
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (!G3.usePost) vignette();
    if (scene === 'menu') drawMenu();
    else {
      drawWorldOverlay();
      if (scene === 'play') {
        const low = player.hp / player.maxHp;
        const a = Math.max(hurtFlash > 0 ? hurtFlash * 1.3 : 0, low < 0.3 ? (0.28 + Math.sin(time * 6) * 0.12) * (1 - low / 0.3) : 0);
        if (a > 0.01) {
          const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.7);
          g.addColorStop(0, 'rgba(200,0,0,0)'); g.addColorStop(1, `rgba(200,0,0,${Math.min(0.7, a)})`);
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        }
      }
      drawHud();
      drawJoystick();
      drawBanner();
      if (scene === 'play') {
        if (modal === 'levelup') drawLevelUp();
        else if (modal === 'kydyr') drawKydyrModal();
        else if (modal === 'pause') drawPause();
        else if (modal === 'revive') drawRevive();
      } else { ui = []; drawEnd(); }
    }
    if (fade > 0) { ctx.fillStyle = `rgba(4,16,22,${fade})`; ctx.fillRect(0, 0, W, H); }
  }

