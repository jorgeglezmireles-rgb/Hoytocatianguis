(function () {
  var SB = 'https://ozygcsqqbuenkqvehrsg.supabase.co', KEY = 'sb_publishable_RxjU9aHhNWpuWi3Jm9AbMQ_tMTjTZxI';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var ICON = {'Comida preparada': '🌮', 'Frutas y verduras': '🥕', 'Para preparar': '🥩', 'Paca': '👕', 'Ropa y calzado nuevo': '👟', 'Belleza y uñas': '💅', 'Chácharas': '💿', 'Plantas y flores': '🌿', 'Hogar y cocina': '🍳', 'Herramientas y refacciones': '🔧', 'Electrónica y celulares': '📱', 'Artesanías y regalos': '🎁', 'Mascotas': '🐾', 'Servicios': '✂️', 'Otro': '📦', 'Comida': '🌮', 'Abasto': '🥕'};
  // Recomendaciones en vivo (si la página no las trae ya escritas)
  var ul = document.querySelector('[data-hallazgos]');
  if (ul && ul.getAttribute('data-static') !== '1' && window.fetch) {
    var id = ul.getAttribute('data-hallazgos');
    fetch(SB + '/rest/v1/hallazgos_publicos?select=*&tianguis_id=eq.' + encodeURIComponent(id) + '&order=votos.desc&limit=5',
      { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        if (!rows || !rows.length) return;
        ul.innerHTML = rows.map(function (h) {
          var pagos = Array.isArray(h.pago) ? h.pago.join(' · ') : (h.pago || '');
          return '<li>' + (h.cat ? '<span class="tag">' + (ICON[h.cat] || '') + ' ' + esc(({'Comida': 'Comida preparada', 'Abasto': 'Frutas y verduras'})[h.cat] || h.cat) + '</span>' : '') +
            '<h3>' + esc(h.titulo) + '</h3>' + (h.esquina ? '<p class="small">📍 ' + esc(h.esquina) + '</p>' : '') +
            (h.referencia_visual ? '<p class="small">👀 ' + esc(h.referencia_visual) + '</p>' : '') +
            (h.tip ? '<p class="tip">“' + esc(h.tip) + '”</p>' : '') +
            '<p class="small">' + esc(pagos) + ' · ▲ ' + (Number(h.votos) || 0) + ' puntos' + (h.alias ? ' · por ' + esc(h.alias) : '') + '</p></li>';
        }).join('');
        var e = document.querySelector('[data-empty]'); if (e) e.hidden = true;
      }).catch(function () {});
  }
  // Fotos aprobadas (si la página no las trae ya escritas)
  var fs = document.querySelector('[data-fotos]');
  if (fs && fs.getAttribute('data-static') !== '1' && window.fetch) {
    var fid = fs.getAttribute('data-fotos'), mapa = '/#t=' + encodeURIComponent(fid);
    var url = function (r) { return SB + '/storage/v1/object/public/fotos/' + String(r).split('/').map(encodeURIComponent).join('/'); };
    var fig = function (f) {
      var t = f.titulo || '', u = esc(url(f.ruta));
      var pie = t ? '<figcaption><a href="' + mapa + '">' + esc(t) + '</a>' + (f.alias ? ' · ' + esc(f.alias) : '') + '</figcaption>' : (f.alias ? '<figcaption>Foto de ' + esc(f.alias) + '</figcaption>' : '');
      return '<figure><a href="' + u + '" target="_blank" rel="noopener"><img src="' + u + '" alt="' + esc(t ? 'Foto de ' + t : 'Foto del tianguis') + '" loading="lazy" decoding="async"' + (f.ancho && f.alto ? ' width="' + (+f.ancho) + '" height="' + (+f.alto) + '"' : '') + '></a>' + pie + '</figure>';
    };
    fetch(SB + '/rest/v1/fotos_publicas?select=*&tianguis_id=eq.' + encodeURIComponent(fid) + '&order=creado.desc&limit=24',
      { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        if (!rows || !rows.length) return;
        var gen = rows.filter(function (f) { return !f.hallazgo_id; }), pue = rows.filter(function (f) { return f.hallazgo_id; });
        var g1 = fs.querySelector('[data-g=tianguis]'), g2 = fs.querySelector('[data-g=puesto]'), h3 = fs.querySelector('[data-g-titulo]');
        if (gen.length) { g1.innerHTML = gen.map(fig).join(''); g1.hidden = false; }
        if (pue.length) { g2.innerHTML = pue.map(fig).join(''); g2.hidden = false; h3.hidden = false; }
        fs.hidden = false;
      }).catch(function () {});
  }
  // Página /hoy/: arma la lista del día con la hora de la CDMX
  var box = document.querySelector('[data-hoy]');
  if (box && window.fetch) {
    var NOMBRES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    var hoy;
    try { hoy = new Intl.DateTimeFormat('es-MX', { weekday: 'long', timeZone: 'America/Mexico_City' }).format(new Date()).toLowerCase(); }
    catch (e) { hoy = NOMBRES[new Date().getDay()]; }
    var idx = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].indexOf(hoy);
    fetch('/static/semana.json?v=1').then(function (r) { return r.json(); }).then(function (S) {
      var d = S.dias[idx], bit = 1 << idx, grupos = {};
      S.t.forEach(function (t) { if (t[3] & bit) (grupos[t[2]] = grupos[t[2]] || []).push(t); });
      Object.keys(grupos).forEach(function (k) { grupos[k].sort(function (a, b) { return a[1].localeCompare(b[1], 'es'); }); });
      var orden = Object.keys(grupos).sort(function (a, b) { return grupos[b].length - grupos[a].length; });
      var total = orden.reduce(function (n, k) { return n + grupos[k].length; }, 0);
      var lead = document.querySelector('[data-hoy-lead]');
      if (lead) lead.innerHTML = 'Hoy es ' + esc(d.label.toLowerCase()) + ': se ponen <b>' + total + ' tianguis</b> en la Ciudad de México.';
      document.querySelectorAll('.daynav .day').forEach(function (a, i) { if (i === idx) a.classList.add('on'); });
      box.innerHTML = orden.map(function (k) {
        var a = S.alcaldias[k];
        return '<section class="block"><h2><a href="/alcaldia/' + a.slug + '/' + d.key + '/">' + esc(a.name) + '</a> <small>' + grupos[k].length + '</small></h2><ul class="list">' +
          grupos[k].map(function (t) { return '<li><a href="' + t[0] + '"><span class="n">' + esc(t[1]) + '</span><span class="m">' + esc(t[4]) + ' · ' + esc(t[5]) + '</span></a></li>'; }).join('') + '</ul></section>';
      }).join('');
    }).catch(function () { box.innerHTML = '<p>No se pudo cargar la lista. Elige el día arriba.</p>'; });
  }
})();
