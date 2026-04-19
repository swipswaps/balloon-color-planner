// js/interaction.js
// Rule 6: interaction layer is SEPARATE from rendering
// This file handles: clicking, selection, grouping, multi-select
// It does NOT draw anything visual — that is Recolor's job

const Interaction = (() => {
  let _regions = [];
  let _onSelect = null;
  let _canvas = null;

  function init(canvas, regions, onSelectCallback) {
    _canvas = canvas;
    _regions = regions;
    _onSelect = onSelectCallback;

    canvas.addEventListener('click', handleClick);
    canvas.style.cursor = 'crosshair';
  }

  function handleClick(e) {
    const rect = _canvas.getBoundingClientRect();
    // Scale click to canvas coordinate space
    const scaleX = _canvas.width  / rect.width;
    const scaleY = _canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;

    // Hit test: find all regions containing the click point
    // Rule 4: test against actual region radius (path geometry)
    const hits = _regions.filter(r => {
      const d = Math.sqrt((x - r.cx)**2 + (y - r.cy)**2);
      return d <= r.r;
    });

    if (hits.length === 0) return;

    // If multiple overlapping, pick the one whose center is closest
    hits.sort((a, b) => {
      const da = Math.sqrt((x-a.cx)**2 + (y-a.cy)**2);
      const db = Math.sqrt((x-b.cx)**2 + (y-b.cy)**2);
      return da - db;
    });
    const hit = hits[0];

    // Shift+click = add to selection; plain click = single select
    _onSelect(hit, e.shiftKey || e.metaKey || e.ctrlKey);
  }

  // Group selection by role (Rule 7 support)
  function selectByRole(role, regions) {
    return regions.filter(r => r.role === role);
  }

  function destroy() {
    if (_canvas) _canvas.removeEventListener('click', handleClick);
  }

  return { init, selectByRole, destroy };
})();
