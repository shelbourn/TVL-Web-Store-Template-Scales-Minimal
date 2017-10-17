import _ from 'lodash';

export default {
  priceWithoutTax: _.template(`
    <% if (price.without_tax) { %>
      <span class="product-price <% if (price.saved) { %>saved<% } %>" data-product-price>
        <%= price.without_tax.formatted %>
      </span>
    <% } %>

    <% if (price.rrp_without_tax) { %>
      <span class="product-price rrp" data-product-rrp>
        <%= price.rrp_without_tax.formatted %>
      </span>
    <% } %>
  `),

  priceWithTax: _.template(`
    <% if (price.with_tax) { %>
      <span class="product-price <% if (price.saved) { %>saved<% } %>" data-product-price>
        <%= price.with_tax.formatted %>
      </span>
    <% } %>

    <% if (price.rrp_with_tax) { %>
      <span class="product-price rrp" data-product-rrp>
        <%= price.rrp_with_tax.formatted %>
      </span>
    <% } %>
  `),

  priceSaved: _.template(`
    <% if (price.saved) { %>
      <span class="product-price-saved" data-product-price-saved>
        (<%= savedString %> <%= price.saved.formatted %>)
      </span>
    <% } %>
    `),
};
