import utils from '@bigcommerce/stencil-utils';
import refreshContent from './refreshContent';
import Alert from '../components/Alert';
import updateState from '../core/updateState';
import SelectWrapper from '../components/SelectWrapper';

export default class ShippingCalculator {
  constructor(el, options) {
    this.$el = $(el);

    this.options = $.extend({
      context: {},
      scope: $('[data-cart-totals]'),
      visibleClass: 'visible',
    }, options);

    this.callbacks = $.extend({
      willUpdate: () => console.log('Update requested.'),
      didUpdate: () => console.log('Update executed.'),
    }, options.callbacks);

    this.ShippingAlerts = new Alert($('[data-cart-shipping]'));

    this._bindEvents();
  }

  _bindEvents() {
    this.options.scope.on('click', '[data-shipping-calculator-toggle]', (event) => {
      this._toggleShippingCalculator(event);
    });

    this.options.scope.on('submit', '[data-shipping-calculator]', (event) => {
      event.preventDefault();
      this._calculateShipping();
    });

    this.options.scope.on('change', '[data-field-type="Country"]', (event) => {
      updateState(true, ($el) => {
        new SelectWrapper($el);
      });
    });
  }

  _toggleShippingCalculator(event) {
    const $target = $(event.currentTarget);
    const $calculator = $('[data-shipping-calculator]', this.options.scope);
    const addText = $target.data('add-text');
    const cancelText = $target.data('cancel-text');

    $calculator.revealer();

    if ($target.text() === cancelText) {
      $target.text(addText);
    } else {
      $target.text(cancelText);
    }
  }

  _calculateShipping() {
    this.callbacks.willUpdate();

    let params = {
      country_id: $('[name="shipping-country"]', this.options.scope).val(),
      state_id: $('[name="shipping-state"]', this.options.scope).val(),
      zip_code: $('[name="shipping-zip"]', this.options.scope).val()
    };

    utils.api.cart.getShippingQuotes(params, 'cart/shipping/shipping-quotes', (err, response) => {
      const $shippingQuotes = $('[data-shipping-quotes]');
      if (response.data.quotes) {
        this.ShippingAlerts.clear();
        $shippingQuotes.html(response.content);
      } else {
        this.ShippingAlerts.error(response.data.errors.join('\n'));
      }

      this.callbacks.didUpdate();

      // bind the select button
      $shippingQuotes.find('.button').on('click', (event) => {
        event.preventDefault();

        this.callbacks.willUpdate();

        const quoteId = $('[data-shipping-quote]:checked').val();

        utils.api.cart.submitShippingQuote(quoteId, (response) => {
          refreshContent(this.callbacks.didUpdate);
        });
      });
    });
  }
}
