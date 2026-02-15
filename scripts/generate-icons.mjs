import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const svgContent = readFileSync(resolve(root, 'public/favicon.svg'), 'utf-8');

// Make SVG larger for better quality rendering
const makeSvg = (size, maskable = false) => {
  if (maskable) {
    // Maskable icons need safe zone (80% inner area)
    const padding = Math.round(size * 0.1);
    const innerSize = size - padding * 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="#6366f1"/>
      <svg x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="url(#gradient)"/>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366f1"/>
            <stop offset="100%" style="stop-color:#8b5cf6"/>
          </linearGradient>
        </defs>
        <path d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fill="white" opacity="0.9"/>
        <path d="M16 10v6l4 2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <circle cx="16" cy="16" r="2" fill="white"/>
        <path d="M11 21l2-3m8 3l-2-3" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
      </svg>
    </svg>`;
  }
  return svgContent.replace('viewBox="0 0 32 32"', `width="${size}" height="${size}" viewBox="0 0 32 32"`);
};

// Create a simple screenshot placeholder
const makeScreenshot = (width, height, label) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#0a0a0f"/>
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#6366f1"/>
        <stop offset="100%" style="stop-color:#8b5cf6"/>
      </linearGradient>
    </defs>
    <rect x="${width*0.3}" y="${height*0.35}" width="${width*0.4}" height="${width*0.4}" rx="24" fill="url(#g)" opacity="0.15"/>
    <text x="${width/2}" y="${height*0.48}" text-anchor="middle" fill="white" font-family="system-ui" font-size="${Math.round(width*0.06)}" font-weight="700">Xpensio</text>
    <text x="${width/2}" y="${height*0.55}" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="${Math.round(width*0.025)}">Smart Finance Tracker</text>
  </svg>`;
};

async function generate() {
  const iconsDir = resolve(root, 'public/icons');
  const screenshotsDir = resolve(root, 'public/screenshots');

  // Generate regular icons
  for (const size of [192, 512]) {
    await sharp(Buffer.from(makeSvg(size)))
      .resize(size, size)
      .png()
      .toFile(resolve(iconsDir, `icon-${size}.png`));
    console.log(`✓ icon-${size}.png`);
  }

  // Generate maskable icons
  for (const size of [192, 512]) {
    await sharp(Buffer.from(makeSvg(size, true)))
      .resize(size, size)
      .png()
      .toFile(resolve(iconsDir, `icon-maskable-${size}.png`));
    console.log(`✓ icon-maskable-${size}.png`);
  }

  // Generate Apple touch icon (180x180)
  await sharp(Buffer.from(makeSvg(180)))
    .resize(180, 180)
    .png()
    .toFile(resolve(iconsDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png');

  // Generate screenshot placeholders
  await sharp(Buffer.from(makeScreenshot(1280, 720, 'Desktop')))
    .png()
    .toFile(resolve(screenshotsDir, 'desktop.png'));
  console.log('✓ desktop.png');

  await sharp(Buffer.from(makeScreenshot(390, 844, 'Mobile')))
    .png()
    .toFile(resolve(screenshotsDir, 'mobile.png'));
  console.log('✓ mobile.png');

  console.log('\nAll PWA assets generated!');
}

generate().catch(console.error);
