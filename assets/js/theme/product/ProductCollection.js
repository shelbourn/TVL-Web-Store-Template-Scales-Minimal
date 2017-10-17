export default class ProductCollection {
  constructor(el) {
    this.$el = $(el);
    this.$sideBar = this.$el.find('[data-collection-sidebar]');
    this.$collectionContainer = this.$el.find('[data-collection-product-list]');

    this._bindEvents();
  }

  _bindEvents() {
    this.$el.on('click', '[data-filter-toggle]', (event) => {
      this._toggleFilterSidebar(event);
    });
  }

  _toggleFilterSidebar(event) {
    this.$el.toggleClass('show-sidebar');
  }
}
