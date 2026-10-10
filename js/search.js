(function () {
  var basePrefix = /\/(articulos|noticias|herramientas|prompts)\//.test(window.location.pathname) ? '../' : '';
  var indexUrl = basePrefix + 'js/search-index.json';
  var data = null;
  var overlay, input, resultsEl, emptyEl;

  var COLOR = {
    primary: '#072417',
    secondary: '#9b4500',
    text: '#181c23',
    textMuted: '#424843',
    border: '#c2c8c2',
    panelBg: '#ffffff',
    hoverBg: '#f1f3fe',
    backdrop: 'rgba(24,28,35,0.6)'
  };

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.className = 'fixed inset-0 z-50 hidden';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s ease';
    overlay.innerHTML =
      '<div id="search-backdrop" style="position:absolute;inset:0;background:' + COLOR.backdrop + ';"></div>' +
      '<div id="search-panel" class="relative max-w-2xl mx-auto mt-24 px-4" style="transform:translateY(-12px) scale(0.98);transition:transform 0.25s cubic-bezier(0.16,1,0.3,1);">' +
        '<div style="background:' + COLOR.panelBg + ';box-shadow:0 10px 40px rgba(0,0,0,0.25);border-radius:2px;">' +
          '<div style="display:flex;align-items:center;gap:0.75rem;padding:1rem;border-bottom:1px solid ' + COLOR.border + ';">' +
            '<span class="material-symbols-outlined" style="color:' + COLOR.textMuted + ';">search</span>' +
            '<input id="search-input" type="text" placeholder="Buscar en las guías…" autocomplete="off" style="width:100%;background:transparent;outline:none;border:none;font-size:17px;font-family:inherit;color:' + COLOR.text + ';" />' +
            '<button id="search-close" type="button" aria-label="Cerrar búsqueda" style="background:none;border:none;cursor:pointer;color:' + COLOR.textMuted + ';display:flex;"><span class="material-symbols-outlined">close</span></button>' +
          '</div>' +
          '<div id="search-results" style="max-height:60vh;overflow-y:auto;"></div>' +
          '<p id="search-empty" style="padding:1rem;font-size:13px;color:' + COLOR.textMuted + ';display:none;">Sin resultados. Prueba con otra palabra.</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    input = overlay.querySelector('#search-input');
    resultsEl = overlay.querySelector('#search-results');
    emptyEl = overlay.querySelector('#search-empty');

    overlay.querySelector('#search-backdrop').addEventListener('click', closeSearch);
    overlay.querySelector('#search-close').addEventListener('click', closeSearch);
    input.addEventListener('input', function () { render(input.value); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeSearch();
      if (e.key === '/' && overlay.classList.contains('hidden') && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        openSearch();
      }
    });
  }

  function normalize(str) {
    return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var QUERY_ALIASES = { crypto: 'cripto' };

  function render(query) {
    var q = normalize(query.trim());
    var qAlias = QUERY_ALIASES[q];
    resultsEl.innerHTML = '';
    if (!data) return;
    // Every word must appear somewhere; a hit in the title outranks the description,
    // which outranks the body, so "correo" puts the email guide first.
    var words = (qAlias || q).split(/\s+/).filter(Boolean);
    var matches = !q ? data : data.map(function (item) {
      var title = normalize(item.title);
      var meta = normalize(item.description + ' ' + item.category + ' ' + (item.keywords ? item.keywords.join(' ') : ''));
      var body = item.body ? normalize(item.body) : '';
      var score = 0;
      for (var i = 0; i < words.length; i++) {
        var w = words[i];
        var s = (title.indexOf(w) !== -1 ? 10 : 0) + (meta.indexOf(w) !== -1 ? 4 : 0) + (body.indexOf(w) !== -1 ? 1 : 0);
        if (!s) return null;
        score += s;
      }
      return { item: item, score: score };
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).map(function (m) { return m.item; });
    emptyEl.style.display = matches.length > 0 ? 'none' : 'block';
    matches.slice(0, 12).forEach(function (item, i) {
      var a = document.createElement('a');
      a.href = basePrefix + item.url;
      a.style.display = 'block';
      a.style.padding = '1rem';
      a.style.textDecoration = 'none';
      a.style.borderTop = i === 0 ? 'none' : '1px solid ' + COLOR.border;
      a.onmouseenter = function () { a.style.background = COLOR.hoverBg; };
      a.onmouseleave = function () { a.style.background = 'transparent'; };
      a.innerHTML =
        '<span style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:' + COLOR.secondary + ';">' + escapeHtml(item.category) + '</span>' +
        '<h3 style="font-size:17px;font-weight:500;color:' + COLOR.primary + ';margin:4px 0 2px;line-height:1.3;">' + escapeHtml(item.title) + '</h3>' +
        '<p style="font-size:13px;color:' + COLOR.textMuted + ';margin:0;line-height:1.4;">' + escapeHtml(item.description) + '</p>';
      resultsEl.appendChild(a);
    });
  }

  function openSearch() {
    if (!overlay) buildOverlay();
    overlay.classList.remove('hidden');
    var panel = overlay.querySelector('#search-panel');
    requestAnimationFrame(function () {
      overlay.style.opacity = '1';
      if (panel) panel.style.transform = 'translateY(0) scale(1)';
    });
    if (!data) {
      fetch(indexUrl, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (json) {
        data = json;
        render(input.value);
      }).catch(function () { data = []; });
    } else {
      render(input.value);
    }
    setTimeout(function () { input.focus(); }, 0);
  }

  function closeSearch() {
    var panel = overlay.querySelector('#search-panel');
    overlay.style.opacity = '0';
    if (panel) panel.style.transform = 'translateY(-12px) scale(0.98)';
    setTimeout(function () { overlay.classList.add('hidden'); }, 180);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var triggers = document.querySelectorAll('#search-trigger');
    triggers.forEach(function (btn) {
      btn.addEventListener('click', openSearch);
    });
  });
})();
