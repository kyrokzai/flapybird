  // =================================================================== physics helpers
  function pushOut(ent, r, includeWater) {
    let hit = false;
    for (const o of obstacles) {
      if (!o.solid && !includeWater) continue;
      const nx = clamp(ent.x, o.x, o.x + o.w), ny = clamp(ent.y, o.y, o.y + o.h);
      let dx = ent.x - nx, dy = ent.y - ny;
      const d2 = dx * dx + dy * dy;
      if (d2 < r * r) {
        hit = true;
        if (d2 > 0.0001) {
          const d = Math.sqrt(d2);
          ent.x += dx / d * (r - d); ent.y += dy / d * (r - d);
        } else {
          const l = ent.x - o.x, rt = o.x + o.w - ent.x, t = ent.y - o.y, b = o.y + o.h - ent.y;
          const m = Math.min(l, rt, t, b);
          if (m === l) ent.x = o.x - r; else if (m === rt) ent.x = o.x + o.w + r;
          else if (m === t) ent.y = o.y - r; else ent.y = o.y + o.h + r;
        }
      }
    }
    const cx = clamp(ent.x, ARENA.x + r, AX2 - r), cy = clamp(ent.y, ARENA.y + r, AY2 - r);
    if (cx !== ent.x || cy !== ent.y) hit = true;
    ent.x = cx; ent.y = cy;
    return hit;
  }
  const solidAt = (x, y, pad) => obstacles.find(o => o.solid && x > o.x - pad && x < o.x + o.w + pad && y > o.y - pad && y < o.y + o.h + pad);
  function lineOfSight(a, b) {
    const d = dist(a, b), n = Math.ceil(d / 8);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      if (solidAt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 0)) return false;
    }
    return true;
  }

  // ---- flow field toward the player (walking enemies route around stones, yurts and water)
  let flow = new Int16Array(COLS * ROWS), flowT = 0;
  const cellOf = (x, y) => [clamp(Math.floor((x - ARENA.x) / CELL), 0, COLS - 1), clamp(Math.floor((y - ARENA.y) / CELL), 0, ROWS - 1)];
  const cellBlocked = (c, r) => c < 0 || r < 0 || c >= COLS || r >= ROWS || obstacles.some(o => o.x === ARENA.x + c * CELL && o.y === ARENA.y + r * CELL);
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function computeFlow() {
    flow.fill(-1);
    const [pc, pr] = cellOf(player.x, player.y);
    const q = [[pc, pr]]; flow[pr * COLS + pc] = 0;
    while (q.length) {
      const [c, r] = q.shift(), v = flow[r * COLS + c];
      for (const [dc, dr] of DIRS) {
        const nc = c + dc, nr = r + dr;
        if (cellBlocked(nc, nr) || flow[nr * COLS + nc] >= 0) continue;
        if (dc && dr && (cellBlocked(c + dc, r) || cellBlocked(c, r + dr))) continue;
        flow[nr * COLS + nc] = v + 1; q.push([nc, nr]);
      }
    }
  }
  function clearPath(a, b, pad) {
    const d = dist(a, b), n = Math.ceil(d / 10);
    for (let i = 1; i < n; i++) {
      const t = i / n, x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
      if (obstacles.some(o => x > o.x - pad && x < o.x + o.w + pad && y > o.y - pad && y < o.y + o.h + pad)) return false;
    }
    return true;
  }
  function pathAngle(e) {
    if (clearPath(e, player, e.r * 0.9)) return angTo(e, player);
    const [c, r] = cellOf(e.x, e.y);
    let bv = flow[r * COLS + c]; if (bv < 0) bv = 9999;
    let best = null;
    for (const [dc, dr] of DIRS) {
      const nc = c + dc, nr = r + dr;
      if (cellBlocked(nc, nr)) continue;
      if (dc && dr && (cellBlocked(c + dc, r) || cellBlocked(c, r + dr))) continue;
      const v = flow[nr * COLS + nc];
      if (v >= 0 && v < bv) { bv = v; best = [nc, nr]; }
    }
    if (!best) return angTo(e, player);
    return Math.atan2(ARENA.y + best[1] * CELL + CELL / 2 - e.y, ARENA.x + best[0] * CELL + CELL / 2 - e.x);
  }
  function steerPath(e, spd) { const a = pathAngle(e); e.vx = Math.cos(a) * spd; e.vy = Math.sin(a) * spd; e.face = a; }

