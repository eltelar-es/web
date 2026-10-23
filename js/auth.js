// "Continuar con Google": entrar para llevar tus guías guardadas a todos tus dispositivos.
// Solo se activa cuando hay un ID de cliente de Google configurado. El script de Google
// se carga solo cuando el lector pulsa "Entrar".
(function () {
  var CLIENT_ID = 'PENDIENTE';
  if (!CLIENT_ID || CLIENT_ID === 'PENDIENTE') return;
  var API = 'https://forms.eltelar.es';
  var TOKEN_KEY = 'eltelar-auth', NAME_KEY = 'eltelar-auth-name', SAVED_KEY = 'ia-practica-guardadas';
  var trigger = document.getElementById('search-trigger');
  if (!trigger) return;

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; }
  function local() { try { return JSON.parse(ls(SAVED_KEY) || '[]'); } catch (e) { return []; } }
  function union(a, b) { var s = {}; return a.concat(b).filter(function (x) { return s[x] ? false : (s[x] = 1); }); }
  function api(path, opts) {
    opts = opts || {}; var h = { 'content-type': 'application/json' }, t = ls(TOKEN_KEY);
    if (t) h.authorization = 'Bearer ' + t;
    return fetch(API + path, { method: opts.method || 'GET', headers: h, body: opts.body ? JSON.stringify(opts.body) : undefined }).then(function (r) { return r.json().catch(function () { return { ok: false }; }); });
  }
  function pushSaved() { if (ls(TOKEN_KEY)) api('/api/saved', { method: 'PUT', body: { urls: local() } }); }

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'hidden sm:inline-block px-space-sm py-space-xs border border-outline-variant text-on-surface font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container transition-colors';
  trigger.insertAdjacentElement('afterend', btn);
  function paint() { var n = ls(TOKEN_KEY) && (ls(NAME_KEY) || 'tu cuenta'); btn.textContent = n ? 'Hola, ' + n : 'Entrar'; }
  paint();

  function modal(html) {
    var o = document.createElement('div');
    o.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(7,36,23,.6);display:flex;align-items:center;justify-content:center;padding:16px';
    o.innerHTML = '<div role="dialog" aria-modal="true" style="background:#f9f9ff;max-width:380px;width:100%;padding:28px;border-top:4px solid #fd8a42">' + html + '<button type="button" data-x style="margin-top:16px;font-size:12px;text-transform:uppercase;letter-spacing:.1em;text-decoration:underline">Cerrar</button></div>';
    o.addEventListener('click', function (e) { if (e.target === o || e.target.hasAttribute('data-x')) o.remove(); });
    document.body.appendChild(o); return o;
  }

  function onCredential(resp) {
    api('/api/auth/google', { method: 'POST', body: { credential: resp.credential } }).then(function (d) {
      if (!d.ok) { alert('No hemos podido iniciar sesión. Prueba de nuevo.'); return; }
      ls(TOKEN_KEY, d.token); ls(NAME_KEY, d.name || '');
      ls(SAVED_KEY, JSON.stringify(union(local(), d.saved || []))); pushSaved();
      try { if (window.gtag) window.gtag('event', 'login', { method: 'google' }); } catch (e) {}
      location.reload();
    });
  }

  function openLogin() {
    var m = modal('<h2 style="font-family:Newsreader,Georgia,serif;font-size:24px;margin-bottom:8px">Entrar en El Telar</h2><p style="font-size:14px;line-height:1.5;margin-bottom:16px">Guarda tus guías y llévalas a todos tus dispositivos. Solo guardamos tu nombre, tu correo y las guías que guardes. <a href="' + (location.pathname.indexOf('/', 1) > 0 ? '../' : '') + 'privacidad.html" style="text-decoration:underline">Privacidad</a>.</p><div id="g-btn"></div>');
    function render() {
      window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: onCredential, ux_mode: 'popup' });
      window.google.accounts.id.renderButton(m.querySelector('#g-btn'), { theme: 'outline', size: 'large', text: 'continue_with', locale: 'es', width: 300 });
    }
    if (window.google && window.google.accounts) return render();
    var s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = render; document.head.appendChild(s);
  }

  function openAccount() {
    var m = modal('<h2 style="font-family:Newsreader,Georgia,serif;font-size:24px;margin-bottom:8px">Tu cuenta</h2><p style="font-size:14px;line-height:1.5;margin-bottom:16px">Tus guías guardadas se sincronizan en los dispositivos donde entres.</p><button type="button" data-out style="display:block;margin-bottom:10px;text-decoration:underline">Salir</button><button type="button" data-del style="display:block;color:#ba1a1a;text-decoration:underline">Borrar mi cuenta y mis datos</button>');
    m.querySelector('[data-out]').onclick = function () { api('/api/auth/logout', { method: 'POST' }).then(function () { ls(TOKEN_KEY, null); ls(NAME_KEY, null); location.reload(); }); };
    m.querySelector('[data-del]').onclick = function () {
      if (!confirm('Se borrarán tu cuenta y tus guías guardadas del servidor. ¿Seguro?')) return;
      api('/api/account/delete', { method: 'POST' }).then(function () { ls(TOKEN_KEY, null); ls(NAME_KEY, null); location.reload(); });
    };
  }

  btn.addEventListener('click', function () { if (ls(TOKEN_KEY)) openAccount(); else openLogin(); });
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#save-guide-btn')) setTimeout(pushSaved, 400); });

  if (ls(TOKEN_KEY)) {
    api('/api/me').then(function (d) {
      if (d.error === 'auth') { ls(TOKEN_KEY, null); ls(NAME_KEY, null); paint(); return; }
      if (!d.ok) return;
      var merged = union(local(), d.saved || []);
      if (merged.length !== local().length) ls(SAVED_KEY, JSON.stringify(merged));
      if (merged.length !== (d.saved || []).length) pushSaved();
    });
  }
})();
