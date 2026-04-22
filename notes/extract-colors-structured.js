// extract-colors-structured.js
const fs = require('fs');

const htmlFile = 'Color Chart _ The Balloon Lady.html';
const filesDir = 'Color Chart _ The Balloon Lady_files';
const html = fs.readFileSync(htmlFile, 'utf-8');

// Strategy: find all rich-text divs, extract color name, then find next image
const richTextRegex = /<div[^>]+wixui-rich-text[^>]*>[\s\S]*?<p[^>]*>(.*?)<\/p>[\s\S]*?<\/div>/gi;
const colors = [];
const seen = new Set();

let match;
while ((match = richTextRegex.exec(html)) !== null) {
  const textContent = match[1];
  
  // Extract clean text from nested spans
  const cleanText = textContent
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
  
  // Skip navigation and header text
  if (!cleanText || 
      cleanText.match(/^(HOME|About|Gallery|Events|Corporate|Color Chart|FAQs|The Balloon Lady|Balloon|Menu|Order|Sizing|Care|Instructions|Request|Graduation)$/i) ||
      cleanText.length < 3 ||
      cleanText.length > 60) {
    continue;
  }
  
  // Find the next image after this text block
  const afterText = html.slice(match.index + match[0].length, match.index + match[0].length + 1500);
  const imgMatch = afterText.match(/([a-f0-9_]+~mv2[^"]*\.(?:png|avif))/i);
  
  if (imgMatch && !seen.has(cleanText)) {
    const filename = imgMatch[1].split('/').pop();
    
    // Skip logo images
    if (filename.includes('2a4f0ac799314506') || filename.includes('29861158f6a64f29')) {
      continue;
    }
    
    seen.add(cleanText);
    colors.push({
      name: cleanText,
      thumbnail: `./${filesDir}/${filename}`
    });
  }
}

console.log(`✅ Found ${colors.length} colors!`);
fs.writeFileSync('balloon-colors.json', JSON.stringify(colors, null, 2));
console.log('📁 Saved to balloon-colors.json');
