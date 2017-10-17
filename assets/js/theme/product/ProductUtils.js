import utils from '@bigcommerce/stencil-utils';
import Alert from '../components/Alert';
import CartPreview from '../cart/CartPreview';
import UserDefinedContent from '../components/UserDefinedContent';

export default class ProductUtils {
  constructor(el, options) {
    this.$el = $(el);
    this.options = options;
    this.productId = this.$el.find('[data-product-id]').val();

    // class to add or remove from cart-add button depending on variation availability
    this.buttonDisabledClass = 'button-disabled';

    // two alert locations based on action
    this.cartAddAlert = new Alert(this.$el.find('[data-product-cart-message]'));
    this.cartOptionAlert = new Alert(this.$el.find('[data-product-option-message]'));

    this.callbacks = $.extend({
      willUpdate: () => console.log('Update requested.'),
      didUpdate: () => console.log('Update executed.'),
      switchImage: (url) => console.log(`Image switch attempted for ${url}`),
    }, options.callbacks);
  }

  /**
   * pass in the page context and bind events
   */
  init(context) {
    this.context = context;

    this._bindQuantityChange();
    this._bindProductOptionChange();
    this._bindCartAdd();
    this._bindEvents();

    new UserDefinedContent(this.$el.find('.product-details-description'));

    if (this.$el.hasClass('product-single-container')) {
      this._updateAttributes(window.BCData.product_attributes);
    } else {
      // otherwise emit our option change event (this happens in the quickshop)
      utils.hooks.emit('product-option-change');
    }
  }

  unload() {
    if (this.productOptionHandler) {
      utils.hooks.off('product-option-change', this.productOptionHandler);
    }
  }

  /**
   * Cache an object of jQuery elements for DOM updating
   * @param  jQuery $el - a wrapping element of the scoped product
   * @return {object} - buncha jQuery elements which may or may not exist on the page
   */
  _getViewModel($el) {
    return {
      $price: $('[data-product-price-wrapper="without-tax"]', $el),
      $priceWithTax: $('[data-product-price-wrapper="with-tax"]', $el),
      $saved: $('[data-product-price-saved]', $el),
      $sku: $('[data-product-sku]', $el),
      $weight: $('[data-product-weight]', $el),
      $addToCart: $('[data-button-purchase]', $el),
    };
  }

  /**
   * Bind quantity input changes.
   */
  _bindQuantityChange() {
    this.$el.on('click', '[data-product-quantity-change]', (event) => {
      this._updateQuantity(event);
    });
  }

  /**
   * Bind product events.
   */
  _bindEvents() {
    this.$el.on('click', '[data-accordion-toggle]', (event) => {
      this._toggleAccordion(event);
    });

    this.$el.on('click', '[data-product-share-toggle]', (event) => {
      this._toggleShareButtons(event);
    });
  }

  /**
   * Bind product options changes.
   */
  _bindProductOptionChange() {
    this.productOptionHandler = (event, changedOption) => {
      const $changedOption = $(changedOption);
      const $form = $changedOption.parents('form');

      if (event && $(event.target).hasClass('form-rectangle')) {
        $(event.target).parents('.form-field-control').find('.rectangle').removeClass('active');
        $(event.target).parents('.rectangle').addClass('active');
      }

      // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
      if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
        return;
      }

      utils.api.productAttributes.optionChange(this.productId, $form.serialize(), (err, response) => {
        this.cartAddAlert.clear();

        const viewModel = this._getViewModel(this.$el);
        const data = response ? response.data : {};
        this._updateAttributes(data);

        // updating price
        if (viewModel.$price.length) {
          const priceStrings = {
            price: data.price,
            excludingTax: this.context.productExcludingTax,
          };
          viewModel.$price.html(this.options.priceWithoutTaxTemplate(priceStrings));
        }

        if (viewModel.$priceWithTax.length) {
          const priceStrings = {
            price: data.price,
            includingTax: this.context.productIncludingTax,
          };
          viewModel.$priceWithTax.html(this.options.priceWithTaxTemplate(priceStrings));
        }

        if (viewModel.$saved.length) {
          const priceStrings = {
            price: data.price,
            savedString: this.context.productYouSave,
          };
          viewModel.$saved.html(this.options.priceSavedTemplate(priceStrings));
        }

        // update sku if exists
        if (viewModel.$sku.length) {
          viewModel.$sku.html(data.sku);
        }

        // update weight if exists
        if (viewModel.$weight.length && data.weight) {
          viewModel.$weight.html(data.weight.formatted);
        }

        // handle product variant image if exists
        if (data.image) {
          this.callbacks.switchImage(data.image);
        }

        this.cartOptionAlert.clear();

        // update submit button state
        if (!data.purchasable || !data.instock) {
          if ($('[data-product-quantity]').is(':visible')) {
            this.cartOptionAlert.error(data.purchasing_message);
          }
          viewModel.$addToCart
            .addClass(this.buttonDisabledClass)
            .prop('disabled', true)
            .children('[data-button-text]')
            .text(this.context.unavailable);
        } else {
          let buttonText = this.context.addToCart;
          if (viewModel.$addToCart.is('[data-button-preorder]')) {
            buttonText = this.context.preOrder;
          }
          viewModel.$addToCart
            .removeClass(this.buttonDisabledClass)
            .prop('disabled', false)
            .children('[data-button-text]')
            .text(buttonText);
        }
      });
    };

