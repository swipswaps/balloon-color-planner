// js/config.js
// White-label configuration — this is the ONLY file you edit to rebrand.
// Change these values, push, and the site updates automatically.

const CONFIG = {
  // Business identity
  title:       'Balloon Color Planner',
  subtitle:    'calltheballoonlady.com · West Volusia County, FL',
  phone:       '386-999-3996',
  email:       'calltheballoonlady@gmail.com',
  location:    'De Leon Springs, FL 32130',

  // Visual accent color (hex) — drives --accent CSS variable
  accent:      '#e8006a',

  // Text appended to the copied color plan
  copyFooter:  'The Balloon Lady · calltheballoonlady.com · 386-999-3996',

  // Default preset name on load (must match a key in PRESETS)
  defaultPreset: 'Pink & Fuchsia',

  // Maximum number of color slots shown in sidebar (2 or 3)
  maxSlots: 2,
};

// Apply accent color to CSS variable at runtime
document.documentElement.style.setProperty('--accent', CONFIG.accent);
