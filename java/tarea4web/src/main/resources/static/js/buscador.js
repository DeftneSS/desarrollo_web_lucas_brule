const input = document.getElementById("busqueda");
const contenedor = document.getElementById("resultados");
const mensajeInicial = document.getElementById("mensaje-inicial");
const tablaTodas = document.getElementById("tabla-todas");

let timer = null;

input.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(ejecutarBusqueda, 250);
});

document.addEventListener("DOMContentLoaded", cargarTodasActividades);

async function ejecutarBusqueda() {
    const q = input.value.trim();
    if (q.length < 3) {
        contenedor.innerHTML = "";
        mensajeInicial.hidden = false;
        mensajeInicial.textContent = "Escribe al menos 3 caracteres para buscar.";
        return;
    }
    mensajeInicial.hidden = true;

    try {
        const url = "/api/actividades/buscar?q=" + encodeURIComponent(q);
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("Error: network response was not ok");
        }
        const datos = await res.json();
        renderResultados(datos, q);
    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = "<p class='error'>Ocurrió un error al buscar.</p>";
        throw error;
    }
}

async function cargarTodasActividades() {
    try {
        const res = await fetch("/api/actividades");
        if (!res.ok) {
            throw new Error("Error: network response was not ok");
        }
        const datos = await res.json();
        renderTablaTodas(datos);
    } catch (error) {
        console.error("Error:", error);
        tablaTodas.innerHTML = "<p class='error'>No se pudo cargar la lista de actividades.</p>";
        throw error;
    }
}

function renderResultados(datos, q) {
    if (!datos.length) {
        contenedor.innerHTML = "<p>No se encontraron actividades para \"" + escapeHtml(q) + "\".</p>";
        return;
    }
    const html = datos.map(function (r) {
        return crearTarjeta(r, q);
    }).join("");
    contenedor.innerHTML = html;
}

function renderTablaTodas(datos) {
    if (!datos.length) {
        tablaTodas.innerHTML = "<p>No hay actividades en la base de datos.</p>";
        return;
    }
    let html = "<table>" +
        "<thead><tr>" +
            "<th>ID</th>" +
            "<th>Nombre</th>" +
            "<th>Miembro</th>" +
            "<th>Día</th>" +
            "<th>Tipo</th>" +
            "<th>Comuna</th>" +
            "<th>Nota</th>" +
            "<th>Acción</th>" +
        "</tr></thead>" +
        "<tbody>";
    for (const a of datos) {
        const id = a.id;
        html += "<tr>" +
            "<td>" + escapeHtml(a.id) + "</td>" +
            "<td>" + escapeHtml(a.nombre) + "</td>" +
            "<td>" + escapeHtml(a.miembro) + "</td>" +
            "<td>" + escapeHtml(a.fecha) + "</td>" +
            "<td>" + escapeHtml(a.tipo) + "</td>" +
            "<td>" + escapeHtml(a.comuna) + "</td>" +
            "<td><span id='tabla-nota-" + id + "'>" + escapeHtml(a.nota) + "</span> " +
                "<small>(<span id='tabla-contador-" + id + "'>" + escapeHtml(a.cantidad_notas) + "</span>)</small></td>" +
            "<td><div class='evaluar-zona' id='tabla-evaluar-zona-" + id + "'>" +
                botonAccion(id, a.ya_evaluada === "true", "tabla") +
            "</div></td>" +
        "</tr>";
    }
    html += "</tbody></table>";
    tablaTodas.innerHTML = html;
}

function crearTarjeta(r, q) {
    const id = r.id;
    return "<article class='resultado' data-id='" + id + "'>" +
        "<h2>" + resaltar(r.nombre, q) + "</h2>" +
        "<p><strong>Miembro:</strong> " + escapeHtml(r.miembro) + "</p>" +
        "<p><strong>Día:</strong> " + escapeHtml(r.fecha) + "</p>" +
        "<p><strong>Tipo:</strong> " + escapeHtml(r.tipo) + "</p>" +
        "<p><strong>Comuna:</strong> " + resaltar(r.comuna, q) + "</p>" +
        "<p><strong>Descripción:</strong> " + resaltar(r.descripcion, q) + "</p>" +
        "<p class='nota-linea'>" +
            "<strong>Nota:</strong> <span id='nota-" + id + "'>" + escapeHtml(r.nota) + "</span> " +
            "<span class='cant-notas'>(" +
                "<span id='contador-" + id + "'>" + escapeHtml(r.cantidad_notas) + "</span> evaluaciones)" +
            "</span>" +
        "</p>" +
        "<div class='evaluar-zona' id='evaluar-zona-" + id + "'>" +
            botonAccion(id, r.ya_evaluada === "true", "card") +
        "</div>" +
        "</article>";
}

