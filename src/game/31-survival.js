  // =================================================================== survival: endless waves on the Astana Arena pitch (bonus mode for coins and levels)
  // the stadium is one more room definition after the 15 story rooms; it has no gate run and no fixed enemies
  const SURV_ROOM = ROOM_DEFS.length + 1;
  ROOM_DEFS.push({
    theme: 'street', arena: true, place: { ru: 'Астана Арена', kz: 'Астана Арена', en: 'Astana Arena' },
    lm: [['towers', -9, 4, 1], ['baiterek', 9, 8, 0.8]],
    L: (() => {
      const rows = [];
      for (let r = 0; r < 26; r++) rows.push('........');
      const put = (r, s) => { rows[r] = s; };
      put(3, '.#....#.'); put(7, '...##...'); put(11, '.#....#.'); put(15, '.#....#.'); put(19, '...##...');
      return rows;
    })(),
  });
  const ARENA_TIME = 180;   // the arena is a 3-minute bonus round
  const fmtClock = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const SURV_POOL = [['s', 1], ['w', 1], ['j', 3], ['a', 5], ['m', 7]];   // [type, first wave]
  const SURV_BOSS = ['D', 'J', 'A'];
  const isSurv = () => !!(run && run.mode === 'survival');
  // waves actually survived: the wave on the field only counts once it is beaten
  const wavesDone = () => isSurv() ? Math.max(0, run.wave - (run.waveCleared ? 0 : 1)) : 0;
  // difficulty level used for enemy HP and damage: story = room number, survival grows with the wave
  const diffLevel = () => isSurv() ? 1 + Math.max(0, run.wave - 1) * 0.55 : run.room;

  function survivalSetup() {
    run.mode = 'survival'; run.timeLeft = ARENA_TIME; run.wave = 0; run.waveT = 4;   // counts down once the fly-over ends run.supplyT = 16; run.waveCleared = true;
    run.room = SURV_ROOM; buildRoom(SURV_ROOM);
    crates = [];   // supplies arrive during the fight
  }

  function survivalTick(dt) {
    if (!isSurv() || scene !== 'play' || introT > 0 || modal) return;
    const alive = enemies.filter(e => !e.dead).length;
    run.timeLeft -= dt;
    if (run.timeLeft <= 0) { if (alive === 0 && !run.waveCleared && run.wave > 0) run.waveCleared = true; endRun(true); return; }   // survived the round
    run.waveT -= dt;
    if (alive === 0 && !run.waveCleared && run.wave > 0) waveCleared();
    if (alive === 0 && run.waveT > 4) run.waveT = 4;   // no long waits on an empty pitch
    if (run.waveT <= 0 && alive < 14) nextWave();
    // supply crates keep arriving (at most two on the field)
    run.supplyT -= dt;
    if (run.supplyT <= 0) {
      run.supplyT = 17;
      if (crates.filter(c => !c.open).length < 2) {
        const sp = freeSpotAwayFromPlayer(120); crates.push({ x: sp.x, y: sp.y });
        addFx('ring', sp.x, sp.y, { col: '#ffd24a', size: 3, max: 0.8 });
      }
    }
  }

  function nextWave() {
    run.wave++; run.waveCleared = false;
    const w = run.wave, bossWave = w % 5 === 0;
    const n = Math.min(16, Math.round((bossWave ? 3 : 6) + w * (bossWave ? 0.7 : 1.6)));
    const pool = SURV_POOL.filter(p => w >= p[1]).map(p => p[0]);
    for (let i = 0; i < n; i++) {
      const t = pool[Math.floor(Math.random() * pool.length)], sp = freeSpotAwayFromPlayer(170);
      spawnEnemy(t, sp.x, sp.y, 0.9 + i * 0.08);
    }
    if (bossWave) {
      const type = SURV_BOSS[(w / 5 - 1) % 3], sp = freeSpotAwayFromPlayer(220);
      const b = spawnEnemy(type, sp.x, sp.y, 1.2);
      const k = 1 + Math.floor((w - 5) / 15) * 0.6;   // later laps of the boss cycle are tougher
      b.hp *= k; b.maxHp *= k;
      Sound.roar();
      banner = { kind: 'wave', wave: w, boss: type, t: 2.6 };
    } else banner = { kind: 'wave', wave: w, t: 2.0 };
    run.waveT = 18 + w * 0.8;   // a timed round keeps the waves coming
  }

  // a cleared wave pays out: a shower of coins around the batyr, a supply drop every second wave, a breather heal
  function waveCleared() {
    run.waveCleared = true;
    const w = run.wave;
    for (let i = 0; i < 6 + w * 2; i++) {
      const a = Math.random() * TAU, r = 30 + Math.random() * 70;
      pickups.push({ x: clamp(player.x + Math.cos(a) * r, ARENA.x + 12, AX2 - 12), y: clamp(player.y + Math.sin(a) * r, ARENA.y + 12, AY2 - 12), vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, kind: 'coin', v: 1 + Math.floor(w / 4), t: 0 });
    }
    if (w % 2 === 0) dropBonus(player.x + rand(-50, 50), player.y - 60, randomItem());
    healPlayer(player.maxHp * (0.08 + (run.S.regen || 0)));
    Sound.clear(); slowT = 0.4;
    addFx('ring', player.x, player.y, { col: '#ffd24a', size: 5, max: 0.9 });
    banner = { kind: 'waveClear', wave: w, t: 1.8 };
  }

  // rewards for the end of a survival run: a chest for every 5 waves (up to 3), gems for waves
  function survivalRewards(won) {
    const w = wavesDone(), chests = [];
    for (let i = 0; i < Math.min(3, Math.floor(w / 5)); i++) chests.push(i === 2 || w >= 15 && i === 0 ? 1 : 0);
    if (won) chests.push(1);   // surviving the full 3 minutes: a rare chest
    const items = [];
    for (const minR of chests) { const it = addItem(rollItem(minR)); if (it) items.push(it); }
    const gems = run.gems + Math.floor(w / 3);
    Save.data.gems += gems;
    if (w > (Save.data.bestWave || 0)) Save.data.bestWave = w;
    run.rewards = { items, gems };
  }

  // ---- the stadium: striped pitch with markings, stands with a crowd, advertising boards, floodlights
  function pitchTex(rows) {
    return canvasTex(256, Math.round(256 * rows / COLS), (g, w, h) => {
      const stripe = h / 13;
      for (let i = 0; i * stripe < h; i++) { g.fillStyle = i % 2 ? '#3f8a35' : '#4a9a3c'; g.fillRect(0, i * stripe, w, stripe + 1); }
      // fine grass noise
      for (let i = 0; i < 4000; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(20,60,15,0.18)' : 'rgba(170,220,120,0.14)'; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 3); }
      g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 3;
      const m = 10; g.strokeRect(m, m, w - m * 2, h - m * 2);
      g.beginPath(); g.moveTo(m, h / 2); g.lineTo(w - m, h / 2); g.stroke();
      g.beginPath(); g.arc(w / 2, h / 2, w * 0.17, 0, TAU); g.stroke();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2, h / 2, 4, 0, TAU); g.fill();
      for (const top of [true, false]) {
        const y0 = top ? m : h - m, s = top ? 1 : -1;
        g.strokeRect(w * 0.2, top ? y0 : y0 - h * 0.13, w * 0.6, h * 0.13);
        g.strokeRect(w * 0.36, top ? y0 : y0 - h * 0.05, w * 0.28, h * 0.05);
        g.beginPath(); g.arc(w / 2, y0 + s * h * 0.13, w * 0.1, top ? 0 : Math.PI, top ? Math.PI : TAU); g.stroke();
        g.beginPath(); g.arc(w / 2, y0 + s * h * 0.095, 3, 0, TAU); g.fill();
      }
      for (const [x, y] of [[m, m], [w - m, m], [m, h - m], [w - m, h - m]]) { g.beginPath(); g.arc(x, y, 10, 0, TAU); g.stroke(); }
    });
  }
  function crowdTex() {
    if (G3.crowdTex) return G3.crowdTex;
    const pal = ['#d63a3a', '#f0c040', '#3a8fd6', '#ffffff', '#2fb5a8', '#1e2a44', '#e98a2e', '#8a5ad0'];
    G3.crowdTex = canvasTex(256, 64, (g, w, h) => {
      g.fillStyle = '#1b2232'; g.fillRect(0, 0, w, h);
      for (let y = 4; y < h; y += 10) for (let x = 3; x < w; x += 7) {
        g.fillStyle = pal[(Math.random() * pal.length) | 0]; g.fillRect(x + Math.random() * 2, y, 4, 4);
        g.fillStyle = '#e8c9a8'; g.fillRect(x + 1, y - 3, 2.5, 2.5);
      }
    }, true);
    return G3.crowdTex;
  }
  function boardTex() {
    if (G3.boardTex) return G3.boardTex;
    G3.boardTex = canvasTex(512, 32, (g, w, h) => {
      const cols = ['#0e3b5c', '#b3262e', '#0e3b5c', '#d9a42a'];
      for (let i = 0; i < 4; i++) { g.fillStyle = cols[i]; g.fillRect(i * w / 4, 0, w / 4, h); }
      g.font = `800 14px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
      ['BATIR01', 'ASTANA ARENA', 'BATIR01', 'QAZAQSTAN'].forEach((t, i) => g.fillText(t, i * w / 4 + w / 8, h / 2 + 1));
    }, true);
    return G3.boardTex;
  }
  // obstacles on the pitch: padded advertising cubes instead of street props
  function arenaProp(o) {
    const g = new THREE.Group(), t = boardTex().clone(); t.needsUpdate = true; t.repeat.set(0.25, 1); t.offset.x = (o.seed % 4) * 0.25;
    const side = mat('#ffffff', { map: t, e: '#222', ei: 0.35, r: 0.6 }), top = mat('#1b2232', { r: 0.7 });
    const b = new THREE.Mesh(G3.geo.box, [side, side, top, top, side, side]); b.scale.set(0.9, 0.7, 0.9); b.position.y = 0.35; b.castShadow = b.receiveShadow = true; g.add(b);
    g.position.set(X3(o.x + o.w / 2), 0, Z3(o.y + o.h / 2));
    return g;
  }
  function buildArenaScenery(R, zN, zS) {
    const len = zS - zN, zc = (zN + zS) / 2;
    // advertising boards right outside the touchlines
    const bt = boardTex(); bt.repeat.set(len / 8, 1);
    for (const s of [-1, 1]) {
      const b = mesh(G3.geo.box, mat('#ffffff', { map: bt, e: '#222', ei: 0.4, r: 0.6 }), s * 4.55, 0.22, zc, 0.06, 0.44, len, false);
      R.add(b);
    }
    // stands: four tiers of seats with the crowd, rising away from the pitch
    const ct = crowdTex(); ct.repeat.set(len / 4, 1);
    const crowd = mat('#ffffff', { map: ct, r: 0.9 }), concrete = mat('#9aa0aa', { r: 0.9 });
    for (const s of [-1, 1]) for (let t = 0; t < 4; t++) {
      const x = s * (5.4 + t * 0.9), y = 0.35 + t * 0.55;
      R.add(mesh(G3.geo.box, concrete, x, y / 2, zc, 0.9, y, len + 4, false));
      const face = mesh(G3.geo.box, crowd, x - s * 0.44, y + 0.18, zc, 0.04, 0.36, len + 4, false); R.add(face);
    }
    // end stands behind both goals
    const ctN = crowdTex().clone(); ctN.needsUpdate = true; ctN.repeat.set(3, 1);
    const endCrowd = mat('#ffffff', { map: ctN, r: 0.9 });
    for (const [z0, s] of [[zN - 1.6, -1], [zS + 1.3, 1]]) for (let t = 0; t < 4; t++) {
      const z = z0 + s * t * 0.9, y = 0.35 + t * 0.55;
      R.add(mesh(G3.geo.box, concrete, 0, y / 2, z, 9 + t * 1.8, y, 0.9, false));
      R.add(mesh(G3.geo.box, endCrowd, 0, y + 0.18, z - s * 0.44, 9 + t * 1.8, 0.36, 0.04, false));
    }
    // goals at both ends
    const net = mat('#ffffff', { r: 0.5 });
    for (const [z, s] of [[zN + 0.05, -1], [zS - 0.05, 1]]) {
      for (const sx of [-1, 1]) R.add(mesh(G3.geo.cyl, net, sx * 0.9, 0.35, z + s * 0.25, 0.035, 0.7, 0.035, false));
      R.add(mesh(G3.geo.box, net, 0, 0.7, z + s * 0.25, 1.84, 0.06, 0.06, false));
    }
    // roof rim and floodlight masts at the corners
    const steel = mat('#d8dde4', { m: 0.8, r: 0.35 });
    for (const s of [-1, 1]) R.add(mesh(G3.geo.box, steel, s * 8.6, 3.4, zc, 0.5, 0.2, len + 6, false));
    for (const [sx, z] of [[-1, zN - 2], [1, zN - 2], [-1, zS + 1], [1, zS + 1]]) {
      const x = sx * 7.4;
      R.add(mesh(G3.geo.cyl, steel, x, 3.2, z, 0.12, 6.4, 0.12, false));
      R.add(mesh(G3.geo.box, mat('#fffbe8', { e: '#fff6d0', ei: 2.2 }), x, 6.5, z, 1.4, 0.7, 0.2, false));
      const gl = glow('#fff4d0', 5.5, 0.85); gl.position.set(x, 6.5, z); R.add(gl);
    }
  }
