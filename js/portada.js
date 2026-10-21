// "En portada": la noticia más reciente con foto abre como en un periódico, junto a otras dos noticias y la guía más nueva.
// Todo sale de noticias/noticias.json y de las guías del archivo, así que se actualiza solo. Si algo falla, la sección queda oculta.
(function () {
  var sec = document.getElementById('portada');
  if (!sec) return;
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fecha(iso) {
    var d = new Date(iso + 'T12:00:00');
    return isNaN(d) ? '' : d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  }
  fetch('noticias/noticias.json').then(function (r) { return r.json(); }).then(function (list) {
    list = list.filter(function (n) { return n && n.slug && n.photo; })
      .sort(function (a, b) { return String(b.published || b.date).localeCompare(String(a.published || a.date)); });
    if (list.length < 3) throw 0;
    // En móvil la barra «Última hora» ya enseña la más reciente justo encima, así que la portada empieza por la siguiente.
    var off = window.matchMedia('(max-width: 639px)').matches ? 1 : 0;
    var lead = list[off], next = list.slice(off + 1, off + 3);
    var card = document.querySelector('#guide-grid .guide-card');
    var g = null;
    if (card) {
      var a = card.querySelector('h4') && card.querySelector('h4').closest('a');
      var t = card.querySelector('.guide-topic');
      var tc = t ? t.cloneNode(true) : null;
      if (tc && tc.querySelector('.material-symbols-outlined')) tc.querySelector('.material-symbols-outlined').remove();
      var m = card.querySelector('.font-serif.italic');
      g = { href: a ? a.getAttribute('href') : '#', title: card.querySelector('h4').textContent.trim(), topic: tc ? tc.textContent.trim() : '', mins: m ? m.textContent.trim() : '' };
    }
    function foto(n) { return 'img/noticias/fotos/' + n.slug + '.jpg'; }
    var alt = function (n) { return esc((n.photo && n.photo.alt) || ''); };
    var side = next.map(function (n) {
      return '<a class="portada__item" href="noticias/' + esc(n.slug) + '.html"><div><span class="portada__topic">Noticia · ' + esc(n.category) + '</span><h3>' + esc(n.title) + '</h3><span class="portada__meta">' + esc(fecha(n.published || n.date)) + '</span></div>' +
        '<img src="' + foto(n) + '" alt="' + alt(n) + '" width="104" height="78" loading="lazy" decoding="async"></a>';
    }).join('');
    if (false && g) side += '<a class="portada__item portada__item--guia" href="' + esc(g.href) + '"><div><span class="portada__topic">Guía nueva · ' + esc(g.topic) + '</span><h3>' + esc(g.title) + '</h3><span class="portada__meta">' + esc(g.mins) + '</span></div></a>';
    var now = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    sec.innerHTML =
      '<div class="portada__head"><span class="portada__kicker">En portada</span><span class="portada__date">' + esc(now) + '</span></div>' +
      '<div class="portada__grid">' +
        '<a class="portada__lead" href="noticias/' + esc(lead.slug) + '.html"><figure><img src="' + foto(lead) + '" alt="' + alt(lead) + '" width="1600" height="900" decoding="async"><figcaption>' + alt(lead) + '</figcaption></figure>' +
          '<span class="portada__topic">Noticia · ' + esc(lead.category) + '</span><h2>' + esc(lead.title) + '</h2><p>' + esc(lead.dek) + '</p><span class="portada__meta">' + esc(fecha(lead.published || lead.date)) + ' · Leer la noticia</span></a>' +
        '<div class="portada__side">' + side + '</div>' +
      '</div>';
    sec.hidden = false;
  }).catch(function () { /* sin portada */ });
})();
