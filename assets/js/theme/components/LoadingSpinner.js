export default function($scope, overlay, opaque = false) {
  const $body = $(document.body);
  const $loadingOverlay = $('.loading-overlay');
  const opaqueClass = opaque ? ' opaque' : '';

  $body.toggleClass('is-loading');
  $('.loading-overlay-progress').toggleClass('visible');

  if (overlay) {
    if ($body.hasClass('is-loading')) {
      $scope.prepend(`
        <div class='loading-overlay${opaqueClass}'>
          <div class="loading-spinner">
            <div class="loading-spinner-shape step-1"></div>
            <div class="loading-spinner-shape step-2"></div>
            <div class="loading-spinner-shape step-4"></div>
            <div class="loading-spinner-shape step-3"></div>
          </div>
        </div>
      `);

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
