import PageManager from '../PageManager';
import ProductCollection from './product/ProductCollection';
import FacetedSearch from './components/FacetedSearch';
import Tabs from 'bc-tabs';

export default class Search extends PageManager {
  constructor() {
    super();

    new ProductCollection($('[data-collection]'));
  }

  loaded(next) {
    this.productCount = this.context.themeSettings.collection_products_per_page;

    if ($('[data-faceted-search]').length) {
      this._initializeFacetedSearch();
    }

    this.tabs = new Tabs({
      titleSelector: $('.search-tab-title'),
    });
  }

  _initializeFacetedSearch() {
    const options = {
      toggleFacet: (event) => this._toggleFacet(event),
      config: {
        search: {
          product_results: {
            limit: this.productCount
          }
        }
      },
      showMore: 'collection/search/show-more',
      template: {
        productListing: 'collection/search/search-products',
        sidebar: 'collection/search/search-sidebar'
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

    $target.toggleClass('is-open');

    if ($target.hasClass('is-open')) {
      $target.find('use').attr('xlink:href', '#icon-minus');
    } else {
      $target.find('use').attr('xlink:href', '#icon-plus');
    }
  }
}
