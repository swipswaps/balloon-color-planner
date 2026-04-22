// js/recolor.js — COMPLETE FILE with correct data URI prefix
// NOTE: PHOTO_B64 is defined in js/regions.js and included before this file

const Recolor = (() => {
  let _photoImg = null;

  function loadPhoto(b64) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth === 0) reject(new Error('Image decoded to zero size'));
        _photoImg = img;
        console.log("✅ Photo loaded successfully");
        resolve(img);
      };
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = b64;  // b64 includes full data URI prefix (e.g., 'data:image/jpeg;base64,...')
    });
  }

  function recolor(ctx, regions, colorMap) {
    if (!_photoImg) throw new Error('Photo not loaded — call loadPhoto() first');
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    console.log('🎨 recolor() called - Photo:', _photoImg ? 'loaded' : 'NOT loaded', 'Canvas:', W, 'x', H, 'Regions:', regions.length, 'Colors:', Object.keys(colorMap).length);

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.drawImage(_photoImg, 0, 0, W, H);
    console.log('✅ Photo base layer drawn');

    regions.forEach(region => {
      const color = colorMap[region.id];
      if (!color) return;
      ctx.save();
      ctx.beginPath();
      region.path(ctx);
      ctx.clip();

      ctx.globalCompositeOperation = 'color';
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.35;
      ctx.drawImage(_photoImg, 0, 0, W, H);

      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      ctx.restore();
    });
  }

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