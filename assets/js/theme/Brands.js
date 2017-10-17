import PageManager from '../PageManager';

export default class Brands extends PageManager {
  constructor() {
    super();

    this.$body = $(document.body);
    this.$container = this.$body.find('[data-brands-listing-wrapper]');
    this.$alphabeticalLayout = this.$container.find('[data-brand-listing-alphabetical]');
    this.$columnLayout = this.$container.find('[data-brand-listing-columns]');

    this._sortLayouts();
  }

  _sortLayouts() {
    if (this.$alphabeticalLayout.length > 0) {
      this._sortAlphabetical();
    } else if (this.$columnLayout.length > 0) {
      this._sortColumns();
    } else {
      return;
    }
  }

  _sortAlphabetical() {
    const $items = this.$alphabeticalLayout.find('.brand-item');
    const itemCount = $items.length;
    const letters = this._getAlphabetArray();

    letters.forEach((value, index, letters) => {
      const $itemsForLetter = $items.filter((i, el) => {
        const link = $(el).find('a');
        return link.text().charAt(0).toLowerCase() === value;
      });

      if($itemsForLetter.length > 0) {
        $itemsForLetter.wrapAll('<ul class="brand-alphabetical-list" data-alphabet-letter="' + value + '"></ul>');

        let $ulWithLetter = $('[data-alphabet-letter="' + value + '"]');
        $ulWithLetter.prepend('<li class="brand-item">' + value.toUpperCase() + '</li>');
      }
    });

    const $remainingItems = this.$alphabeticalLayout.find('> .brand-item').sort((a, b) => {
      return $(a).find('> a').text().toUpperCase().localeCompare($(b).find('> a').text().toUpperCase());
    });

    if($remainingItems.length > 0) {
      this.$alphabeticalLayout.prepend('<ul class="brand-alphabetical-list" data-alphabet-letter="numeric"></ul>');
      const $numericList = this.$alphabeticalLayout.find('[data-alphabet-letter="numeric"]');
      $numericList.append('<li class="brand-item">#</li>');

      $remainingItems.each((i, el) => {
        $numericList.append(el);
      });
    }
  }

  _sortColumns() {
    const $items = this.$columnLayout.find('.brand-item');
    const numberOfItems = $items.length;
    const columns = 3;
    const itemsPerColumn = Math.round(numberOfItems / columns);
    let currentIndex = 0;
    let orphanedListItems = numberOfItems % columns;

    while(currentIndex <= numberOfItems) {
      let futureIndex = currentIndex + itemsPerColumn;

      // if we have leftovers, add them in 'til there's none left
      if(orphanedListItems > 0) {
        futureIndex += 1;
        orphanedListItems -= 1;
      }

      $items.slice(currentIndex, futureIndex).wrapAll('<ul class="brand-column"></ul>');

      currentIndex = futureIndex;
    }
  }

  _getAlphabetArray() {
    const start = "a".charCodeAt(0);
    const finish = "z".charCodeAt(0);
    let array = [];

    for (let i = start; i <= finish; i++) {
      array.push(String.fromCharCode(i));
    }

    return array;
  }
}
