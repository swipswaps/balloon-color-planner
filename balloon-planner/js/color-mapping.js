// color-mapping.js
// Maps arrangement IDs to color families
// Based on visual grouping: arrangements are sequenced by color family
// 27 colors grouped into 7 families: White/Cream, Gold/Champagne, Brown/Mocha, Pink/Fuchsia, Purple, Navy, Grey/Silver

const ARRANGEMENT_COLOR_MAPPING = {
  'white-cream': {
    label: 'White & Cream',
    colorNames: ['Fashion White', 'Pearl White', 'Silk Oyster White'],
    // Arrangements 1-30: estimated as first color family group
    arrangementIds: Array.from({length: 30}, (_, i) => `arrangement-${String(i+1).padStart(3, '0')}`)
  },
  'gold-champagne': {
    label: 'Gold & Champagne',
    colorNames: ['Metallic Gold', 'Reflex Champagne', 'Metallic Rose Gold'],
    // Arrangements 31-60
    arrangementIds: Array.from({length: 30}, (_, i) => `arrangement-${String(i+31).padStart(3, '0')}`)
  },
  'brown-mocha': {
    label: 'Brown & Mocha',
    colorNames: ['Deluxe Mocha', 'Deluxe Coffee', 'Deluxe Chocolate'],
    // Arrangements 61-90
    arrangementIds: Array.from({length: 30}, (_, i) => `arrangement-${String(i+61).padStart(3, '0')}`)
  },
  'pink-fuchsia': {
    label: 'Pink & Fuchsia',
    colorNames: ['Reflex Fuchsia', 'Fashion Bubble Gum Pink', 'Pastel Matte Pink', 'Deluxe Raspberry', 'Pearl Pink', 'Silk Pink Blossom', 'Reflex Pink', 'Reflex Rose Gold', 'Metallic Fuchsia'],
    // Arrangements 91-140 (largest group)
    arrangementIds: Array.from({length: 50}, (_, i) => `arrangement-${String(i+91).padStart(3, '0')}`)
  },
  'purple': {
    label: 'Purple',
    colorNames: ['Silk Light Amethyst', 'Pastel Matte Lilac', 'Deluxe Purple Orchid'],
    // Arrangements 141-165
    arrangementIds: Array.from({length: 25}, (_, i) => `arrangement-${String(i+141).padStart(3, '0')}`)
  },
  'navy': {
    label: 'Navy',
    colorNames: ['Fashion Navy'],
    // Arrangements 166-175
    arrangementIds: Array.from({length: 10}, (_, i) => `arrangement-${String(i+166).padStart(3, '0')}`)
  },
  'grey-silver': {
    label: 'Grey & Silver',
    colorNames: ['Metallic Silver', 'Reflex Silver', 'Deluxe Grey'],
    // Arrangements 176-190
    arrangementIds: Array.from({length: 15}, (_, i) => `arrangement-${String(i+176).padStart(3, '0')}`)
  }
};

// Helper function: get color family for an arrangement ID
function getColorFamily(arrangementId) {
  for (const [slug, group] of Object.entries(ARRANGEMENT_COLOR_MAPPING)) {
    if (group.arrangementIds.includes(arrangementId)) {
      return slug;
    }
  }
  return null;
}

// Helper function: get all arrangement IDs for a color family
function getArrangementsByColor(colorSlug) {
  return ARRANGEMENT_COLOR_MAPPING[colorSlug]?.arrangementIds || [];
}
