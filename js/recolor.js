// js/recolor.js — COMPLETE FILE with correct data URI prefix
const PHOTO_B64 = "iVBORw0KGgoAAAANSUhEUgAAAoAAAAKACAYAAACX4d4x..."; 
// ← REPLACE THE LINE ABOVE WITH YOUR FULL ORIGINAL BASE64 FROM THE CLAUDE ZIP
// (the long string that starts with iVBORw0KGgoAAAANSUhEUgAAAoAAAAKACAYAAACX4d4x
// and ends with the last characters from the original photo file)

const Recolor = (() => {
  let _photoImg = null;

  function loadPhoto(callback) {
    const img = new Image();
    img.src = 'data:image/png;base64,' + PHOTO_B64;
    img.onload = () => {
      console.log("✅ Photo loaded successfully");
      _photoImg = img;
      if (callback) callback();
    };
    img.onerror = () => {
      console.error("❌ Photo failed to load");
      const errEl = document.getElementById("photo-error");
      if (errEl) errEl.textContent = "Error: photo failed to load";
    };
  }

  function recolor(ctx, regions, colorMap) {
    if (!_photoImg) throw new Error('Photo not loaded — call loadPhoto() first');
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.drawImage(_photoImg, 0, 0, W, H);

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

export default Recolor;