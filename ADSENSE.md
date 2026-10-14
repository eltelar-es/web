# AdSense: notas para la solicitud

Estado del repositorio (14-10-2026):

- Páginas legales enlazadas en el pie de todas las páginas: `privacidad.html`,
  `cookies.html`, `aviso-legal.html`, `terminos.html`, `sobre-nosotros.html`,
  `contacto.html` (formulario en forms.eltelar.es + contacto@eltelar.es).
- `robots.txt` permite todo y da acceso explícito a `Mediapartners-Google`.
- `sitemap.xml` incluye todas las páginas indexables.
- El `<head>` de cada página ya carga `adsbygoogle.js` con `ca-pub-8239907995939753`
  y Consent Mode v2 (todo "denied" por defecto hasta que el usuario acepta).

## ads.txt

Ya existe `ads.txt` en la raíz con:

```
google.com, pub-8239907995939753, DIRECT, f08c47fec0942fa0
```

Comprueba en AdSense (Cuenta > Información de la cuenta) que ese es TU ID de
editor. Si no lo es, sustituye la línea por:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

con tu ID real (16 dígitos). No subas nunca un ID inventado. Cambia también el
`client=ca-pub-...` del script de AdSense en el `<head>` de las páginas y en
`tools/prompts_chrome.html` para que coincidan.

## CMP obligatoria en el EEE / Reino Unido / Suiza

Desde 2024 Google exige que los sitios que muestran anuncios a usuarios del
EEE, Reino Unido y Suiza usen una **CMP certificada por Google** compatible con
el TCF v2.2. El banner propio de `js/cookie-consent.js` NO es una CMP
certificada. Opción más sencilla y gratuita:

1. En AdSense: **Privacidad y mensajes > Mensajes de consentimiento del RGPD
   (Europa)** y crea/publica el mensaje para eltelar.es.
2. Cuando el mensaje de Google esté activo, quitar o desactivar el banner propio
   para no pedir el consentimiento dos veces (y mantener el botón "Cambiar mi
   elección de cookies" apuntando a la CMP de Google:
   `googlefc.callbackQueue.push(googlefc.showRevocationMessage)`).

## Aviso legal (LSSI)

`aviso-legal.html` identifica el sitio como "El Telar" con correo de contacto.
La LSSI pide que el titular de un sitio con actividad económica (los anuncios
lo son) publique su nombre o razón social, NIF y domicilio. Decide tú si
añadirlos (por ejemplo, con los datos de una empresa o autónomo); por ahora no
se publica ningún dato personal.
