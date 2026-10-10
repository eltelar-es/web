(function () {
  var KEY = 'ia-practica-guardadas';

  function getSaved() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }

  var saveBtn = document.getElementById('save-guide-btn');
  if (saveBtn) {
    var url = window.location.pathname;
    var icon = saveBtn.querySelector('.material-symbols-outlined');

    var render = function () {
      var isSaved = getSaved().indexOf(url) !== -1;
      if (icon) icon.textContent = isSaved ? 'bookmark' : 'bookmark_border';
      saveBtn.classList.toggle('text-primary', isSaved);
      saveBtn.title = isSaved ? 'Quitar de guardadas' : 'Guardar guía';
    };
    render();

    saveBtn.addEventListener('click', function () {
      var saved = getSaved();
      var idx = saved.indexOf(url);
      if (idx === -1) { saved.push(url); } else { saved.splice(idx, 1); }
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
      render();
    });
  }

  var linkBtn = document.getElementById('copy-link-btn');
  if (linkBtn) {
    linkBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href);
      var linkIcon = linkBtn.querySelector('.material-symbols-outlined');
      if (linkIcon) {
        var original = linkIcon.textContent;
        linkIcon.textContent = 'check';
        setTimeout(function () { linkIcon.textContent = original; }, 2000);
      }
    });
  }

  var firstSecLink = document.querySelector('nav a[href^="#sec-"], ol a[href^="#sec-"], ul a[href^="#sec-"]');
  var toc = firstSecLink ? firstSecLink.closest('nav, ol, ul') : null;
  var tocLinks = toc ? Array.prototype.slice.call(toc.querySelectorAll('a[href^="#sec-"]')) : [];

  if (toc && tocLinks.length) {
    var progressKey = 'ia-practica-progreso:' + window.location.pathname;

    var getDone = function () {
      try { return JSON.parse(localStorage.getItem(progressKey) || '[]'); } catch (e) { return []; }
    };
    var setDone = function (arr) {
      try { localStorage.setItem(progressKey, JSON.stringify(arr)); } catch (e) {}
    };

    var bar = document.createElement('div');
    bar.className = 'mb-space-sm';
    bar.innerHTML =
      '<div class="flex items-center justify-between font-caption text-caption text-on-surface-variant mb-1">' +
        '<span data-progreso-texto></span>' +
      '</div>' +
      '<div class="h-1.5 bg-surface-container-high w-full overflow-hidden">' +
        '<div data-progreso-barra class="h-full bg-primary transition-all" style="width:0%"></div>' +
      '</div>';
    toc.parentNode.insertBefore(bar, toc);
    var texto = bar.querySelector('[data-progreso-texto]');
    var barra = bar.querySelector('[data-progreso-barra]');

    var dots = {};
    tocLinks.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var dot = document.createElement('span');
      dot.className = 'inline-block w-2.5 h-2.5 rounded-full border border-outline-variant mr-2 align-middle shrink-0';
      a.insertBefore(dot, a.firstChild);
      dots[id] = dot;
    });

    var render = function () {
      var done = getDone();
      tocLinks.forEach(function (a) {
        var id = a.getAttribute('href').slice(1);
        var isDone = done.indexOf(id) !== -1;
        var dot = dots[id];
        dot.classList.toggle('bg-primary', isDone);
        dot.classList.toggle('border-primary', isDone);
      });
      var pct = Math.round((done.length / tocLinks.length) * 100);
      barra.style.width = pct + '%';
      texto.textContent = (done.length === tocLinks.length)
        ? 'Guía completada'
        : done.length + ' de ' + tocLinks.length + ' secciones leídas';
    };
    render();

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        var done = getDone();
        var changed = false;
        entries.forEach(function (entry) {
          if (entry.isIntersecting && done.indexOf(entry.target.id) === -1) {
            done.push(entry.target.id);
            changed = true;
          }
        });
        if (changed) { setDone(done); render(); }
      }, { rootMargin: '-40% 0px -50% 0px' });

      tocLinks.forEach(function (a) {
        var target = document.getElementById(a.getAttribute('href').slice(1));
        if (target) observer.observe(target);
      });
    }
  }
})();
