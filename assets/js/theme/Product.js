import _ from 'lodash';
import PageManager from '../PageManager';
import Alert from './components/Alert';
import ProductUtils from './product/ProductUtils';
import QuantityWidget from './components/QuantityWidget';
import productViewTemplates from './product/productViewTemplates';
import ProductReviews from './product/Reviews';
import ProductImagesOverlay from './product/ProductImagesOverlay';
import LoadingOverlay from './components/LoadingOverlay';

export default class Product extends PageManager {
  constructor() {
    super();

    this.el = '[data-product-container]';
    this.$el = $(this.el);
  }

  loaded(next) {
    this.imagesOverlay = new ProductImagesOverlay($('[data-product-gallery-overlay]'), this.context);

    this.alert = new Alert($('[data-product-message]'));
    this.quantityControl = new QuantityWidget({scope: '[data-cart-item-add]'});

    new ProductReviews(this.context);

    this.ProductUtils = new ProductUtils(this.el, {
      priceWithoutTaxTemplate: productViewTemplates.priceWithoutTax,
      priceWithTaxTemplate: productViewTemplates.priceWithTax,
      priceSavedTemplate: productViewTemplates.priceSaved,
      callbacks: {
        willUpdate: () => LoadingOverlay($('[data-main-content]'), true),
        didUpdate: () => LoadingOverlay($('[data-main-content]'), true),
        switchImage: _.bind(this.imagesOverlay.newImage, this.imagesOverlay),
      },
    }).init(this.context);

    this._bindOverlayToggle();

    next();
  }

  _bindOverlayToggle() {
    this.$el.on('click', '[data-product-image]', (event) => {
      this._toggleImagesOverlay(event);
    });
  }

  _toggleImagesOverlay(event) {
    const $target = $(event.currentTarget);
    this.imagesOverlay.toggleOverlay($target);
  }
}
