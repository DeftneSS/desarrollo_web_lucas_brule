const miembros = [
    { nombre: "Lucas", apellido: "Brule", email: "lucas.brule@ug.uchile.cl", telefono: "912345678", tipo: "Pregrado" },
    { nombre: "Ana", apellido: "Martínez", email: "ana.martinez@dcc.uchile.cl", telefono: "987654321", tipo: "Academico" },
    { nombre: "Pedro", apellido: "González", email: "pedro.gonzalez@gmail.com", telefono: "956781234", tipo: "Postgrado" },
    { nombre: "María", apellido: "López", email: "maria.lopez@uchile.cl", telefono: "923456789", tipo: "Funcionario" },
    { nombre: "Carlos", apellido: "Rojas", email: "carlos.rojas@ug.uchile.cl", telefono: "945678123", tipo: "Pregrado" },
    { nombre: "Sofía", apellido: "Pérez", email: "sofia.perez@ing.uchile.cl", telefono: "978123456", tipo: "Postgrado" },
    { nombre: "Diego", apellido: "Soto", email: "diego.soto@outlook.com", telefono: "934567812", tipo: "Funcionario" },
    { nombre: "Valentina", apellido: "Castro", email: "valentina.castro@dcc.uchile.cl", telefono: "967812345", tipo: "Academico" },
    { nombre: "Javier", apellido: "Muñoz", email: "javier.munoz@ug.uchile.cl", telefono: "923781456", tipo: "Pregrado" },
    { nombre: "Camila", apellido: "Vargas", email: "camila.vargas@hotmail.com", telefono: "956123478", tipo: "Pregrado" },
    { nombre: "Tomás", apellido: "Silva", email: "tomas.silva@yahoo.com", telefono: "987456123", tipo: "Postgrado" },
    { nombre: "Isidora", apellido: "Reyes", email: "isidora.reyes@uchile.cl", telefono: "945123678", tipo: "Funcionario" },
];

const FILAS_POR_PAGINA = 5;
let paginaActual = 1;
let miembrosFiltrados = [...miembros];

const aplicarFiltros = () => {
    const tipo = document.getElementById("filtro-tipo").value;
    const orden = document.getElementById("orden").value;

    miembrosFiltrados = tipo === "" ? [...miembros] : miembros.filter(m => m.tipo === tipo);

    const [campo, direccion] = orden.split("-");
    miembrosFiltrados.sort((a, b) => {
        const cmp = a[campo].localeCompare(b[campo], "es", { sensitivity: "base" });
        return direccion === "asc" ? cmp : -cmp;
    });

    paginaActual = 1;
    renderTabla();
};

const renderTabla = () => {
    const tbody = document.getElementById("tabla-miembros");
    tbody.innerHTML = "";

    const totalPaginas = Math.max(1, Math.ceil(miembrosFiltrados.length / FILAS_POR_PAGINA));
    paginaActual = Math.min(paginaActual, totalPaginas);

    const inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
    const visibles = miembrosFiltrados.slice(inicio, inicio + FILAS_POR_PAGINA);

    if (visibles.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 5;
        td.textContent = "No hay miembros que coincidan con el filtro.";
        td.style.textAlign = "center";
        tr.appendChild(td);
        tbody.appendChild(tr);
    } else {
        for (const m of visibles) {
            const tr = document.createElement("tr");
            for (const valor of [m.nombre, m.apellido, m.email, m.telefono, m.tipo]) {
                const td = document.createElement("td");
                td.textContent = valor;
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    }

    document.getElementById("info-pagina").textContent = `${paginaActual} de ${totalPaginas}`;
    document.getElementById("btn-prev").disabled = paginaActual <= 1;
    document.getElementById("btn-next").disabled = paginaActual >= totalPaginas;
};

const cambiarPagina = (delta) => {
    paginaActual += delta;
    renderTabla();
};

aplicarFiltros();
