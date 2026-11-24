// node tools/strip-root-motion.mjs in.glb out.glb — Tripo run clips walk forward: pin the Hip bone over its bind-pose spot (world x/z), keep the bob. Needs @gltf-transform/core.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
// column-major 4x4 helpers (affine)
const xf = (m, p) => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
const invAff = m => {
  const a = m[0], b = m[4], c = m[8], d = m[1], e = m[5], f = m[9], g = m[2], h = m[6], i = m[10];
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g, det = a * A + b * B + c * C;
  const r = [A / det, -(b * i - c * h) / det, (b * f - c * e) / det, B / det, (a * i - c * g) / det, -(a * f - c * d) / det, C / det, -(a * h - b * g) / det, (a * e - b * d) / det];
  const t = [m[12], m[13], m[14]], o = new Array(16).fill(0);
  // rows of r → column-major
  o[0] = r[0]; o[4] = r[1]; o[8] = r[2]; o[1] = r[3]; o[5] = r[4]; o[9] = r[5]; o[2] = r[6]; o[6] = r[7]; o[10] = r[8]; o[15] = 1;
  o[12] = -(r[0] * t[0] + r[1] * t[1] + r[2] * t[2]); o[13] = -(r[3] * t[0] + r[4] * t[1] + r[5] * t[2]); o[14] = -(r[6] * t[0] + r[7] * t[1] + r[8] * t[2]);
  return o;
};
const [inp, out] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(inp);
const hip = doc.getRoot().listNodes().find(n => n.getName() === 'Hip');
const parent = doc.getRoot().listNodes().find(n => n.listChildren().includes(hip));
const pm = parent.getWorldMatrix(), inv = invAff(pm);
for (const a of doc.getRoot().listAnimations()) for (const c of a.listChannels()) {
  if (c.getTargetNode() !== hip || c.getTargetPath() !== 'translation') continue;
  const o = c.getSampler().getOutput(), arr = o.getArray().slice(), n = o.getCount(), w = [];
  for (let i = 0; i < n; i++) w.push(xf(pm, Array.from(arr.slice(i * 3, i * 3 + 3))));
  const rest = xf(pm, hip.getTranslation()), mx = rest[0], mz = rest[2];   // keep the hip over the bind-pose spot
  console.log(a.getName(), 'world x', Math.min(...w.map(p => p[0])).toFixed(3), Math.max(...w.map(p => p[0])).toFixed(3), 'y', Math.min(...w.map(p => p[1])).toFixed(3), Math.max(...w.map(p => p[1])).toFixed(3), 'z', Math.min(...w.map(p => p[2])).toFixed(3), Math.max(...w.map(p => p[2])).toFixed(3));
  for (let i = 0; i < n; i++) { const p = w[i]; p[0] = mx; p[2] = mz; const l = xf(inv, p); arr.set(l, i * 3); }
  o.setArray(arr);
}
if (out) await io.write(out, doc);
