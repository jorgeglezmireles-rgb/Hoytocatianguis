# Hoy toca tianguis

Mapa colaborativo de los tianguis de la Ciudad de México: https://hoytocatianguis.com

- `tianguis-web/`: el sitio estático tal como se publica (Netlify lo sirve sin build).
- Datos base: catálogo de tianguis de la ADIP (CDMX). Mapa base: © colaboradores de OpenStreetMap (ODbL).
- Datos comunitarios y cuentas: Supabase. La llave incluida en el código es la *publishable key*, pública por diseño; el acceso está protegido con RLS.

Cada cambio que llega a `main` se publica automáticamente.

Proyecto de Jorge González Mireles ([@GlezMireles](https://x.com/GlezMireles)).
