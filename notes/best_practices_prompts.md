# Best Practice Prompts with Working Code
## Addressing What Actually Failed in This Session

---

### PROMPT 1 — Visual gate: never ship coordinates without rendering them first

The single most repeated failure. Balloon positions were detected correctly,
then shipped broken because no one looked at the output before the user did.

```python
from PIL import Image, ImageDraw
import numpy as np
from scipy.ndimage import distance_transform_edt, maximum_filter

def detect_verify_normalise(img_path, label, scale_to=220,
                              min_r=8, win=20, sep=20, max_r_frac=0.20):
    """
    Detect balloon positions, annotate back onto source, normalise coords.
    Does NOT return until the annotated image has been saved for inspection.
    """
    img = Image.open(img_path).convert('RGBA')
    arr = np.array(img)
    W, H = img.size
    rgb, alpha = arr[:,:,:3].astype(float), arr[:,:,3]
    lum = 0.299*rgb[:,:,0] + 0.587*rgb[:,:,1] + 0.114*rgb[:,:,2]
    bg = ((lum > 230) & (rgb.min(axis=2) > 195)) | (alpha < 20)
    dist = distance_transform_edt(~bg)
    max_r_px = W * max_r_frac
    lmax = maximum_filter(dist, size=win)
    peaks = (dist == lmax) & (dist >= min_r) & (dist <= max_r_px)
    pts = sorted([(dist[y,x], x, y) for y,x in np.argwhere(peaks)], reverse=True)
    balls = []
    for val, x, y in pts:
        if not any(((x-b[1])**2+(y-b[2])**2)**0.5 < sep for b in balls):
            balls.append((val, x, y))

    # STEP 1: annotate back onto source — must view this before proceeding
    overlay = img.copy().convert('RGB')
    draw = ImageDraw.Draw(overlay)
    for val, x, y in balls:
        draw.ellipse([x-val, y-val, x+val, y+val], outline=(0,220,0), width=2)
        draw.ellipse([x-3, y-3, x+3, y+3], fill=(255,0,0))
    overlay.save(f'/home/claude/annotated_{label}.jpg', quality=90)
    print(f"INSPECT THIS: annotated_{label}.jpg  ({len(balls)} balloons)")
    # ← View the image here. If circles don't match balloons, tune params and rerun.

    # STEP 2: normalise to SVG viewport
    sc = scale_to / W
    import math
    raw = [{'cx': x*sc, 'cy': y*sc, 'r': max(4, val*sc)} for val,x,y in balls]
    min_x = min(b['cx']-b['r'] for b in raw)
    min_y = min(b['cy']-b['r'] for b in raw)
    margin = 8
    ox, oy = margin - min_x, margin - min_y
    norm = [{'cx':round(b['cx']+ox,1), 'cy':round(b['cy']+oy,1), 'r':round(b['r'],1)}
            for b in raw]
    sw = math.ceil(max(b['cx']+b['r'] for b in norm)) + margin
    sh = math.ceil(max(b['cy']+b['r'] for b in norm)) + margin

    # STEP 3: verify bounding boxes — must be zero violations
    bad = [b for b in norm if b['cx']-b['r']<0 or b['cy']-b['r']<0
           or b['cx']+b['r']>sw or b['cy']+b['r']>sh]
    if bad:
        raise ValueError(f"{label}: {len(bad)} balloons out of bounds {sw}x{sh}: {bad}")

    # STEP 4: render pink verification PNG — compare visually to source photo
    check = Image.new('RGB', (sw, sh), (248,247,245))
    dc = ImageDraw.Draw(check)
    for b in sorted(norm, key=lambda b: b['cy']):
        cx,cy,r = b['cx'],b['cy'],b['r']
        dc.ellipse([cx-r,cy-r,cx+r,cy+r], fill=(235,120,160), outline=(180,60,100))
        dc.ellipse([cx-r*.3,cy-r*.35,cx+r*.1,cy-r*.05], fill=(255,200,220))
    check.save(f'/home/claude/render_{label}.png')
    print(f"COMPARE TO SOURCE: render_{label}.png  viewport={sw}x{sh}")
    # ← View this PNG and compare to the original photo.
    # If the shape matches, proceed. If not, fix before building any widget.

    return norm, sw, sh
```

---

### PROMPT 2 — Base64 encode with mandatory decode verification

Every image embedded in HTML must pass this before use.
No exceptions for "it looks fine" or "it's only a thumbnail."

