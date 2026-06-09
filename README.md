# Tarea 3 — Desarrollo Web — Lucas Brule

## Decisiones de diseño

- **Esquema SQL extendido (Tarea 2)**: se mantienen los datos de Tarea 1 (apellido, password, tipo + campos condicionales por tipo, link en actividad, fecha + hora_fin en lugar de día + duración) como columnas adicionales a `miembro` y `actividad`.
- **Tabla `comentario` (Tarea 3)**: se crea con el script `database/tabla-comentario.sql` provisto en el enunciado, sin modificaciones.
- **Vista de actividad separada `/actividad/<id>`**: el enunciado pide "agregar comentario cuando se visualiza una actividad". Se creó una vista dedicada para cada actividad (en vez de meter los comentarios dentro de `/miembro/<id>`).
- **Highcharts** para los 3 gráficos de estadísticas. Se carga desde el CDN oficial (`https://code.highcharts.com/highcharts.js`).
- **Llamadas async con `fetch`** (no XHR crudo): los comentarios y los 3 gráficos consumen endpoints JSON del servidor (`/api/...`). El form de comentarios NO hace submit tradicional — JS valida, hace `POST` async y refresca el listado sin recargar.
- **Nombre del comentarista asociado al usuario logueado**: el form de comentarios sólo pide el texto; el nombre se toma de `session["miembro_id"]` para evitar suplantación. Esto desvía del enunciado (pide "caja de texto" para nombre), pero se documenta como decisión consciente de seguridad.
- **Password en texto plano**: el enunciado no exige hashing; en un sistema real se hashearía.
- **Archivos**: se guardan en `static/uploads/` con nombre `sha256(filename) + extensión_detectada_por_filetype`.

## Cómo levantar

1. Cargar la BD en MySQL
2. Instalar dependencias: `py -m pip install -r requirements.txt`
3. Levantar: `flask run`
