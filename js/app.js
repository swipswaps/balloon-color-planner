// js/app.js
// Rule 12: full pipeline — Image → Segmentation → Regions → Interaction → Color → Recolor → Verify
// Rule 7: color assignment by role (large/medium/small), not blind alternation
// Rule 11: revert protocol — restore immediately, present, then explain
// Rule 14: one cluster, one image, 2-3 colors — expand only after correctness achieved

const App = (() => {
  // State
  const state = {
    colorMap: {},      // regionId -> hex color
    selected: new Set(),
    slots: [null, null], // up to 3 color slots
    activeSlot: 0,
  };

  let canvas, ctx;

  // Rule 9: validate bounds after any transform
  function assertBounds(regions, W, H) {
    const violations = regions.filter(r =>
      r.cx - r.r < 0 || r.cy - r.r < 0 ||
      r.cx + r.r > W || r.cy + r.r > H
    );
    if (violations.length > 0) {
      console.error('BOUND VIOLATIONS — halting render:', violations);
      throw new Error(`${violations.length} regions out of bounds`);
    }
  }

  async function init() {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');
    canvas.width  = PHOTO_W;
    canvas.height = PHOTO_H;

    // Rule 10: verify photo loads
    try {
      await Recolor.loadPhoto(PHOTO_B64);
    } catch(e) {
      console.error('Photo load failed:', e);
      document.getElementById('status').textContent = 'Error: photo failed to load';
      return;
    }

    // Rule 9: validate bounds before any render
    assertBounds(REGIONS, PHOTO_W, PHOTO_H);

    // Rule 7: apply default preset (Pink & Fuchsia) by role
    applyPreset('Pink & Fuchsia');

    // Rule 6: interaction separate from rendering
    Interaction.init(canvas, REGIONS, handleSelect);

    renderPalette();
    renderSlots();
    renderSummary();
    render();
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Rule 3: recolor engine handles photo base + per-region color
    Recolor.recolor(ctx, REGIONS, state.colorMap);
    // Rule 6: selection indicators drawn on top by recolor module
    state.selected.forEach(id => {
      const r = REGIONS.find(r => r.id === id);
      if (r) Recolor.drawSelection(ctx, r);
    });
  }

  function handleSelect(region, additive) {
    if (additive) {
      if (state.selected.has(region.id)) state.selected.delete(region.id);
      else state.selected.add(region.id);
    } else {
      if (state.selected.size === 1 && state.selected.has(region.id))
        state.selected.clear();
      else { state.selected.clear(); state.selected.add(region.id); }
    }
    renderChips();
    render();
  }

  // Rule 7: color assignment by role
  function applyPreset(name) {
    const preset = PRESETS[name];
    if (!preset) return;
    REGIONS.forEach(r => {
      const c = preset[r.role] || preset.large;
      state.colorMap[r.id] = c.h;
    });
    state.slots = Object.values(preset).map(c => c);
    state.selected.clear();
    renderSlots();
    renderSummary();
    render();
  }

  // Rule 7: assign chosen color to selected regions
  // If nothing selected and slot mode active, apply to all of that role
  function assignColor(hex, colorObj) {
    const slot = state.activeSlot;
    state.slots[slot] = colorObj;

    const targets = state.selected.size > 0
      ? [...state.selected]
      : REGIONS.map(r => r.id); // all

    targets.forEach(id => { state.colorMap[id] = hex; });
    state.selected.clear();

    // Advance slot after pick
    if (state.activeSlot < state.slots.length - 1) state.activeSlot++;

    renderSlots();
    renderChips();
    renderSummary();
    render();
  }

  // Rule 7: select all of a role
  function selectRole(role) {
    state.selected = new Set(REGIONS.filter(r => r.role === role).map(r => r.id));
    renderChips();
    render();
  }

  // Rule 11: revert — restore working state immediately
  function revert() {
    state.colorMap = {};
    state.selected.clear();
    state.slots = [null, null];
    state.activeSlot = 0;
    applyPreset('Pink & Fuchsia');
  }

  // ── UI renderers ──────────────────────────────────────────────────────────

  function renderPalette() {
    const el = document.getElementById('palette');
    el.innerHTML = PALETTE.map(group => {
      const hasPreset = PRESETS.hasOwnProperty(group.g);
      const label = hasPreset
        ? `<button class="preset-btn" onclick="App.applyPreset('${group.g}')">${group.g}</button>`
        : `<div class="group-label">${group.g}</div>`;
      const swatches = group.c.map(c =>
        `<div class="swatch" style="background:${c.h}" title="${c.n}"
          onclick="App.assignColor('${c.h}',${JSON.stringify(c)})"></div>`
      ).join('');
      return `<div class="pal-group">${label}<div class="swatches">${swatches}</div></div>`;
    }).join('');
  }

  function renderSlots() {
    const el = document.getElementById('slots');
    el.innerHTML = state.slots.map((c, i) => {
      const active = state.activeSlot === i ? ' active' : '';
      if (!c) return `<div class="slot empty${active}" onclick="App.setSlot(${i})">Color ${i+1}</div>`;
      const light = isLight(c.h);
      return `<div class="slot filled${active}" style="background:${c.h}" onclick="App.setSlot(${i})">
        <span style="color:${light?'#333':'#fff'}">${c.n}</span>
        <span class="slot-x" onclick="App.clearSlot(event,${i})">×</span>
      </div>`;
    }).join('');
  }

  function renderChips() {
    const el = document.getElementById('chips');
    if (!state.selected.size) { el.innerHTML = '<span class="none">Click balloons to select</span>'; return; }
    el.innerHTML = [...state.selected].sort((a,b)=>a-b).map(id => {
      const r = REGIONS.find(r => r.id === id);
      const col = state.colorMap[id] || '#ccc';
      return `<div class="chip" onclick="App.deselect(${id})">
        <span class="chip-dot" style="background:${col}"></span>#${id+1}×</div>`;
    }).join('');
  }

  function renderSummary() {
    const counts = {};
    REGIONS.forEach(r => {
      const col = state.colorMap[r.id];
      if (!col) return;
      const name = findColorName(col);
      counts[name] = (counts[name]||0) + 1;
    });
    const el = document.getElementById('summary');
    el.innerHTML = Object.entries(counts)
      .sort((a,b) => b[1]-a[1])
      .map(([n,ct]) => `<div class="sum-row"><span>${n}</span><span>${ct}</span></div>`)
      .join('');
  }

  function findColorName(hex) {
    for (const g of PALETTE) for (const c of g.c)
      if (c.h === hex) return c.n;
    return hex;
  }

  function isLight(hex) {
    const n = parseInt(hex.slice(1),16);
    const r=(n>>16)&255, g=(n>>8)&255, b=n&255;
    return (0.299*r + 0.587*g + 0.114*b) > 140;
  }

  // Public API
  return {
    init,
    applyPreset,
    assignColor,
    selectRole,
    revert,
    setSlot(i)      { state.activeSlot = i; renderSlots(); },
    clearSlot(e,i)  { e.stopPropagation(); state.slots.splice(i,1,null); state.activeSlot=i; renderSlots(); },
    deselect(id)    { state.selected.delete(id); renderChips(); render(); },
    selectAll()     { state.selected = new Set(REGIONS.map(r=>r.id)); renderChips(); render(); },
    clearSel()      { state.selected.clear(); renderChips(); render(); },
    copyPlan() {
      const counts = {};
      REGIONS.forEach(r => {
        const name = findColorName(state.colorMap[r.id]||'');
        counts[name] = (counts[name]||0)+1;
      });
      const text = ['Balloon Color Plan — calltheballoonlady.com', '']
        .concat(Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([n,ct])=>`${ct}× ${n}`))
        .join('\n');
      navigator.clipboard.writeText(text)
        .then(() => { const b=event.target; const o=b.textContent; b.textContent='✓ Copied!'; setTimeout(()=>b.textContent=o,1800); })
        .catch(() => alert(text));
    }
  };
})();

window.addEventListener('DOMContentLoaded', App.init);
