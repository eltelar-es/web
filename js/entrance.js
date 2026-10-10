(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function tag(el, variant, delay) {
    if (!el) return;
    el.classList.add('appear', variant);
    el.style.setProperty('--d', delay + 's');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var title = document.querySelector('.font-headline-lg');
    var lede = document.querySelector('.font-lead-paragraph');
    var byline = document.getElementById('copy-guide-btn');

    tag(title, 'appear--soft', 0.1);
    tag(lede, 'appear--soft', 0.32);
    if (byline) {
      var row = byline.closest('div');
      tag(row, 'appear--soft', 0.5);
    }

    // Scroll reveal: card grids (guide/noticia/herramienta listings) fade+lift
    // into place as they enter view, staggered by position within their row.
    if ('IntersectionObserver' in window) {
      var cards = Array.prototype.filter.call(
        document.querySelectorAll('.grid > article'),
        function (el) { return el.className.indexOf('col-span-8') === -1; }
      );
      if (cards.length) {
        var byParent = new Map();
        cards.forEach(function (card) {
          var siblings = byParent.get(card.parentElement) || 0;
          card.classList.add('reveal-up');
          card.style.transitionDelay = Math.min(siblings * 0.08, 0.32) + 's';
          byParent.set(card.parentElement, siblings + 1);
        });
        var io = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        cards.forEach(function (card) { io.observe(card); });
      }
    }
  });
})();
