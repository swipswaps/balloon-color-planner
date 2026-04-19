// js/recolor.js
// Rule 2: original photo is the base layer — never reconstructed from geometry
// Rule 3: recoloring engine — clip to region, apply 'color' blend, restore shading
// Rule 4: regions define their own path() — not circles
// Rule 6: this file handles rendering ONLY — interaction is separate (app.js)
// Rule 13: preserves original lighting, shading, texture

const Recolor = (() => {
  let _photoImg = null;

  // Rule 10: verify image loads before using
  function loadPhoto(b64) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth === 0) reject(new Error('Image decoded to zero size'));
        _photoImg = img;
        resolve(img);
      };
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = b64;
    });
  }

  // Rule 3: core recoloring function
  // 'color' composite op preserves luminance — keeps shading, changes only hue
  function recolor(ctx, regions, colorMap) {
    if (!_photoImg) throw new Error('Photo not loaded — call loadPhoto() first');

    const W = ctx.canvas.width;
    const H = ctx.canvas.height;

    // Base layer: original photo (Rule 2)
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.drawImage(_photoImg, 0, 0, W, H);

    // Color layer: per-region (Rule 4)
    regions.forEach(region => {
      const color = colorMap[region.id];
      if (!color) return; // unassigned regions show original photo color

      ctx.save();

      // Clip to balloon region shape (Rule 4: path(), not circle)
      ctx.beginPath();
      region.path(ctx);
      ctx.clip();

      // Step 1: Apply hue/color — 'color' blend preserves luminance (Rule 13)
      ctx.globalCompositeOperation = 'color';
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, W, H);

      // Step 2: Restore shading from original photo (Rule 13)
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.35;
      ctx.drawImage(_photoImg, 0, 0, W, H);

      // Step 3: Restore specular highlights (Rule 13)
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      ctx.restore();
    });
  }

  // Render selection indicator without altering photo rendering (Rule 6)
  function drawSelection(ctx, region) {
    ctx.save();
    ctx.beginPath();
    region.path(ctx);
    ctx.strokeStyle = '#e8006a';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#e8006a';
    ctx.fill();
    ctx.restore();
  }

  return { loadPhoto, recolor, drawSelection };
})();
