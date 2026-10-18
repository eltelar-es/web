(function () {
  var STORAGE_KEY = 'eltelar-cookie-consent';
  var basePrefix = /\/(articulos|noticias|herramientas|prompts)\//.test(window.location.pathname) ? '../' : '';

  var COLOR = {
    primary: '#072417',
    secondary: '#9b4500',
    accent: '#fd8a42',
    cream: '#f9f9ff',
    muted: '#9bb3a5',
    border: 'rgba(249,249,255,0.18)'
  };
  var SERIF = "'Newsreader', Georgia, serif";
  var SANS = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

  window.eltelarConsent = {
    get: function () {
      try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    },
    isAccepted: function () {
      return window.eltelarConsent.get() === 'accepted';
    }
  };

  // Tell Google tags about the choice (the page sets everything to "denied" by default, see <head>).
  function applyConsent(value) {
    var g = value === 'accepted' ? 'granted' : 'denied';
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { ad_storage: g, ad_user_data: g, ad_personalization: g, analytics_storage: g });
    }
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.requestNonPersonalizedAds = g === 'granted' ? 0 : 1;
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
    applyConsent(value);
    document.dispatchEvent(new CustomEvent('eltelar-consent-change', { detail: value }));
  }

  function buildBanner() {
    var bar = document.createElement('div');
    bar.id = 'cookie-consent-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Aviso de cookies');
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:60;background:' + COLOR.primary + ';border-top:2px solid ' + COLOR.accent + ';box-shadow:0 -12px 32px rgba(0,0,0,0.28);transform:translateY(100%);transition:transform 0.35s cubic-bezier(0.16,1,0.3,1);';
    bar.innerHTML =
      '<div style="max-width:1240px;margin:0 auto;padding:20px 24px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px;">' +
        '<div style="display:flex;align-items:flex-start;gap:14px;flex:1;min-width:260px;">' +
          '<div style="flex-shrink:0;width:34px;height:34px;border:1px solid ' + COLOR.accent + ';display:flex;align-items:center;justify-content:center;font-family:' + SERIF + ';font-weight:700;color:' + COLOR.accent + ';font-size:14px;">ET</div>' +
          '<div>' +
            '<span style="display:block;font-family:' + SANS + ';font-size:10.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:' + COLOR.accent + ';margin-bottom:4px;">Aviso de cookies</span>' +
            '<p style="margin:0;font-family:' + SERIF + ';font-size:16px;line-height:1.5;color:' + COLOR.cream + ';font-style:italic;max-width:560px;">' +
              'Usamos cookies para medir el tráfico y, cuando esté activa la publicidad, mostrar anuncios de Google AdSense. ' +
              '<a href="' + basePrefix + 'privacidad.html#cookies" style="color:' + COLOR.accent + ';font-style:normal;text-decoration:underline;text-underline-offset:2px;">Más información sobre las cookies</a>' +
            '</p>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;flex-shrink:0;">' +
          '<button id="cookie-reject" type="button" style="font-family:' + SANS + ';font-size:11.5px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:11px 20px;border:1px solid ' + COLOR.border + ';background:transparent;color:' + COLOR.cream + ';cursor:pointer;transition:border-color 0.2s,color 0.2s;" onmouseover="this.style.borderColor=\'' + COLOR.cream + '\'" onmouseout="this.style.borderColor=\'' + COLOR.border + '\'">Rechazar</button>' +
          '<button id="cookie-accept" type="button" style="font-family:' + SANS + ';font-size:11.5px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:11px 22px;border:1px solid ' + COLOR.accent + ';background:' + COLOR.accent + ';color:' + COLOR.primary + ';cursor:pointer;transition:filter 0.2s;" onmouseover="this.style.filter=\'brightness(1.08)\'" onmouseout="this.style.filter=\'none\'">Aceptar</button>' +
        '</div>' +
      '</div>';
    var st = document.createElement('style');
    st.id = 'cookie-consent-compact';
    st.textContent = '@media (max-width:640px){#cookie-consent-bar>div{padding:12px 16px!important;gap:10px!important}#cookie-consent-bar>div>div:first-child>div:first-child{display:none!important}#cookie-consent-bar span[style*="uppercase"]{display:none!important}#cookie-consent-bar p{font-size:13.5px!important;line-height:1.4!important}#cookie-consent-bar>div>div:last-child{width:100%}#cookie-consent-bar button{flex:1;padding:10px 14px!important}}';
    document.head.appendChild(st);
    document.body.appendChild(bar);

    document.getElementById('cookie-accept').addEventListener('click', function () {
      setConsent('accepted');
      hideBanner(bar);
    });
    document.getElementById('cookie-reject').addEventListener('click', function () {
      setConsent('rejected');
      hideBanner(bar);
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { bar.style.transform = 'translateY(0)'; });
    });
    return bar;
  }

  function showBanner() {
    var existing = document.getElementById('cookie-consent-bar');
    var bar = existing || buildBanner();
    if (existing) {
      requestAnimationFrame(function () { bar.style.transform = 'translateY(0)'; });
    }
  }

  function hideBanner(bar) {
    bar.style.transform = 'translateY(100%)';
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.eltelarConsent.get()) {
      showBanner();
    }
    var reopenBtn = document.getElementById('reopen-cookie-consent');
    if (reopenBtn) {
      reopenBtn.addEventListener('click', showBanner);
    }
  });
})();
