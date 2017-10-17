import utils from '@bigcommerce/stencil-utils';
import imagesLoaded from 'imagesloaded';
import LoadingSpinner from '../components/LoadingSpinner';
import LoadingOverlay from '../components/LoadingOverlay';

export default class ProductImagesOverlay {
  constructor(el, context) {
    this.context = context;
    this.$body = $(document.body);
    this.$el = $(el);

    this.$productImageList = $('[data-product-image-list]');
    this.$overlayImageList = $('[data-overlay-image-list]');
    this.$overlayThumbList = $('[data-overlay-thumbnail-list]');
    this.$overlayClose = $('[data-product-gallery-overlay-close]', this.$el);

    this.overlayScrollPositions = [];
    this.variantLoaded = false;
    this.imagesResized = false;

    this.imageMargin = 30;

    this._bindEvents();
  }

  toggleOverlay(target) {
    LoadingSpinner(this.$el, true, true);
    this.$el.revealer();
    this.$body.toggleClass('product-overlay-open');

    this.$overlayImageList.imagesLoaded(() => {
      if (!this.imagesResized) {
        this._setImagesWidth();
      }
    });

    if (target) {
      setTimeout(() => {
        if (this.overlayScrollPositions.length === 0) {
          this._mapImageScrollPositions();
        }
        this._findAndScroll(target, 100);
        setTimeout(() => {
          LoadingSpinner(this.$el, true);
        }, 200);
      }, 500);
    }
  }

  _bindEvents() {
    this.$overlayClose.on('click', () => {
      this.toggleOverlay();
      LoadingSpinner(this.$el, true, true);
    });

    this.$el.on('click', '[data-overlay-thumbnail]', (event) => {
      this._findAndScroll(event.currentTarget, 500);
    });

    this.$overlayImageList.scroll(() => {
      this._addActiveClassOnScroll();
    });

    $(document.body).on('keyup', (event) => {
      if (event.keyCode == 27 && this.$el.is(':visible')) {
        this.toggleOverlay();
        LoadingSpinner(this.$el, true, true);
      }
    });
  }

  _setImagesWidth() {
    const $overlayImages = $('[data-overlay-image] img', this.$el);
    let smallestImage = $overlayImages[0];

    $overlayImages.each(function() {
      if ($(this).width() < $(smallestImage).width()) {
        smallestImage = this;
      }
    });

    if ($(smallestImage).width() == 0) {
      $overlayImages.css('width', '100%');
    } else {
      $overlayImages.css('width', $(smallestImage).width());
    }

    this.imagesResized = true;
  }

  _addActiveClassOnScroll() {
    const scrollPosition = this.$overlayImageList.scrollTop();

    $.each(this.overlayScrollPositions, (i, v) => {
      if(scrollPosition >= v) {
        $('.active', this.$overlayThumbList).removeClass('active');
        const $activeTarget = $(`[data-find-image-id="${i}"]`, this.$overlayThumbList);
        $activeTarget.addClass('active');
      }
    });
  }

  _mapImageScrollPositions() {
    $('[data-overlay-image]', this.$overlayImageList).each((i, el) => {
      const $el = $(el);
      let position = $el.position().top;

      if($el.is(':last-child') && ($el.outerHeight() < $(window).height())) {
        // 10 seems to be the magic number to account for any padding/margin that may occur
        position = position - ($(window).height() - $el.outerHeight()) - 10;
      }

      this.overlayScrollPositions.push(position);
    });
  }

  _findAndScroll(target, scrollSpeed = 500) {
    const $target = $(target);
    const targetId = $target.attr('data-find-image-id');

    if(typeof targetId !== 'undefined') {
      const $scrollTarget = $('[data-image-id="' + targetId + '"]', this.$el);

      if($scrollTarget.length > 0) {
        this._scrollTo($scrollTarget, scrollSpeed);
      }
    }
  }

  _scrollTo(target, scrollSpeed) {
    const $target = $(target);
    const targetIndex = $target.attr('data-image-id');
    const scrollPosition = this.overlayScrollPositions[targetIndex];

    this.$overlayImageList.animate({ scrollTop: scrollPosition + this.imageMargin }, scrollSpeed, 'linear');
  }

  newImage(imgObj) {
    const originalSrc = utils.tools.image.getSrc(imgObj.data, 'original');
    const largeImgSrc = utils.tools.image.getSrc(imgObj.data, this.context.themeImageSizes['large']);
    const smallImgSrc = utils.tools.image.getSrc(imgObj.data, this.context.themeImageSizes['thumbnail']);

    LoadingOverlay($('[data-main-content]'), true);

    const newListImage = $(`
      <figure class='product-single-image variant-image' data-product-image data-find-image-id='0'>
        <div class='product-gallery-image-container' style='background-image:url(${largeImgSrc});'>
          <img src='${largeImgSrc}' alt='${imgObj.alt}'>
        </div>
      </figure>`);

    const newOverlayImage = $(`
      <figure class='product-gallery-overlay-image' data-overlay-image data-image-id='0'>
        <img src='${largeImgSrc}' alt='${imgObj.alt}'>
      </figure>`);

    const newThumbImage = $(`
      <div class='product-gallery-overlay-thumbnails-item' data-overlay-thumbnail data-find-image-id='0'>
        <img src='${smallImgSrc}' alt='${imgObj.alt}'>
      </div>`);

    if (this.variantLoaded) {
      $('[data-product-image]', this.$productImageList).first().remove();
      $('[data-overlay-image]', this.$overlayImageList).first().remove();
      $('[data-overlay-thumbnail]', this.$overlayThumbList).first().remove();
    } else {
      this.variantLoaded = true;
    }

    $(newListImage).prependTo(this.$productImageList);
    $(newOverlayImage).prependTo(this.$overlayImageList);
    $(newThumbImage).prependTo(this.$overlayThumbList);

    $('[data-product-image]', this.$productImageList).each(function(i) {
      $(this).attr('data-find-image-id', i);
    });

    $('[data-overlay-image]', this.$overlayImageList).each(function(i) {
      $(this).attr('data-image-id', i);
    });

    $('[data-overlay-thumbnail]', this.$overlayThumbList).each(function(i) {
      $(this).attr('data-find-image-id', i);
    });

    $('[data-product-image-list]').imagesLoaded(() => {
      LoadingOverlay($('[data-main-content]'), true);
      $('[data-product-image]', this.$productImageList).addClass('loaded');
    });
  }
}
