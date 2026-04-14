const data = {
    TipoUsuario: ["Pregrado", "Postgrado", "Funcionario", "Academico"],
    
}


const dominiosPermitidos = [
    'uchile.cl',
    'ing.uchile.cl',
    'dcc.uchile.cl',
    'ug.uchile.cl',
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'yahoo.com',
    'icloud.com',
    ]

const validarMail = (email) => {
    // El correo electrónico no debe estar vacío, no debe contener solo espacios,}
    // debe contener un "@" y un ".", y no debe tener más de un "@".
    if (!email || email.trim() === "" || 
        !email.includes("@") || !email.includes(".") || 
        email.split('@').length > 2) {

    return false
    }

    //Validar formato
    if (!/^[\w.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email)) {
        return false
    }

    // El dominio del correo electrónico debe ser uno de los permitidos
    const dominio = email.split('@')[1]
    if (!dominiosPermitidos.includes(dominio)) {
        return false
    }

    return true
}

const validarNombre = (name) => {
    // El nombre no debe estar vacío, no debe contener solo espacios 
    // y no debe tener más de un espacio consecutivo
    if (!name || name.trim().length < 2 || /\s{2,}/.test(name)) {
        return false
    }
    return true
}

const validarApellido = (lastName) => {
    // El apellido no debe estar vacío, no debe contener solo espacios 
    // y no debe tener más de un espacio consecutivo
    if (!lastName || lastName.trim() === "" || /\s{2,}/.test(lastName)) {
        return false
    }

    return true
}

const validarPassword = (password) => {
    // La contraseña no debe estar vacía, debe tener al menos 6 caracteres 
    // y no debe contener espacios
    if (!password || password.trim() === "" || 
    password.length < 6 || /\s/.test(password)) {
        return false
    }

    // La contraseña debe contener al menos una letra mayúscula y un número
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        return false
    }
    return true
}

const validarTelefono = (phoneNumber) => {
    // El número de teléfono no debe estar vacío, debe contener solo dígitos 
    // y debe tener exactamente 9 dígitos
    if (!phoneNumber || !/^\d{9,9}$/.test(phoneNumber)) {
        return false
    }
    return true
}

const validarSelect = (select) => {
    if (!select || select.value === "") {
        return false
    }
    return true
}

const validarArchivo = (file) => {
    // El archivo no debe estar vacío y debe ser un PDF o una imagen
    if (!file || file.length < 1) {
        return false
    }
    const fileObj = file[0]
    if (fileObj.type !== "application/pdf" && fileObj.type.split('/')[0] !== "image") {
        return false
    }
    return true
}

const validarLink = (link) => {
    // El link no debe estar vacío
    if (!link || link.trim() === "") {
        return false
    }
    
    // El link debe ser una URL válida (debe empezar con http o https)
    if (!/^https?:\/\/.+/.test(link)) {
        return false
    }
    
    return true
}



const validarFormRegistro = () => {
    console.log("Enviando formulario...");

    let myForm = document.forms["myForm"];
    let nameInput = myForm["name"].value;
    let lastNameInput = myForm["lastname"].value;
    let emailInput = myForm["email"].value;
    let passwordInput = myForm["password"].value;
    let phoneInput = myForm["phone"].value;
    let typeInput = myForm["type"].value;

    
    let invalidInputs = []
    let isValid = true

    const setInvalidInput = (input) => {
        invalidInputs.push(input)
        isValid &&= false
    }


    if (!validarNombre(nameInput)) {
        setInvalidInput("Nombre")
    }

    if (!validarApellido(lastNameInput)) {
        setInvalidInput("Apellido")
    }

    if (!validarMail(emailInput)) {
        setInvalidInput("Correo Electrónico")
    }

    if (!validarPassword(passwordInput)) {
        setInvalidInput("Contraseña")
    }

    if (!validarTelefono(phoneInput)) {
        setInvalidInput("Número de Teléfono")
    }

    if (!validarSelect(typeInput)) {
        setInvalidInput("Tipo de Usuario")
    }


    let validationBox = document.getElementById("val-box-registro");
    let validationMessageElem = document.getElementById("val-msg-registro");
    let validationListElem = document.getElementById("val-list-registro");

    if (!isValid) {
        validationListElem.textContent = "";

        for (input of invalidInputs) {
            let listElem = document.createElement("li");
            listElem.innerText = input;
            validationListElem.appendChild(listElem);
        }

        validationMessageElem.innerText = "Los siguientes campos son inválidos:";

        validationBox.style.backgroundColor = "#c8a2a5";
        validationBox.style.borderColor = "red";

        validationBox.hidden = false;
    } else {

        myForm.style.display = "none";
        validationMessageElem.innerText = "¡Registro exitoso!";
        validationBox.style.backgroundColor = "#a2c8a5";
        validationBox.style.borderColor = "green";
        validationListElem.textContent = "";
        validationBox.hidden = false;

        let continueButton = document.createElement("button");
        continueButton.innerText = "Continuar";
        continueButton.style.marginRight = "10px";
        continueButton.onclick = () => {
            window.location.href = "listado.html";
        }

        validationListElem.appendChild(continueButton);

    }

    let submitBtn = document.getElementById("envio");
    submitBtn.addEventListener("click", validarFormRegistro);

}


const validarFormActividades = () => {
    console.log("Enviando formulario...");

    let ActividadesForm = document.forms["ActividadesForm"];
    let fileInput = ActividadesForm["file"].files;
    let linkInput = ActividadesForm["link"].value;
    let actividadesInput = ActividadesForm["tipo"].value;

    let invalidInputs = []
    let isValid = true

    const setInvalidInput = (input) => {
        invalidInputs.push(input)
        isValid &&= false
    }

    if (!validarArchivo(fileInput)){
        setInvalidInput("Archivo")
    }

    if (!validarLink(linkInput)) {
        setInvalidInput("Link")
    }

    if (!validarSelect(actividadesInput)) {
        setInvalidInput("Actividad")
    }

    let validationBox = document.getElementById("val-box-actividades");
    let validationMessageElem = document.getElementById("val-msg-actividades");
    let validationListElem = document.getElementById("val-list-actividades");

    if (!isValid) {
        validationListElem.textContent = "";
        for (input of invalidInputs) {
            let listElem = document.createElement("li");
            listElem.innerText = input;
            validationListElem.appendChild(listElem);
        }

        validationMessageElem.innerText = "Los siguientes campos son inválidos:";

        validationBox.style.backgroundColor = "#c8a2a5";
        validationBox.style.borderColor = "red";

        validationBox.hidden = false;

    } else {

        ActividadesForm.style.display = "none";
        validationMessageElem.innerText = "¡Archivo subido exitosamente!";
        validationBox.style.backgroundColor = "#a2c8a5";
        validationBox.style.borderColor = "green";
        validationListElem.textContent = "";
        validationBox.hidden = false;

        let continueButton = document.createElement("button");
        continueButton.innerText = "Subir";
        continueButton.style.marginRight = "10px";
        continueButton.onclick = () => {
            window.location.href = "activ-historial.html";
        }

        validationListElem.appendChild(continueButton);
    }

    let submitBtn = document.getElementById("envio-actividades");
    submitBtn.addEventListener("click", validarFormActividades);
}