    utils.hooks.on('product-option-change', this.productOptionHandler);
  }

  /**
   * Add a product to cart
   */
  _bindCartAdd() {
    utils.hooks.on('cart-item-add', (event, form) => {
      // Do not do AJAX if browser doesn't support FormData
      if (window.FormData === undefined) { return; }

      event.preventDefault();

      this.callbacks.willUpdate($(form));

      // Add item to cart
      utils.api.cart.itemAdd(new FormData(form), (err, response) => {
        let isError = false;

        if (err || response.data.error) {
          isError = true;
          response = err || response.data.error;
        } else {
          utils.api.cart.getContent({template: 'cart/cart-preview/cart-preview'}, (err, response) => {
            $('[data-cart-preview]').html(response);
            new CartPreview('[data-cart-preview]');
          });
        }

        this._updateMessage(isError, response);
        this.callbacks.didUpdate(isError, response, $(form));
      });
    });
  }

  /**
   * Validate and update quantity input value
   */
  _updateQuantity(event) {
    const $target = $(event.currentTarget);
    const $quantity = $target.closest('[data-product-quantity]').find('[data-product-quantity-input]');
    const min = parseInt($quantity.prop('min'), 10);
    const max = parseInt($quantity.prop('max'), 10);
    let newQuantity = parseInt($quantity.val(), 10);

    this.cartAddAlert.clear();
    this.cartOptionAlert.clear();

    if ($target.is('[data-quantity-increment]') && (!max || newQuantity < max)) {
      newQuantity = newQuantity + 1;
    } else if ($target.is('[data-quantity-decrement]') && newQuantity > min) {
      newQuantity = newQuantity - 1;
    }

    $quantity.val(newQuantity);
  }

  /**
   * interpret and display cart-add response message
   */
  _updateMessage(isError, response) {
    this.cartAddAlert.clear();

    let message = '';

    if (isError) {
      message = response;
    } else {
      message = this.context.addSuccess;
      message = message
                  .replace('*product*', this.$el.find('[data-product-details]').data('product-title'))
                  .replace('*cart_link*', `<a href=${this.context.urlsCart}>${this.context.cartLink}</a>`)
                  .replace('*continue_link*', `<a href='/'>${this.context.homeLink}</a>`)
                  .replace('*checkout_link*', `<a href=${this.context.urlsCheckout}>${this.context.checkoutLink}</a>`);
    }

    this.cartAddAlert.message(message, (isError ? 'error' : 'success'));
  }

  _updateAttributes(data) {
    const behavior = data.out_of_stock_behavior;
    const inStockIds = data.in_stock_attributes;
    const outOfStockMessage = ` (${data.out_of_stock_message})`;

    if (behavior !== 'hide_option' && behavior !== 'label_option') {
      return;
    }

    $('[data-product-attribute-value]', this.$el).each((i, attribute) => {
      const $attribute = $(attribute);
      const attrId = parseInt($attribute.data('product-attribute-value'), 10);

      if (inStockIds.indexOf(attrId) !== -1) {
        this._enableAttribute($attribute, behavior, outOfStockMessage);
      } else {
        this._disableAttribute($attribute, behavior, outOfStockMessage);
      }
    });

    if(this._allFieldsHidden()) {
      const $quantityInput = this.$el.find('[data-product-quantity-input]');
      const $quantityContainer = $quantityInput.parents('[data-product-quantity]');
      $quantityInput.val(0);
      $quantityContainer.hide();
    } else {
      if (!$('[data-product-quantity]').is(':visible')) {
        $('[data-product-quantity]').show();
      }
    }
  }

  _disableAttribute($attribute, behavior, outOfStockMessage) {
    if (behavior === 'hide_option') {
      $attribute.hide();
    } else {
      if (this._getAttributeType($attribute) === 'set-select') {
        $attribute.html($attribute.html().replace(outOfStockMessage, '') + outOfStockMessage);
      } else {
        $attribute.addClass('option-unavailable');
      }
    }
  }

  _enableAttribute($attribute, behavior, outOfStockMessage) {
    if (behavior === 'hide_option') {
      $attribute.show();
    } else {
      if (this._getAttributeType($attribute) === 'set-select') {
        $attribute.html($attribute.html().replace(outOfStockMessage, ''));
      } else {
        $attribute.removeClass('option-unavailable');
      }
    }
  }

  _getAttributeType($attribute) {
    const $parent = $attribute.closest('[data-product-attribute]');
    return $parent ? $parent.data('product-attribute') : null;
  }

  _toggleAccordion(event) {
    const $toggle = $(event.currentTarget);
    const $container = $toggle.parents('[data-accordion-container]');
    const $icon = $toggle.find('.accordion-toggle');

    if ($container.length) {
      const $content = $container.find('[data-accordion-content]');
      $content.revealer();
      $icon.html('<svg><use xlink:href="#icon-minus"></use></svg>');

      if ($content.hasClass('visible')) {
        $icon.html('<svg><use xlink:href="#icon-plus"></use></svg>');
      }
    }
  }

  _toggleShareButtons(event) {
    event.preventDefault();
    const $target = $(event.currentTarget);
    const $shareButtons = $target.next();

    if ($shareButtons.length > 0) {
      $shareButtons.revealer();
    }
  }

  _allFieldsHidden() {
    const $formFields = $('.form-field', '[data-product-option-change]');
    return !$formFields.filter((i, formField) => $(formField).is(':visible')).length;
  }
}
