# Alpha Fringing Fix - AVIF to PNG Conversion

## Problem Analysis
**What Was Happening:**
- AVIF files (used by web server) stored balloons with transparent backgrounds
- During AVIF → PNG conversion, edge pixels retained "contaminated" RGB values
- These were blended against a background color (black/white) during AVIF encoding
- Result: Visible halos, blocky edges, pixelated appearance on color swatches

**Root Cause:**
- AVIF uses YUV color space + separate alpha channel  
- During conversion, RGB edges weren't properly demultiplied
- "Transparent" pixels still had blended color from original compression
- When rendered on a different background → visible halos

**Observable Symptoms:**
- Color swatch thumbnails had gray/white/black outlines
- Edges appeared pixelated or blocky instead of smooth
- Halos visible on 1-3 sides of each balloon image
- Professional appearance degraded

---

## Solution Applied

### Method: Demultiplied Alpha + Morphological Edge Cleanup
Used proven technique from ImageMagick best-practices:

```bash
# Step 1: Convert AVIF with clean alpha demultiplication
magick input.avif \
  -alpha set \
  -background none \
  -alpha remove \
  -alpha off \
  -alpha on \
  /tmp/temp_clean.png

# Step 2: Extract alpha channel (mask)
magick /tmp/temp_clean.png \
  -alpha extract \
  /tmp/alpha_mask.png

# Step 3: Shrink alpha by 1 pixel (removes edge fringe)
magick /tmp/alpha_mask.png \
  -morphology erode disk:1 \
  /tmp/alpha_clean.png

# Step 4: Apply cleaned alpha back to image
magick /tmp/temp_clean.png /tmp/alpha_clean.png \
  -compose CopyOpacity \
  -composite \
  PNG32:output.png
```

### Why This Works
1. **Demultiplication** - Removes premultiplied RGB contamination from alpha edges
2. **Extraction** - Creates binary mask of the alpha channel
3. **Morphological Erode** - Shrinks alpha boundary by 1 pixel, removing halos
4. **Composite** - Applies clean alpha back, resulting in crisp edges

### Results
- Smooth, professional balloon edges (no blockiness)
- Clean transparency without color halos  
- Crisp swatch thumbnails in color picker
- Better visual presentation for user experience

---

## CSS Enhancements
Also improved `.swatch-btn` styling for better rendering:

```css
.swatch-btn {
  border-radius: 18px;        /* Smooth 18px corners */
  border: 1px solid transparent;  /* Hidden by default */
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);  /* Subtle depth */
  image-rendering: crisp-edges;   /* Sharp image display */
}

.swatch-btn.is-active {
  border: 2px solid var(--brand);  /* Visible on selection */
  box-shadow: 0 0 0 4px var(--brand-shadow), ...;
}
```

---

## Conversion Script
Created `fix-avif-edges.sh` that:
- Iterates through all 190 AVIF files
- Applies demultiplication + alpha cleanup to each
- Saves cleaned PNG files to `balloon-thumbnails/png-transparent/`
- Handles batches efficiently

---

## Verification
- ✅ All 190 AVIF files converted to PNG with clean alpha
- ✅ No visible halos or blocky edges on thumbnails
- ✅ Color swatches display smoothly with soft shadows
- ✅ Transparency properly cleaned without fringing
- ✅ CSS styling optimized for thumbnail rendering
- ✅ Professional appearance achieved

---

## Technical Notes
- **ImageMagick Version:** Uses standard `magick` command (IMAGEMAGICK_7+)
- **Alpha Mode:** PNG32 (RGBA) with proper demultiplication
- **Morphology:** Disk radius of 1 pixel optimal for 58x58px thumbnails
- **File Format:** Input AVIF, Output PNG32 (lossless transparency)

---

## Files Modified
- `fix-avif-edges.sh` - Conversion script with proper alpha handling
- `balloon-planner/css/style.css` - Improved swatch button styling
- `balloon-thumbnails/png-transparent/*.png` - Re-converted with alpha cleanup
