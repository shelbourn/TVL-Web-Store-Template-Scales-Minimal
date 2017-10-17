import _ from 'lodash';
import Flickity from 'flickity';
import utils from '@bigcommerce/stencil-utils';

export default class ProductSlideshow {
  constructor($scope, context) {
    this.context = context;
    this.$scope = $scope;
    this.$el = $scope.find('[data-product-slideshow]');
    this.$slideshowImage = $scope.find('[data-product-slideshow-image]');

    this.$el.imagesLoaded()
      .progress((instance, image) => {
        this._slidesHeight();
      })
      .always(() => {
        this._setupSlides();

        setTimeout(() => {
          this._slidesHeight();
        }, 500);
      });

    this._bindEvents();
  }

  addImage(img) {
    const largeImgSrc = utils.tools.image.getSrc(img.data, this.context.themeImageSizes['large']);
    const smallImgSrc = utils.tools.image.getSrc(img.data, this.context.themeImageSizes['thumbnail']);

    const $existing = this.$el.find('[data-product-slideshow-image]');
    let foundExisting = false;

    $existing.each((index, el) => {
      const $slide = $(el);
      const src = $slide.attr('src');

      if (src === largeImgSrc) {
        foundExisting = true;
        this.flickity.selectCell($slide.data('image-position'));
      }
    });

    if (foundExisting) {
      return;
    }

    const index = this.flickity.cells.length;

    const $slide = $(`
      <img
        class="product-gallery-slideshow-image"
        data-image-position="${index}"
        src="${largeImgSrc}"
        alt=""
        data-product-slideshow-image>
    `);

    const $thumb = $(`
      <span
        class="product-gallery-slideshow-thumbnail"
        style="background-image: url(${smallImgSrc});"
        data-image-position="${index}"
        data-high-res="${largeImgSrc}"
        data-product-thumbnail>
        <img class="show-for-sr" src="${smallImgSrc}" alt="">
      </span>
    `);

    const $thumbs = this.$el.siblings('.product-gallery-slideshow-thumbnail-list');
    $thumbs.append($thumb);
    this.$el.parent().addClass('visible-controls');
    $thumbs.removeClass('product-gallery-slideshow-thumbnail-list-single');

    this.flickity.append($slide);
    $thumb.click();
  }

  _bindEvents() {
    $('body').on('click', '[data-product-thumbnail]', (event) => {
      this._switchProductImage(event);
    });

    $(window).on('resize', _.debounce((event) => {
      this._slidesHeight();
    }, 200));
  }

  _setupSlides() {
    this.flickity = new Flickity(this.$el[0], {
      cellSelector: '.product-gallery-slideshow-image',
      prevNextButtons: true,
      contain: false,
      accessibility: false,
      pageDots: true,
      freeScroll: false,
      wrapAround: true,
      resize: true,
      initialIndex: this.$el.data('slideshow-position'),
    });

    this.flickity.on('settle', event => this._slidesHeight());
    this.flickity.on('cellSelect', event => this._slidesHeight());
  }

  _slidesHeight() {
    $('.flickity-viewport').imagesLoaded(() => {
      const sliderHeight = this.$el.find('.flickity-slider .is-selected').height();
      this.$el.find('.flickity-viewport').height(sliderHeight);
    });
  }

  _switchProductImage(event) {
    const $target = $(event.target);

    let $thumbnail = $(event.target);
    let index = $thumbnail.index();

    $thumbnail
      .addClass('active')
      .siblings()
      .removeClass('active');

    this.flickity.select(index);
  }
}
