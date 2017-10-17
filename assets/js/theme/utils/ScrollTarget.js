export default function ScrollTarget(ScrollTarget, $context) {
  const duration = 500;
  const easing = 'linear';
  $context = ($context ? $context : $('html, body'));

  $context.animate({
    scrollTop: $(ScrollTarget).offset().top,
  }, duration, easing);
}
