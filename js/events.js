// Eventos de medición (Google Analytics 4): qué guías se leen hasta el final, qué comandos se copian,
// cuándo se comparte y adónde salen los lectores. Solo se envían si hay gtag y el lector lo ha permitido.
(function () {
  // Inicio de sesión con Google (inactivo hasta que haya ID de cliente)
  var base = (document.currentScript && document.currentScript.src || '').replace(/events\.js.*$/, '');
  if (base) { var a = document.createElement('script'); a.src = base + 'auth.js?v=1'; a.defer = true; document.head.appendChild(a); }
  function ev(name, params) {
    try { if (typeof window.gtag === 'function') window.gtag('event', name, Object.assign({ page_path: location.pathname }, params || {})); } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('a,button'); if (!t) return;
    if (t.tagName === 'BUTTON' && /^\s*(copiar|copiado)\s*$/i.test(t.textContent)) { ev('copy_command'); return; }
    if (t.closest('[data-share-bar]')) { ev('share', { method: (t.textContent || 'más').trim().toLowerCase() }); return; }
    if (t.id === 'save-guide-btn') { ev('save_guide'); return; }
    if (t.tagName === 'A' && t.host && t.host !== location.host && /^https?:$/.test(t.protocol)) ev('outbound_click', { link_domain: t.host });
  }, true);
  var art = document.querySelector('article[class*="col-span-8"]');
  if (art) {
    var sent = {};
    var check = function () {
      var r = art.getBoundingClientRect(), total = art.offsetHeight || 1;
      var seen = Math.min(1, Math.max(0, (window.innerHeight - r.top) / total));
      [50, 90].forEach(function (p) { if (!sent[p] && seen >= p / 100) { sent[p] = 1; ev('read_' + p); } });
      if (sent[50] && sent[90]) window.removeEventListener('scroll', check);
    };
    window.addEventListener('scroll', check, { passive: true });
  }
  var q = document.getElementById('guide-q');
  if (q) { var tm; q.addEventListener('input', function () { clearTimeout(tm); tm = setTimeout(function () { if (q.value.trim().length > 2) ev('search_guides'); }, 1200); }); }
})();
