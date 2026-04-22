// extract-colors.js
const fs = require('fs');
const path = require('path');

const htmlFile = 'Color Chart _ The Balloon Lady.html'; // ← change if your filename is different
const filesDir = 'Color Chart _ The Balloon Lady_files';

const html = fs.readFileSync(htmlFile, 'utf-8');

// Find all image filenames and nearby text (color names)
const matches = html.matchAll(/0e982e_[a-f0-9]+~mv2[^"]*\.avif/g);

const colors = [];
const seen = new Set();

for (const match of matches) {
  const filename = match[0];
  const fullPath = path.join(filesDir, filename);

  // Try to find the color name by looking around the image in the HTML
  const snippetStart = Math.max(0, match.index - 300);
  const snippet = html.slice(snippetStart, match.index + 400);

  const nameMatch = snippet.match(/>([^<]{3,40})<\/[^>]+>/);
  let name = nameMatch ? nameMatch[1].trim() : '';

  if (name && !seen.has(name)) {
    seen.add(name);
    colors.push({
      name: name,
      thumbnail: `./${filesDir}/${filename}`
    });
  }
}

// Deduplicate and sort by appearance
const uniqueColors = Array.from(new Map(colors.map(c => [c.name, c])).values());

console.log(`✅ Found ${uniqueColors.length} colors!`);
console.log(JSON.stringify(uniqueColors, null, 2));

// Save to file too
fs.writeFileSync('balloon-colors.json', JSON.stringify(uniqueColors, null, 2));
console.log('📁 Saved to balloon-colors.json');