```python
from PIL import Image
import io, base64

def encode_verified(img_path, max_w, max_h, quality=75):
    """
    Encode image to base64 JPEG. Decode it back and verify PIL can open it.
    Raises if the round-trip fails. Returns the data: URI string.
    """
    img = Image.open(img_path).convert('RGB')
    scale = min(max_w/img.width, max_h/img.height, 1.0)
    nw, nh = max(1, int(img.width*scale)), max(1, int(img.height*scale))
    resized = img.resize((nw, nh), Image.LANCZOS)

    buf = io.BytesIO()
    resized.save(buf, 'JPEG', quality=quality, optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode()

    # Mandatory round-trip verification
    try:
        decoded_bytes = base64.b64decode(b64)
        decoded_img = Image.open(io.BytesIO(decoded_bytes))
        assert decoded_img.size == (nw, nh), \
            f"Size mismatch after decode: got {decoded_img.size}, expected {nw}x{nh}"
        assert len(b64) >= 100, f"Suspiciously short base64: {len(b64)} chars"
    except Exception as e:
        raise RuntimeError(f"Base64 verification failed for {img_path}: {e}")

    print(f"OK  {img_path} -> {nw}x{nh}  {len(b64):,} chars")
    return f"data:image/jpeg;base64,{b64}", nw, nh

# Build all thumbnails with verification
thumbnails = {}
for key, path, w, h in [
    ('compact', '/home/claude/clust_row_mocha.png', 72, 72),
    ('spread',  '/home/claude/cluster_row4_4.png',  72, 72),
]:
    uri, tw, th = encode_verified(path, w, h)
    thumbnails[key] = uri
```

---

### PROMPT 3 — Photo recoloring: canvas multiply, never CSS filter

CSS `hue-rotate` on a JPEG is not a balloon recoloring tool.
It shifts every pixel uniformly. White → teal. Background → wrong color.

The correct approach: draw colored circles over known balloon positions
using `globalCompositeOperation = 'multiply'`. The photo's shadows and
shading show through; only the hue changes.

```javascript
/**
 * Recolor balloon regions on a canvas overlay above a real photo.
 * @param {HTMLCanvasElement} canvas - positioned absolute over the photo
 * @param {HTMLImageElement} photo   - the real arrangement image underneath
 * @param {Array} balloons           - [{cx,cy,r}] in arrangement coordinates
 * @param {string[]} colors          - hex colors, one per balloon (or cycling)
 * @param {number} arrW, arrH        - the arrangement's declared viewport size
 */
function drawColorOverlay(canvas, photo, balloons, colors, arrW, arrH) {
    const displayW = photo.offsetWidth  || photo.naturalWidth;
    const displayH = photo.offsetHeight || photo.naturalHeight;
    canvas.width  = displayW;
    canvas.height = displayH;

    const sx = displayW / arrW;
    const sy = displayH / arrH;
    const sr = Math.min(sx, sy);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, displayW, displayH);

    // Painter's sort: back balloons first
    const sorted = balloons.map((b,i)=>({...b,i})).sort((a,b)=>a.cy-b.cy);

    sorted.forEach(({cx, cy, r, i}) => {
        const color = colors[i % colors.length];
        const px = cx * sx;
        const py = cy * sy;
        const pr = r  * sr * 0.95;

        ctx.save();
        // multiply: photo shadows darken the color naturally
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.80;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // screen: restore specular highlight
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.22;
        ctx.beginPath();
        ctx.arc(px - pr*0.15, py - pr*0.22, pr*0.36, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
    });
}

// HTML structure required:
// <div style="position:relative; display:inline-block">
//   <img id="photo" src="...">
//   <canvas id="overlay" style="position:absolute;top:0;left:0;pointer-events:none">
// </div>
```

---

### PROMPT 4 — Revert immediately, then explain

```python
import shutil, os

# Keep a versioned backup after every user-confirmed working state
def save_working_checkpoint(src, label='working'):
    dst = src.replace('.html', f'_CHECKPOINT_{label}.html')
    shutil.copy(src, dst)
    print(f"Checkpoint saved: {dst}")
    return dst

# When user says "revert":
def revert(checkpoint_path, output_path):
    shutil.copy(checkpoint_path, output_path)
    print(f"Reverted to: {checkpoint_path} -> {output_path}")
    # present_files([output_path])  ← do this first
    # THEN explain what broke, briefly, if at all

# Usage pattern:
# 1. User confirms working state → save_working_checkpoint()
# 2. Attempt improvement → it breaks
# 3. User says "revert" → revert(checkpoint, output) → present_files
# 4. One sentence explanation maximum
```

---

### PROMPT 5 — Trim palette at first instruction

