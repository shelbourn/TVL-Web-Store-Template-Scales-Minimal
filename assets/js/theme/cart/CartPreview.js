import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';
import ActualSize from '../components/ActualSize';
import LoadingOverlay from '../components/LoadingOverlay';
import CurrencySelector from '../components/CurrencySelector';

export default class QuickCart {
  constructor(el) {
    this.$cartPreview = $(el);
    this.$body = $(document.body);
    this.$window = $(window);
    this.$cartPreviewToggle = this.$cartPreview.find('[data-cart-preview-toggle]');
    this.$cartPreviewContainer = this.$cartPreview.find('[data-cart-preview-container]');
    this.$cartPreviewOverlay = this.$body.find('[data-cart-preview-overlay]');

    this.currencySelector = new CurrencySelector('[data-currency-selector]');

    this._bindEvents();
    this._cartPreviewPosition();
  }

  _bindEvents() {
    $(window).on('resize', _.debounce(() => {
      this._cartPreviewPosition();
    }, 200));

    this.$cartPreviewToggle.on('click', (event) => {
      this._toggleCartPreview();
    });

    $('[data-cart-preview-item-remove]').on('click', (event) => {
      this._removeProductQuickCart(event);
    });

    this.$body.on('keyup', (event) => {
      if (event.keyCode == 27) {
        if (this.$cartPreviewContainer.hasClass('visible')) {
          this._toggleCartPreview();
        }
      }
    });

    this.$cartPreviewContainer.on('click', (event) => {
      event.stopPropagation();
    });

    this.$body.on('click', (event) => {
      if (this.$cartPreviewContainer.hasClass('visible')) {
        this._toggleCartPreview();
      }
    });
  }

  _cartPreviewPosition() {
    const cartPreviewHeaderHeight = $('[data-header-main]').outerHeight();
    const cartPreviewCurrencyHeight = $('[data-cart-preview-currency]').actual('outerHeight', { includeMargin : true });
    const cartPreviewFooterHeight = $('[data-cart-preview-footer]').actual('outerHeight', { includeMargin : true });
    const cartPreviewNavigationHeight = $('[data-cart-preview-navigation]').actual('outerHeight', { includeMargin : true });
    const cartPreviewListOffset =  cartPreviewFooterHeight + cartPreviewNavigationHeight;

    $('[data-cart-preview-currency]').css({
      top: cartPreviewHeaderHeight / 2,
      marginTop: -(cartPreviewCurrencyHeight / 2)
    });

    $('[data-cart-preview-list-container]').css({
      height: `calc(100vh - ${cartPreviewHeaderHeight}px)`,
      marginTop: cartPreviewHeaderHeight
    });

    $('[data-cart-preview-item-list]').css({
      height: `calc(100% - ${cartPreviewListOffset}px)`,
    });

    $('[data-cart-preview-close]').css({
      top: cartPreviewHeaderHeight / 2,
    });
  }

  _toggleCartPreview() {
    this.$body.toggleClass('cart-preview-open');
    this.$cartPreviewContainer.revealer();
    this.$cartPreviewOverlay.revealer();
  }

  _removeProductQuickCart(event) {
    const $product = $(event.currentTarget);
    const itemId = $product.data('product-id');

    if (! itemId) { return; }

    utils.api.cart.itemRemove(itemId, (err, response) => {
      if (response.data.status === 'succeed') {
        this._updateCartPreview();
      } else {
        alert(response.data.errors.join('\n'));
      }
    });
  }

  _updateCartPreview(callback) {
    const $cartPreviewCount = $('[data-cart-preview-count]');
    const $cartPreviewListContainer = $('[data-cart-preview-list-container]');

    LoadingOverlay($cartPreviewListContainer, true);

    utils.api.cart.getContent({ template: 'cart/cart-preview/cart-preview-item-list' }, (err, response) => {
      $cartPreviewListContainer.html(response);
      this._cartPreviewPosition();

      LoadingOverlay($cartPreviewListContainer, true);

      if (callback) {
        callback();
      }
    });

    utils.api.cart.getContent({ template: 'cart/cart-preview/cart-preview-count' }, (err, response) => {
      $cartPreviewCount.html(response);
      this._cartPreviewPosition();

      if (callback) {
        callback();
      }
    });
  }
}
