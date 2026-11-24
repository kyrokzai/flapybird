  const MENU_CAM = { fov: 32, dist: 6.1, y: 0.8, look: 0.98 };
  // =================================================================== realistic grass, ground and a soft-focus backdrop (menu close-up)
  // grass tufts are crossed alpha cards painted on a canvas: dozens of thin tapered blades, dark at the root, light at the tip
  const WIND_CARD = [
    'vec3 transformed = vec3(position);',
    '#ifdef USE_INSTANCING',
    'float ph = instanceMatrix[3].x * 1.7 + instanceMatrix[3].z * 1.3;',
    '#else',
    'float ph = 0.0;',
    '#endif',
    'float bend = pow(clamp(position.y / 0.5, 0.0, 1.0), 1.6);',
    'transformed.x += (sin(uT * 1.9 + ph) * 0.06 + sin(uT * 4.7 + ph * 2.0) * 0.015) * bend;',
    'transformed.z += cos(uT * 1.5 + ph) * 0.035 * bend;',
  ].join('\n');

  function grassCardTex(warm) {
    const key = warm ? 'grassCardW' : 'grassCard';
    if (G3[key]) return G3[key];
    const S = 256, rnd = mulberry32(warm ? 17 : 23);
    // colour and coverage are painted separately: transparent pixels keep a grass colour, so mipmaps never fade blades to black
    const colC2 = document.createElement('canvas'), alC = document.createElement('canvas');
    colC2.width = alC.width = colC2.height = alC.height = S;
    const g = colC2.getContext('2d'), ga = alC.getContext('2d');
    g.fillStyle = warm ? '#6f8a36' : '#5f8f36'; g.fillRect(0, 0, S, S);
    ga.fillStyle = '#000'; ga.fillRect(0, 0, S, S);
    for (let i = 0; i < 70; i++) {
      const x0 = 18 + rnd() * (S - 36), bh = S * (0.45 + rnd() * 0.53), bw = 2.2 + rnd() * 3.2, lean = (rnd() - 0.5) * 70;
      const x1 = x0 + lean, y1 = S - bh;
      const blade = c => {
        c.beginPath(); c.moveTo(x0 - bw, S);
        c.quadraticCurveTo(x0 + lean * 0.25 - bw * 0.6, S - bh * 0.55, x1, y1);
        c.quadraticCurveTo(x0 + lean * 0.25 + bw * 0.6, S - bh * 0.55, x0 + bw, S);
        c.closePath(); c.fill();
      };
      const tip = warm ? ['#a9be58', '#93b04a', '#bcc46a', '#7fa040'][i % 4] : ['#a7cf62', '#8fc052', '#b9d77a', '#7fb048'][i % 4];
      const gr = g.createLinearGradient(0, S, 0, y1);
      gr.addColorStop(0, warm ? '#4a5e26' : '#3a5f26'); gr.addColorStop(0.4, warm ? '#6a8a34' : '#5a8a34'); gr.addColorStop(1, tip);
      g.fillStyle = gr; blade(g);
      ga.fillStyle = '#fff'; blade(ga);
    }
    const cd = g.getImageData(0, 0, S, S).data, ad = ga.getImageData(0, 0, S, S).data, out = new Uint8Array(S * S * 4);
    // rows are flipped so the texture is upright (DataTexture has no flipY)
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const si = ((S - 1 - y) * S + x) * 4, di = (y * S + x) * 4;
      out[di] = cd[si]; out[di + 1] = cd[si + 1]; out[di + 2] = cd[si + 2]; out[di + 3] = ad[si];
    }
    const t = new THREE.DataTexture(out, S, S, THREE.RGBAFormat);
    t.encoding = THREE.sRGBEncoding; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
    t.anisotropy = G3.r ? Math.min(8, G3.r.capabilities.getMaxAnisotropy()) : 1;
    t.needsUpdate = true;
    return (G3[key] = t);
  }

  // three vertical cards at 60° to each other; normals point up so the tuft is lit like a lawn, not like a wall
  function grassTuftGeo() {
    if (G3.tuftGeo) return G3.tuftGeo;
    const pos = [], uv = [], nor = [], idx = [], wdt = 0.62, hgt = 0.5;
    for (let k = 0; k < 3; k++) {
      const a = k * Math.PI / 3, cx = Math.cos(a) * wdt / 2, cz = Math.sin(a) * wdt / 2, b = pos.length / 3;
      pos.push(-cx, 0, -cz, cx, 0, cz, cx, hgt, cz, -cx, hgt, -cz);
      uv.push(0, 0, 1, 0, 1, 1, 0, 1);
      for (let i = 0; i < 4; i++) nor.push(0, 1, 0);
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3, b, b + 2, b + 1, b, b + 3, b + 2);   // both windings: FrontSide keeps the up-normal on each side
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setIndex(idx);
    return (G3.tuftGeo = geo);
  }

  // place(rnd) → [x, z, scale] or null to skip
  function makeGrassField(n, place, warm, seed) {
    const m = new THREE.MeshStandardMaterial({ map: grassCardTex(warm), alphaTest: 0.42, side: THREE.FrontSide, roughness: 1, metalness: 0 });
    windMaterial(m, WIND_CARD);
    const field = new THREE.InstancedMesh(grassTuftGeo(), m, n), dm = new THREE.Object3D(), rnd = mulberry32(seed || 9), cc = new THREE.Color();
    let k = 0;
    for (let i = 0; i < n * 4 && k < n; i++) {
      const p = place(rnd); if (!p) continue;
      dm.position.set(p[0], 0, p[1]); dm.rotation.set(0, rnd() * Math.PI, 0); dm.scale.set(p[2] * (0.8 + rnd() * 0.5), p[2] * (0.7 + rnd() * 0.6), p[2]); dm.updateMatrix();
      field.setMatrixAt(k, dm.matrix); { const v = 0.42 + Math.pow(rnd(), 0.8) * 0.5, dry = rnd() < 0.18; cc.setRGB(v * (dry ? 1.15 : 0.85), v * (dry ? 1.0 : 1.0), v * (dry ? 0.6 : 0.7)); } field.setColorAt(k, cc); k++;
    }
    field.count = k; field.receiveShadow = true;
    return field;
  }

  // ground: soft patches of green, olive and dry earth with fine blade marks
  function groundTex(warm) {
    const key = warm ? 'groundW' : 'ground';
    if (G3[key]) return G3[key];
    const rnd = mulberry32(warm ? 5 : 6);
    const t = canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = warm ? '#5d6e2c' : '#4f7a2c'; g.fillRect(0, 0, w, h);
      const pal = warm ? ['#6f7f34', '#4d5c22', '#7a6a3a', '#879043', '#3f4d1c'] : ['#5d8a33', '#43692a', '#6f8f3a', '#7a7444', '#38592a'];
      for (let i = 0; i < 260; i++) {
        const x = rnd() * w, y = rnd() * h, r = 10 + rnd() * 50;
        const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, pal[i % pal.length] + 'aa'); gr.addColorStop(1, pal[i % pal.length] + '00');
        g.fillStyle = gr;
        for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { g.beginPath(); g.arc(x + ox, y + oy, r, 0, TAU); g.fill(); }
      }
      g.lineWidth = 1;
      for (let i = 0; i < 5000; i++) {
        const x = rnd() * w, y = rnd() * h, l = 3 + rnd() * 6;
        g.strokeStyle = rnd() < 0.5 ? 'rgba(20,35,10,0.35)' : (warm ? 'rgba(210,200,120,0.3)' : 'rgba(170,210,110,0.3)');
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 3, y - l); g.stroke();
      }
    }, true);
    return (G3[key] = t);
  }

  // a softly blurred copy of a panorama: the backdrop reads as depth of field instead of showing JPEG blocks up close
  function blurredTex(tex, name) {
    G3.skyBlur = G3.skyBlur || {};
    if (G3.skyBlur[name]) return G3.skyBlur[name];
    const img = tex.image; if (!img || !img.width) return tex;
    const w = img.width, h = img.height, big = document.createElement('canvas'); big.width = w; big.height = h;
    const small = document.createElement('canvas'); small.width = Math.max(64, w >> 2); small.height = Math.max(32, h >> 2);
    const sg = small.getContext('2d'), bg = big.getContext('2d');
    sg.imageSmoothingQuality = 'high'; bg.imageSmoothingQuality = 'high';
    sg.drawImage(img, 0, 0, small.width, small.height);
    bg.drawImage(small, 0, 0, w, h);
    // keep a little of the original detail on top so the horizon does not turn to mush
    bg.globalAlpha = 0.6; bg.drawImage(img, 0, 0, w, h); bg.globalAlpha = 1;
    const t = new THREE.CanvasTexture(big);
    t.encoding = THREE.sRGBEncoding; t.mapping = THREE.EquirectangularReflectionMapping;
    return (G3.skyBlur[name] = t);
  }
