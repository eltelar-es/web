// Búsqueda tolerante compartida (buscador general y páginas de prompts): ignora palabras de relleno,
// junta variantes («resumir», «resumen») y sinónimos, y ordena por parecido en vez de exigir todas
// las palabras, para que una frase natural siempre encuentre el prompt más cercano.
(function () {
  var STOP = {};
  ('a al algo ante bien como con cual cuando de del desde donde el ella en entre es esa ese eso esta este esto estos hacer hay la las le les lo los mas me mi mis muy necesito ni no nos o para pero poco por puedo que quiero se sea ser si sin sobre su sus tambien te tengo tu tus un una uno unos unas usando utilizando y ya ayuda ayudame dame hazme haz quisiera prompt prompts ia chatgpt claude gemini forma manera cosa cosas tema temas mejor buen buena')
    .split(' ').forEach(function (w) { STOP[w] = 1; });
  var SYN = {
    resum: ['sintesis', 'sintetiz', 'esquema', 'resum'], present: ['diapositiv', 'charla', 'exposicion', 'presentacion'],
    diapositiv: ['present'], correo: ['email', 'mail'], email: ['correo'], mail: ['correo', 'email'],
    cv: ['curriculum'], curriculum: ['cv'], factur: ['recibo'], reclam: ['queja', 'reclamacion'], queja: ['reclam'],
    trabaj: ['empleo'], empleo: ['trabaj'], estudi: ['examen', 'apunte'], dinero: ['ahorr', 'gasto'],
    whatsapp: ['mensaje', 'chat'], important: ['clave', 'esencial', 'importante'], traduc: ['idioma'], negocio: ['empresa', 'cliente']
  };
  var SUF = ['aciones', 'amiento', 'imiento', 'adoras', 'adores', 'adora', 'ador', 'acion', 'amente', 'mente', 'idades', 'idad', 'ciones', 'cion', 'iendo', 'ando', 'ados', 'adas', 'idos', 'idas', 'ado', 'ada', 'ido', 'ida', 'ar', 'er', 'ir', 'es', 'as', 'os', 's', 'a', 'o', 'e'];
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function stem(w) {
    for (var i = 0; i < SUF.length; i++) { var s = SUF[i]; if (w.length - s.length >= 4 && w.slice(-s.length) === s) return w.slice(0, -s.length); }
    return w;
  }
  function terms(q) {
    var seen = {}, out = [];
    norm(q).split(/[^a-z0-9]+/).forEach(function (w) {
      if (w.length < 2 || STOP[w]) return;
      var st = stem(w); if (seen[st]) return; seen[st] = 1;
      out.push([st].concat((SYN[st] || SYN[w] || []).map(stem)));
    });
    return out;
  }
  function field(s) { return ' ' + norm(s).replace(/[^a-z0-9]+/g, ' ') + ' '; }
  function hit(f, alts) { for (var i = 0; i < alts.length; i++) if (f.indexOf(' ' + alts[i]) > -1) return true; return false; }
  // items: array; get(item) -> {t: title, m: description/meta, b: body} already passed through field().
  function rank(q, items, get) {
    var T = terms(q), list = [];
    if (!T.length) return { terms: 0, list: list };
    items.forEach(function (it) {
      var f = get(it), n = 0, s = 0;
      T.forEach(function (a) { var x = (hit(f.t, a) ? 10 : 0) + (hit(f.m, a) ? 4 : 0) + (f.b && hit(f.b, a) ? 1 : 0); if (x) { n++; s += x; } });
      if (n) list.push({ item: it, n: n, score: s, exact: n === T.length });
    });
    list.sort(function (a, b) { return b.n - a.n || b.score - a.score; });
    return { terms: T.length, list: list };
  }
  window.ETSearch = { norm: norm, field: field, terms: terms, rank: rank };
})();

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
    // Ranked by how many of the meaningful words match (title > description > body), not
    // all-or-nothing, so a whole sentence still lands on the closest guide or prompt.
    var E = window.ETSearch;
    var ranked = !q ? null : E.rank(qAlias || q, data, function (item) {
      return item._f || (item._f = {
        t: E.field(item.title),
        m: E.field(item.description + ' ' + item.category + ' ' + item.url + ' ' + (item.keywords ? item.keywords.join(' ') : '')),
        b: E.field(item.body || '')
      });
    });
    var matches = !ranked ? data : ranked.list.map(function (m) { return m.item; });
    emptyEl.style.display = matches.length > 0 ? 'none' : 'block';
    if (ranked && ranked.list.length && !ranked.list[0].exact) {
      var note = document.createElement('p');
      note.style.cssText = 'margin:0;padding:.75rem 1rem;font-size:13px;color:' + COLOR.textMuted + ';background:' + COLOR.hoverBg + ';';
      note.textContent = 'No hay una coincidencia exacta. Esto es lo más parecido:';
      resultsEl.appendChild(note);
    }
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
        (ranked && i === 0 ? '<span style="display:inline-block;margin:0 8px 4px 0;padding:2px 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;background:' + COLOR.primary + ';color:#fff;">Recomendado para ti</span>' : '') +
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
