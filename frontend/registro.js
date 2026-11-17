
// ==========================================
// 1. IMPORTACIONES DE FIREBASE
// ==========================================

import { auth, db } from "../backend/firebase.js";

import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";


// ==========================================
// 2. OBTENER ELEMENTOS DEL FORMULARIO
// ==========================================

const formularioRegistro = document.getElementById("registro");

const passwordInput = document.getElementById("contrasena");
const togglePasswordBtn = document.getElementById("toggle-password");
const eyeIcon = document.getElementById("eye-icon");

const botonRegistro = document.getElementById("boton-registro");

const checkPrivacidad = document.getElementById("privacidad");
const checkDatos = document.getElementById("confirmar-datos");

const inputUsuario = document.getElementById("correo-login");
const telefonoInput = document.getElementById("telefono");


// ==========================================
// 3. MOSTRAR U OCULTAR CONTRASEÑA
// ==========================================

if (togglePasswordBtn && passwordInput && eyeIcon) {

    togglePasswordBtn.addEventListener("click", function () {

        const mostrar = passwordInput.type === "password";

        passwordInput.type = mostrar ? "text" : "password";

        if (mostrar) {
            eyeIcon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            `;
        } else {
            eyeIcon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;
        }
    });
}


// ==========================================
// 4. VALIDACIÓN DE LA CONTRASEÑA
// ==========================================

const reqlongitud = document.getElementById("req-longitud");
const reqmayuscula = document.getElementById("req-mayuscula");
const reqminuscula = document.getElementById("req-minuscula");
const reqnumero = document.getElementById("req-numero");
const reqespecial = document.getElementById("req-especial");

function validarFormulario() {

    if (!formularioRegistro || !passwordInput || !botonRegistro) {
        return;
    }

    const password = passwordInput.value;

    // Comprobar cada requisito de la contraseña
    const esLongitud = password.length >= 8;
    const esMayuscula = /[A-Z]/.test(password);
    const esMinuscula = /[a-z]/.test(password);
    const esNumero = /[0-9]/.test(password);

    // Se aceptan estos caracteres especiales:
    // ! @ # $ % ^ & *
    const esEspecial = /[!@#$%^&*]/.test(password);

    // Actualizar el estado visual de cada requisito
    if (reqlongitud) {
        reqlongitud.className = esLongitud ? "valido" : "invalido";
    }

    if (reqmayuscula) {
        reqmayuscula.className = esMayuscula ? "valido" : "invalido";
    }

    if (reqminuscula) {
        reqminuscula.className = esMinuscula ? "valido" : "invalido";
    }

    if (reqnumero) {
        reqnumero.className = esNumero ? "valido" : "invalido";
    }

    if (reqespecial) {
        reqespecial.className = esEspecial ? "valido" : "invalido";
    }

    // La contraseña debe cumplir todos los requisitos
    const contrasenaValida =
        esLongitud &&
        esMayuscula &&
        esMinuscula &&
        esNumero &&
        esEspecial;

    // Comprobar que las dos casillas estén seleccionadas
    const casillasMarcadas =
        checkPrivacidad &&
        checkDatos &&
        checkPrivacidad.checked &&
        checkDatos.checked;

    // Comprobar también los demás campos obligatorios del HTML
    const camposValidos = formularioRegistro.checkValidity();

    // Habilitar el botón únicamente cuando todo sea correcto
    botonRegistro.disabled = !(
        contrasenaValida &&
        casillasMarcadas &&
        camposValidos
    );
}


// ==========================================
// 5. EVENTOS PARA ACTUALIZAR LA VALIDACIÓN
// ==========================================

// Actualizar cuando se escribe la contraseña
if (passwordInput) {
    passwordInput.addEventListener("input", validarFormulario);
}

// Actualizar cuando se marcan las casillas
if (checkPrivacidad) {
    checkPrivacidad.addEventListener("change", validarFormulario);
}

if (checkDatos) {
    checkDatos.addEventListener("change", validarFormulario);
}

// Actualizar cuando se modifican los demás campos
if (formularioRegistro) {
    formularioRegistro.querySelectorAll("input").forEach(function (campo) {
        campo.addEventListener("input", validarFormulario);
        campo.addEventListener("change", validarFormulario);
    });
}

// Estado inicial del botón
validarFormulario();


// ==========================================
// 6. VALIDAR EL CORREO INSTITUCIONAL
// ==========================================

if (inputUsuario) {

    inputUsuario.addEventListener("input", function () {

        // Solo permite letras minúsculas, números y guion bajo
        this.value = this.value.toLowerCase().replace(/[^a-z0-9_]/g, "");

        validarFormulario();
    });
}


// ==========================================
// 7. VALIDAR EL NÚMERO DE TELÉFONO
// ==========================================

if (telefonoInput) {

    telefonoInput.addEventListener("input", function () {

        // Eliminar cualquier carácter que no sea número
        this.value = this.value.replace(/[^0-9]/g, "").slice(0, 10);

        validarFormulario();
    });
}


// ==========================================
// 8. REGISTRO DE USUARIOS EN FIREBASE
// ==========================================

if (formularioRegistro) {

    formularioRegistro.addEventListener("submit", async function (evento) {

        evento.preventDefault();

        // Evitar que se envíe un formulario incompleto
        validarFormulario();

        if (!formularioRegistro.checkValidity()) {
            formularioRegistro.reportValidity();
            return;
        }

        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();

        const usuarioCorreo = inputUsuario.value.trim().toLowerCase();
        const correo = usuarioCorreo + "@tecnaucalpan.mx";

        const edad = Number(document.getElementById("edad").value);
        const telefono = telefonoInput.value.trim();
        const contrasena = passwordInput.value;

        // Validar nuevamente la contraseña antes de enviarla
        const contrasenaValida =
            contrasena.length >= 8 &&
            /[A-Z]/.test(contrasena) &&
            /[a-z]/.test(contrasena) &&
            /[0-9]/.test(contrasena) &&
            /[!@#$%^&*]/.test(contrasena);

        if (!contrasenaValida) {
            alert("La contraseña no cumple con todos los requisitos.");
            return;
        }

        if (!/^[a-z0-9_]+$/.test(usuarioCorreo)) {
            alert("El usuario del correo contiene caracteres no permitidos.");
            return;
        }

        if (!Number.isInteger(edad) || edad < 13 || edad > 120) {
            alert("Introduce una edad válida.");
            return;
        }

        if (!/^[0-9]{10}$/.test(telefono)) {
            alert("El teléfono debe contener exactamente 10 números.");
            return;
        }

        if (!checkPrivacidad.checked || !checkDatos.checked) {
            alert("Debes aceptar las políticas y confirmar tus datos.");
            return;
        }

        // Deshabilitar el botón mientras Firebase procesa el registro
        botonRegistro.disabled = true;
        botonRegistro.textContent = "Creando cuenta...";

        let usuarioCreado = null;

        try {

            console.log("Intentando crear cuenta en Firebase Authentication...");

            // Crear la cuenta en Firebase Authentication
            const credencial = await createUserWithEmailAndPassword(
                auth,
                correo,
                contrasena
            );

            usuarioCreado = credencial.user;

            console.log("Cuenta creada. Guardando información en Firestore...");

            // Guardar los datos adicionales del usuario
            await setDoc(doc(db, "usuarios", usuarioCreado.uid), {

                nombre: nombre,
                apellido: apellido,
                correo: correo,
                edad: edad,
                telefono: telefono,

                fechaRegistro: serverTimestamp(),

                rol: "usuario"
            });

            // Enviar correo de verificación
            await sendEmailVerification(usuarioCreado);

            // Cerrar la sesión hasta que verifique su correo
            await signOut(auth);

            console.log("Registro completado correctamente.");

            alert(
                "¡Tu cuenta fue creada!\n\n" +
                "Te enviamos un correo de verificación a " + correo +
                ". Revisa tu bandeja de entrada o spam. " +
                "Después podrás iniciar sesión."
            );

            formularioRegistro.reset();

            validarFormulario();

            window.location.replace("/index.html");

        } catch (error) {

            console.error("Error durante el registro:", error);

            // Si la cuenta llegó a crearse, cerrar esa sesión
            if (usuarioCreado && auth.currentUser &&
                auth.currentUser.uid === usuarioCreado.uid) {

                try {
                    await signOut(auth);
                } catch (errorSesion) {
                    console.error("No se pudo cerrar la sesión:", errorSesion);
                }
            }

            switch (error.code) {

                case "auth/email-already-in-use":
                    alert("Este correo electrónico ya está registrado.");
                    break;

                case "auth/invalid-email":
                    alert("El correo electrónico no es válido.");
                    break;

                case "auth/weak-password":
                    alert("Firebase rechazó la contraseña. Comprueba sus requisitos.");
                    break;

                case "permission-denied":
                case "firestore/permission-denied":
                    alert("Firebase rechazó el guardado de datos. Revisa las reglas de Firestore.");
                    break;

                default:
                    alert("Ocurrió un error durante el registro: " + error.message);
                    break;
            }

        } finally {

            // Restaurar el botón y su validación
            botonRegistro.textContent = "Crear cuenta";
            validarFormulario();
        }
    });
}
