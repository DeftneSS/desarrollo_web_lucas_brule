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
    if (!dominiosPermitidos.includes(dominio)) {
        return false;
    }

    return true;
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
    if (!phoneNumber || !/^\d{9}$/.test(phoneNumber)) {
        return false;
    }
    return true;
};

const validarSelect = (value) => {
    if (!value || value === "") {
        return false;
    }
    return true;
};

const validarTextoSimple = (texto) => {
    if (!texto || texto.trim().length < 2) {
        return false;
    }
    return true;
};

const validarAnio = (anio) => {
    if (!anio) return false;
    const n = Number(anio);
    return Number.isInteger(n) && n >= 1900 && n <= 2030;
};

const validarArchivo = (file) => {
    if (!file || file.length < 1) {
        return false;
    }
    const fileObj = file[0];
    const tipo = fileObj.type.split("/")[0];
    if (tipo !== "image" && tipo !== "video") {
        return false;
    }
    return true;
};

const validarLink = (link) => {
    if (!link || link.trim() === "") {
        return false;
    }
    if (!/^https?:\/\/.+/.test(link)) {
        return false;
    }
    return true;
};

const validarHora = (hora) => {
    if (!hora || hora.trim() === "") {
        return false;
    }
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
    const tipo = document.getElementById("type").value;
    const estudiante = document.getElementById("campos-estudiante");
    const funcionario = document.getElementById("campos-funcionario");
    const academico = document.getElementById("campos-academico");

    estudiante.hidden = !(tipo === "Pregrado" || tipo === "Postgrado");
    funcionario.hidden = tipo !== "Funcionario";
    academico.hidden = tipo !== "Academico";
};

const validarFormRegistro = () => {
    const myForm = document.forms["myForm"];
    const nameInput = myForm["name"].value;
    const lastNameInput = myForm["lastname"].value;
    const emailInput = myForm["email"].value;
    const passwordInput = myForm["password"].value;
    const phoneInput = myForm["phone"].value;
    const typeInput = myForm["type"].value;

    const invalidInputs = [];

    const setInvalidInput = (input) => {
        invalidInputs.push(input);
    };

    if (!validarNombre(nameInput)) setInvalidInput("Nombre");
    if (!validarApellido(lastNameInput)) setInvalidInput("Apellido");
    if (!validarMail(emailInput)) setInvalidInput("Correo Electrónico");
    if (!validarPassword(passwordInput)) setInvalidInput("Contraseña");
    if (!validarTelefono(phoneInput)) setInvalidInput("Número de Teléfono");
    if (!validarSelect(typeInput)) setInvalidInput("Tipo de Usuario");

    if (typeInput === "Pregrado" || typeInput === "Postgrado") {
        if (!validarTextoSimple(myForm["carrera"].value)) setInvalidInput("Carrera");
        if (!validarAnio(myForm["anio-ingreso"].value)) setInvalidInput("Año de Ingreso");
    } else if (typeInput === "Funcionario") {
        if (!validarTextoSimple(myForm["departamento"].value)) setInvalidInput("Departamento");
        if (!validarTextoSimple(myForm["cargo"].value)) setInvalidInput("Cargo");
    } else if (typeInput === "Academico") {
        if (!validarTextoSimple(myForm["area"].value)) setInvalidInput("Área de Investigación");
        if (!validarSelect(myForm["grado"].value)) setInvalidInput("Grado Académico");
    }

    const validationBox = document.getElementById("val-box-registro");
    const validationMessageElem = document.getElementById("val-msg-registro");
    const validationListElem = document.getElementById("val-list-registro");

    validationListElem.textContent = "";

    if (invalidInputs.length > 0) {
        for (const input of invalidInputs) {
            const listElem = document.createElement("li");
            listElem.innerText = input;
            validationListElem.appendChild(listElem);
        }

        validationMessageElem.innerText = "Los siguientes campos son inválidos:";
        validationMessageElem.style.color = "#721c24";
        validationListElem.style.color = "#721c24";
        validationBox.style.backgroundColor = "#f8d7da";
        validationBox.style.borderColor = "#721c24";
        validationBox.hidden = false;
    } else {
        myForm.style.display = "none";
        validationMessageElem.innerText = "¡Registro exitoso!";
        validationMessageElem.style.color = "#155724";
        validationListElem.style.color = "#155724";
        validationBox.style.backgroundColor = "#d4edda";
        validationBox.style.borderColor = "#155724";
        validationBox.hidden = false;

        const continueButton = document.createElement("button");
        continueButton.type = "button";
        continueButton.innerText = "Continuar";
        continueButton.onclick = () => {
            window.location.href = "listado.html";
        };
        validationListElem.appendChild(continueButton);
    }
};

const validarFormActividades = () => {
    const actividadesForm = document.forms["ActividadesForm"];
    const nameInput = actividadesForm["name"].value;
    const descriptionInput = actividadesForm["description"].value;
    const dateInput = actividadesForm["date"].value;
    const timeStartInput = actividadesForm["time-start"].value;
    const timeEndInput = actividadesForm["time-end"].value;
    const tipoInput = actividadesForm["tipo"].value;
    const fileInput = actividadesForm["file"].files;
    const linkInput = actividadesForm["link"].value;

    const invalidInputs = [];

    const setInvalidInput = (input) => {
        invalidInputs.push(input);
    };

    if (!validarTextoSimple(nameInput)) setInvalidInput("Nombre de la Actividad");
    if (!validarTextoSimple(descriptionInput)) setInvalidInput("Descripción");
    if (!validarFecha(dateInput)) setInvalidInput("Fecha");
    if (!validarHora(timeStartInput)) setInvalidInput("Hora de Inicio");
    if (!validarHora(timeEndInput)) setInvalidInput("Hora de Término");
    if (validarHora(timeStartInput) && validarHora(timeEndInput) && !validarRangoHorario(timeStartInput, timeEndInput)) {
        setInvalidInput("Rango horario (la hora de término debe ser posterior al inicio)");
    }
    if (!validarSelect(tipoInput)) setInvalidInput("Tipo de Actividad");
    if (!validarArchivo(fileInput)) setInvalidInput("Archivo (foto o video)");
    if (!validarLink(linkInput)) setInvalidInput("Link");

    const validationBox = document.getElementById("val-box-actividades");
    const validationMessageElem = document.getElementById("val-msg-actividades");
    const validationListElem = document.getElementById("val-list-actividades");

    validationListElem.textContent = "";

    if (invalidInputs.length > 0) {
        for (const input of invalidInputs) {
            const listElem = document.createElement("li");
            listElem.innerText = input;
            validationListElem.appendChild(listElem);
        }

        validationMessageElem.innerText = "Los siguientes campos son inválidos:";
        validationMessageElem.style.color = "#721c24";
        validationListElem.style.color = "#721c24";
        validationBox.style.backgroundColor = "#f8d7da";
        validationBox.style.borderColor = "#721c24";
        validationBox.hidden = false;
    } else {
        actividadesForm.style.display = "none";
        validationMessageElem.innerText = "¡Actividad registrada exitosamente!";
        validationMessageElem.style.color = "#155724";
        validationListElem.style.color = "#155724";
        validationBox.style.backgroundColor = "#d4edda";
        validationBox.style.borderColor = "#155724";
        validationBox.hidden = false;

        const continueButton = document.createElement("button");
        continueButton.type = "button";
        continueButton.innerText = "Volver al Listado";
        continueButton.onclick = () => {
            window.location.href = "listado.html";
        };
        validationListElem.appendChild(continueButton);
    }
};
