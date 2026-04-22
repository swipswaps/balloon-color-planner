# Photo Picker Enhancement Ideas

## Priority 1: Essential Fixes

### Fix 1: Add PNG Fallback for WebP
**Issue**: Older browsers without WebP support won't see images
**Solution**: Use `<picture>` element with `<source>` tags

```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.png" alt="Arrangement">
</picture>
```

### Fix 2: Better Error Handling
**Issue**: If image fails to load, user sees broken image
**Solution**: Add onerror handler and placeholder

```javascript
img.onerror = () => {
  img.src = 'placeholder-image.png';
  console.error('Failed to load:', arr.photo);
};
```

### Fix 3: Accent Color Support
**Issue**: Only main color works
**Solution**: Add second color picker for accent

```javascript
function selectAccentColor(color) {
  state.accentColor = color;
  // Apply blend or saturation adjustment
}
```

## Priority 2: UX Improvements

### Improvement 1: Keyboard Navigation
**Add**: Arrow keys to switch arrangements, Tab to cycle colors

```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') previousArrangement();
  if (e.key === 'ArrowRight') nextArrangement();
  if (e.key === 'Enter') selectMainColor(currentColor);
});
```

### Improvement 2: Arrangement Info Tooltip
**Add**: Hover to see arrangement name, price, quantity per arrangement

```html
<button class="arr-thumb" title="12 balloons, starts at $45">
  <img src="thumbnail.webp">
</button>
```

### Improvement 3: Favorite Arrangements
**Add**: Star icon to save favorite arrangements locally

```javascript
const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
function toggleFavorite(id) {
  if (favorites.includes(id)) favorites.remove(id);
  else favorites.push(id);
  localStorage.setItem('favorites', JSON.stringify(favorites));
}
```

## Priority 3: Advanced Features

### Feature 1: Advanced Color Filtering (Canvas)
**Current**: Simple CSS hue-rotate
**Future**: Pixel-by-pixel color mapping

```javascript
function applyAdvancedColor(sourceColor, targetColor) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, 342, 384);
  
  // Replace source color with target color
  // Detect white/light balloons, preserve them
  // Blend dark balloon colors to target
  
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}
```

### Feature 2: Downloadable Preview
**Add**: Generate PNG preview of selected arrangement + colors

```javascript
function downloadPreview() {
  const canvas = document.createElement('canvas');
  canvas.width = 342;
  canvas.height = 384;
  // Draw photo with applied filters
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'balloon-arrangement.png';
    a.click();
  });
}
```

### Feature 3: Shareable URL
**Add**: Encode selections in URL, load on page view

```javascript
function getShareUrl() {
  const params = {
    arr: state.currentArrangement.id,
    color: state.mainColor.hex,
    accent: state.accentColor?.hex
  };
  return `${window.location.href}?${new URLSearchParams(params)}`;
}

function loadFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('arr')) selectArrangement(params.get('arr'));
  if (params.has('color')) selectMainColor(findColorByHex(params.get('color')));
}
```

### Feature 4: Multiple Arrangements Per Order
**Add**: Add/remove multiple arrangements to shopping cart

```javascript
const cart = [];
function addToCart(arrangement, color) {
  cart.push({ arrangement, color, quantity: 1 });
  updateSummary();
}
function removeFromCart(index) {
  cart.splice(index, 1);
  updateSummary();
}
```

## Priority 4: Performance Optimizations

### Optimization 1: Lazy Loading
**Add**: Load images only when visible (Intersection Observer)

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src;
      observer.unobserve(entry.target);
    }
  });
});
thumbnails.forEach(img => observer.observe(img));
```

### Optimization 2: Image Caching
**Add**: Service worker to cache images for offline use

```javascript
// Register service worker
navigator.serviceWorker.register('sw.js');

// In sw.js, cache photos on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('balloon-photos-v1').then(cache => {
      return cache.addAll([...ARRANGEMENTS.map(a => a.photo)]);
    })
  );
});
```

### Optimization 3: Responsive Images
**Add**: Different image sizes for mobile vs desktop

```html
<picture>
  <source media="(max-width: 480px)" srcset="image-small.webp">
  <source media="(min-width: 481px)" srcset="image-large.webp">
  <img src="image.png">
</picture>
```

## Priority 5: Integration Features

### Integration 1: Add to Wix Product
**Add**: Embed widget in Wix site directly

### Integration 2: Contact Form
**Add**: Submit color plan directly to business email

```javascript
function submitOrder() {
  const formData = new FormData();
  formData.append('arrangement', state.currentArrangement.name);
  formData.append('color', state.mainColor.hex);
  
  fetch('submit-order', { method: 'POST', body: formData });
}
```

### Integration 3: Price Calculator
**Add**: Show price based on arrangement + quantity

```javascript
function calculatePrice() {
  const basePrice = state.currentArrangement.basePrice || 45;
  const quantity = state.quantity || 1;
  return basePrice * quantity;
}
```

## Recommended Implementation Order

1. **Phase 1** (Week 1): Essential Fixes + Error Handling
2. **Phase 2** (Week 2): UX Improvements + Keyboard Navigation
3. **Phase 3** (Week 3): Download Preview + Shareable URLs
4. **Phase 4** (Week 4): Cart System + Price Calculator
5. **Phase 5+** (Advanced): Canvas-based filtering, Service Worker caching

---
**Status**: Planning complete — Ready for incremental implementation
