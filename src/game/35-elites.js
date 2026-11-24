  // =================================================================== elite monsters: fire, ice and shield auras (from room 3, and on the arena from wave 3)
  // fire: bursts into a ring of flames when slain; ice: chills the batyr nearby (slower steps); shield: a golden ward soaks hits and comes back
  const ELITES = {
    fire: { col: '#ff6a2a', name: { ru: 'Огненный', kz: 'Отты', en: 'Blazing' } },
    ice: { col: '#6fd8ff', name: { ru: 'Ледяной', kz: 'Мұзды', en: 'Frost' } },
    shield: { col: '#ffd24a', name: { ru: 'Заговорённый', kz: 'Қорғанды', en: 'Warded' } },
  };
  const ELITE_KEYS = Object.keys(ELITES);
  function eliteChance() {
    if (isSurv()) return run.wave >= 3 ? 0.14 : 0;
    return run.room >= 3 ? 0.11 : 0;
  }
  function maybeElite(e) {
    if (e.boss || Math.random() >= eliteChance()) return;
    const k = ELITE_KEYS[Math.floor(Math.random() * ELITE_KEYS.length)];
    e.elite = k;
    e.hp *= 2.3; e.maxHp *= 2.3; e.r *= 1.12; e.xp *= 1.5; e.coin *= 3;
    if (k === 'shield') { e.ward = e.maxHp * 0.35; e.wardMax = e.ward; e.wardT = 0; }
  }
  // a hit on a warded elite is soaked by the ward first; returns the damage that gets through
  function eliteAbsorb(e, d) {
    if (!e.elite || e.elite !== 'shield' || e.ward <= 0) return d;
    e.wardT = 3.2;
    const soak = Math.min(e.ward, d); e.ward -= soak;
    if (e.ward <= 0) { addFx('ring', e.x, e.y, { col: '#ffd24a', size: 2.2, max: 0.35 }); burst(e.x, e.y, '#ffe08a', 12, 160, 2.5); }
    return d - soak;
  }
  function eliteTick(e, dt) {
    if (!e.elite) return;
    if (e.elite === 'shield' && e.ward < e.wardMax) { e.wardT -= dt; if (e.wardT <= 0) e.ward = Math.min(e.wardMax, e.ward + e.wardMax * 0.25 * dt); }
    if (e.elite === 'ice' && player && Math.hypot(player.x - e.x, player.y - e.y) < 85) player.chill = 0.25;
  }
  function eliteDeath(e) {
    if (!e.elite) return;
    if (e.elite === 'fire') ring(e, 8, 115, 'fire', Math.random());
    if (!SIM.on) { Save.data.stats.elites = (Save.data.stats.elites || 0) + 1; }
    if (Math.random() < 0.3) dropBonus(e.x, e.y, randomItem());
  }

  // ---- visuals: coloured aura on the ground, a glow, the ward bubble; every monster gets a faint red threat ring for readability
  function addEliteVisuals(e, m) {
    m.threat = decal(G3.ringTex, '#ff3a2a', (e.r / CELL) * 2.6, 0.22); m.threat.position.y = 0.018; m.g.add(m.threat);
    if (!e.elite) return;
    const c = ELITES[e.elite].col;
    m.aura = decal(G3.ringTex, c, (e.r / CELL) * 4.2, 0.85); m.aura.material.blending = THREE.AdditiveBlending; m.aura.position.y = 0.022; m.g.add(m.aura);
    m.auraGlow = glow(c, (e.r / CELL) * 4.5, 0.5); m.auraGlow.position.y = MODEL_H[e.type] * 0.5; m.g.add(m.auraGlow);
    if (e.elite === 'shield') {
      m.ward = new THREE.Mesh(G3.geo.sphere, new THREE.MeshBasicMaterial({ color: col('#ffd24a'), transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending }));
      m.ward.scale.setScalar((e.r / CELL) * 2.4); m.ward.position.y = MODEL_H[e.type] * 0.5; m.g.add(m.ward);
    }
    m.g.scale.setScalar(1.15);
  }
  function updateEliteVisuals(e, m) {
    if (m.threat) m.threat.material.opacity = e.spawn > 0 ? 0 : 0.2 + (e.wind ? 0.25 : 0);
    if (!m.aura) return;
    const t = time * 3 + e.x * 0.01;
    m.aura.rotation.z = time * 1.4; m.aura.material.opacity = 0.65 + Math.sin(t) * 0.2;
    m.auraGlow.material.opacity = 0.35 + Math.sin(t * 1.3) * 0.12;
    if (m.ward) { m.ward.visible = e.ward > 0; m.ward.material.opacity = 0.12 + 0.18 * (e.ward / e.wardMax) + Math.sin(t * 2) * 0.03; }
  }
