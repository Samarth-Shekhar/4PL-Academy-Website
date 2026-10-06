import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const keys = [
  'bba-ai', 'bba-global-logistics', 'bba-digital-marketing',
  'mba-supply-chain', 'bba-supply-chain', 'mba-trade-compliance',
];
const target = 'artifacts/academy/public/images/program-hero';
const variants = [
  ['4k', 3840, 2160, 84],
  ['1920', 1920, 1080, 82],
  ['960', 960, 540, 82],
  ['thumb', 480, 270, 80],
];
fs.mkdirSync(target, { recursive: true });
const exports = [];
for (const key of keys) {
  const input = `attached_assets/generated_images/4pl-${key}-hero.jpg`;
  if (!fs.existsSync(input)) throw new Error(`Missing generated artwork: ${input}`);
  for (const [suffix, width, height, quality] of variants) {
    const output = path.join(target, `${key}-${suffix}.webp`);
    execFileSync('convert', [
      input, '-auto-orient', '-filter', 'Lanczos',
      '-resize', `${width}x${height}^`, '-gravity', 'center',
      '-extent', `${width}x${height}`, '-strip', '-quality', String(quality), output,
    ]);
    exports.push({ key, file: output, width, height, bytes: fs.statSync(output).size });
  }
}
console.log(JSON.stringify({
  note: 'AI-generated 1024px source artwork; 3840×2160 exports are upscaled, not native 4K.',
  exports,
}, null, 2));
