import utils from '@bigcommerce/stencil-utils';
import SelectWrapper from '../components/SelectWrapper';

export default function(didUpdate) {
  const $cartTotals = $('[data-cart-totals]');
  const $cartContent = $('[data-cart-content]');
  const $cartItem = $('[data-cart-item]', $cartContent);
  const options = {
    template: {
      content: 'cart/cart-item/cart-item-layout',
      totals: 'cart/cart-totals',
    },
  };

  utils.api.cart.getContent(options, (err, response) => {
    $cartContent.html(response.content);
    $cartTotals.html(response.totals);

    $(document).trigger('form-validation');

    if ($('[data-shipping-calculator] select').length) {
      const $select = $('[data-shipping-calculator] select');
      $select.each((i, el) => {
        new SelectWrapper(el);
      });
    }

    didUpdate();
  });
}
