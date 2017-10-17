export default function($scope, overlay) {
  const $body = $(document.body);
  const $loadingOverlay = $('.loading-overlay');

  $body.toggleClass('is-loading');
  $('.loading-overlay-progress').toggleClass('visible');

  if (overlay) {
    if ($body.hasClass('is-loading')) {
      $scope.prepend(`<div class='loading-overlay'><div class='loading-overlay-progress'><span>`);

      setTimeout(() => {
        $('.loading-overlay').addClass('visible');
      }, 10);
    } else {
      $loadingOverlay.removeClass('visible').one('trend', () => {
        $loadingOverlay.remove();
      });
    }
  }
}
