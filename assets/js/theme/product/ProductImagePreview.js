import _ from 'lodash';
import { api } from '@bigcommerce/stencil-utils';
import LoadingSpinner from '../components/LoadingSpinner';

export default class ProductImagePreview {
  constructor() {
    this.options = {
      template: 'collection/collection-image-preview',
    };

    this._bindEvents();
    this._breakpointCheck();
  }

  _bindEvents() {
    $(window).on('resize', _.debounce(() => {
      this._breakpointCheck();
    }, 200));

    $('[data-image-preview]').on('mouseover', (event) => {
      this._previewOpen(event);
    });

    $('[data-image-preview]').on('mouseleave', (event) => {
      this._previewClose(event);
    });

    $('[data-image-preview]').one('mouseover', (event) => {
      this._previewImages(event);
    });
  }

  _breakpointCheck() {
    if ($(window).width() > 1039) {
      this.previewEnabled = true;
    } else {
      this.previewEnabled = false;
    }
  }

  _previewOpen(event) {
    if (this.previewEnabled) {
      $('.product-item-image-preview', $(event.currentTarget)).revealer('show');
    }
  }

  _previewClose(event) {
    if (this.previewEnabled) {
      $('.product-item-image-preview', $(event.currentTarget)).revealer('hide').removeClass('preview-active');
    }
  }

  _previewImages(event) {
    if (this.previewEnabled) {
      const $target = $(event.currentTarget);
      const $images = $('[data-image-preview-container]', $target);
      const productId = $target.data('product-id');

      LoadingSpinner($images, true);

      api.product.getById(productId, this.options, (err, content) => {
        $images.html(content).addClass('preview-active');

        LoadingSpinner($images, true);

        this._previewHover(event);
      });
    }
  }

  _previewHover(event) {
    const $target = $(event.currentTarget);
    const $images = $('[data-image-preview-container]', $target);
    const $imageSlice = $('.image-preview-slice-image', $images);
    const imageCount = $imageSlice.length;
    const sliceWidth = 100 / imageCount;
    const productLink = $('.product-item-image-link', $target).attr('href');

    $imageSlice.each(function(index) {
      $('.image-preview-slice-trigger-container', $images).append(`<a class='image-preview-slice-trigger' href='${productLink}' style='width:${sliceWidth}%' data-slice-index='${index}'></a>`);
    });

    $('.image-preview-slice-trigger').on('mouseover', (event) => {
      const $target = $(event.currentTarget);
      const $container = $target.parents('.product-item-container');
      const index = $target.data('slice-index');

      $('.image-preview-slice-image').revealer('hide', true);
      $('.image-preview-slice-trigger').removeClass('active');

      if (!$(`.image-preview-slice-container [data-image-index='${index}']`, $container).hasClass('visible')) {
        $(`.image-preview-slice-container [data-image-index='${index}']`, $container).revealer('show');
        $target.addClass('active');
      }
    });
  }
}
