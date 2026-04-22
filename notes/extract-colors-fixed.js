// extract-colors-fixed.js
const fs = require('fs');
const path = require('path');

const htmlFile = 'Color Chart _ The Balloon Lady.html';
const filesDir = 'Color Chart _ The Balloon Lady_files';

const html = fs.readFileSync(htmlFile, 'utf-8');

// Match image URLs containing 0e982e_ hashes (the balloon color thumbnails)
const imgRegex = /(0e982e_[a-f0-9]+~mv2[^"]*\.(?:png|avif))/gi;
const matches = [...html.matchAll(imgRegex)];

const colors = [];
const seen = new Set();

for (const match of matches) {
  const filename = match[1].split('/').pop(); // Get just the filename from URL
  
  // Extract color name by looking backward in HTML from image position
  const beforeImage = html.slice(Math.max(0, match.index - 500), match.index);
  
  // Color names appear in <p> tags within wixui-rich-text divs
  const nameMatches = beforeImage.match(/>([^<>]{3,50})</g);
  if (!nameMatches) continue;
  
  // Take the last text match before the image (closest one)
  const lastText = nameMatches[nameMatches.length - 1];
  const name = lastText.replace(/>/g, '').replace(/</g, '').trim();
  
  // Filter out navigation/UI text
  if (name && 
      !name.match(/^(HOME|About|Gallery|Color Chart|FAQs|The Balloon Lady)$/i) &&
      !seen.has(name)) {
    seen.add(name);
    colors.push({
      name: name,
      thumbnail: `./${filesDir}/${filename}`
    });
  }
}

console.log(`✅ Found ${colors.length} colors!`);
fs.writeFileSync('balloon-colors.json', JSON.stringify(colors, null, 2));
console.log('📁 Saved to balloon-colors.json');
