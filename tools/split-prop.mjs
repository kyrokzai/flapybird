// node tools/split-prop.mjs in.glb out.glb gate|lamp — needs @gltf-transform/core + extensions (npm i -D, not in package.json).
// gate: crest/posts stay in node "frame", the leaves become "doorL"/"doorR" (hinged in themeWalls); lamp: drops the round sign and fills the post with a clean pipe.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const [inp, out, mode] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(inp);
const root = doc.getRoot(), scene = root.listScenes()[0];
const node0 = root.listNodes().find(n => n.getMesh());
const prim = node0.getMesh().listPrimitives()[0];
const pos = prim.getAttribute('POSITION'), idx = prim.getIndices().getArray();
const v = [0, 0, 0], P = i => (pos.getElement(i, v), v.slice());
let ymin = Infinity, ymax = -Infinity;
for (let i = 0; i < pos.getCount(); i++) { const p = P(i); ymin = Math.min(ymin, p[1]); ymax = Math.max(ymax, p[1]); }
const classify = (a, b, c) => {   // door leaves: below the crest and between the posts (|z| < 0.325)
  const A = P(a), B = P(b), C = P(c), cx = (A[0] + B[0] + C[0]) / 3, cy = (A[1] + B[1] + C[1]) / 3, cz = (A[2] + B[2] + C[2]) / 3, f = (cy - ymin) / (ymax - ymin);
  if (mode === 'lamp') { const r = Math.max(...[A, B, C].map(p => Math.hypot(p[0] - 0.049, p[2] - 0.0948))); return (f > 0.2 && f < 0.62 && r > 0.045) || (f > 0.215 && f < 0.6) ? null : 'all'; }
  if (f >= 0.7 || Math.abs(cz) >= 0.325) return 'frame';
  return cz < 0 ? 'doorL' : 'doorR';
};
const parts = {};
for (let t = 0; t < idx.length; t += 3) { const k = classify(idx[t], idx[t + 1], idx[t + 2]); if (!k) continue; (parts[k] = parts[k] || []).push(idx[t], idx[t + 1], idx[t + 2]); }
const buf = root.listBuffers()[0];
for (const [k, tris] of Object.entries(parts)) {
  const p2 = prim.clone(); p2.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(tris)).setBuffer(buf));
  const m = doc.createMesh(k).addPrimitive(p2);
  const n = doc.createNode(k).setMesh(m).setTranslation(node0.getTranslation()).setRotation(node0.getRotation()).setScale(node0.getScale());
  scene.addChild(n);
  console.log(k, tris.length / 3);
}
if (mode === 'lamp') {   // a clean pipe replaces the cut-out stretch of the post
  const seg = 16, y0 = ymin + (ymax - ymin) * 0.205, y1 = ymin + (ymax - ymin) * 0.61, R0 = 0.03, R1 = 0.0135, ax = 0.049, az = 0.0948, P2 = [], N2 = [], I2 = [];
  for (let i = 0; i <= seg; i++) { const a = i / seg * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); P2.push(ax + c * R0, y0, az + s * R0, ax + c * R1, y1, az + s * R1); N2.push(c, 0, s, c, 0, s); }
  for (let i = 0; i < seg; i++) { const a = i * 2; I2.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const mat = doc.createMaterial('pipe').setBaseColorFactor([0.05, 0.053, 0.057, 1]).setMetallicFactor(0.55).setRoughnessFactor(0.45);
  const pr = doc.createPrimitive().setMaterial(mat)
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(P2)).setBuffer(buf))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(N2)).setBuffer(buf))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(I2)).setBuffer(buf));
  scene.addChild(doc.createNode('pipe').setMesh(doc.createMesh('pipe').addPrimitive(pr)));
}
node0.dispose();
await io.write(out, doc);
