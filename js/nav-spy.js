(function () {
  var links = document.querySelectorAll('.nav-spy-link');
  if (!links.length || !('IntersectionObserver' in window)) return;

  var sections = [];
  links.forEach(function (link) {
    var id = link.getAttribute('data-nav-target');
    var section = document.getElementById(id);
    if (section) sections.push({ id: id, el: section, link: link });
  });
  if (!sections.length) return;

  function setActive(id) {
    links.forEach(function (link) {
      var isActive = link.getAttribute('data-nav-target') === id;
      link.classList.toggle('text-emerald-racing', isActive);
      link.classList.toggle('font-bold', isActive);
      link.classList.toggle('border-emerald-racing', isActive);
      link.classList.toggle('border-transparent', !isActive);
    });
  }

  var visible = {};
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      visible[entry.target.id] = entry.intersectionRatio;
    });
    var topId = null, topRatio = 0;
    sections.forEach(function (s) {
      var r = visible[s.id] || 0;
      if (r > topRatio) { topRatio = r; topId = s.id; }
    });
    // Fuera de las secciones vigiladas no se marca ninguna: antes se quedaba subrayada la última.
    setActive(topId);
  }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });

  sections.forEach(function (s) { observer.observe(s.el); });
})();
