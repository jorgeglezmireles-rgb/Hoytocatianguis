// /hoy.json — los tianguis que se ponen hoy en la CDMX (hora de America/Mexico_City).
// Pensado para los widgets de la app: una sola consulta ligera, cacheada en la CDN de Netlify.
//
// Junta tres fuentes, igual que el mapa:
//   1. El catálogo ADIP (catalogo.mjs, generado por fuente/build/hoy_catalogo.py).
//   2. Lo que vive en Supabase: tianguis de la comunidad aprobados (tianguis_comunidad),
//      correcciones aprobadas (correcciones_aplicadas: horario, días, nombre, calles, "ya no se pone"...)
//      y recomendaciones publicadas (hallazgos_publicos: cuántas hay y con qué se paga).
//   3. Si Supabase no responde, entrega solo el catálogo y lo avisa con "supabase": false.
//
// Parámetro opcional para pruebas: /hoy.json?dia=lunes (o martes, miercoles, ... domingo).
import catalogo from './catalogo.mjs';

const SB = 'https://ozygcsqqbuenkqvehrsg.supabase.co';
const KEY = 'sb_publishable_RxjU9aHhNWpuWi3Jm9AbMQ_tMTjTZxI'; // llave publicable: pública por diseño, solo lee lo que RLS deja ver
const ZONA = 'America/Mexico_City';
const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const DIAS_TXT = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HUNDIDO = -3; // igual que en el mapa: con -3 puntos o menos una recomendación se colapsa
const SITIO = 'https://hoytocatianguis.com';

const SMALL = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'en', 'entre']);
const titleCase = s => String(s || '').toLowerCase().replace(/(^|[\s(.\/-])([a-záéíóúñü])/g, (m, a, b) => a + b.toUpperCase())
  .split(' ').map((w, i) => i > 0 && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : w).join(' ');

function ahoraEnCDMX(now = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA, weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).formatToParts(now).map(x => [x.type, x.value]));
  const seg = (+p.hour) * 3600 + (+p.minute) * 60 + (+p.second);
  return { dia: EN.indexOf(p.weekday), fecha: `${p.year}-${p.month}-${p.day}`, faltan: Math.max(60, 86400 - seg) };
}

// Punto a la mitad del recorrido, sobre la calle (igual que trazoCentro del mapa)
function centro(v) {
  const k = Math.cos(19.4 * Math.PI / 180), d = (p, q) => Math.hypot(p[0] - q[0], (p[1] - q[1]) * k);
  const segs = v.filter(s => s.length >= 2); let total = 0;
  for (const s of segs) for (let i = 1; i < s.length; i++) total += d(s[i - 1], s[i]);
  if (!total) return v.flat()[0];
  let falta = total / 2;
  for (const s of segs) for (let i = 1; i < s.length; i++) {
    const l = d(s[i - 1], s[i]);
    if (l && falta <= l) { const f = falta / l; return [s[i - 1][0] + (s[i][0] - s[i - 1][0]) * f, s[i - 1][1] + (s[i][1] - s[i - 1][1]) * f]; }
    falta -= l;
  }
  const u = segs[segs.length - 1]; return u[u.length - 1];
}
const trazoValido = v => Array.isArray(v) && v.some(s => Array.isArray(s) && s.length >= 2);

