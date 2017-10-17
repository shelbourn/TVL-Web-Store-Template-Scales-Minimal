import _ from 'lodash';
import Flickity from 'flickity-imagesloaded';
import isElementInViewport from './Inview';

export default class Carousel {

  constructor(opts = {}) {
    this.options = $.extend({
      el: '[data-carousel-slides]',
      delay: '100',
      nav: '[data-carousel-pagination]',
    }, opts);

    if ($(this.options.el).length) {
      this._init();
    }
  }

  _init() {
    const $el = $(this.options.el);

    this.flickity = new Flickity(this.options.el, {
      prevNextButtons: true,
      pageDots: true,
      wrapAround: true,
      autoPlay: this.options.delay,
      imagesLoaded: true,
      accessibility: false,
    });

    // Update slide height on load
    this._slideHeight();
    setTimeout(() => this._slideHeight(), 500);

    $el.imagesLoaded()
      .progress(() => this._slideHeight())
      .always(() => $el.find('.flickity-viewport').addClass('loaded'));

    this._bindEvents();
  }

  _bindEvents() {
    // Reset slider's max-height on window resize
    $(window).on('resize', _.debounce(() => {
      this._slideHeight();
    }, 200));

    // Play / Pause slider when in / out of viewport
    $(window).on('scroll', _.debounce(() => {
      if (isElementInViewport($(this.options.el)[0])) {
        this._playSlider();
      } else {
        this._pauseSlider();
      }
    }, 200));

    // Stop the player from firing a bunch in the background
    $(window).on('blur', () => {
      this._pauseSlider();
    });

    $(window).on('focus', () => {
      this._playSlider();
    });

    // Dynamically set slider heights based on content
    this.flickity.on('cellSelect', () => {
      $(this.$element).closest(this.options.el).trigger('cellSelect');
    });

    $(this.options.el).on('cellSelect', () => {
      this._slideHeight();
    });
  }

  _slideHeight() {
    const $carousel = $(this.options.el).find('.flickity-viewport');
    const $windowHeight = $(window).height();
    const $headerHeight = $('body').find('.header-main').outerHeight();
    const autoHeight = $(this.options.el).find('.is-selected').height();
    const fullHeight = $windowHeight;
    const croppedHeight = $windowHeight - $headerHeight;

    if ($('body').hasClass('carousel-height-cropped')) {
      $carousel.css({'height': croppedHeight});
    } else if ($('body').hasClass('carousel-height-full')) {
      $carousel.css({'height': fullHeight});
    } else {
      $carousel.css({'height': autoHeight});
    }
  }

  _pauseSlider() {
    if (this.flickity.player.isPlaying) {
      this.flickity.deactivatePlayer();
    }
  }

  _playSlider() {
    if (!this.flickity.player.isPlaying) {
      this.flickity.activatePlayer();
    }
  }
}
