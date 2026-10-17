// Sends every <form data-telar-form> to /api/form (see worker/index.js).
// data-ok points at the element shown on success; failures are reported under the form
// instead of pretending the message went through.
(function () {
  var NETWORK = 'No hemos podido conectar. Si estás en España y hay partido, algunos operadores bloquean temporalmente parte de internet: inténtalo de nuevo en un rato o escríbenos a contacto@eltelar.es';
  var FALLBACK = 'No se pudo enviar. Inténtalo de nuevo o escríbenos a contacto@eltelar.es';

  function showError(form, text) {
    var box = form.querySelector('[data-form-error]');
    if (!box) {
      box = document.createElement('p');
      box.setAttribute('data-form-error', '');
      box.setAttribute('role', 'alert');
      box.className = 'text-xs font-sans mt-2 w-full';
      box.style.color = '#b3261e';
      form.appendChild(box);
    }
    box.textContent = text;
  }

  document.querySelectorAll('form[data-telar-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var button = form.querySelector('[type="submit"]');
      var data = new FormData(form);
      data.set('page', location.pathname);
      if (button) button.disabled = true;

      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 12000) : null;
      fetch('https://forms.eltelar.es/api/form', { method: 'POST', body: data, signal: ctrl ? ctrl.signal : undefined })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            if (!res.ok || !body.ok) {
              throw new Error(body.error === 'email' ? 'Revisa la dirección de correo.' : FALLBACK);
            }
            return body;
          });
        })
        .then(function (body) {
          var ok = document.getElementById(form.getAttribute('data-ok'));
          // With the mailing service connected, the visitor still has to click the confirmation email.
          if (ok && body.confirm) ok.textContent = 'Casi listo: te hemos enviado un correo para confirmar la suscripción. Si no lo ves, mira en spam.';
          form.classList.add('hidden');
          if (ok) ok.classList.remove('hidden');
        })
        .catch(function (err) {
          var text = err && err.message;
          if (err && (err.name === 'AbortError' || err.name === 'TypeError')) text = NETWORK;
          showError(form, text === 'Revisa la dirección de correo.' || text === NETWORK ? text : FALLBACK);
        })
        .finally(function () {
          if (timer) clearTimeout(timer);
          if (button) button.disabled = false;
        });
    });
  });
})();
