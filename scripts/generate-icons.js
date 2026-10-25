const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const svgPath = path.join(__dirname, '../public/icons/icon.svg');
  const svg = fs.readFileSync(svgPath);

  await sharp(svg).resize(192, 192).png().toFile(path.join(__dirname, '../public/icons/icon-192x192.png'));
  await sharp(svg).resize(192, 192).png().toFile(path.join(__dirname, '../public/icons/icon-192x192-maskable.png'));
  await sharp(svg).resize(512, 512).png().toFile(path.join(__dirname, '../public/icons/icon-512x512.png'));
  await sharp(svg).resize(512, 512).png().toFile(path.join(__dirname, '../public/icons/icon-512x512-maskable.png'));

  console.log('ALL_PWA_ICONS_GENERATED_SUCCESSFULLY');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
