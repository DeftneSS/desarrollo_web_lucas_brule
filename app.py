import os
import hashlib
from datetime import datetime

from flask import Flask, render_template, request, redirect, url_for, flash, session
from werkzeug.utils import secure_filename
import filetype

from database import db
from utils.validations import (
    validate_register_miembro,
    validate_register_actividad,
    TIPOS_USUARIO,
)


UPLOAD_FOLDER = "static/uploads"

app = Flask(__name__)
app.secret_key = "tarea2"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 50 * 1000 * 1000

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# --- Auth helpers ---
def current_miembro():
    """Devuelve el miembro logueado (o None)."""
    mid = session.get("miembro_id")
    if not mid:
        return None
    return db.get_miembro_by_id(mid)


@app.context_processor
def inject_user():
    """Expone `user` en todos los templates."""
    return {"user": current_miembro()}


# --- Routes ---
@app.route("/")
def index():
    miembros = db.get_miembros_recientes(5)
    return render_template("index.html", miembros=miembros)


@app.route("/login", methods=["GET", "POST"])
def login():
    if session.get("miembro_id"):
        return redirect(url_for("index"))

    if request.method == "POST":
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")
        status, result = db.verify_login(email, password)
        if status:
            session["miembro_id"] = result
            flash("Sesión iniciada.", "success")
            return redirect(url_for("index"))
        return render_template("login.html", error=result, email=email), 400

    return render_template("login.html", error=None, email="")


@app.route("/logout")
def logout():
    session.pop("miembro_id", None)
    flash("Sesión cerrada.", "success")
    return redirect(url_for("index"))


@app.route("/registro", methods=["GET", "POST"])
def registro():
    if session.get("miembro_id"):
        return redirect(url_for("index"))

    regiones = db.get_regiones()
    comunas = db.get_comunas()

    if request.method == "POST":
        f = request.form
        errores = validate_register_miembro(f)

        # Validaciones que requieren BD (region/comuna deben existir y coincidir)
        if not errores:
            region_id = int(f["region_id"])
            comuna_id = int(f["comuna_id"])
            if db.get_region_by_id(region_id) is None:
                errores.append("Región")
            comuna = db.get_comuna_by_id(comuna_id)
            if comuna is None or comuna.region_id != region_id:
                errores.append("Comuna")

        # Email único
        if not errores and db.get_miembro_by_email(f["email"].strip()) is not None:
            errores.append("Correo Electrónico (ya está registrado)")

        if errores:
            return render_template("registro.html", regiones=regiones, comunas=comunas,
                                   errores=errores, form_data=f.to_dict()), 400

        tipo = f["type"]
        data = {
            "nombre": f["name"].strip(),
            "apellido": f["lastname"].strip(),
            "email": f["email"].strip(),
            "telefono": f["phone"].strip(),
            "password": f["password"],
            "tipo": tipo,
            "comuna_id": int(f["comuna_id"]),
            "carrera": f.get("carrera", "").strip() if tipo in ("Pregrado", "Postgrado") else None,
            "anio_ingreso": int(f["anio-ingreso"]) if tipo in ("Pregrado", "Postgrado") else None,
            "departamento": f.get("departamento", "").strip() if tipo == "Funcionario" else None,
            "cargo": f.get("cargo", "").strip() if tipo == "Funcionario" else None,
            "area_investigacion": f.get("area", "").strip() if tipo == "Academico" else None,
            "grado_academico": f.get("grado") if tipo == "Academico" else None,
        }

        status, result = db.register_miembro(data)
        if status:
            session["miembro_id"] = result  # auto-login
            flash(f"Miembro {data['nombre']} {data['apellido']} registrado correctamente.", "success")
            return redirect(url_for("index"))

        errores.append(result)
        return render_template("registro.html", regiones=regiones, comunas=comunas,
                               errores=errores, form_data=f.to_dict()), 400

    # GET
    return render_template("registro.html", regiones=regiones, comunas=comunas,
                           errores=[], form_data={})


@app.route("/actividades", methods=["GET", "POST"])
def actividades():
    if "miembro_id" not in session:
        flash("Debes iniciar sesión para registrar actividades.", "error")
        return redirect(url_for("login"))

    miembro_id = session["miembro_id"]

    if request.method == "POST":
        f = request.form
        archivos = request.files.getlist("file")
        errores = validate_register_actividad(f, archivos, miembro_id_from_session=miembro_id)

        if errores:
            return render_template("actividades.html",
                                   errores=errores, form_data=f.to_dict()), 400

        # Guardar archivos: hash sha256 del filename + extensión detectada por filetype
        archivos_validos = [a for a in archivos if a and a.filename]
        archivos_info = []
        for archivo in archivos_validos:
            _filename = hashlib.sha256(
                secure_filename(archivo.filename).encode("utf-8")
            ).hexdigest()
            kind = filetype.guess(archivo)
            _extension = kind.extension if kind else archivo.filename.rsplit(".", 1)[-1]
            archivo.stream.seek(0)
            img_filename = f"{_filename}.{_extension}"
            ruta = os.path.join(app.config["UPLOAD_FOLDER"], img_filename)
            archivo.save(ruta)
            archivos_info.append((ruta.replace("\\", "/"), archivo.filename))

        data = {
            "miembro_id": miembro_id,
            "nombre": f["name"].strip(),
            "descripcion": f["description"].strip(),
            "fecha": datetime.strptime(f["date"], "%Y-%m-%d").date(),
            "hora_inicio": f["time-start"],
            "hora_fin": f["time-end"],
            "tipo": f["tipo"],
            "link": f.get("link", "").strip() or None,
        }

        status, result = db.register_actividad(data, archivos_info)
        if status:
            flash(f"Actividad '{data['nombre']}' registrada con {len(archivos_info)} archivo(s).", "success")
            return redirect(url_for("index"))

        errores.append(result)
        return render_template("actividades.html",
                               errores=errores, form_data=f.to_dict()), 400

    # GET
    return render_template("actividades.html", errores=[], form_data={})


@app.route("/listado")
def listado():
    page = request.args.get("page", 1, type=int)
    if page < 1:
        page = 1
    tipo = request.args.get("tipo", "").strip()
    orden = request.args.get("orden", "nombre-asc").strip()

    tipo_filtro = tipo if tipo in TIPOS_USUARIO else None
    paginacion = db.get_miembros_paginados(page=page, per_page=5, tipo=tipo_filtro, orden=orden)

    return render_template("listado.html", paginacion=paginacion,
                           tipo=tipo_filtro or "", orden=orden)


@app.route("/miembro/<int:id>")
def miembro_detalle(id):
    miembro = db.get_miembro_by_id(id)
    if miembro is None:
        flash("El miembro solicitado no existe.", "error")
        return redirect(url_for("listado"))
    return render_template("miembro_detalle.html", miembro=miembro)


@app.route("/estadisticas")
def estadisticas():
    return render_template("estadisticas.html")


if __name__ == "__main__":
    app.run(debug=True)
