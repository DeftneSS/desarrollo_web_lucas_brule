"""Validaciones de formularios. Replican las reglas de static/validador.js."""

import re
from datetime import datetime

DOMINIOS_PERMITIDOS = {
    "uchile.cl", "ing.uchile.cl", "dcc.uchile.cl", "ug.uchile.cl",
    "gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com",
}

TIPOS_USUARIO = {"Pregrado", "Postgrado", "Funcionario", "Academico"}
GRADOS = {"Licenciado", "Magister", "Doctor"}
TIPOS_ACTIVIDAD = {"Artistica", "Deportiva", "Tecnologica", "Social", "General"}

MIME_IMAGE_VIDEO_PREFIXES = ("image/", "video/")

EMAIL_RE = re.compile(r"^[\w.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$")
HORA_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
FECHA_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
LINK_RE = re.compile(r"^https?://.+")


# --- Validaciones por campo ---
def validar_nombre(s):
    return bool(s) and len(s.strip()) >= 2 and not re.search(r"\s{2,}", s)


def validar_apellido(s):
    return bool(s) and s.strip() != "" and not re.search(r"\s{2,}", s)


def validar_email(s):
    if not s or s.strip() == "" or "@" not in s or "." not in s:
        return False
    if s.count("@") != 1:
        return False
    if not EMAIL_RE.match(s):
        return False
    dominio = s.split("@")[1]
    return dominio in DOMINIOS_PERMITIDOS


def validar_telefono(s):
    return bool(s) and bool(re.fullmatch(r"\d{9}", s))


def validar_password(s):
    if not s or s.strip() == "" or len(s) < 6 or re.search(r"\s", s):
        return False
    return bool(re.search(r"[A-Z]", s)) and bool(re.search(r"\d", s))


def validar_tipo_usuario(s):
    return s in TIPOS_USUARIO


def validar_anio(n):
    try:
        v = int(n)
    except (TypeError, ValueError):
        return False
    return 1900 <= v <= 2030


def validar_grado(s):
    return s in GRADOS


def validar_texto_simple(s):
    return bool(s) and len(s.strip()) >= 2


def validar_fecha(s):
    if not s or not FECHA_RE.match(s):
        return False
    try:
        datetime.strptime(s, "%Y-%m-%d")
        return True
    except ValueError:
        return False


def validar_hora(s):
    return bool(s) and bool(HORA_RE.match(s))


def validar_rango_horario(inicio, fin):
    return validar_hora(inicio) and validar_hora(fin) and inicio < fin


def validar_tipo_actividad(s):
    return s in TIPOS_ACTIVIDAD


def validar_link(s):
    if not s:
        return True  # opcional
    return bool(LINK_RE.match(s))


def validar_archivo(filestorage):
    if not filestorage or not filestorage.filename:
        return False
    mime = (filestorage.mimetype or "").lower()
    return mime.startswith(MIME_IMAGE_VIDEO_PREFIXES)


def validar_id_int(s):
    try:
        v = int(s)
        return v > 0
    except (TypeError, ValueError):
        return False


# --- Validación de formularios completos (estilo aux) ---
def validate_register_miembro(form):
    """Devuelve lista de errores. Vacía = válido."""
    errores = []

    if not validar_nombre(form.get("name", "")):
        errores.append("Nombre")
    if not validar_apellido(form.get("lastname", "")):
        errores.append("Apellido")
    if not validar_email(form.get("email", "")):
        errores.append("Correo Electrónico")
    if not validar_telefono(form.get("phone", "")):
        errores.append("Número de Teléfono")
    if not validar_password(form.get("password", "")):
        errores.append("Contraseña")

    tipo = form.get("type", "")
    if not validar_tipo_usuario(tipo):
        errores.append("Tipo de Usuario")

    if not validar_id_int(form.get("region_id", "")):
        errores.append("Región")
    if not validar_id_int(form.get("comuna_id", "")):
        errores.append("Comuna")

    if tipo in ("Pregrado", "Postgrado"):
        if not validar_texto_simple(form.get("carrera", "")):
            errores.append("Carrera")
        if not validar_anio(form.get("anio-ingreso", "")):
            errores.append("Año de Ingreso")
    elif tipo == "Funcionario":
        if not validar_texto_simple(form.get("departamento", "")):
            errores.append("Departamento")
        if not validar_texto_simple(form.get("cargo", "")):
            errores.append("Cargo")
    elif tipo == "Academico":
        if not validar_texto_simple(form.get("area", "")):
            errores.append("Área de Investigación")
        if not validar_grado(form.get("grado", "")):
            errores.append("Grado Académico")

    return errores


def validate_register_actividad(form, archivos, miembro_id_from_session=None):
    """Devuelve lista de errores. Vacía = válido.

    Si `miembro_id_from_session` se entrega, se asume que la actividad
    pertenece al usuario logueado y no se valida el campo `miembro_id` del form.
    """
    errores = []

    if miembro_id_from_session is None:
        if not validar_id_int(form.get("miembro_id", "")):
            errores.append("Miembro")
    if not validar_texto_simple(form.get("name", "")):
        errores.append("Nombre de la Actividad")
    if not validar_texto_simple(form.get("description", "")):
        errores.append("Descripción")
    if not validar_fecha(form.get("date", "")):
        errores.append("Fecha")
    if not validar_hora(form.get("time-start", "")):
        errores.append("Hora de Inicio")
    if not validar_hora(form.get("time-end", "")):
        errores.append("Hora de Término")
    if validar_hora(form.get("time-start", "")) and validar_hora(form.get("time-end", "")) \
       and not validar_rango_horario(form["time-start"], form["time-end"]):
        errores.append("Rango horario (la hora de término debe ser posterior al inicio)")
    if not validar_tipo_actividad(form.get("tipo", "")):
        errores.append("Tipo de Actividad")
    if form.get("link") and not validar_link(form["link"]):
        errores.append("Link")

    archivos_validos = [a for a in archivos if a and a.filename]
    if not archivos_validos:
        errores.append("Archivo (al menos una foto o video)")
    else:
        for a in archivos_validos:
            if not validar_archivo(a):
                errores.append(f"Archivo inválido: {a.filename}")
                break

    return errores
