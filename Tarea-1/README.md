## Tarea 1 - Desarrollo Web - Lucas Brule

Prototipo del sistema de gestión de actividades del DCC. Solo archivos HTML/CSS/JS, sin backend.

### Archivos

- `index.html` — pantalla de inicio con navegación a todas las secciones.
- `registro.html` — formulario de registro de miembros. Los campos del formulario se ajustan dinámicamente según el tipo de usuario (Pregrado/Postgrado/Funcionario/Académico).
- `actividades.html` — formulario para registrar una actividad (nombre, descripción, fecha, hora inicio/término, tipo, foto o video, enlace).
- `listado.html` + `listado.js` — listado de miembros con filtro por tipo, ordenamiento (nombre, apellido, correo, ambas direcciones) y paginación (5 por página). Los datos son una muestra hardcodeada porque el enunciado indica que no es necesario almacenar información.
- `estadisticas.html` — gráficos sobre miembros y actividades. Las imágenes son estáticas (cake_graph.jpg, bar_graph.jpg, grafico_torta.jpg) ya que es solo un prototipo de interfaz.
- `styles.css` — estilos globales del sistema.
- `validador.js` — validaciones de los formularios (registro y actividades). Toda la validación se hace en JavaScript ya que el atributo `required` no cuenta como validación según el enunciado.

### Decisiones de diseño

- **Campos condicionales en registro.html**: según el tipo de usuario seleccionado se muestran campos extras acordes a su función (carrera y año de ingreso para estudiantes, departamento y cargo para funcionarios, área de investigación y grado académico para académicos).
- **Datos de muestra en listado.js**: como no hay backend ni almacenamiento, el listado opera sobre un arreglo de miembros de ejemplo. El filtrado, ordenamiento y paginación funcionan completamente en cliente.
- **Validaciones**: todas las reglas de validación (correo con dominio permitido, contraseña con mayúscula + número + mínimo 6 caracteres, teléfono de 9 dígitos, rango horario coherente, archivo solo foto/video, URL con http/https) están implementadas en `validador.js` y se ejecutan al hacer clic en el botón de envío.
- **Sin atributo `required`**: removido de todos los inputs porque no cuenta como validación. El usuario podría dejar campos vacíos y el sistema responde con la lista de campos inválidos.
