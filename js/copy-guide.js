(function () {
  var btn = document.getElementById('copy-guide-btn');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var article = document.querySelector('article.post') || document.getElementById('article-content') || document.querySelector('article');
    if (!article) return;
    var clone = article.cloneNode(true);
    clone.querySelectorAll('.ad-slot, .relacionados, [class*="ad-"]').forEach(function (el) { el.remove(); });
    var text = (document.title.split('|')[0].trim() + '\n\n' + clone.innerText.trim())
      .replace(/\n{3,}/g, '\n\n');
    navigator.clipboard.writeText(text).then(function () {
      var original = btn.textContent;
      btn.textContent = '✓ Copiado — pégalo en Claude, ChatGPT...';
      btn.classList.add('is-copied');
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove('is-copied');
      }, 2200);
    });
  });
})();