async function sb(path) {
  const r = await fetch(`${SB}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, signal: AbortSignal.timeout(5000)
  });
  if (!r.ok) throw new Error(`${path.split('?')[0]}: HTTP ${r.status}`);
  return r.json();
}
// Supabase entrega como máximo 1000 filas por consulta: pide de mil en mil
async function sbTodo(path) {
  const out = [];
  for (let off = 0; ; off += 1000) {
    const rows = await sb(`${path}&limit=1000&offset=${off}`);
    out.push(...rows);
    if (rows.length < 1000) return out;
  }
}

function desdeCatalogo() {
  const C = catalogo.campos;
  return catalogo.tianguis.map(a => {
    const t = Object.fromEntries(C.map((c, i) => [c, a[i]]));
    t.fuente = 'adip';
    return t;
  });
}

function desdeComunidad(row) {
  const calles = row.calle ? row.calle + (row.entre1 ? ` entre ${row.entre1}${row.entre2 ? ' y ' + row.entre2 : ''}` : '') : '';
  let lat = row.lat, lng = row.lng;
  if (trazoValido(row.trazo)) [lat, lng] = centro(row.trazo);
  return {
    id: 'com-' + row.id, nombre: row.nombre || `Tianguis ${titleCase(row.colonia || row.calle)}`,
    colonia: titleCase(row.colonia || ''), alcaldia: titleCase(row.alcaldia || ''), calles,
    dias: row.dias, horario: `${row.hora_inicio}–${row.hora_fin}`, latitud: lat, longitud: lng,
    puestos: row.puestos || 0, pagina: `/tianguis/comunidad/?id=${encodeURIComponent(row.id)}`, fuente: 'comunidad'
  };
}

// Misma lógica que aplicarCorreccion() del mapa
function corregir(t, row) {
  const d = row.datos || {};
  if (d.lat && d.lng) { t.latitud = d.lat; t.longitud = d.lng; }
  if (d.ubicacion) t.calles = d.ubicacion;
  if (d.nombre) t.nombre = d.nombre;
  if (d.dias) t.dias = d.dias;
  if (d.horario) t.horario = d.horario;
  if (d.colonia) t.colonia = titleCase(d.colonia);
  if (d.alcaldia) t.alcaldia = titleCase(d.alcaldia);
  if (d.puestos) t.puestos = d.puestos;
  if (d.cerrado) t.cerrado = true;
  if (trazoValido(d.trazo) && !(d.lat && d.lng)) [t.latitud, t.longitud] = centro(d.trazo);
  t.corregido = true;
}

export async function armarHoy({ dia, fecha }) {
  const todos = desdeCatalogo();
  let supabase = true; const avisos = [];
  const intenta = async (nombre, fn) => { try { return await fn(); } catch (e) { supabase = false; avisos.push(`${nombre}: ${e.message}`); return []; } };

  const [comunidad, correcciones] = await Promise.all([
    intenta('tianguis_comunidad', () => sbTodo('tianguis_comunidad?select=*&order=id')),
    intenta('correcciones_aplicadas', () => sbTodo('correcciones_aplicadas?select=tianguis_id,datos,creado&order=creado.asc'))
  ]);
  for (const row of comunidad) if (row && row.id && row.lat != null) todos.push(desdeComunidad(row));
  const porId = new Map(todos.map(t => [t.id, t]));
  for (const row of correcciones) { const t = porId.get(row.tianguis_id); if (t) corregir(t, row); }

  const hoy = todos.filter(t => (t.dias & (1 << dia)) && !t.cerrado && t.latitud != null);

  // Recomendaciones publicadas de los tianguis de hoy
  const recos = new Map();
  const ids = hoy.map(t => t.id);
  const lotes = []; for (let i = 0; i < ids.length; i += 120) lotes.push(ids.slice(i, i + 120));
  // Si Supabase ya falló arriba, no lo hagas esperar otra vez
  const filas = !supabase ? [] : (await Promise.all(lotes.map(l => intenta('hallazgos_publicos',
    () => sbTodo(`hallazgos_publicos?select=tianguis_id,pago,votos&tianguis_id=in.(${l.map(encodeURIComponent).join(',')})&order=id`))))).flat();
  for (const h of filas) {
    if (Number(h.votos) <= HUNDIDO) continue;
    const r = recos.get(h.tianguis_id) || { n: 0, pago: new Set() };
    r.n++; for (const p of (Array.isArray(h.pago) ? h.pago : h.pago ? [h.pago] : [])) r.pago.add(p);
    recos.set(h.tianguis_id, r);
  }

  const tianguis = hoy.map(t => {
    const r = recos.get(t.id);
    const [hora_inicio = '', hora_fin = ''] = String(t.horario || '').split(/[–-]/);
    const pagina = t.pagina || '';
    return {
      id: t.id,
      slug: t.fuente === 'adip' && pagina ? pagina.split('/').filter(Boolean).pop() : t.id,
      nombre: t.nombre, colonia: t.colonia, alcaldia: t.alcaldia, calles: t.calles,
      horario: t.horario, hora_inicio, hora_fin,
      latitud: +(+t.latitud).toFixed(6), longitud: +(+t.longitud).toFixed(6),
      puestos: t.puestos || 0,
      metodos_pago: r ? [...r.pago].sort() : [],
      recomendaciones: r ? r.n : 0,
      tiene_recomendaciones: !!r,
      fuente: t.fuente, corregido: !!t.corregido,
      url: SITIO + (t.fuente === 'adip' && pagina ? pagina : `/?t=${encodeURIComponent(t.id)}`),
      mapa: `${SITIO}/?t=${encodeURIComponent(t.id)}`
    };
  });

  return {
    fecha, dia: DIAS_TXT[dia], zona_horaria: ZONA, generado: new Date().toISOString(),
    supabase, ...(avisos.length ? { avisos } : {}), total: tianguis.length, tianguis
  };
}

export default async (req) => {
  const ahora = ahoraEnCDMX();
  const pedido = new URL(req.url).searchParams.get('dia');
  const fijo = !pedido ? -1 : DIAS.indexOf(pedido.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''));
  const dia = fijo >= 0 ? fijo : ahora.dia;
  const body = await armarHoy({ dia, fecha: ahora.fecha });

  // Cache: hasta 15 min en la CDN (5 min en el teléfono), pero nunca más allá de la medianoche de la CDMX
  // cuando se pide "hoy". Si Supabase falló, solo 1 min para reintentar pronto.
  const tope = fijo >= 0 ? 3600 : ahora.faltan;
  const cdn = Math.min(body.supabase ? 900 : 60, tope);
  const swr = Math.max(0, Math.min(120, tope - cdn));
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': `public, max-age=${Math.min(300, cdn)}`,
      'Netlify-CDN-Cache-Control': `public, durable, s-maxage=${cdn}${swr ? `, stale-while-revalidate=${swr}` : ''}`,
      'Netlify-Vary': 'query=dia'
    }
  });
};

export const config = { path: '/hoy.json' };
