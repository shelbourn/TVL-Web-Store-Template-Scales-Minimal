import utils from '@bigcommerce/stencil-utils';
import refreshContent from './refreshContent';
import Alert from '../components/Alert';

export default class CouponCodes {
  constructor(el, options) {
    this.$el = $(el);

    this.options = $.extend({
      context: {},
      $scope: $('[data-cart-totals]'),
    }, options);

    this.callbacks = $.extend({
      willUpdate: () => console.log('Update requested.'),
      didUpdate: () => console.log('Update executed.'),
    }, options.callbacks);

    this.CouponAlerts = new Alert($('[data-coupon-codes]', this.options.$scope));

    this._bindEvents();
  }

  _bindEvents() {
    this.options.$scope.on('click', '[data-coupon-code-toggle]', (event) => {
      this._toggleCouponCodes(event);
    });

    this.options.$scope.on('submit', '[data-coupon-code-form]', (event) => {
      event.preventDefault();
      this._addCode();
    });
  }

  _toggleCouponCodes(event) {
    const $target = $(event.currentTarget);
    const addText = $target.data('add-text');
    const cancelText = $target.data('cancel-text');

    $('[data-coupon-code-form]', this.options.$scope).revealer();

    if ($target.text() === cancelText) {
      $target.text(addText);
    } else {
      $target.text(cancelText);
    }
  }

  _addCode() {
    const $input = $('[data-coupon-code-input]', this.options.$scope);
    const code = $input.val();

    this.CouponAlerts.clear();
    this.callbacks.willUpdate();

    if (!code) {
      this.CouponAlerts.error(this.context.couponCodeEmptyInput);
      return this.callbacks.didUpdate();
    }

    utils.api.cart.applyCode(code, (err, response) => {
      if (response.data.status === 'success') {
        refreshContent(this.callbacks.didUpdate);
      } else {
        this.CouponAlerts.error(response.data.errors.join('\n'), true);
        this.callbacks.didUpdate();
      }
    });
  }
}
