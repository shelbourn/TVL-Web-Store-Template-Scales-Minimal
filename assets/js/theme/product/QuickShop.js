import utils from '@bigcommerce/stencil-utils';
import ProductUtils from './ProductUtils';
import ProductSlideshow from './ProductSlideshow';
import productViewTemplates from './productViewTemplates';
import Alert from '../components/Alert';
import QuantityWidget from '../components/QuantityWidget';
import SelectWrapper from '../components/SelectWrapper';
import FileUploadWrapper from '../components/FileUploadWrapper';
import FormValidator from '../utils/FormValidator';
import LoadingOverlay from '../components/LoadingOverlay';
import ProductImagesOverlay from './ProductImagesOverlay';

export default class QuickShop {
  constructor(el, context) {
    this.context = context;
    this.$el = $(el);
    this.$body = $(document.body);
    this.$scope = $('[data-quick-shop-scope]');
    this.$quickShop = $('[data-quick-shop]');
    this.$quickShopWrapper = $('[data-quick-shop-wrapper]');
    this.$quickShopLoading = this.$quickShopWrapper.find('[data-loading-overlay]');

    this._bindEvents();
  }

  _bindEvents() {
    this.$scope.on('click', '[data-quick-shop-trigger]', (event) => {
      this._openQuickShop(event);
    });

    this.$quickShopWrapper.on('click', (event) => {
      this._closeQuickShop(event);
    });

    this.$body.on('keyup', (event) => {
      if (event.keyCode == 27) {
        if (this.$quickShopWrapper.hasClass('visible')) {
          this._closeQuickShop(event);
        }
      }
    });
  }

  _openQuickShop(event) {
    const productId = $(event.currentTarget).data('quick-shop-trigger');

    LoadingOverlay(this.$quickShopWrapper, this.$quickShopLoading);

    this.$body.addClass('quick-shop-open');
    this.$quickShopWrapper.revealer();

    utils.api.product.getById(productId, { template: 'product/quick-shop' }, (err, response) => {
      if (response) {
        this.$quickShop.html(response);

        this.imagesOverlay = new ProductImagesOverlay($('[data-product-gallery-overlay]'), this.context);

        this.ProductUtils = new ProductUtils(this.$quickShop, {
          priceWithoutTaxTemplate: productViewTemplates.priceWithoutTax,
          priceWithTaxTemplate: productViewTemplates.priceWithTax,
          priceSavedTemplate: productViewTemplates.priceSaved,
          callbacks: {
            willUpdate: () => {
              LoadingOverlay(this.$quickShopWrapper, this.$quickShopLoading);
              this.$quickShop.toggleClass('is-loading');
            },
            didUpdate: () => {
              LoadingOverlay(this.$quickShopWrapper, this.$quickShopLoading);
              this.$quickShop.toggleClass('is-loading');
            },
            switchImage: imgObj => this.switchImage(imgObj),
          },
        });

        this.ProductUtils.init(this.context);

        const $select = this.$quickShop.find('select');
        if ($select.length) {
          $select.each((i, el) => {
            new SelectWrapper(el);
          });
        }

        const $file = this.$quickShop.find('.form-file');
        if ($file.length) {
          $file.each((i, el) => {
            new FileUploadWrapper(el, this.context).updateFilename();
          });
        }
      } else {
        alert(err);
      }

      this.$quickShop.imagesLoaded(() => {
        this.$quickShop.revealer();
        new FormValidator(this.context).initGlobal();
        this.slideshow = new ProductSlideshow(this.$el, this.context);
        LoadingOverlay(this.$quickShopWrapper, this.$quickShopLoading);

        $('[data-quick-shop-close]').on('click', (event) => {
          this._closeQuickShop(event);
        });
      });
    });
  }

  _closeQuickShop(event) {
    if (this.$quickShopWrapper.hasClass('visible')) {
      this.$body.removeClass('quick-shop-open');
      this.$quickShopWrapper.revealer().one('trend', () => {
        this.$quickShop
          .off('click', '[data-product-quantity-change]')
          .off('change', '[data-product-option-change]');
      });
      this.$quickShop.revealer();
      this.$quickShop.empty();
    }

    if (this.ProductUtils) {
      this.ProductUtils.unload();
    }
  }

  switchImage(img) {
    if (!this.slideshow) return;
    this.slideshow.addImage(img);
  }
}
