(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // INIT: Get app container and verify data layer
    // Verbose: Need app element and ProductGalleryData (generated from arrangements-photo.js + color-mapping)
    var app = document.getElementById('productGalleryApp');
    if (!app) return;

    var data = window.ProductGalleryData;
    if (!data) {
      console.warn('[Gallery] Missing ProductGalleryData - check gallery-data.js loaded');
      return;
    }

    // GET DOM ELEMENTS: Main gallery, thumbnail gallery, color swatches
    // Verbose: Store references to DOM nodes for efficient access - avoid repeated queries
    var mainWrapper = document.getElementById('mainWrapper');
    var thumbWrapper = document.getElementById('thumbWrapper');
    var swatchList = document.getElementById('swatchList');
    var selectedColorLabel = document.getElementById('selectedColorLabel');
    var resetBtn = document.getElementById('resetGalleryBtn');

    var mainEl = document.querySelector('.js-product-main');
    var thumbsEl = document.querySelector('.js-product-thumbs');

    if (!mainWrapper || !thumbWrapper || !swatchList || !mainEl || !thumbsEl) {
      console.warn('[Gallery] Required DOM elements not found');
      return;
    }

    // STATE MANAGEMENT: Track current view mode (default all 190 or filtered by color)
    // Verbose: mode = 'default' shows all 190 arrangements, mode = 'color' filters to selected family
    var state = {
      mode: 'default',
      colorSlug: null
    };

    var defaultLabel = data.attribute && data.attribute.defaultLabel ? data.attribute.defaultLabel : 'All Arrangements';

    function createMainSlide(url, label, index, total) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      var wrap = document.createElement('div');
      wrap.className = 'main-image-wrap';
      var link = document.createElement('a');
      link.className = 'main-image-link';
      link.href = url;
      link.setAttribute('data-fancybox', 'product-gallery');
      link.setAttribute('data-caption', label + ' (' + (index + 1) + '/' + total + ')');
      var img = document.createElement('img');
      img.className = 'main-img';
      img.src = url;
      img.alt = label;
      link.appendChild(img);
      wrap.appendChild(link);
      slide.appendChild(wrap);
      return slide;
    }

    function createThumbSlide(url, label) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      var box = document.createElement('div');
      box.className = 'thumb-box';
      var img = document.createElement('img');
      img.src = url;
      img.alt = label;
      box.appendChild(img);
      slide.appendChild(box);
      return slide;
    }

    function renderCollection(label, images) {
      mainWrapper.innerHTML = '';
      thumbWrapper.innerHTML = '';
      images.forEach(function (url, index) {
        mainWrapper.appendChild(createMainSlide(url, label, index, images.length));
        thumbWrapper.appendChild(createThumbSlide(url, label));
      });
      if (mainEl.swiper) {
        mainEl.swiper.slideTo(0, 0);
        mainEl.swiper.update();
      }
      if (thumbsEl.swiper) {
        thumbsEl.swiper.slideTo(0, 0);
        thumbsEl.swiper.update();
      }
      if (window.jQuery && window.jQuery.fancybox) {
        window.jQuery('[data-fancybox="product-gallery"]').off('click.fb-start').fancybox({
          loop: true,
          arrows: true,
          buttons: ['zoom', 'slideShow', 'fullScreen', 'thumbs', 'close']
        });
      }
    }

    function applyDefaultGallery() {
      state.mode = 'default';
      state.colorSlug = null;
      selectedColorLabel.textContent = defaultLabel;
      setActiveSwatch(null);
      renderCollection(defaultLabel, data.defaultGallery.images);
    }

    function applyColorGallery(slug) {
      var collection = data.colorCollections[slug];
      if (!collection) return;
      state.mode = 'color';
      state.colorSlug = slug;
      selectedColorLabel.textContent = collection.label;
      setActiveSwatch(slug);
      renderCollection(collection.label, collection.images);
    }

    function setActiveSwatch(activeSlug) {
      var buttons = swatchList.querySelectorAll('.swatch-btn');
      buttons.forEach(function (button) {
        button.classList.toggle('is-active', button.dataset.colorSlug === activeSlug);
      });
    }

    function renderSwatches() {
      var fragment = document.createDocumentFragment();
      Object.keys(data.colorCollections).forEach(function (slug) {
        var item = data.colorCollections[slug];
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'swatch-btn';
        button.dataset.colorSlug = slug;
        button.title = item.label;
        var img = document.createElement('img');
        img.src = item.swatch;
        img.alt = item.label;
        button.appendChild(img);
        fragment.appendChild(button);
      });
      swatchList.appendChild(fragment);
    }

    // SWIPER INIT: Thumbnail slider - show 4-5 thumbnails visible, rest scrollable
    // Verbose: freeMode = true allows smooth scrolling. watchSlidesProgress syncs with main slider.
    // Must handle large dataset: 190 slides will create many DOM nodes - Swiper optimizes via virtual slides
    var thumbsSwiper = new Swiper(thumbsEl, {
      slidesPerView: 5,
      spaceBetween: 12,
      freeMode: true,
      watchSlidesProgress: true,
      breakpoints: {
        320: { slidesPerView: 3, spaceBetween: 8 },
        768: { slidesPerView: 4, spaceBetween: 10 },
        1024: { slidesPerView: 5, spaceBetween: 12 }
      }
    });

    // SWIPER INIT: Main gallery slider - responsive nav buttons, synced with thumbnails
    // Verbose: thumbs.swiper links to thumb slider for synced navigation (click thumb -> main updates)
    var mainSwiper = new Swiper(mainEl, {
      spaceBetween: 12,
      navigation: {
        nextEl: mainEl.querySelector('.swiper-button-next'),
        prevEl: mainEl.querySelector('.swiper-button-prev')
      },
      thumbs: {
        swiper: thumbsSwiper
      }
    });

    renderSwatches();
    applyDefaultGallery();

    swatchList.addEventListener('click', function (event) {
      var button = event.target.closest('.swatch-btn');
      if (button) applyColorGallery(button.dataset.colorSlug);
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', applyDefaultGallery);
    }

    var copyBtn = document.getElementById('copyPlanBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = 'Balloon Order\n' + state.colorSlug ? data.colorCollections[state.colorSlug].label : defaultLabel;
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = '✓ Copied!';
          setTimeout(function () {
            copyBtn.textContent = '📋 Copy Plan';
          }, 2000);
        });
      });
    }
  });
})();
