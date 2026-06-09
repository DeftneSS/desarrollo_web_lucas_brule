
function validarTextoComentario(texto) {
    if (!texto) return false;
    const t = texto.trim();
    return t.length >= 5 && t.length <= 300;
}

function escapeHtml(s) {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function mostrarErroresComentario(mensajes) {
    const box = document.getElementById("val-box-comentario");
    const items = mensajes.map(function (m) { return "<li>" + escapeHtml(m) + "</li>"; }).join("");
    box.innerHTML =
        "<h3 style='color:#721c24;font-size:1.05em;margin-bottom:8px;'>Los siguientes campos son inválidos:</h3>" +
        "<ul style='color:#721c24;list-style-position:inside;'>" + items + "</ul>";
    box.style.background = "#f8d7da";
    box.style.border = "1px solid #721c24";
    box.style.color = "#721c24";
    box.style.padding = "12px";
    box.style.marginBottom = "15px";
    box.style.borderRadius = "5px";
    box.hidden = false;
}

function ocultarErroresComentario() {
    const box = document.getElementById("val-box-comentario");
    box.hidden = true;
    box.innerHTML = "";
}

function renderComentarios(comentarios) {
    const cont = document.getElementById("lista-comentarios");
    if (!comentarios.length) {
        cont.innerHTML = "<p>Aún no hay comentarios. ¡Sé el primero!</p>";
        return;
    }
    const html = comentarios.map(function (c) {
        return "<article class='comentario'>" +
            "<p class='comentario-meta'>" +
                "Comentario de <strong>" + escapeHtml(c.nombre) + "</strong> · " +
                "<span>" + escapeHtml(c.fecha || "") + "</span>" +
            "</p>" +
            "<p>" + escapeHtml(c.texto) + "</p>" +
            "</article>";
    }).join("");
    cont.innerHTML = html;
}

async function fetchJSON(url, options) {
    try {
        const res = await fetch(url, options);

        if (!res.ok) {
            throw new Error("Error: network response was not ok");
        }

        const datos = await res.json();
        return datos;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

const ACTIVIDAD_ID = document.querySelector("main").dataset.actividadId;

async function cargarComentarios() {
    const url = `/api/actividades/${ACTIVIDAD_ID}/comentarios`;
    try {
        const datos = await fetchJSON(url);
        renderComentarios(datos);
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("lista-comentarios").innerHTML =
            "<p style='color:#721c24;'>Error al cargar comentarios.</p>";
        throw error;
    }
}

async function agregarComentario() {
    const texto = document.getElementById("com-texto").value;

    if (!validarTextoComentario(texto)) {
        mostrarErroresComentario(["Texto del comentario (entre 5 y 300 caracteres)"]);
        return;
    }

    const url = `/api/actividades/${ACTIVIDAD_ID}/comentarios`;
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texto: texto.trim() }),
        });

        const datos = await res.json().catch(function () { return {}; });

        if (res.ok) {
            ocultarErroresComentario();
            document.getElementById("com-texto").value = "";
            await cargarComentarios();
            return;
        }

        if (datos.errores) {
            mostrarErroresComentario(datos.errores);
            return;
        }

        throw new Error("Error: network response was not ok");
    } catch (error) {
        console.error("Error:", error);
        if (!document.getElementById("val-box-comentario").innerHTML) {
            mostrarErroresComentario(["Error de conexión al servidor."]);
        }
        throw error;
    }
}

document.addEventListener("DOMContentLoaded", cargarComentarios);
