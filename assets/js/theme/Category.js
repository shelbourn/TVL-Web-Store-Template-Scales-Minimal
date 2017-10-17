import PageManager from '../PageManager';
import ProductCollection from './product/ProductCollection';
import FacetedSearch from './components/FacetedSearch';

export default class Category extends PageManager {
  constructor() {
    super();

    new ProductCollection($('[data-collection]'));
  }

  loaded(next) {
    this.productCount = this.context.themeSettings.collection_products_per_page;

    if ($('[data-faceted-search]').length) {
      this._initializeFacetedSearch();
    }
  }

  _initializeFacetedSearch() {
    const options = {
      toggleFacet: (event) => this._toggleFacet(event),
      config: {
        category: {
          products: {
            limit: this.productCount
          }
        }
      },
      showMore: 'collection/category/show-more',
      template: {
        productListing: 'collection/category/category-products',
        sidebar: 'collection/category/category-sidebar'
      },
      context: {
        productListing: '[data-collection-product-list]',
        sidebar: '[data-collection-sidebar]',
      },
    };

    this.FacetedSearch = new FacetedSearch(options);
  }

  _toggleFacet(event) {
    const $target = $(event.currentTarget);
    $target
      .parents('[data-facet-filter]')
      .children('[data-facet-filter-wrapper]')
      .toggleClass('is-open');

    const $toggle = $target.find('.facet-toggle');

    $toggle.toggleClass('is-open');

    if ($toggle.hasClass('is-open')) {
      $toggle.find('use').attr('xlink:href', '#icon-minus');
    } else {
      $toggle.find('use').attr('xlink:href', '#icon-plus');
    }
  }
}
