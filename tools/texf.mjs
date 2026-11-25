// node texf.mjs in.glb out.glb colorPx normalPx — like texn, but POSITION stays float (vertex shaders read model-space heights), meshopt-compressed
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { textureCompress, prune, dedup, quantize, reorder } from '@gltf-transform/functions';
import sharp from 'sharp';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const [i, o, cs, ns] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(i);
for (const m of doc.getRoot().listMaterials()) { m.setMetallicRoughnessTexture(null); m.setMetallicFactor(0.1).setRoughnessFactor(0.8); if (+ns === 0) m.setNormalTexture(null); }
for (const mesh of doc.getRoot().listMeshes()) for (const p of mesh.listPrimitives()) p.setAttribute('TANGENT', null);
await doc.transform(prune(),
  textureCompress({ encoder: sharp, targetFormat: 'jpeg', quality: 82, slots: /baseColor/, resize: [+cs, +cs] }),
  ...(+ns ? [textureCompress({ encoder: sharp, targetFormat: 'jpeg', quality: 85, slots: /normal/, resize: [+ns, +ns] })] : []),
  prune(), dedup(), reorder({ encoder: MeshoptEncoder }), quantize({ pattern: /^(NORMAL|TEXCOORD_0)$/, quantizeNormal: 10, quantizeTexcoord: 12 }));
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER });
await io.write(o, doc);
