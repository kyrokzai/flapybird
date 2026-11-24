  // =================================================================== static batching: hundreds of small props become a handful of meshes (fewer draw calls on phones)
  // Props are built from primitives with their own material each; meshes with identical-looking materials,
  // the same shadow flags and the same vertex layout are baked into world space and merged into one.
  function matKey(m) {
    if (!m || Array.isArray(m) || !m.isMeshStandardMaterial || m.transparent || m.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile || m.userData.wind) return null;
    return [m.color.getHexString(), m.roughness.toFixed(2), m.metalness.toFixed(2), m.flatShading ? 1 : 0, m.emissive.getHexString(), m.emissiveIntensity.toFixed(2), m.side,
      m.map ? m.map.uuid : '-', m.normalMap ? m.normalMap.uuid : '-', m.vertexColors ? 1 : 0, m.envMap ? 1 : 0, m.depthWrite ? 1 : 0].join('|');
  }
  function geoKey(g) {
    const names = Object.keys(g.attributes).sort();
    for (const n of names) { const a = g.attributes[n]; if (a.isInterleavedBufferAttribute || !(a.array instanceof Float32Array)) return null; }
    if (g.morphAttributes && Object.keys(g.morphAttributes).length) return null;
    return names.map(n => n + g.attributes[n].itemSize).join(',') + (g.index ? '#i' : '#n');
  }
  function mergeStatic(R, keep) {
    if (!THREE.BufferGeometryUtils || !THREE.BufferGeometryUtils.mergeBufferGeometries) return 0;
    R.updateMatrixWorld(true);
    const skip = new Set();
    for (const k of keep) if (k) k.traverse(o => skip.add(o));
    const groups = new Map();
    R.traverse(o => {
      if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || skip.has(o) || !o.visible) return;
      const mk = matKey(o.material), gk = mk && geoKey(o.geometry);
      if (!gk) return;
      const key = mk + '/' + gk + '/' + (o.castShadow ? 1 : 0) + (o.receiveShadow ? 1 : 0);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(o);
    });
    let removed = 0;
    for (const list of groups.values()) {
      if (list.length < 2) continue;
      const geos = list.map(o => {
        const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
        // a mirrored transform flips the winding: keep faces pointing outwards
        if (o.matrixWorld.determinant() < 0 && g.index) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i]; ix[i] = ix[i + 2]; ix[i + 2] = t; } }
        return g;
      });
      const merged = THREE.BufferGeometryUtils.mergeBufferGeometries(geos, false);
      geos.forEach(g => g.dispose());
      if (!merged) continue;
      const m = new THREE.Mesh(merged, list[0].material);
      m.castShadow = list[0].castShadow; m.receiveShadow = list[0].receiveShadow;
      m.matrixAutoUpdate = false; m.updateMatrix();
      for (const o of list) { o.parent.remove(o); removed++; }
      R.add(m);
    }
    // whatever is left and never moves does not need its matrix recomputed every frame
    R.traverse(o => { if (!skip.has(o) && o !== R) { o.updateMatrix(); o.matrixAutoUpdate = false; } });
    return removed;
  }
