# Hoy toca tianguis

Versión actual: **2.15** (noviembre 2026).

Mapa colaborativo de los tianguis de la Ciudad de México: https://hoytocatianguis.com

- `tianguis-web/`: el sitio estático tal como se publica (Netlify lo sirve sin build).
- Datos base: catálogo de tianguis de la ADIP (CDMX). Mapa base: © colaboradores de OpenStreetMap (ODbL).
- Datos comunitarios y cuentas: Supabase. La llave incluida en el código es la *publishable key*, pública por diseño; el acceso está protegido con RLS.

Cada cambio que llega a `main` se publica automáticamente.

## Novedades

### 2.15
- "Para pensar cosas": se quitó de "En preparación" el satélite con la muestra grande, que ya está publicado.

### 2.14
- **"Para pensar cosas" nueva**: `datos.html` es ahora la portada de la sección, con una ficha por análisis y su cifra principal. Sigue con contraseña.
- Análisis en `pensar/`: el km² con más tianguis (antes en `datos.html`), tianguis y comercio formal (DENUE y SEDECO), nivel socioeconómico con "¿De quién es la calle?" (Censo 2020 y Locatel), desiertos y pantanos alimentarios (DENUE, CONEVAL y defunciones del INEGI), la calle que se presta y los tianguis vistos desde el satélite Sentinel-2 (233 tianguis, 2017 a 2025).

### 2.13
- **Recorrido de bienvenida en el celular**: la primera vez que alguien abre el sitio desde el celular, un recorrido corto (como el de la app) ilumina cada botón: días, cerca de ti, buscar, la ficha, recomendar y la cuenta. Se puede saltar y volver a ver en "❓ Cómo usar el mapa". No sale en computadora, ni dentro de la app, ni cuando se llega con una liga a un tianguis.

### 2.12
- **Ficha de inicio nueva, "cerca de ti"**: en lugar de "Últimas recomendaciones" ahora muestra tres cosas: 📍 los tianguis que tocan hoy cerca (los 3 más cercanos, con horario, distancia y puestos), ⭐ recomendaciones a menos de 5 km con pestañas 🔥 Populares y 🆕 Nuevos, y 📷 fotos a menos de 5 km. Al tocar una recomendación o una foto se abre la ficha de su tianguis.
- Si la persona no ha dado permiso de ubicación, hay un botón "📍 Usar mi ubicación" y se muestran las recomendaciones y fotos más recientes de toda la ciudad. El sitio no vuelve a pedir el permiso por su cuenta.
- Se quitó el aviso "⭐ Toca aquí para ver las últimas recomendaciones", que repetía lo mismo.

### 2.11
- **Imágenes para compartir nuevas**: las 23 tarjetas de días y alcaldías (`og/`) usan la línea gráfica actual: logo del pin, franja de lonas, títulos en Lilita One con sombra del color de cada día y los puntos del mapa. JPEG normal (baseline) de menos de 80 KB, para que WhatsApp las muestre. Las páginas las piden con `?v=2` para que las redes no usen las viejas guardadas.
- **Ñ corregidas**: cuatro calles del catálogo de la ADIP salían con "Ã‘" en lugar de "Ñ" (Brasileños, Cañada, Peñasco). Ya se corrigieron en el mapa, el directorio y las páginas.
- **Aviso de privacidad para la app**: secciones de fotos, permisos de la app (ubicación, micrófono, cámara, avisos) y cómo eliminar tu cuenta (`privacidad.html#eliminar-cuenta`, la liga que pide Google Play).
- **Tomar foto con la cámara**: al subir una foto de un puesto o del tianguis hay un botón "📷 Tomar foto", que abre la cámara del celular, junto a "🖼️ Elegir de la galería". En computadora solo sale el de galería.

### 2.1
- **Fotos de la comunidad**: fotos del tianguis en general y de cada puesto. Se comprimen en el navegador y pierden el GPS. Pasan por un filtro automático (Google Cloud Vision). Hasta 3 por persona en cada puesto, 3 del tianguis y 10 al día. Botón para reportar. Salen en la ficha y en la página de cada tianguis.
- **Validación comunitaria**: los validadores revisan correcciones, tianguis nuevos y fotos en "🧐 Revisar cambios".
- **Recomendados**: se pueden ordenar por 🔥 Populares, ⬆️ Mejores, 🆕 Nuevos y 📍 Cerca.
- **Medallas nuevas**: 📸 Fotógrafo de tianguis (5 fotos) y 🧐 Validador.
- **Para pensar cosas**: disponible en celular y computadora, con contraseña.
- Aviso de privacidad actualizado (fotos y validadores).

Proyecto de Jorge González Mireles ([@GlezMireles](https://x.com/GlezMireles)).
