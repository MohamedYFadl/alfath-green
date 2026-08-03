import sharp from 'sharp';
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'T:/Mohamed/Freelance/alfath -green';
const PROJ = 'T:/Mohamed/Freelance/alfath -green/project';
const IMG = path.join(PROJ, 'src/assets/images');
const PUB = path.join(PROJ, 'public');

await mkdir(path.join(IMG, 'hero'), { recursive: true });
await mkdir(path.join(IMG, 'products'), { recursive: true });
await mkdir(path.join(IMG, 'blog'), { recursive: true });
await mkdir(path.join(IMG, 'brand'), { recursive: true });
await mkdir(path.join(PUB, 'videos'), { recursive: true });

const jpg = (q = 82) => ({ quality: q, mozjpeg: true });

// ---------- helpers ----------
async function wide(src, out, w = 1920) {
  await sharp(path.join(SRC, src))
    .resize({ width: w, withoutEnlargement: true })
    .jpeg(jpg(84))
    .toFile(path.join(IMG, out));
  console.log('wide  ', out);
}

async function square(src, out, opts = {}) {
  const { left, top, width, height, size = 1000 } = opts;
  let p = sharp(path.join(SRC, src)).rotate();
  if (width) p = p.extract({ left, top, width, height });
  await p
    .resize(size, size, { fit: 'cover', position: opts.position || 'centre' })
    .jpeg(jpg(84))
    .toFile(path.join(IMG, out));
  console.log('square', out);
}

// ---------- hero (wide, cinematic) ----------
await wide('field.png', 'hero/hero-field.jpg');
await wide('HARVSET.png', 'hero/hero-harvest.jpg');
await wide('Packing.png', 'hero/hero-packing.jpg');
await wide('Export.png', 'hero/hero-export.jpg');

// ---------- about / sections ----------
await wide('Egyptian agricultural workers.png', 'about-team.jpg', 1600);
await wide('thumb.jpg', 'video-thumb.jpg', 1400);

// ---------- products (square 1:1 cards) ----------
// fruits
await square('86186-حصاد-البرتقال-(8).jpg', 'products/orange.jpg');
await square('لمون 1.jpg', 'products/lemon.jpg');
await square('لمون 2.jpg', 'products/lemon-2.jpg');
await square('لمون 3.jpg', 'products/lemon-3.jpg');
await square('تصدير-العنب.jpg', 'products/grapes.jpg');
await square('images.jpg', 'products/pomegranate.jpg');
// vegetables
await square('thumb.jpg', 'products/potato.jpg', { position: 'centre' });
await square('بصل.jpg', 'products/onion.jpg');
await square('فلفل رومي.jpg', 'products/pepper.jpg');
await square('فلفل رومي2.jpg', 'products/pepper-2.jpg');
await square('1فلفل رومي.jpg', 'products/pepper-3.jpg');

// tomato: crop the tomato cluster out of the harvest shot (1664x931 approx)
{
  const meta = await sharp(path.join(SRC, 'HARVSET.png')).metadata();
  const size = Math.round(meta.height * 0.62);
  await sharp(path.join(SRC, 'HARVSET.png'))
    .extract({
      left: Math.round(meta.width * 0.20),
      top: Math.round(meta.height * 0.38),
      width: size,
      height: size,
    })
    .resize(1000, 1000, { fit: 'cover' })
    .jpeg(jpg(84))
    .toFile(path.join(IMG, 'products/tomato.jpg'));
  console.log('square', 'products/tomato.jpg');
}

// cucumber: crop cucumber crates out of the packing shot
{
  const meta = await sharp(path.join(SRC, 'Packing.png')).metadata();
  const size = Math.round(meta.height * 0.55);
  await sharp(path.join(SRC, 'Packing.png'))
    .extract({
      left: Math.round(meta.width * 0.62),
      top: Math.round(meta.height * 0.45),
      width: size,
      height: size,
    })
    .resize(1000, 1000, { fit: 'cover' })
    .jpeg(jpg(84))
    .toFile(path.join(IMG, 'products/cucumber.jpg'));
  console.log('square', 'products/cucumber.jpg');
}

// ---------- blog covers (16:9) ----------
async function cover(src, out) {
  await sharp(path.join(SRC, src))
    .resize(1400, 787, { fit: 'cover' })
    .jpeg(jpg(84))
    .toFile(path.join(IMG, out));
  console.log('cover ', out);
}
await cover('when to harvest.avif', 'blog/harvest-timing.jpg');
await cover('field.png', 'blog/nile-soil.jpg');
await cover('Export.png', 'blog/cold-chain.jpg');
await cover('Packing.png', 'blog/packing-standards.jpg');

// ---------- brand ----------
// full logo, trimmed of white border, kept on transparent
await sharp(path.join(SRC, 'logo.webp'))
  .resize({ width: 900 })
  .png()
  .toFile(path.join(IMG, 'brand/logo-full.png'));
console.log('brand  logo-full.png');

// emblem only: top portion of logo.webp (globe + handshake + leaves),
// with the white studio background keyed out to transparent so the mark
// can sit on the warm-white header without a visible white box.
async function keyOutWhite(buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const HARD = 250; // fully transparent at/above this
  const SOFT = 228; // fully opaque at/below this
  for (let i = 0; i < data.length; i += 4) {
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    if (min >= HARD) data[i + 3] = 0;
    else if (min > SOFT) data[i + 3] = Math.round(((HARD - min) / (HARD - SOFT)) * 255);
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

{
  const meta = await sharp(path.join(SRC, 'logo.webp')).metadata();
  const cropped = await sharp(path.join(SRC, 'logo.webp'))
    .extract({
      left: Math.round(meta.width * 0.09),
      top: Math.round(meta.height * 0.05),
      width: Math.round(meta.width * 0.82),
      height: Math.round(meta.height * 0.58),
    })
    .png()
    .toBuffer();

  const keyed = await keyOutWhite(cropped);

  await sharp(keyed)
    .trim({ threshold: 1 })
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(IMG, 'brand/logo-mark.png'));
  console.log('brand  logo-mark.png');
}

// map placeholder
await sharp(path.join(SRC, 'map.png'))
  .resize({ width: 1200 })
  .jpeg(jpg(78))
  .toFile(path.join(IMG, 'map-placeholder.jpg'));
console.log('map    map-placeholder.jpg');

// favicon from emblem
await sharp(path.join(IMG, 'brand/logo-mark.png'))
  .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toFile(path.join(PUB, 'favicon.png'));
console.log('pub    favicon.png');

// ---------- videos ----------
await copyFile(path.join(SRC, '1.mp4'), path.join(PUB, 'videos/farm-1.mp4'));
await copyFile(path.join(SRC, '2.mp4'), path.join(PUB, 'videos/farm-2.mp4'));
// About-section feature clip. Large (~18 MB) — see README on compressing it.
await copyFile(path.join(SRC, 'journey.mp4'), path.join(PUB, 'videos/journey.mp4'));
console.log('pub    videos copied');

console.log('\nDone.');
