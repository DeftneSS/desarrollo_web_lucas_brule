const validarForm = () => {
    console.log("Enviando formulario...");

    let nameInput = document.getElementById("name");
    let lastNameInput = document.getElementById("last-name");
    let emailInput = document.getElementById("email");
    let passwordInput = document.getElementById("password");
    let phoneInput = document.getElementById("phone");

    const dominiosPermitidos = [
    'uchile.cl',
    'ing.uchile.cl',
    'dcc.uchile.cl',
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
        if (!name || name.trim() === "" || /\s{2,}/.test(name)) {
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

    let isValid = false
    let msg = ""


    if (!validarNombre(nameInput.value)) {
        msg += "El nombre es inválido."
        emailInput.style.borderColor = "red"
    } else {
        emailInput.style.borderColor = ""
    }

    if (!validarApellido(lastNameInput.value)) {
        msg += " El apellido es inválido."
        lastNameInput.style.borderColor = "red"
    } else {
        lastNameInput.style.borderColor = ""
    }

    if (!validarMail(emailInput.value)) {
        msg += " El correo electrónico es inválido."
        emailInput.style.borderColor = "red"
    } else {
        emailInput.style.borderColor = ""
    }

    if (!validarPassword(passwordInput.value)) {
        msg += " La contraseña es inválida."
        passwordInput.style.borderColor = "red"
    } else {
        passwordInput.style.borderColor = ""
    }

    if (!validarTelefono(phoneInput.value)) {
        msg += " El número de teléfono es inválido."
        phoneInput.style.borderColor = "red"
    } else {
        phoneInput.style.borderColor = ""
    }

    if (msg === "") {
        msg = "Formulario enviado correctamente."
        isValid = true
        let name = nameInput.value
        localStorage.setItem("name", name)
        
    }

}