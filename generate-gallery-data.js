// Script to generate gallery-data.js from AVIF files in balloon-planner/assets/images/
// Updated for AVIF-only structure - paths are portable (dev and production identical)
// Usage: node generate-gallery-data.js

const fs = require('fs');
const path = require('path');

// Read AVIF files directly from new assets folder
const assetsDir = './balloon-planner/assets/images';
const avifFiles = fs.readdirSync(assetsDir)
  .filter(f => f.endsWith('.avif'))
  .sort();

console.log(`Found ${avifFiles.length} AVIF files in assets/images/`);

// Create relative paths (works in dev and production)
const allPhotos = avifFiles.map(f => `./assets/images/${f}`);

// Color family grouping (7 families, 190 arrangements total)
const colorMapping = {
  'white-cream': { label: 'White & Cream', start: 0, count: 30 },
  'gold-champagne': { label: 'Gold & Champagne', start: 30, count: 30 },
  'brown-mocha': { label: 'Brown & Mocha', start: 60, count: 30 },
  'pink-fuchsia': { label: 'Pink & Fuchsia', start: 90, count: 50 },
  'purple': { label: 'Purple', start: 140, count: 25 },
  'navy': { label: 'Navy', start: 165, count: 10 },
  'grey-silver': { label: 'Grey & Silver', start: 175, count: 15 }
};

// Generate gallery data structure
const galleryData = {
  product: { title: 'Balloon Arrangement Planner' },
  attribute: { name: 'Color', defaultLabel: 'All Arrangements' },
  defaultGallery: {
    images: allPhotos
  },
  colorCollections: {}
};

// Create filtered image collections for each color family
for (const [slug, config] of Object.entries(colorMapping)) {
  const colorImages = allPhotos.slice(config.start, config.start + config.count);
  const swatchImage = colorImages[0] || allPhotos[0];
  
  galleryData.colorCollections[slug] = {
    label: config.label,
    swatch: swatchImage,
    images: colorImages
  };
}

// Write the output file
const output = `window.ProductGalleryData = ${JSON.stringify(galleryData, null, 2)};`;
fs.writeFileSync('./balloon-planner/js/gallery-data.js', output, 'utf8');

console.log('✓ gallery-data.js generated successfully');
console.log(`✓ Total arrangements in defaultGallery: ${galleryData.defaultGallery.images.length}`);
console.log(`✓ Color families: ${Object.keys(galleryData.colorCollections).length}`);
Object.entries(colorMapping).forEach(([slug, config]) => {
  console.log(`  - ${config.label}: ${config.count} arrangements`);
});
