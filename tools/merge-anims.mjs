// Merges animation clips from several auto-rigged GLBs (same skeleton) into one GLB, strips root motion, compresses.
// Needs: npm i @gltf-transform/core @gltf-transform/functions @gltf-transform/extensions sharp (not a project dependency).
// Example: node tools/merge-anims.mjs out.glb idle.glb idle=idle.glb run=run.glb shot=shot.glb hit=hit.glb death=death.glb
// usage: node merge_anims.mjs out.glb base.glb name1=file1.glb name2=file2.glb ...
import { NodeIO } from '@gltf-transform/core';
import { resample, dedup, prune, textureCompress, quantize } from '@gltf-transform/functions';
import sharp from 'sharp';
const [out, basePath, ...rest] = process.argv.slice(2);
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(basePath);
const root = doc.getRoot(), buf = root.listBuffers()[0];
const byName = new Map(root.listNodes().map(n => [n.getName(), n]));
for (const a of root.listAnimations()) a.dispose();
for (const spec of rest) {
  const [name, file] = spec.split('=');
  const src = await io.read(file);
  for (const sa of src.getRoot().listAnimations()) {
    const anim = doc.createAnimation(name);
    for (const ch of sa.listChannels()) {
      const tn = byName.get(ch.getTargetNode().getName()); if (!tn) continue;
      const ss = ch.getSampler();
      const cp = acc => doc.createAccessor().setType(acc.getType()).setArray(acc.getArray().slice()).setBuffer(buf);
      const s = doc.createAnimationSampler().setInput(cp(ss.getInput())).setOutput(cp(ss.getOutput())).setInterpolation(ss.getInterpolation());
      anim.addSampler(s).addChannel(doc.createAnimationChannel().setTargetNode(tn).setTargetPath(ch.getTargetPath()).setSampler(s));
    }
    break;
  }
}

// ---- clean up root motion on Hips: the game moves the hero itself
const qmul = (a, b) => [a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1], a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0], a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3], a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
const twistY = q => { const l = Math.hypot(q[1], q[3]) || 1; return [0, q[1] / l, 0, q[3] / l]; };
const conj = q => [-q[0], -q[1], -q[2], q[3]];
const hips = byName.get('Hips'), hipRest = hips.getTranslation();
for (const a of root.listAnimations()) {
  const name = a.getName();
  let yaw0 = null;
  for (const ch of a.listChannels()) {
    if (ch.getTargetNode() !== hips) continue;
    const acc = ch.getSampler().getOutput(), o = acc.getArray();
    if (ch.getTargetPath() === 'rotation') {
      for (let i = 0; i < o.length; i += 4) {
        const q = [o[i], o[i + 1], o[i + 2], o[i + 3]];
        let r;
        if (name === 'death') { if (!yaw0) yaw0 = conj(twistY(q)); r = qmul(yaw0, q); }
        else if (name === 'idle' || name === 'hit') r = qmul(q, conj(twistY(q)));
        else r = q;
        o.set(r, i);
      }
    }
  }
  for (const ch of a.listChannels()) {
    if (ch.getTargetNode() !== hips || ch.getTargetPath() !== 'translation') continue;
    const o = ch.getSampler().getOutput().getArray(), x0 = o[0], z0 = o[2];
    for (let i = 0; i < o.length; i += 3) {
      if (name === 'death') {
        // rotate the fall by the same yaw correction, starting from the rest spot
        const dx = o[i] - x0, dz = o[i + 2] - z0, y = yaw0 ? 2 * Math.atan2(yaw0[1], yaw0[3]) : 0, c = Math.cos(y), s = Math.sin(y);
        o[i] = hipRest[0] + c * dx + s * dz; o[i + 2] = hipRest[2] - s * dx + c * dz;
      } else { o[i] = hipRest[0]; o[i + 2] = hipRest[2]; }
    }
  }
}
for (const m of root.listMeshes()) for (const p of m.listPrimitives()) { const t = p.getAttribute('TANGENT'); if (t) { p.setAttribute('TANGENT', null); } }
await doc.transform(resample({ tolerance: 0.0005 }), dedup(), prune(), textureCompress({ encoder: sharp, targetFormat: 'jpeg', quality: 82, resize: [1024, 1024] }), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12, quantizeWeight: 8 }));
await io.write(out, doc);
console.log('written', out, root.listAnimations().map(a => a.getName() + ':' + a.listChannels().length).join(' '));
