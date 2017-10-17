import { api } from '@bigcommerce/stencil-utils';
import LoadingOverlay from './LoadingOverlay';
import ProductImagePreview from '../product/ProductImagePreview';
import ActualSize from './ActualSize';

export default class Navigation {
  constructor(el) {
    this.$body = $(document.body);
    this.$navigation = $(el);

    this.$dropdownToggle = this.$navigation.find('[data-dropdown-toggle]');
    this.$productsToggle = this.$navigation.find('[data-products-toggle]');
    this.$mobileNavigationToggle = this.$navigation.find('[data-mobile-navigation-trigger]');
    this.$mobileNavigationOverlay = this.$navigation.find('[data-header-navigation-overlay]');

    this.$primaryTier = this.$navigation.find('[data-primary-tier]');
    this.$secondaryTier = this.$navigation.find('[data-secondary-tier]');
    this.$extendedTier = this.$navigation.find('[data-extended-tier]');

    this.$searchForm = this.$navigation.find('[data-search-form]');
    this.$searchFormToggle = this.$body.find('[data-search-form-toggle]');
    this.$searchFormOverlay = this.$body.find('[data-search-form-overlay]');

    this.options = {
      template: 'header/header-navigation-products',
    };

    this._bindEvents();
  }

  _bindEvents() {
    this.$dropdownToggle.on('click', '> a', (event) => {
      this._toggleDropdown(event);

      if (!this.$body.hasClass('navigation-dropdown-open')) {
        this.$body.addClass('navigation-dropdown-open');
      }
    });

    this.$productsToggle.on('click', '> a', (event) => {
      this._fetchProducts(event);
    });

    this.$mobileNavigationToggle.on('click', (event) => {
      this._toggleMobileNavigation(event);
    });

    this.$searchFormToggle.on('click', (event) => {
      this._toggleSearchForm(event);
    });

    this.$body.on('keyup', (event) => {
      if (event.keyCode == 27) {
        this._closeAllDropdowns(event);

        if (this.$searchForm.hasClass('visible')) {
          this._toggleSearchForm(event);
        }

        if (this.$primaryTier.hasClass('visible')) {
          this._toggleMobileNavigation(event);
        }
      }
    });

    this.$navigation.on('click', (event) => {
      event.stopPropagation();
    });

    this.$body.on('click', (event) => {
      if (this.$navigation.find('ul.visible').length) {
        this._closeAllDropdowns(event);
      }

      if (this.$searchForm.hasClass('visible')) {
        this._toggleSearchForm(event);
      }
    });

    this.$mobileNavigationOverlay.on('click', (event) => {
      if (this.$primaryTier.hasClass('visible')) {
        this._closeAllDropdowns(event);
        this._toggleMobileNavigation(event);
      }
    });
  }

  _toggleDropdown(event) {
    const $target = $(event.currentTarget);
    const $scope = $target.closest('.header-navigation-list');
    const $toggle = $target.closest('[data-dropdown-toggle]');
    const $dropdown = $toggle.children('.header-navigation-list');
    const isOpen = $toggle.hasClass('menu-open');

    event.preventDefault();

    if (!isOpen && $scope.hasClass('primary-tier')) {
      this._closeInactiveDropdowns(event);
    }

    if (!isOpen && !$scope.hasClass('primary-tier')) {
      this._closeSecondaryDropdowns($scope);
    }

    $toggle.toggleClass('menu-open');
    $dropdown.revealer();

    if (isOpen) {
      $dropdown.one('revealer-hide', event => {
        $dropdown.removeClass('header-navigation-list-left');
      });
    } else {
      $dropdown.one('revealer-animating', event => {
        const offset = $dropdown.offset().left + $dropdown.outerWidth();
        const isLeft = offset > $(window).width();
        $dropdown.toggleClass('header-navigation-list-left', isLeft);
      });
    }

    event.stopPropagation();
  }

  _fetchProducts(event) {
    const $target = $(event.currentTarget);
    const $parent = $target.parents('.header-navigation-list');
    const $products = $parent.find('[data-header-navigation-products]');
    const categoryUrl = event.currentTarget.href;

    event.preventDefault();

    LoadingOverlay($products, true)

    api.getPage(categoryUrl, this.options, (err, content) => {
      $products.html(content);
      LoadingOverlay($products, true);

      const $imagePreview = $('[data-image-preview]');
      if ($imagePreview.length) {
        new ProductImagePreview($imagePreview);
      }
    });
  }

  _toggleMobileNavigation(event) {
    this._closeAllDropdowns(event);
    this.$body.toggleClass('mobile-nav-open');
    this.$mobileNavigationOverlay.revealer();
    this.$mobileNavigationToggle.toggleClass('active');
    this.$primaryTier.revealer();
  }

  _toggleSearchForm(event) {
    this.$body.toggleClass('search-form-visible');
    this.$searchForm.revealer();
    this.$searchFormOverlay.revealer();

    setTimeout(()=> {
      this.$searchForm.find('[type=text]').val('');
      this.$searchForm.find('[type=text]').focus();
    }, 300);
  }

  _closeSecondaryDropdowns($target) {
    const $parent = $target.closest('.header-navigation-list');
    const $items = $parent.find('.menu-open');
    const $menus = $items.find('.visible');

    if ($menus.length > 0) {
      $menus.revealer();
      $menus.removeClass('header-navigation-list-left');
      $items.toggleClass('menu-open');
    }
  }

  _closeInactiveDropdowns(event) {
    const $target = $(event.target);
    const $scope = $target.closest('.header-navigation-list');
    const $dropdown = $scope.find('ul.visible');

    $dropdown.revealer();
    $dropdown.removeClass('header-navigation-list-left');
    $dropdown.parent().removeClass('menu-open');
  }

  _closeAllDropdowns(event) {
    const $target = $(event.target);
    const $dropdowns = this.$navigation.find('ul');

    for (let i = 0; i < $dropdowns.length; i++) {
      const $menuItem = $($dropdowns[i]).parent();

      if ($menuItem.hasClass('menu-open')) {
        $menuItem.removeClass('menu-open');
        $menuItem.find('> ul')
          .revealer()
          .removeClass('header-navigation-list-left');
      }
    }

    this.$body.removeClass('navigation-dropdown-open');
  }
}
