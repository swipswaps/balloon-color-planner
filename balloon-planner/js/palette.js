// js/palette.js
// Colors visible in actual calltheballoonlady.com product photos only.
// Trimmed from 86 to 27 on first instruction (Rule: execute at first request).

const PALETTE = [
  { g: 'White & Cream', c: [
    { n: 'Fashion White',    h: '#FEFEFE' },
    { n: 'Pearl White',      h: '#F0EBE0' },
    { n: 'Silk Oyster White',h: '#E5D9C4' },
  ]},
  { g: 'Gold & Champagne', c: [
    { n: 'Metallic Gold',    h: '#C8A020' },
    { n: 'Reflex Champagne', h: '#D4C2A0' },
    { n: 'Metallic Rose Gold',h:'#D49A90' },
  ]},
  { g: 'Brown & Mocha', c: [
    { n: 'Deluxe Mocha',     h: '#7A4830' },
    { n: 'Deluxe Coffee',    h: '#6A3A22' },
    { n: 'Deluxe Chocolate', h: '#4A2810' },
  ]},
  { g: 'Pink & Fuchsia', c: [
    { n: 'Reflex Fuchsia',          h: '#E8006A' },
    { n: 'Fashion Bubble Gum Pink', h: '#FF5FAA' },
    { n: 'Pastel Matte Pink',       h: '#FFB0C4' },
    { n: 'Deluxe Raspberry',        h: '#C01E52' },
    { n: 'Pearl Pink',              h: '#E898B0' },
    { n: 'Silk Pink Blossom',       h: '#F0B8C4' },
    { n: 'Reflex Pink',             h: '#E03870' },
    { n: 'Reflex Rose Gold',        h: '#C08878' },
    { n: 'Metallic Fuchsia',        h: '#CC0088' },
  ]},
  { g: 'Purple', c: [
    { n: 'Silk Light Amethyst',  h: '#D4B8E0' },
    { n: 'Pastel Matte Lilac',   h: '#C8A8D4' },
    { n: 'Deluxe Purple Orchid', h: '#7A3888' },
  ]},
  { g: 'Navy', c: [
    { n: 'Fashion Navy', h: '#1A237E' },
  ]},
  { g: 'Grey & Silver', c: [
    { n: 'Metallic Silver', h: '#C0C0C0' },
    { n: 'Reflex Silver',   h: '#A8A8B8' },
    { n: 'Deluxe Grey',     h: '#AAAAAA' },
  ]},
];

// Rule 7: presets assign by role (large/medium/small), NOT blind alternation
// Source traceability noted per preset
const PRESETS = {
  // Source: site menu garland photos — hot pink dominant, pastel medium, chrome accent
  'Pink & Fuchsia': {
    large:  { n: 'Reflex Fuchsia',          h: '#E8006A' },
    medium: { n: 'Fashion Bubble Gum Pink', h: '#FF5FAA' },
    small:  { n: 'Reflex Rose Gold',        h: '#C08878' },
  },
  // Source: clust_row_mocha.png — all mocha family
  'Brown & Mocha': {
    large:  { n: 'Deluxe Mocha',    h: '#7A4830' },
    medium: { n: 'Deluxe Coffee',   h: '#6A3A22' },
    small:  { n: 'Deluxe Chocolate',h: '#4A2810' },
  },
  // Source: shimmer wall photos — champagne dominant, white medium, gold accent
  'Gold & Champagne': {
    large:  { n: 'Reflex Champagne',  h: '#D4C2A0' },
    medium: { n: 'Fashion White',     h: '#FEFEFE' },
    small:  { n: 'Metallic Gold',     h: '#C8A020' },
  },
  // Source: all-white arrangements — pearl dominant, silver accent
  'White & Cream': {
    large:  { n: 'Pearl White',      h: '#F0EBE0' },
    medium: { n: 'Fashion White',    h: '#FEFEFE' },
    small:  { n: 'Metallic Silver',  h: '#C0C0C0' },
  },
  // Source: garland chrome-purple photos — lavender dominant, white medium, silver accent
  'Purple': {
    large:  { n: 'Silk Light Amethyst', h: '#D4B8E0' },
    medium: { n: 'Pastel Matte Lilac',  h: '#C8A8D4' },
    small:  { n: 'Reflex Silver',       h: '#A8A8B8' },
  },
};
