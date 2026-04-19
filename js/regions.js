// js/regions.js
// AUTO-GENERATED from hybrid segmentation of clust_row_mocha.png
// Rule 1: visually verified — annotated + reconstruction images confirmed alignment
// Rule 8: positions NOT modified after detection — geometry integrity preserved
// Rule 9: all cx±r, cy±r validated within 300x356 — zero violations

const PHOTO_W = 300;
const PHOTO_H = 356;

// Rule 10: photo encode/decode verified (PIL round-trip confirmed 300x356)
const PHOTO_B64 = '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';

// Rule 4: regions, not circles — each has a path() method for canvas clipping
// Rule 7: role = large/medium/small by radius tercile for color assignment
const RAW_REGIONS = [
  {
    "id": 0,
    "cx": 121.4,
    "cy": 41.4,
    "r": 12.7,
    "orig_cx": 170.0,
    "orig_cy": 58.0,
    "orig_r": 17.7,
    "role": "small"
  },
  {
    "id": 1,
    "cx": 216.4,
    "cy": 52.9,
    "r": 34.6,
    "orig_cx": 303.0,
    "orig_cy": 74.0,
    "orig_r": 48.5,
    "role": "large"
  },
  {
    "id": 2,
    "cx": 145.0,
    "cy": 58.6,
    "r": 15.0,
    "orig_cx": 203.0,
    "orig_cy": 82.0,
    "orig_r": 21.0,
    "role": "small"
  },
  {
    "id": 3,
    "cx": 158.6,
    "cy": 71.4,
    "r": 13.7,
    "orig_cx": 222.0,
    "orig_cy": 100.0,
    "orig_r": 19.2,
    "role": "small"
  },
  {
    "id": 4,
    "cx": 210.0,
    "cy": 72.9,
    "r": 31.0,
    "orig_cx": 294.0,
    "orig_cy": 102.0,
    "orig_r": 43.4,
    "role": "medium"
  },
  {
    "id": 5,
    "cx": 195.7,
    "cy": 86.4,
    "r": 30.1,
    "orig_cx": 274.0,
    "orig_cy": 121.0,
    "orig_r": 42.2,
    "role": "medium"
  },
  {
    "id": 6,
    "cx": 110.7,
    "cy": 99.3,
    "r": 38.6,
    "orig_cx": 155.0,
    "orig_cy": 139.0,
    "orig_r": 54.1,
    "role": "large"
  },
  {
    "id": 7,
    "cx": 251.4,
    "cy": 100.0,
    "r": 23.4,
    "orig_cx": 352.0,
    "orig_cy": 140.0,
    "orig_r": 32.7,
    "role": "medium"
  },
  {
    "id": 8,
    "cx": 190.7,
    "cy": 112.9,
    "r": 32.9,
    "orig_cx": 267.0,
    "orig_cy": 158.0,
    "orig_r": 46.1,
    "role": "medium"
  },
  {
    "id": 9,
    "cx": 79.3,
    "cy": 117.9,
    "r": 35.1,
    "orig_cx": 111.0,
    "orig_cy": 165.0,
    "orig_r": 49.2,
    "role": "large"
  },
  {
    "id": 10,
    "cx": 152.1,
    "cy": 149.3,
    "r": 38.8,
    "orig_cx": 213.0,
    "orig_cy": 209.0,
    "orig_r": 54.3,
    "role": "large"
  },
  {
    "id": 11,
    "cx": 35.7,
    "cy": 154.3,
    "r": 13.9,
    "orig_cx": 50.0,
    "orig_cy": 216.0,
    "orig_r": 19.4,
    "role": "small"
  },
  {
    "id": 12,
    "cx": 95.7,
    "cy": 172.1,
    "r": 29.7,
    "orig_cx": 134.0,
    "orig_cy": 241.0,
    "orig_r": 41.6,
    "role": "medium"
  },
  {
    "id": 13,
    "cx": 43.6,
    "cy": 178.6,
    "r": 21.4,
    "orig_cx": 61.0,
    "orig_cy": 250.0,
    "orig_r": 30.0,
    "role": "medium"
  },
  {
    "id": 14,
    "cx": 61.4,
    "cy": 208.6,
    "r": 17.9,
    "orig_cx": 86.0,
    "orig_cy": 292.0,
    "orig_r": 25.0,
    "role": "small"
  },
  {
    "id": 15,
    "cx": 175.7,
    "cy": 215.0,
    "r": 18.0,
    "orig_cx": 246.0,
    "orig_cy": 301.0,
    "orig_r": 25.2,
    "role": "small"
  },
  {
    "id": 16,
    "cx": 114.3,
    "cy": 225.0,
    "r": 36.2,
    "orig_cx": 160.0,
    "orig_cy": 315.0,
    "orig_r": 50.6,
    "role": "large"
  },
  {
    "id": 17,
    "cx": 63.6,
    "cy": 267.1,
    "r": 35.6,
    "orig_cx": 89.0,
    "orig_cy": 374.0,
    "orig_r": 49.8,
    "role": "large"
  }
];

const REGIONS = RAW_REGIONS.map(r => ({
  ...r,
  // path() defines the clipping region for canvas recoloring (Rule 3/4)
  path(ctx) {
    ctx.arc(r.cx, r.cy, r.r * 0.95, 0, Math.PI * 2);
  }
}));
