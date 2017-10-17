import { hooks, api } from '@bigcommerce/stencil-utils';
import Url from 'url';
import LoadingOverlay from '../components/LoadingOverlay';
import 'history.js/scripts/bundled-uncompressed/html4+html5/jquery.history';

export default class FacetedSearch {
  constructor(options, callback) {
    this.callback = callback;
    this.$body = $(document.body);
    this.$collectionContainer = this.$body.find('[data-collection]');

    this.options = $.extend({
      config: {
        category: {
          shop_by_price: true
        }
      },
      template: {
        productListing: 'collection/category/category-products',
        sidebar: 'collection/category/category-sidebar'
      },
      context: {
        productListing: '[data-collection-product-list]',
        sidebar: '[data-collection-sidebar]',
      },
      facetToggle: '[data-facet-toggle]',
      moreToggle: '[data-show-more-facets]',
      clearAll: '[data-facet-remove-all]',
      toggleFacet: () => console.log('Facet toggled.'),
    }, options);

    this.callbacks = $.extend({
      willUpdate: () => console.log('Update requested.'),
      didUpdate: () => console.log('Update executed.'),
    }, options.callbacks);

    this._bindEvents();
  }

  _bindEvents() {
    this.$body.on('click', this.options.facetToggle, (event) => {
      this._toggleFacet(event);
    });

    this.$body.on('click', this.options.moreToggle, (event) => {
      this._showAdditionalFilters(event);
    });

    this.$body.on('click', this.options.clearAll, (event) => {
      this._clearAllFilters(event);
    });

    $(window).on('statechange', this._onStateChange.bind(this));
    hooks.on('facetedSearch-facet-clicked', this._onFacetClick.bind(this));
    hooks.on('facetedSearch-range-submitted', this._onRangeSubmit.bind(this));
    hooks.on('sortBy-submitted', this._onSortBySubmit.bind(this));
  }

  init(options) {
    this.options.template = $.extend({
      productListing: this.options.template.productListing,
      sidebar: this.options.template.sidebar,
    }, options.template);

    this._onStateChange();
  }

  _showAdditionalFilters(event) {
    // Show/hide full facet list based on setting  for product filtering
    event.preventDefault();

    const $showMoreLink = $(event.currentTarget);
    const $originalList = $showMoreLink.siblings('.facet-default');
    const facet = $originalList.attr('data-facet');
    const facetUrl = History.getState().url;

    // Show/Hide extra facets based on settings for product filtering
    if (!$showMoreLink.siblings('.faceted-search-option-columns').length) {
      if (this.options.showMore) {
        api.getPage(facetUrl, {
          template: this.options.showMore,
          params: {
            list_all: facet,
          },
        }, (err, response) => {
          if (err) {
            throw new Error(err);
          }

          $(response).insertAfter($originalList);

          // show/hide original facet list
          $originalList.toggle();

          // Toggle show more/less link
          $showMoreLink.children().toggle();
        });
      }
    } else {
      $showMoreLink.siblings('.faceted-search-option-columns').toggle();

      // show/hide original facet list
      $originalList.toggle();

      // Toggle show more/less link
      $showMoreLink.children().toggle();
    }
  }

  _clearAllFilters(event) {
    event.preventDefault();

    if (this.$body.hasClass('search')) {
      this._goToUrl(window.location.href.split('&')[0]);
    } else {
      this._goToUrl(window.location.href.split('?')[0]);
    }
  }

  _toggleFacet(event) {
    $(event.currentTarget).toggleClass('is-open');
    $(event.currentTarget).parent().children('.facet-filter-wrapper').toggle();

    this.options.toggleFacet(event);
  }

  _onFacetClick(event) {
    event.preventDefault();

    const $target = $(event.currentTarget);
    const url = $target.attr('href');

    this._goToUrl(url);
    this._scrollTop();
  }

  _onRangeSubmit(event) {
    event.preventDefault();

    const url = Url.parse(location.href);
    let queryParams = $(event.currentTarget).serialize();

    if (this.$body.hasClass('search')) {
      const currentSearch = `search_query=${$('[data-faceted-search]').data('search-query')}` || '';
      queryParams = `${queryParams}&${currentSearch}`;
    }

    this._goToUrl(Url.format({ pathname: url.pathname, search: '?' + queryParams }));
  }

  _onSortBySubmit(event) {
    event.preventDefault();

    const url = Url.parse(location.href, true);
    const queryParams = $(event.currentTarget).serialize().split('=');

    url.query[queryParams[0]] = queryParams[1];
    delete url.query['page'];

    this._goToUrl(Url.format({ pathname: url.pathname, query: url.query }));
  }

  _onStateChange(event) {
    this.callbacks.willUpdate();

    LoadingOverlay(this.$collectionContainer, true);

    api.getPage(History.getState().url, this.options, (err, content) => {
      if (err) {
        throw new Error(err);
        this.callbacks.didUpdate();

        LoadingOverlay(this.$collectionContainer, true);

        return;
      }

      if (content) {
        $(this.options.context.productListing).html(content.productListing);
        $(this.options.context.sidebar).html(content.sidebar);

        if ($('[data-faceted-search]').hasClass('active-filters')) {
          $('[data-facet-remove-all]').addClass('visible');
        } else {
          $('[data-facet-remove-all]').removeClass('visible');
        }

        this.callbacks.didUpdate();

        LoadingOverlay(this.$collectionContainer, true);
      }
    });
  }

  _goToUrl(url) {
    History.pushState({}, document.title, url);
  }

  _scrollTop() {
    const $dataCollection = $('body').find('[data-collection]');
    const offsetTop = $dataCollection.offset().top;

    $('body, html').animate({ scrollTop: offsetTop });
  }
}
