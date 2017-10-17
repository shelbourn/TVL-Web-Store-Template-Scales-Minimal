import utils from '@bigcommerce/stencil-utils';
import refreshContent from './refreshContent';
import Alert from '../components/Alert';

export default class CartUtils {
  constructor(options) {
    this.$cartContent = $('[data-cart-content]');
    this.$cartTotals = $('[data-cart-totals]');

    this.CartAlerts = new Alert($('[data-cart-messages]', this.$cartContent));
    this.productData = {};

    this.callbacks = $.extend({
      willUpdate: () => console.log('Update requested.'),
      didUpdate: () => console.log('Update executed.'),
    }, options.callbacks);

    this._bindEvents();
  }

  _bindEvents() {
    this.$cartContent.on('click', '[data-cart-item-quantity-change]', (event) => {
      event.preventDefault();
      this._updateQuantity(event);
    });

    this.$cartContent.on('click', '[data-cart-item-remove]', (event) => {
      event.preventDefault();
      this._removeCartItem(event);
    });

    this.$cartTotals.on('click', '[data-cart-update]', (event) => {
      event.preventDefault();
      this._updateCart(event);
    });
  }

  _updateQuantity(event) {
    const $target = $(event.currentTarget);
    const $cartItem = $target.closest('[data-cart-item]');
    const itemId = $cartItem.data('item-id');
    const $quantityInput = $cartItem.find('[data-cart-item-quantity-input]');
    const min = parseInt($quantityInput.prop('min'), 10);
    const max = parseInt($quantityInput.prop('max'), 10);
    let newQuantity = parseInt($quantityInput.val(), 10);

    if ($target.is('[data-cart-item-quantity-increment]') && (!max || newQuantity < max)) {
      newQuantity = newQuantity + 1;
    } else if ($target.is('[data-cart-item-quantity-decrement]') && newQuantity > min) {
      newQuantity = newQuantity - 1;
    }

    $quantityInput.val(newQuantity);
  }

  _updateCart(event) {
    const $cartItem = $('[data-cart-item]');
    let items = [];

    this.callbacks.willUpdate();

    $cartItem.each((i, el) => {
      const $el = $(el);

      items.push({
        id: $el.data('item-id'),
        quantity: parseInt($el.find('[data-cart-item-quantity-input]').val(), 10),
      });

      utils.api.cart.update(items, (err, response) => {
        items.pop();
      });
    }).promise().done(() => {
      refreshContent(this.callbacks.didUpdate);
    });
  }

  _removeCartItem(event) {
    const itemId = $(event.currentTarget).closest('[data-cart-item]').data('item-id');

    this.callbacks.willUpdate();

    utils.api.cart.itemRemove(itemId, (err, response) => {
      if (response.data.status === 'succeed') {
        refreshContent(this.callbacks.didUpdate);
      } else {
        this.CartAlerts.error(response.data.errors.join('\n'), true);
        this.callbacks.didUpdate();
      }
    });
  }
}
