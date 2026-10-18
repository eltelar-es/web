// Aparición al hacer scroll, línea que se dibuja bajo los títulos de sección y scroll suave.
(function () {
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var root = document.documentElement;
  var bar = document.createElement('div'); bar.id = 'mo-progress'; document.body.appendChild(bar);
  function prog() { var h = root.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%'; }
  addEventListener('scroll', prog, { passive: true }); prog();

  if (reduce || !('IntersectionObserver' in window)) return;
  var vh = innerHeight, targets = [];
  function add(el, d) { if (!el || el.classList.contains('mo')) return; if (el.getBoundingClientRect().top < vh * 0.9 && scrollY < 50) return; el.classList.add('mo'); el.style.setProperty('--mo-d', (d || 0) + 's'); targets.push(el); }
  // cabeceras de sección y su línea
  document.querySelectorAll('main section > div:first-child, main section > div > div:first-child').forEach(function (el) {
    if (el.querySelector('h2,h3') && el.className.indexOf('border-b-2') > -1) { add(el); el.classList.add('mo-rule'); }
  });
  // rejillas: los hijos entran escalonados
  ['#elige-camino .grid > a', '#prompts-teaser .grid > a', '#radar .grid > *', '#herramientas-teaser .grid > a', '#noticias-teaser .grid > *', '#sobre-nosotros .grid > *'].forEach(function (s) {
    document.querySelectorAll(s).forEach(function (el, i) { add(el, Math.min(i, 8) * 0.07); });
  });
  document.querySelectorAll('.portada__lead').forEach(function (el) { add(el); });
  document.querySelectorAll('.portada__item').forEach(function (el, i) { add(el, 0.15 + i * 0.1); });
  document.querySelectorAll('.gift-band__in,#despacho > *').forEach(function (el) { add(el); });
  root.classList.add('mo-on');
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('mo-in'); io.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  targets.forEach(function (el) { io.observe(el); });
  // las tarjetas de guías se crean/filtran por JS: se observan también
  var grid = document.getElementById('guide-grid');
  if (grid) {
    var seen = new WeakSet();
    var feed = function () { grid.querySelectorAll('.guide-card').forEach(function (c, i) { if (seen.has(c)) return; seen.add(c); if (c.getBoundingClientRect().top < vh && scrollY < 50) return; c.classList.add('mo'); c.style.setProperty('--mo-d', (i % 3) * 0.08 + 's'); io.observe(c); }); };
    feed(); new MutationObserver(feed).observe(grid, { childList: true });
  }
  // tras cualquier mutación del DOM (portada que carga después), vuelve a mirar
  var sec = document.getElementById('portada');
  if (sec) new MutationObserver(function () { sec.querySelectorAll('.portada__lead,.portada__item').forEach(function (el, i) { if (el.classList.contains('mo')) return; el.classList.add('mo'); el.style.setProperty('--mo-d', (i * 0.1) + 's'); io.observe(el); }); }).observe(sec, { childList: true });
})();