```python
# What's actually visible in the site photos:
SITE_PALETTE = [
    {'g': 'White & Cream', 'c': [
        {'n': 'Fashion White',    'h': '#FEFEFE'},
        {'n': 'Pearl White',      'h': '#F0EBE0'},
        {'n': 'Silk Oyster White','h': '#E5D9C4'},
    ]},
    {'g': 'Gold & Champagne', 'c': [
        {'n': 'Metallic Gold',    'h': '#C8A020'},
        {'n': 'Reflex Champagne', 'h': '#D4C2A0'},
        {'n': 'Metallic Rose Gold','h': '#D49A90'},
    ]},
    {'g': 'Brown & Mocha', 'c': [
        {'n': 'Deluxe Mocha',      'h': '#7A4830'},
        {'n': 'Deluxe Coffee',     'h': '#6A3A22'},
        {'n': 'Deluxe Chocolate',  'h': '#4A2810'},
    ]},
    {'g': 'Pink & Fuchsia', 'c': [
        {'n': 'Reflex Fuchsia',          'h': '#E8006A'},
        {'n': 'Fashion Bubble Gum Pink', 'h': '#FF5FAA'},
        {'n': 'Pastel Matte Pink',       'h': '#FFB0C4'},
        {'n': 'Deluxe Raspberry',        'h': '#C01E52'},
        {'n': 'Pearl Pink',              'h': '#E898B0'},
        {'n': 'Silk Pink Blossom',       'h': '#F0B8C4'},
        {'n': 'Reflex Pink',             'h': '#E03870'},
        {'n': 'Reflex Rose Gold',        'h': '#C08878'},
        {'n': 'Metallic Fuchsia',        'h': '#CC0088'},
    ]},
    {'g': 'Purple', 'c': [
        {'n': 'Silk Light Amethyst', 'h': '#D4B8E0'},
        {'n': 'Pastel Matte Lilac',  'h': '#C8A8D4'},
        {'n': 'Deluxe Purple Orchid','h': '#7A3888'},
    ]},
    {'g': 'Navy', 'c': [
        {'n': 'Fashion Navy', 'h': '#1A237E'},
    ]},
    {'g': 'Grey & Silver', 'c': [
        {'n': 'Metallic Silver', 'h': '#C0C0C0'},
        {'n': 'Reflex Silver',   'h': '#A8A8B8'},
        {'n': 'Deluxe Grey',     'h': '#AAAAAA'},
    ]},
]
# 27 colors. Apply this the first time the user requests a trim.
```

---

### PROMPT 6 — Preset combos traced to specific photos

Each preset maps balloon index → color. Assignment is not arbitrary:
large balloon indices get dominant colors, small indices get accents.
This must be traceable to a specific source image.

