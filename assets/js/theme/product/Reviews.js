import Modal from 'bc-modal';
import FormValidator from '../utils/FormValidator';
import ScrollTarget from '../utils/ScrollTarget';
import { hooks, api } from '@bigcommerce/stencil-utils';

export default class ProductReviews {
  constructor(context) {
    this.context = context;
    this.Validator = new FormValidator(this.context);
    this.$body = $(document.body);
    this.$reviewsContainer = this.$body.find('[data-product-reviews-list]');
    this.reviewModal = new Modal({
      el: $('#modal-review-form'),
      modalClass: 'review-modal-container',
      afterShow: () => {
        const $form = $('#form-leave-a-review');
        this.Validator.initSingle($form);
      },
    });

    this._bindEvents();
    this._createColumns();
  }

  _bindEvents() {
    $('[data-leave-review]').click((event) => {
      event.preventDefault();
      this.reviewModal.open();
    });

    $('[data-load-more-reviews-button]').on('click', (event) => {
      event.preventDefault();
      this._loadMoreReviews(event);
    });

    $('[data-reviews-list]').on('click', (event) => {
      event.preventDefault();
      ScrollTarget('[data-product-reviews-container]');
    });
  }

  _createColumns() {
    const $allReviews = this.$reviewsContainer.find('.product-single-review-item').length;
    const $oddReviews = this.$reviewsContainer.find('.product-single-review-item:nth-child(odd)');
    const $evenReviews = this.$reviewsContainer.find('.product-single-review-item:nth-child(even)');
    const column = '<section class="product-single-reviews-column"></section>';

    if ($allReviews > 1) {
      this.$reviewsContainer
        .prepend($(column).append($oddReviews))
        .prepend($(column).append($evenReviews));
    }
  }

  _loadMoreReviews(event) {
    const $target = $(event.currentTarget);
    const url = $target.attr('data-load-more-url');
    const requestOptions = { template: 'reviews/review-list' };

    $target.toggleClass('loading');

    api.getPage(url, requestOptions, (error, response) => {
      if (error) {
        $target.toggleClass('loading');
        throw new Error(error);
      }

      if (response) {
        const $reviews = $(response).find('.product-single-review-item');
        this._appendToColumns($reviews);

        const $button = $(response).find('.button');

        if ($button.length > 0) {
          const nextUrl = $button.attr('data-load-more-url');
          $target.attr('data-load-more-url', nextUrl);
        } else {
          $target.hide();
        }

        $target.toggleClass('loading');
      }
    });
  }

  _appendToColumns($items) {
    const $odd = $items.filter('.product-single-review-item:nth-child(odd)');
    const $even = $items.filter('.product-single-review-item:nth-child(even)');
    const $columns = this.$reviewsContainer.find('.product-single-reviews-column');

    $columns.eq(0).append($odd);
    $columns.eq(1).append($even);
  }
}
