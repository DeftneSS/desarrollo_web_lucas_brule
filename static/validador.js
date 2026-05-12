const dominiosPermitidos = [
    "uchile.cl",
    "ing.uchile.cl",
    "dcc.uchile.cl",
    "ug.uchile.cl",
    "gmail.com",
    "outlook.com",
    "hotmail.com",
    "yahoo.com",
    "icloud.com",
];

const validarMail = (email) => {
    if (!email || email.trim() === "" ||
        !email.includes("@") || !email.includes(".") ||
        email.split("@").length > 2) {
        return false;
    }

    if (!/^[\w.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email)) {
        return false;
    }

    const dominio = email.split("@")[1];
    return dominiosPermitidos.includes(dominio);
};

const validarNombre = (name) => {
    if (!name || name.trim().length < 2 || /\s{2,}/.test(name)) {
        return false;
    }
    return true;
};

const validarApellido = (lastName) => {
    if (!lastName || lastName.trim() === "" || /\s{2,}/.test(lastName)) {
        return false;
    }
    return true;
};

const validarPassword = (password) => {
    if (!password || password.trim() === "" ||
        password.length < 6 || /\s/.test(password)) {
        return false;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        return false;
    }
    return true;
};

const validarTelefono = (phoneNumber) => {
    return /^\d{9}$/.test(phoneNumber || "");
};

const validarSelect = (value) => {
    return !!value && value !== "";
};

const validarTextoSimple = (texto) => {
    return !!texto && texto.trim().length >= 2;
};

const validarAnio = (anio) => {
    if (!anio) return false;
    const n = Number(anio);
    return Number.isInteger(n) && n >= 1900 && n <= 2030;
};

const validarArchivos = (fileList) => {
    if (!fileList || fileList.length < 1 || fileList.length > 3) return false;
    for (const f of fileList) {
        const tipo = (f.type || "").split("/")[0];
        if (tipo !== "image" && tipo !== "video") return false;
    }
    return true;
};

const validarLink = (link) => {
    if (!link || link.trim() === "") return true; // opcional
    return /^https?:\/\/.+/.test(link);
};

const validarHora = (hora) => {
    if (!hora) return false;
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
};

const validarRangoHorario = (inicio, fin) => {
    if (!validarHora(inicio) || !validarHora(fin)) return false;
    return inicio < fin;
};

const validarFecha = (fecha) => {
    if (!fecha || fecha.trim() === "") return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(fecha);
};

const mostrarCamposPorTipo = () => {
    const tipoElem = document.getElementById("type");
    if (!tipoElem) return;
    const tipo = tipoElem.value;
    const estudiante = document.getElementById("campos-estudiante");
    const funcionario = document.getElementById("campos-funcionario");
    const academico = document.getElementById("campos-academico");

    estudiante.hidden = !(tipo === "Pregrado" || tipo === "Postgrado");
    funcionario.hidden = tipo !== "Funcionario";
    academico.hidden = tipo !== "Academico";
};

const filtrarComunas = () => {
    const regionSelect = document.getElementById("region_id");
    const comunaSelect = document.getElementById("comuna_id");
    const dataScript = document.getElementById("comunas-data");
    if (!regionSelect || !comunaSelect || !dataScript) return;

    const comunas = JSON.parse(dataScript.textContent);
    const regionId = parseInt(regionSelect.value, 10);
    const seleccionada = parseInt(comunaSelect.dataset.selected || "", 10);

    while (comunaSelect.options.length > 1) {
        comunaSelect.remove(1);
    }

    if (!regionId) return;

    for (const c of comunas) {
        if (c.region_id !== regionId) continue;
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.nombre;
        if (seleccionada === c.id) opt.selected = true;
        comunaSelect.appendChild(opt);
    }
};

const mostrarErrores = (boxId, msgId, listId, invalidInputs) => {
    const box = document.getElementById(boxId);
    const msg = document.getElementById(msgId);
    const list = document.getElementById(listId);
    list.textContent = "";
    for (const input of invalidInputs) {
        const li = document.createElement("li");
        li.innerText = input;
        list.appendChild(li);
    }
    msg.innerText = "Los siguientes campos son inválidos:";
    msg.style.color = "#721c24";
    list.style.color = "#721c24";
    box.style.backgroundColor = "#f8d7da";
    box.style.borderColor = "#721c24";
    box.hidden = false;
};

const validarFormRegistro = () => {
    const myForm = document.forms["myForm"];
    const invalidInputs = [];

    if (!validarNombre(myForm["name"].value)) invalidInputs.push("Nombre");
    if (!validarApellido(myForm["lastname"].value)) invalidInputs.push("Apellido");
    if (!validarMail(myForm["email"].value)) invalidInputs.push("Correo Electrónico");
    if (!validarPassword(myForm["password"].value)) invalidInputs.push("Contraseña");
    if (!validarTelefono(myForm["phone"].value)) invalidInputs.push("Número de Teléfono");
    if (!validarSelect(myForm["region_id"].value)) invalidInputs.push("Región");
    if (!validarSelect(myForm["comuna_id"].value)) invalidInputs.push("Comuna");

    const tipo = myForm["type"].value;
    if (!validarSelect(tipo)) invalidInputs.push("Tipo de Usuario");

    if (tipo === "Pregrado" || tipo === "Postgrado") {
        if (!validarTextoSimple(myForm["carrera"].value)) invalidInputs.push("Carrera");
        if (!validarAnio(myForm["anio-ingreso"].value)) invalidInputs.push("Año de Ingreso");
    } else if (tipo === "Funcionario") {
        if (!validarTextoSimple(myForm["departamento"].value)) invalidInputs.push("Departamento");
        if (!validarTextoSimple(myForm["cargo"].value)) invalidInputs.push("Cargo");
    } else if (tipo === "Academico") {
        if (!validarTextoSimple(myForm["area"].value)) invalidInputs.push("Área de Investigación");
        if (!validarSelect(myForm["grado"].value)) invalidInputs.push("Grado Académico");
    }

    if (invalidInputs.length > 0) {
        mostrarErrores("val-box-registro", "val-msg-registro", "val-list-registro", invalidInputs);
    } else {
        myForm.submit();
    }
};

const validarFormActividades = () => {
    const form = document.forms["ActividadesForm"];
    const invalidInputs = [];

    if (!validarTextoSimple(form["name"].value)) invalidInputs.push("Nombre de la Actividad");
    if (!validarTextoSimple(form["description"].value)) invalidInputs.push("Descripción");
    if (!validarFecha(form["date"].value)) invalidInputs.push("Fecha");
    if (!validarHora(form["time-start"].value)) invalidInputs.push("Hora de Inicio");
    if (!validarHora(form["time-end"].value)) invalidInputs.push("Hora de Término");
    if (validarHora(form["time-start"].value) && validarHora(form["time-end"].value) &&
        !validarRangoHorario(form["time-start"].value, form["time-end"].value)) {
        invalidInputs.push("Rango horario (la hora de término debe ser posterior al inicio)");
    }
    if (!validarSelect(form["tipo"].value)) invalidInputs.push("Tipo de Actividad");
    if (!validarArchivos(form["file"].files)) invalidInputs.push("Archivo (al menos una foto o video válido)");
    if (!validarLink(form["link"].value)) invalidInputs.push("Link");

    if (invalidInputs.length > 0) {
        mostrarErrores("val-box-actividades", "val-msg-actividades", "val-list-actividades", invalidInputs);
    } else {
        form.submit();
    }
};
