// node tools/detach-cloak.mjs in.glb [out.glb 0] — Tripo binds the cloak to the arm bones, so it flaps out when the arms move.
// Vertices more than 5 cm from the arm (bind pose) hand their arm weights to Spine02, fully past 9 cm (smooth in between). Without out.glb it only prints a histogram.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const [inp, out, thr] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(inp);
const skin = doc.getRoot().listSkins()[0], joints = skin.listJoints(), ibm = skin.getInverseBindMatrices();
const names = joints.map(j => j.getName());
// bind-space joint positions: inverse of IBM translation (affine inverse)
const inv = m => { const a = m[0], b = m[4], c = m[8], d = m[1], e = m[5], f = m[9], g = m[2], h = m[6], i = m[10];
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g, det = a * A + b * B + c * C;
  const r = [A / det, -(b * i - c * h) / det, (b * f - c * e) / det, B / det, (a * i - c * g) / det, -(a * f - c * d) / det, C / det, -(a * h - b * g) / det, (a * e - b * d) / det];
  const t = [m[12], m[13], m[14]]; return [-(r[0] * t[0] + r[1] * t[1] + r[2] * t[2]), -(r[3] * t[0] + r[4] * t[1] + r[5] * t[2]), -(r[6] * t[0] + r[7] * t[1] + r[8] * t[2])]; };
const jp = joints.map((j, k) => inv(Array.from(ibm.getElement(k, new Array(16)))));
const J = n => jp[names.indexOf(n)];
const mesh = doc.getRoot().listNodes().find(n => n.getMesh() && n.getSkin()).getMesh(), prim = mesh.listPrimitives()[0];
// mesh node transform (bind space should match mesh space)
const P = prim.getAttribute('POSITION'), JO = prim.getAttribute('JOINTS_0'), WE = prim.getAttribute('WEIGHTS_0');
console.log('pos range', P.getMin([]), P.getMax([]));
for (const n of ['Hip', 'Spine02', 'Head', 'L_Upperarm', 'L_Forearm', 'L_Hand', 'R_Upperarm', 'R_Forearm', 'R_Hand']) console.log(n, J(n).map(x => x.toFixed(3)).join(' '));
const isArm = n => /(Upperarm|Forearm|Elbow|Hand|Pinky|Ring|Mid|Index|Thumb)/.test(n);
const side = n => n.startsWith('L_') ? 'L' : 'R';
const segDist = (p, a, b) => { const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]]; const t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2))); return Math.hypot(ap[0] - ab[0] * t, ap[1] - ab[1] * t, ap[2] - ab[2] * t); };
const armDist = (p, s) => Math.min(segDist(p, J(s + '_Upperarm'), J(s + '_Forearm')), segDist(p, J(s + '_Forearm'), J(s + '_Hand')), segDist(p, J(s + '_Hand'), J(s + '_Mid3')));
const hist = {}; let moved = 0; const sp = names.indexOf('Spine02');
const v = [0, 0, 0], jj = [0, 0, 0, 0], ww = [0, 0, 0, 0];
for (let i = 0; i < P.getCount(); i++) {
  P.getElement(i, v); JO.getElement(i, jj); WE.getElement(i, ww);
  let aw = 0, s = null; for (let k = 0; k < 4; k++) if (ww[k] > 0 && isArm(names[jj[k]])) { aw += ww[k]; s = side(names[jj[k]]); }
  if (!aw) continue;
  const d = armDist(v, s), b = Math.min(20, Math.floor(d / 0.01)); hist[b] = (hist[b] || 0) + 1;
  const f = Math.max(0, Math.min(1, (d - 0.05) / 0.04));   // 0 = sleeve, 1 = cloak / quiver
  if (out && f > 0) {
    let k0 = jj.findIndex((q, k) => q === sp && ww[k] > 0);
    if (k0 < 0) k0 = ww.findIndex(x => x === 0);
    if (k0 < 0) { let best = -1; for (let k = 0; k < 4; k++) if (!isArm(names[jj[k]]) && (best < 0 || ww[k] < ww[best])) best = k; if (best >= 0) { k0 = best; } }
    if (k0 < 0) { let best = 0; for (let k = 1; k < 4; k++) if (ww[k] < ww[best]) best = k; k0 = best; }
    if (jj[k0] !== sp) { /* the dropped influence goes to the spine too */ jj[k0] = sp; }
    for (let k = 0; k < 4; k++) if (k !== k0 && isArm(names[jj[k]])) { const m = ww[k] * f; ww[k] -= m; ww[k0] += m; }
    const sum = ww[0] + ww[1] + ww[2] + ww[3]; for (let k = 0; k < 4; k++) ww[k] /= sum;
    JO.setElement(i, jj); WE.setElement(i, ww); moved++;
  }
}
console.log('arm-weighted verts by distance from the arm (cm-ish bins of 0.01):', JSON.stringify(hist));
if (out) { console.log('moved', moved); await io.write(out, doc); }
