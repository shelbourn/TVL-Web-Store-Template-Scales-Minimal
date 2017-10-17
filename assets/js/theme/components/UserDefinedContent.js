import fitvids from 'fitvids';

export default class UserDefinedContent {
  constructor (el, options = {}) {
    this.$el = $(el);

    this.options = $.extend({
      maxContentWidth: 700,
      adjustedContentClass: 'extended-media'
    }, options);

    this._adjustLargerImages();
    fitvids();
  }

  _adjustLargerImages() {
    const $images = this.$el.find('img');

    $images.each((i, el) => {
      $('<img />').attr('src', $(el).attr('src')).on('load', (event) => {
        const realWidth = event.currentTarget.width;

        if (realWidth > this.options.maxContentWidth) {
          $(el).addClass('extended-media');
          $(el).parent('p').css('text-align', 'center');
        }
      });
    });
  }
}