function botonAccion(id, yaEvaluada, contexto) {
    if (!window.HAY_SESION) {
        return "<span class='hint'>Inicia sesión para evaluar</span>";
    }
    if (yaEvaluada) {
        return "<button type='button' onclick=\"sacarNota(" + id + ")\">Sacar calificación</button>";
    }
    return "<button type='button' onclick=\"mostrarSelector(" + id + ", '" + contexto + "')\">Evaluar</button>";
}

function mostrarSelector(id, contexto) {
    const zonaId = (contexto === "tabla" ? "tabla-evaluar-zona-" : "evaluar-zona-") + id;
    const zona = document.getElementById(zonaId);
    let opciones = "";
    for (let i = 1; i <= 7; i++) {
        opciones += "<option value='" + i + "'>" + i + "</option>";
    }
    zona.innerHTML =
        "<label for='select-nota-" + contexto + "-" + id + "'>Nota (1-7):</label> " +
        "<select id='select-nota-" + contexto + "-" + id + "'>" + opciones + "</select> " +
        "<button type='button' onclick=\"enviarNota(" + id + ", '" + contexto + "')\">Guardar</button> " +
        "<button type='button' onclick=\"cancelarEvaluacion(" + id + ", '" + contexto + "')\">Cancelar</button>";
}

function cancelarEvaluacion(id, contexto) {
    const zonaId = (contexto === "tabla" ? "tabla-evaluar-zona-" : "evaluar-zona-") + id;
    const zona = document.getElementById(zonaId);
    zona.innerHTML = botonAccion(id, false, contexto);
}

async function enviarNota(id, contexto) {
    const select = document.getElementById("select-nota-" + contexto + "-" + id);
    const valor = parseInt(select.value, 10);
    if (!Number.isInteger(valor) || valor < 1 || valor > 7) {
        alert("La nota debe ser un entero entre 1 y 7.");
        return;
    }

    try {
        const url = "/api/actividades/" + id + "/notas";
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nota: valor }),
        });
        const datos = await res.json();
        if (!res.ok) {
            alert(datos.error || "Error al guardar la nota.");
            return;
        }
        actualizarNotaEnDom(id, datos.nota, datos.cantidad_notas, true);
    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión al guardar la nota.");
        throw error;
    }
}

async function sacarNota(id) {
    if (!confirm("¿Retirar tu evaluación de esta actividad?")) return;

    try {
        const url = "/api/actividades/" + id + "/notas";
        const res = await fetch(url, { method: "DELETE" });
        const datos = await res.json();
        if (!res.ok) {
            alert(datos.error || "Error al retirar la nota.");
            return;
        }
        actualizarNotaEnDom(id, datos.nota, datos.cantidad_notas, false);
    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión al retirar la nota.");
        throw error;
    }
}

function actualizarNotaEnDom(id, nota, cantidad, yaEvaluada) {
    const spanCard = document.getElementById("nota-" + id);
    if (spanCard) spanCard.textContent = nota;
    const contadorCard = document.getElementById("contador-" + id);
    if (contadorCard) contadorCard.textContent = cantidad;
    const zonaCard = document.getElementById("evaluar-zona-" + id);
    if (zonaCard) zonaCard.innerHTML = botonAccion(id, yaEvaluada, "card");

    const spanTabla = document.getElementById("tabla-nota-" + id);
    if (spanTabla) spanTabla.textContent = nota;
    const contadorTabla = document.getElementById("tabla-contador-" + id);
    if (contadorTabla) contadorTabla.textContent = cantidad;
    const zonaTabla = document.getElementById("tabla-evaluar-zona-" + id);
    if (zonaTabla) zonaTabla.innerHTML = botonAccion(id, yaEvaluada, "tabla");
}

function escapeHtml(s) {
    return String(s == null ? "" : s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function resaltar(texto, q) {
    const seguro = escapeHtml(texto);
    if (!q) return seguro;
    const regex = new RegExp("(" + escapeRegex(q) + ")", "gi");
    return seguro.replace(regex, "<mark>$1</mark>");
}
