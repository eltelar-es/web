(function () {
  var article = document.querySelector('main article.lg\\:col-span-8');
  if (!article) return;

  var bar = document.createElement('div');
  bar.id = 'reading-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:0%;background:#fd8a42;z-index:60;transition:width 0.1s linear;';
  document.body.appendChild(bar);

  var ticking = false;

  function update() {
    ticking = false;
    var rect = article.getBoundingClientRect();
    var articleTop = rect.top + window.scrollY;
    var articleHeight = rect.height;
    var viewport = window.innerHeight;
    var scrolled = window.scrollY - articleTop + viewport * 0.4;
    var total = articleHeight;
    var pct = total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0;
    bar.style.width = pct + '%';
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
