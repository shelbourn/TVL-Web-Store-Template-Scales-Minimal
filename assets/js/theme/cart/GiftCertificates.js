import utils from '@bigcommerce/stencil-utils';
import refreshContent from './refreshContent';
import Alert from '../components/Alert';

export default class GiftCertificates {
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

    this.GiftcardAlerts = new Alert($('[data-gift-certificates]', this.options.$scope));

    this._bindEvents();
  }

  _bindEvents() {
    this.options.$scope.on('click', '[data-gift-certificate-toggle]', (event) => {
      this._toggleGiftCertificates(event);
    });

    this.options.$scope.on('submit', '[data-gift-certificate-form]', (event) => {
      event.preventDefault();
      this._addCode();
    });
  }

  _toggleGiftCertificates(event) {
    const $target = $(event.currentTarget);
    const addText = $target.data('add-text');
    const cancelText = $target.data('cancel-text');

    $('[data-gift-certificate-form]', this.options.$scope).revealer();

    if ($target.text() === cancelText) {
      $target.text(addText);
    } else {
      $target.text(cancelText);
    }
  }

  _addCode() {
    const code = this.options.$scope.find('[data-gift-certificate-input]').val();

    this.callbacks.willUpdate();

    if (! this._isValidCode(code)) {
      if (!$('[data-gift-certificates] .alert').length) {
        this.GiftcardAlerts.error(this.options.context.giftCertificateInputEmpty);
      }
      return this.callbacks.didUpdate();
    }

    utils.api.cart.applyGiftCertificate(code, (err, response) => {
      if (response.data.status === 'success') {
        refreshContent(this.callbacks.didUpdate);
      } else {
        this.GiftcardAlerts.error(response.data.errors.join('\n'));
        this.callbacks.didUpdate();
      }
    });
  }

  _isValidCode(code) {
    if (typeof code !== 'string') {
      return false;
    }

    return /^[A-Z0-9]{3}\-[A-Z0-9]{3}\-[A-Z0-9]{3}\-[A-Z0-9]{3}$/.exec(code);
  }
}
