import PageManager from '../PageManager';
import utils from '@bigcommerce/stencil-utils';
import CartUtils from './cart/CartUtils';
import ShippingCalculator from './cart/ShippingCalculator';
import CouponCodes from './cart/CouponCodes';
import GiftCertificates from './cart/GiftCertificates';
import GiftWrapping from './cart/GiftWrapping';
import LoadingOverlay from './components/LoadingOverlay';
import FormValidator from './utils/FormValidator';

export default class Cart extends PageManager {
  _bindEvents() {
    $(document).on('form-validation', (event) => {
      new FormValidator(this.context).initGlobal();
    });
  }

  loaded(next) {
    this.$scopeContainer = $('[data-main-content]');
    this.$scopeContent = $('[data-cart-content]');
    this.$scopeTotals = $('[data-cart-totals]');

    new FormValidator(this.context).initGlobal();

    this._bindEvents();

    const sharedCallbacks = {
      willUpdate: () => LoadingOverlay(this.$scopeContainer, true),
      didUpdate: () => LoadingOverlay(this.$scopeContainer, true),
    };

    this.ShippingCalculator = new ShippingCalculator('[data-shipping-calculator]', {
      context: this.context,
      scope: this.$scopeTotals,
      visibleClass: 'visible',
      callbacks: sharedCallbacks,
    });

    this.CouponCodes = new CouponCodes('[data-coupon-codes]', {
      context: this.context,
      scope: this.$scopeTotals,
      visibleClass: 'visible',
      callbacks: sharedCallbacks,
    });

    this.GiftCertificates = new GiftCertificates('[data-gift-certificates]', {
      context: this.context,
      scope: this.$scopeTotals,
      visibleClass: 'visible',
      callbacks: sharedCallbacks,
    });

    this.GiftWrapping = new GiftWrapping({
      context: this.context,
      scope: this.$scopeContent,
    });

    this.CartUtils = new CartUtils({
      callbacks: sharedCallbacks,
    });

    if (window.ApplePaySession && $('.dev-environment').length) {
      $(document.body).addClass('apple-pay-supported');
    }

    next();
  }
}
