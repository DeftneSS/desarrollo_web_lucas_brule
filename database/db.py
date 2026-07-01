from datetime import datetime

from sqlalchemy import (
    create_engine, Column, Integer, String, Text, Date, DateTime, Enum, ForeignKey,
    TIMESTAMP, func,
)
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, joinedload


# --- Config ---
DB_NAME = "tarea2"
DB_USERNAME = "cc5002"
DB_PASSWORD = "programacionweb"
DB_HOST = "localhost"
DB_PORT = 3306
DB_CHARSET = "utf8"

DATABASE_URL = (
    f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset={DB_CHARSET}"
)

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


# --- Models ---
class Region(Base):
    __tablename__ = "region"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)

    comunas = relationship("Comuna", back_populates="region")


class Comuna(Base):
    __tablename__ = "comuna"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(200), nullable=False)
    region_id = Column(Integer, ForeignKey("region.id"), nullable=False)

    region = relationship("Region", back_populates="comunas")
    miembros = relationship("Miembro", back_populates="comuna")


class Miembro(Base):
    __tablename__ = "miembro"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
    apellido = Column(String(255), nullable=False)
    email = Column(String(80), nullable=False)
    telefono = Column(String(15), nullable=False)
    password = Column(String(255), nullable=False)
    tipo = Column(Enum("Pregrado", "Postgrado", "Funcionario", "Academico"), nullable=False)
    fecha_registro = Column(DateTime, nullable=False)
    comuna_id = Column(Integer, ForeignKey("comuna.id"), nullable=False)
    carrera = Column(String(255))
    anio_ingreso = Column(Integer)
    departamento = Column(String(255))
    cargo = Column(String(255))
    area_investigacion = Column(String(255))
    grado_academico = Column(Enum("Licenciado", "Magister", "Doctor"))

    comuna = relationship("Comuna", back_populates="miembros")
    actividades = relationship("Actividad", back_populates="miembro", cascade="all, delete")


class Actividad(Base):
    __tablename__ = "actividad"

    id = Column(Integer, primary_key=True, autoincrement=True)
    miembro_id = Column(Integer, ForeignKey("miembro.id"), nullable=False)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    fecha = Column(Date, nullable=False)
    hora_inicio = Column(String(5), nullable=False)
    hora_fin = Column(String(5), nullable=False)
    tipo = Column(Enum("Artistica", "Deportiva", "Tecnologica", "Social", "General"), nullable=False)
    link = Column(String(500))

    miembro = relationship("Miembro", back_populates="actividades")
    fotos = relationship("Foto", back_populates="actividad", cascade="all, delete")


class Foto(Base):
    __tablename__ = "foto"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ruta_archivo = Column(String(300), nullable=False)
    nombre_archivo = Column(String(300), nullable=False)
    actividad_id = Column(Integer, ForeignKey("actividad.id"), nullable=False)

    actividad = relationship("Actividad", back_populates="fotos")


class Comentario(Base):
    __tablename__ = "comentario"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(80), nullable=False)
    texto = Column(String(300), nullable=False)
    fecha = Column(TIMESTAMP, nullable=False, server_default=func.current_timestamp())
    actividad_id = Column(Integer, ForeignKey("actividad.id"), nullable=False)

    actividad = relationship("Actividad", backref="comentarios")


