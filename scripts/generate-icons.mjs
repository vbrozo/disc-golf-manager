import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = join(process.cwd(), 'public', 'icons');
mkdirSync(outDir, { recursive: true });

function makeSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.35;
  const rr = size * 0.18; // border-radius

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e3a5f"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${rr}" fill="url(#bg)"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 1.0}" fill="none" stroke="rgba(34,197,94,0.55)" stroke-width="${size * 0.025}"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.75}" fill="none" stroke="rgba(34,197,94,0.4)" stroke-width="${size * 0.025}"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.5}" fill="none" stroke="rgba(34,197,94,0.25)" stroke-width="${size * 0.025}"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.35}" fill="#22c55e"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.13}" fill="#0f172a"/>
</svg>`;
}

for (const size of sizes) {
  writeFileSync(join(outDir, `icon-${size}x${size}.svg`), makeSvg(size));
  console.log(`icon-${size}x${size}.svg`);
}

// Also write a maskable version (more padding)
function makeMaskable(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.28;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#0f172a"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 1.0}" fill="none" stroke="rgba(34,197,94,0.55)" stroke-width="${size * 0.025}"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.75}" fill="none" stroke="rgba(34,197,94,0.4)" stroke-width="${size * 0.025}"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.5}" fill="none" stroke="rgba(34,197,94,0.25)" stroke-width="${size * 0.025}"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.35}" fill="#22c55e"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.13}" fill="#0f172a"/>
</svg>`;
}

writeFileSync(join(outDir, 'maskable-512x512.svg'), makeMaskable(512));
console.log('maskable-512x512.svg');
