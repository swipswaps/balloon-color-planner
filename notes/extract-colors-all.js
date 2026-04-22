// extract-colors-all.js
const fs = require('fs');
const path = require('path');

const htmlFile = 'Color Chart _ The Balloon Lady.html';
const filesDir = 'Color Chart _ The Balloon Lady_files';

const html = fs.readFileSync(htmlFile, 'utf-8');

// Match ALL image filenames in srcSet (not just 0e982e_ prefix)
const imgRegex = /([a-f0-9_]+~mv2[^"]*\.(?:png|avif))/gi;
const matches = [...html.matchAll(imgRegex)];

const colors = [];
const seen = new Set();

for (const match of matches) {
  const filename = match[1].split('/').pop();
  
  // Skip if not a color thumbnail (filter out logo/header images)
  if (filename.includes('2a4f0ac799314506') || filename.includes('29861158f6a64f29')) {
    continue; // These are the logo images from header
  }
  
  const beforeImage = html.slice(Math.max(0, match.index - 600), match.index);
  
  // Color names in <p> or <span> tags
  const nameMatches = beforeImage.match(/>([^<>]{3,50})</g);
  if (!nameMatches) continue;
  
  const lastText = nameMatches[nameMatches.length - 1];
  const name = lastText.replace(/>/g, '').replace(/</g, '').trim();
  
  // Filter UI text and duplicates
  if (name && 
      !name.match(/^(HOME|About|Gallery|Events|Corporate|Color Chart|FAQs|The Balloon Lady|Balloon|Menu|Order|Sizing|Care|Instructions|Request)$/i) &&
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
