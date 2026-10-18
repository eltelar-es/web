// Portadas tipográficas: una por guía, con su número, su tema y el color de su tema.
(function () {
  function build() {
    document.querySelectorAll('#guide-grid .guide-card').forEach(function (c) {
      if (c.dataset.tc) return; c.dataset.tc = 1;
      var th = c.querySelector('.guide-thumb'); if (!th) return;
      var ref = (c.textContent.match(/Ref\.\s*#(\d+)/i) || [])[1] || '';
      var t = c.querySelector('.guide-topic'); var topic = t ? t.textContent.trim() : '';
      var cat = c.getAttribute('data-cat') || '';
      th.innerHTML = '<div class="tcov"><span class="tcov__k">El Telar · Guía</span><span class="tcov__n">' + ref + '</span><span class="tcov__t">' + (cat || topic) + '</span></div>';
      th.classList.remove('overflow-hidden');
    });
  }
  build();
  var g = document.getElementById('guide-grid');
  if (g) new MutationObserver(build).observe(g, { childList: true });
})();
