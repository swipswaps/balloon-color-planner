# Balloon Color Planner

Interactive balloon color picker for [calltheballoonlady.com](https://calltheballoonlady.com).  
Built for West Volusia County, FL. White-label ready.

---

## What it does

- Shows the real mocha cluster photo as the base layer
- Applies your chosen colors to each balloon region using canvas compositing
- Preserves original photo shading, highlights, and depth
- Assigns colors by balloon role (large / medium / small), not randomly
- Lets you select individual balloons or entire role groups
- Copies a ready-to-order color plan to clipboard

---

## Deploy in 5 minutes

```bash
# 1. Clone and enter
git clone https://github.com/YOUR_USERNAME/balloon-color-planner
cd balloon-color-planner

# 2. Push to GitHub
git add .
git commit -m "Initial deploy"
git push origin main
```

Then in GitHub:
- **Settings → Pages → Source: GitHub Actions → Save**
- First push triggers the workflow automatically
- Live at `https://YOUR_USERNAME.github.io/balloon-color-planner/`

---

## White-label rebrand

Open `js/config.js` — it is the **only file you edit** to rebrand:

```js
const CONFIG = {
  title:         'Balloon Color Planner',
  subtitle:      'yoursite.com · Your City, State',
  phone:         '555-000-0000',
  email:         'you@yoursite.com',
  accent:        '#e8006a',   // changes all pink UI elements
  copyFooter:    'Your Business · yoursite.com',
  defaultPreset: 'Pink & Fuchsia',
  maxSlots:       2,
};
```

Push the change. Workflow redeploys automatically in ~30 seconds.

---

## File structure

```
balloon-color-planner/
├── index.html                  Markup only — no inline logic or styles
├── css/
│   └── style.css               All styles — no rendering logic
├── js/
│   ├── config.js               ONLY file to edit for white-labeling
│   ├── regions.js              Balloon region data — auto-generated from photo
│   ├── palette.js              27 site colors + role-based presets
│   ├── recolor.js              Canvas recoloring engine
│   ├── interaction.js          Click/select handling — separate from rendering
│   └── app.js                  Orchestrator — state, color assignment, UI
└── .github/
    └── workflows/
        └── deploy.yml          GitHub Pages CI/CD
```

---

## Architecture

```
[Original Photo]
      ↓
[Hybrid Segmentation]          (distance transform + watershed, run once offline)
      ↓
[Balloon Regions]              js/regions.js — 18 verified regions with role tags
      ↓
[Interaction Layer]            js/interaction.js — click/select, no visual output
      ↓
[Color Assignment Engine]      js/app.js — assigns by role: large/medium/small
      ↓
[Canvas Recolor Engine]        js/recolor.js — photo base + per-region clip + blend
      ↓
[Visual Verification Output]   Canvas element in browser
```

### Rendering rules (non-negotiable)

| Rule | Requirement |
|------|-------------|
| Base layer | Always the original photo — never reconstructed geometry |
| Color application | Canvas `color` blend mode, clipped to balloon region |
| Shading restoration | `multiply` redraw of original photo at 35% opacity |
| Highlight restoration | `screen` white fill at 12% opacity |
| Interaction | Separate canvas layer / hit-test only — never drawn visually |
| CSS filters | Never used for recoloring — shifts entire image uniformly |

---

## Updating balloon regions

If you add a new arrangement photo:

```bash
# Run the segmentation script on your new photo
python3 tools/segment.py your_photo.png

# Inspect the output images BEFORE using the data:
#   VERIFY_annotated.jpg   — green circles on source photo
#   VERIFY_reconstruction.jpg — pink reconstruction to compare

# If circles match balloons, the generated regions.js is correct.
# If they don't match, tune the parameters in segment.py and rerun.
```

**Never ship region data without visual verification. Never.**

---

## Color palette

27 colors, all visible in actual calltheballoonlady.com product photos:

| Group | Colors |
|-------|--------|
| White & Cream | Fashion White, Pearl White, Silk Oyster White |
| Gold & Champagne | Metallic Gold, Reflex Champagne, Metallic Rose Gold |
| Brown & Mocha | Deluxe Mocha, Deluxe Coffee, Deluxe Chocolate |
| Pink & Fuchsia | Reflex Fuchsia, Bubble Gum Pink, Pastel Pink, Raspberry, Pearl Pink, Pink Blossom, Reflex Pink, Rose Gold, Metallic Fuchsia |
| Purple | Silk Light Amethyst, Pastel Matte Lilac, Deluxe Purple Orchid |
| Navy | Fashion Navy |
| Grey & Silver | Metallic Silver, Reflex Silver, Deluxe Grey |

### Clickable presets

Clicking any group label in the palette auto-fills all 18 balloons by role:

- **Pink & Fuchsia** — Reflex Fuchsia (large) · Bubble Gum Pink (medium) · Rose Gold (small)
- **Brown & Mocha** — Deluxe Mocha (large) · Deluxe Coffee (medium) · Chocolate (small)
- **Gold & Champagne** — Reflex Champagne (large) · Fashion White (medium) · Metallic Gold (small)
- **White & Cream** — Pearl White (large) · Fashion White (medium) · Metallic Silver (small)
- **Purple** — Silk Light Amethyst (large) · Pastel Matte Lilac (medium) · Reflex Silver (small)

---

## Local development

No build step. Open `index.html` in any browser.  
For live reload:

```bash
npx serve .
# or
python3 -m http.server 8080
```

---

## Contact

The Balloon Lady · De Leon Springs, FL 32130  
calltheballoonlady@gmail.com · 386-999-3996
