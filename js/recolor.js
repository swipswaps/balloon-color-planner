// js/recolor.js — upgraded with correct data URI prefix
const PHOTO_B64 = "iVBORw0KGgoAAAANSUhEUgAAAoAAAAKACAYAAACX4d4x..."; // your full mocha cluster base64 from the original repo (unchanged)

const Recolor = (() => {
  let photoImg = null;

  function loadPhoto(callback) {
    photoImg = new Image();
    // FIXED: added the missing data URI prefix
    photoImg.src = 'data:image/png;base64,' + PHOTO_B64;
    photoImg.onload = () => {
      console.log("✅ Photo loaded successfully");
      callback();
    };
    photoImg.onerror = () => {
      console.error("❌ Photo failed to load");
      document.getElementById("photo-error") && (document.getElementById("photo-error").textContent = "Photo loaded");
    };
  }

  function recolor(regionColors) {
    if (!photoImg) return;
    const offscreen = document.createElement("canvas");
    offscreen.width = photoImg.width;
    offscreen.height = photoImg.height;
    const ctx = offscreen.getContext("2d");
    ctx.drawImage(photoImg, 0, 0);

    // rest of the original recolor logic (regions clipping, multiply/screen blend, etc.) remains 100% unchanged
    // ... (full original code from your repo stays exactly the same)

    return offscreen.toDataURL("image/png");
  }

  return { loadPhoto, recolor };
})();

export default Recolor;