```javascript
// COMPACT cluster balloon roles (by radius, largest first):
// Dominant (r≥23): indices 0,1,5,6,9
// Secondary (r≥18): indices 2,3,7,8
// Accent/tiny (r<18): indices 4,10

const PRESETS = {
  // Source: site menu garland photos — hot pink + pastel + white + chrome-purple
  'Pink & Fuchsia': [
    {n:'Reflex Fuchsia',h:'#E8006A'},            // 0 dominant
    {n:'Pastel Matte Pink',h:'#FFB0C4'},          // 1 dominant
    {n:'Fashion White',h:'#FEFEFE'},              // 2 secondary
    {n:'Reflex Fuchsia',h:'#E8006A'},             // 3 secondary
    {n:'Reflex Rose Gold',h:'#C08878'},           // 4 accent (chrome)
    {n:'Fashion Bubble Gum Pink',h:'#FF5FAA'},    // 5 dominant (largest)
    {n:'Pastel Matte Pink',h:'#FFB0C4'},          // 6 dominant
    {n:'Fashion White',h:'#FEFEFE'},              // 7 secondary
    {n:'Fashion Bubble Gum Pink',h:'#FF5FAA'},    // 8 secondary
    {n:'Reflex Fuchsia',h:'#E8006A'},             // 9 dominant
    {n:'Reflex Rose Gold',h:'#C08878'},           // 10 accent
  ],
  // Source: clust_row_mocha.png — all mocha browns, all balloons same family
  'Brown & Mocha': [
    {n:'Deluxe Mocha',h:'#7A4830'},
    {n:'Deluxe Coffee',h:'#6A3A22'},
    {n:'Deluxe Mocha',h:'#7A4830'},
    {n:'Deluxe Coffee',h:'#6A3A22'},
    {n:'Deluxe Chocolate',h:'#4A2810'},
    {n:'Deluxe Mocha',h:'#7A4830'},
    {n:'Deluxe Coffee',h:'#6A3A22'},
    {n:'Deluxe Mocha',h:'#7A4830'},
    {n:'Deluxe Coffee',h:'#6A3A22'},
    {n:'Deluxe Mocha',h:'#7A4830'},
    {n:'Deluxe Chocolate',h:'#4A2810'},
  ],
  // Source: shimmer wall photo — champagne + white + gold accents
  'Gold & Champagne': [
    {n:'Reflex Champagne',h:'#D4C2A0'},
    {n:'Fashion White',h:'#FEFEFE'},
    {n:'Metallic Gold',h:'#C8A020'},
    {n:'Reflex Champagne',h:'#D4C2A0'},
    {n:'Metallic Rose Gold',h:'#D49A90'},
    {n:'Fashion White',h:'#FEFEFE'},
    {n:'Reflex Champagne',h:'#D4C2A0'},
    {n:'Metallic Gold',h:'#C8A020'},
    {n:'Fashion White',h:'#FEFEFE'},
    {n:'Reflex Champagne',h:'#D4C2A0'},
    {n:'Metallic Gold',h:'#C8A020'},
  ],
  // Source: all-white arrangements — pearl + oyster + silver accents
  'White & Cream': [
    {n:'Pearl White',h:'#F0EBE0'},
    {n:'Fashion White',h:'#FEFEFE'},
    {n:'Silk Oyster White',h:'#E5D9C4'},
    {n:'Pearl White',h:'#F0EBE0'},
    {n:'Metallic Silver',h:'#C0C0C0'},
    {n:'Fashion White',h:'#FEFEFE'},
    {n:'Pearl White',h:'#F0EBE0'},
    {n:'Silk Oyster White',h:'#E5D9C4'},
    {n:'Fashion White',h:'#FEFEFE'},
    {n:'Pearl White',h:'#F0EBE0'},
    {n:'Metallic Silver',h:'#C0C0C0'},
  ],
  // Source: garland photos — lavender + lilac + white + silver
  'Purple': [
    {n:'Silk Light Amethyst',h:'#D4B8E0'},
    {n:'Fashion White',h:'#FEFEFE'},
    {n:'Pastel Matte Lilac',h:'#C8A8D4'},
    {n:'Silk Light Amethyst',h:'#D4B8E0'},
    {n:'Reflex Silver',h:'#A8A8B8'},
    {n:'Silk Light Amethyst',h:'#D4B8E0'},
    {n:'Pastel Matte Lilac',h:'#C8A8D4'},
    {n:'Fashion White',h:'#FEFEFE'},
    {n:'Silk Light Amethyst',h:'#D4B8E0'},
    {n:'Pastel Matte Lilac',h:'#C8A8D4'},
    {n:'Reflex Silver',h:'#A8A8B8'},
  ],
};

function applyPreset(name) {
  const preset = PRESETS[name];
  if (!preset) return;
  const cl = CLUSTERS.find(c => c.id === state.cluster);
  state.colors[cl.id] = cl.balloons.map((_, i) => preset[i] || preset[preset.length-1]);
  state.selected.clear();
  state.activeColor = null;
  render();
}
```

---

### PROMPT 7 — What the arrangement matching problem actually is

The session ended with the SVG approach because real-photo recoloring failed.
Here is an honest description of each approach's tradeoffs for future reference:

```
APPROACH A: SVG circles (what we shipped)
  Pro: works reliably, colors are accurate, UX is clean
  Con: doesn't look like real balloons — no depth, overlap, or organic shape
  When to use: when a functional tool matters more than visual realism

APPROACH B: CSS hue-rotate filter on photo
  Pro: simple one-liner
  Con: shifts every pixel including white background — fundamentally broken
  When to use: never for this use case

APPROACH C: Canvas multiply overlay on photo
  Pro: preserves photo depth/shading, colors apply correctly to balloons
  Con: requires accurate balloon position data aligned to photo coordinate space;
       if positions are off by even 10px the overlay looks wrong;
       the "looks awful" failure was likely misaligned coords, not wrong blend mode
  When to use: if balloon positions in photo space are verified accurate first

APPROACH D: SVG feColorMatrix per balloon region (not tried)
  Pro: precise control, hardware accelerated, works per-element
  Con: requires SVG mask per balloon from the photo, complex setup
  When to use: if building a production tool where visual fidelity is required

APPROACH E: Server-side image processing (not tried)
  Pro: exact per-pixel recoloring in target hue space
  Con: requires a server, latency
  When to use: if accuracy must be guaranteed and a backend is available
```