# --- Paginación ---
class Paginacion:
    def __init__(self, items, page, per_page, total):
        self.items = items
        self.page = page
        self.per_page = per_page
        self.total = total
        self.pages = max(1, (total + per_page - 1) // per_page)
        self.has_prev = page > 1
        self.has_next = page < self.pages
        self.prev_num = page - 1
        self.next_num = page + 1


# --- Database Functions ---

# region / comuna
def get_regiones():
    session = SessionLocal()
    regiones = session.query(Region).order_by(Region.nombre).all()
    session.close()
    return regiones


def get_comunas():
    session = SessionLocal()
    comunas = session.query(Comuna).order_by(Comuna.nombre).all()
    session.close()
    return comunas


def get_region_by_id(id):
    session = SessionLocal()
    region = session.query(Region).filter_by(id=id).first()
    session.close()
    return region


def get_comuna_by_id(id):
    session = SessionLocal()
    comuna = session.query(Comuna).filter_by(id=id).first()
    session.close()
    return comuna


# miembro - lectura
def get_miembro_by_id(id):
    session = SessionLocal()
    miembro = (
        session.query(Miembro)
        .options(
            joinedload(Miembro.comuna).joinedload(Comuna.region),
            joinedload(Miembro.actividades).joinedload(Actividad.fotos),
        )
        .filter_by(id=id)
        .first()
    )
    session.close()
    return miembro


def get_miembros_recientes(limit=5):
    session = SessionLocal()
    miembros = (
        session.query(Miembro)
        .order_by(Miembro.fecha_registro.desc())
        .limit(limit)
        .all()
    )
    session.close()
    return miembros


def get_todos_los_miembros():
    session = SessionLocal()
    miembros = session.query(Miembro).order_by(Miembro.apellido, Miembro.nombre).all()
    session.close()
    return miembros


def get_miembros_paginados(page, per_page=5, tipo=None, orden="nombre-asc"):
    session = SessionLocal()
    query = session.query(Miembro)
    if tipo:
        query = query.filter(Miembro.tipo == tipo)

    columnas_orden = {
        "nombre-asc": Miembro.nombre.asc(),
        "nombre-desc": Miembro.nombre.desc(),
        "apellido-asc": Miembro.apellido.asc(),
        "apellido-desc": Miembro.apellido.desc(),
        "email-asc": Miembro.email.asc(),
        "email-desc": Miembro.email.desc(),
    }
    query = query.order_by(columnas_orden.get(orden, Miembro.nombre.asc()))

    total = query.count()
    items = query.limit(per_page).offset((page - 1) * per_page).all()
    session.close()
    return Paginacion(items, page, per_page, total)


def miembro_existe(id):
    session = SessionLocal()
    existe = session.query(Miembro).filter_by(id=id).first() is not None
    session.close()
    return existe


def get_miembro_by_email(email):
    session = SessionLocal()
    m = session.query(Miembro).filter_by(email=email).first()
    session.close()
    return m


def verify_login(email, password):
    """Devuelve (True, miembro_id) si las credenciales son válidas,
    (False, mensaje) en caso contrario."""
    m = get_miembro_by_email(email)
    if m is None or m.password != password:
        return False, "Email o contraseña incorrectos."
    return True, m.id


# actividad - lectura
def get_actividad_by_id(id):
    session = SessionLocal()
    actividad = (
        session.query(Actividad)
        .options(
            joinedload(Actividad.miembro),
            joinedload(Actividad.fotos),
        )
        .filter_by(id=id)
        .first()
    )
    session.close()
    return actividad


# comentarios
def get_comentarios_by_actividad(actividad_id):
    session = SessionLocal()
    comentarios = (
        session.query(Comentario)
        .filter_by(actividad_id=actividad_id)
        .order_by(Comentario.fecha.desc())
        .all()
    )
    session.close()
    return comentarios


def create_comentario(data):
    session = SessionLocal()
    nuevo = Comentario(**data)
    session.add(nuevo)
    session.commit()
    new_id = nuevo.id
    fecha = nuevo.fecha
    session.close()
    return new_id, fecha


def register_comentario(data):
    try:
        data["fecha"] = datetime.now()
        new_id, fecha = create_comentario(data)
        return True, {"id": new_id, "fecha": fecha.isoformat() if fecha else None}
    except Exception as e:
        return False, f"Error al guardar el comentario: {e}"


# estadísticas
def stats_miembros_por_dia():
    session = SessionLocal()
    rows = (
        session.query(
            func.date(Miembro.fecha_registro).label("dia"),
            func.count(Miembro.id).label("total"),
        )
        .group_by(func.date(Miembro.fecha_registro))
        .order_by(func.date(Miembro.fecha_registro))
        .all()
    )
    session.close()
    return [{"dia": r.dia.isoformat(), "total": r.total} for r in rows]


def stats_actividades_por_tipo():
    session = SessionLocal()
    rows = (
        session.query(
            Actividad.tipo,
            func.count(Actividad.id).label("total"),
        )
        .group_by(Actividad.tipo)
        .all()
    )
    session.close()
    return [{"tipo": r.tipo, "total": r.total} for r in rows]


def stats_actividades_por_comuna():
    """Comunas para las cuales se han registrado miembros (vía INNER JOIN),
    con el total de actividades de esos miembros (vía OUTER JOIN para que las
    comunas con miembros pero sin actividades aparezcan con total = 0)."""
    session = SessionLocal()
    rows = (
        session.query(
            Comuna.nombre.label("comuna"),
            func.count(Actividad.id).label("total"),
        )
        .join(Miembro, Miembro.comuna_id == Comuna.id)
        .outerjoin(Actividad, Actividad.miembro_id == Miembro.id)
        .group_by(Comuna.id, Comuna.nombre)
        .order_by(Comuna.nombre)
        .all()
    )
    session.close()
    return [{"comuna": r.comuna, "total": r.total} for r in rows]


# miembro - escritura
def create_miembro(data):
    session = SessionLocal()
    nuevo = Miembro(**data)
    session.add(nuevo)
    session.commit()
    new_id = nuevo.id
    session.close()
    return new_id


def register_miembro(data):
    try:
        data["fecha_registro"] = datetime.now()
        new_id = create_miembro(data)
        return True, new_id
    except Exception as e:
        return False, f"Error al guardar el miembro: {e}"


# actividad - escritura
def create_actividad(data):
    session = SessionLocal()
    nueva = Actividad(**data)
    session.add(nueva)
    session.commit()
    new_id = nueva.id
    session.close()
    return new_id


def create_foto(ruta_archivo, nombre_archivo, actividad_id):
    session = SessionLocal()
    nueva = Foto(
        ruta_archivo=ruta_archivo,
        nombre_archivo=nombre_archivo,
        actividad_id=actividad_id,
    )
    session.add(nueva)
    session.commit()
    session.close()


def register_actividad(data, archivos_info):
    """archivos_info: lista de tuplas (ruta_archivo, nombre_archivo)."""
    try:
        actividad_id = create_actividad(data)
        for ruta, nombre in archivos_info:
            create_foto(ruta, nombre, actividad_id)
        return True, actividad_id
    except Exception as e:
        return False, f"Error al guardar la actividad: {e}"
