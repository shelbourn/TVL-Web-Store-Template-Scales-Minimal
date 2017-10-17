import PageManager from '../PageManager';
import SelectWrapper from './components/SelectWrapper';
import QuickShop from './product/QuickShop';
import ProductImagePreview from './product/ProductImagePreview';
import FormValidator from './utils/FormValidator';
import FileUploadWrapper from './components/FileUploadWrapper';
import Navigation from './components/Navigation';
import CartPreview from './cart/CartPreview';
import initFormSwatchFields from './core/formSelectedValue';
import ProductCompare from 'bc-compare';

// global scope jQuery plugins
/* eslint-disable no-unused-vars */
import validetta from 'validetta';

export default class Global extends PageManager {
  constructor() {
    super();

    new Navigation('[data-header-navigation]');
    new CartPreview('[data-cart-preview]');

    const $select = $('select');
    if ($select.length) {
      $select.each((i, el) => {
        new SelectWrapper(el);
      });
    }
  }

  loaded(next) {
    initFormSwatchFields();

    // quickshop
    const $quickShop = $('[data-quick-shop-trigger]');
    if ($quickShop.length) {
      new QuickShop('[data-quick-shop]', this.context);
    }

    // image hover preview
    const $imagePreview = $('[data-image-preview]');
    if ($imagePreview.length) {
      new ProductImagePreview($imagePreview);
    }

    // global form validation
    this.validator = new FormValidator(this.context);
    this.validator.initGlobal();

    const $upload = $('.form-field-file input');
    if ($upload.length) {
      $upload.each((i, el) => {
        new FileUploadWrapper(el, this.context).updateFilename();
      });
    }

    if ($('.compare-enabled').length) {
      this._initCompare();
    }
  }

  _initCompare() {
    const compare = new ProductCompare({
      maxItems: 3,
    });
  }
}
