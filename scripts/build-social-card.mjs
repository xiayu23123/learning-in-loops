// Rasterize public/social-card.svg to public/social-card.png (1200x630).
// Social sites don't render SVG previews, so the PNG is what og:image uses.
// Run after editing the SVG: node scripts/build-social-card.mjs
// (sharp comes with Astro.)
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const svg = fileURLToPath(new URL('../public/social-card.svg', import.meta.url));
const png = fileURLToPath(new URL('../public/social-card.png', import.meta.url));

const info = await sharp(svg, { density: 72 })
  .resize(1200, 630)
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toFile(png);
console.log(`Wrote ${png} (${info.width}x${info.height}, ${info.size} bytes)`);
