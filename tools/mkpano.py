# python3 tools/mkpano.py wide.png out.jpg 0.535 — a wide (~180°) panorama (horizon at that height fraction) becomes a seamless 2:1 equirect sky:
# the image plus its mirror (the centre faces the gate), sky and ground continued smoothly above and below. Needs Pillow + numpy.
import sys
from PIL import Image, ImageFilter, ImageOps
src, out, hz = sys.argv[1], sys.argv[2], float(sys.argv[3])
W, H = 3072, 1536
half = W // 2
im = Image.open(src).convert('RGB')
ih = round(im.height * half / im.width)
im = im.resize((half, ih), Image.LANCZOS)
band = Image.new('RGB', (W, ih)); band.paste(im, (0, 0)); band.paste(ImageOps.mirror(im), (half, 0))
band = band.transform(band.size, Image.AFFINE, (1, 0, -half // 2, 0, 1, 0), resample=Image.NEAREST) if False else Image.fromarray(__import__('numpy').roll(__import__('numpy').array(band), half // 2, axis=1))
top = H // 2 - round(hz * ih)
canvas = Image.new('RGB', (W, H))
# above: the top rows of the sky stretched up to the zenith, blurred and a little darker
st = band.crop((0, 0, W, 24)).resize((10, 1), Image.BOX).resize((W, max(1, top)), Image.BICUBIC)
import numpy as np
a = np.array(st).astype(np.float32); fade = np.linspace(0.55, 1.0, a.shape[0])[:, None, None]; st = Image.fromarray((a * fade).clip(0, 255).astype(np.uint8))
canvas.paste(st, (0, 0)); canvas.paste(band, (0, top))
bl = np.array(canvas).astype(np.float32); fillrow = np.array(st)[-1].astype(np.float32)
for d in range(60):
    k = 1 - d / 60; bl[top + d] = bl[top + d] * (1 - k * 0.85) + fillrow * k * 0.85
canvas = Image.fromarray(bl.clip(0, 255).astype(np.uint8))
bot = top + ih
sb = band.crop((0, ih - 24, W, ih)).resize((10, 1), Image.BOX).resize((W, H - bot), Image.BICUBIC)
canvas.paste(sb, (0, bot))
# soften the two seams
m = np.array(canvas).astype(np.float32)
for y0 in (top, bot):
    for d in range(-12, 13):
        y = y0 + d
        if 0 < y < H - 1: m[y] = (m[y - 1] + m[y] + m[y + 1]) / 3
Image.fromarray(m.clip(0, 255).astype(np.uint8)).save(out, quality=82, optimize=True, progressive=True)
print(out, 'top', top, 'band', ih)
