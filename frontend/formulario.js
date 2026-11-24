
import { auth } from "../backend/firebase.js";

import {
    signInWithEmailAndPassword,
    sendEmailVerification,
    reload,
    signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";


// ==================================================
// 1. OBTENER ELEMENTOS DEL FORMULARIO
// ==================================================

const formularioLogin = document.getElementById("login");
const inputUsuario = document.getElementById("correo-login");
const inputContrasena = document.getElementById("contrasena");


// ==================================================
// 2. CONFIGURACIÓN DEL DOMINIO INSTITUCIONAL
// ==================================================

const dominioInstitucional = "@tecnaucalpan.mx";


// ==================================================
// 3. CONFIGURACIÓN DEL LÍMITE DE INTENTOS
// ==================================================

const MAX_INTENTOS = 5;

const TIEMPO_BLOQUEO = 60 * 60 * 1000;

const CLAVE_INTENTOS = "tigerMarketIntentosLogin";
const CLAVE_BLOQUEO = "tigerMarketBloqueoLogin";


// ==================================================
// 4. FUNCIONES PARA CONTROLAR LOS INTENTOS
// ==================================================
function obtenerIntentos() {

    return Number(localStorage.getItem(CLAVE_INTENTOS)) || 0;

}


function comprobarBloqueo() {

    const fechaBloqueo = Number(
        localStorage.getItem(CLAVE_BLOQUEO)
    );

    if (!fechaBloqueo) {
        return false;
    }

    const tiempoRestante = fechaBloqueo - Date.now();

    if (tiempoRestante > 0) {

        const minutosRestantes = Math.ceil(
            tiempoRestante / 60000
        );

        alert(
            "Lo siento, has alcanzado el límite de 5 intentos.\n" +
            "Tu acceso está bloqueado temporalmente.\n" +
            "Inténtalo nuevamente en " +
            minutosRestantes + " minutos."
        );

        return true;
    }

    localStorage.removeItem(CLAVE_BLOQUEO);
    localStorage.removeItem(CLAVE_INTENTOS);

    return false;

}

function registrarIntento() {

    let intentos = obtenerIntentos();

    intentos++;

    localStorage.setItem(CLAVE_INTENTOS, intentos);

    if (intentos >= MAX_INTENTOS) {

        const fechaBloqueo = Date.now() + TIEMPO_BLOQUEO;

        localStorage.setItem(CLAVE_BLOQUEO, fechaBloqueo);

        alert(
            "Lo siento, has superado los 5 intentos permitidos.\n" +
            "Tu acceso ha sido bloqueado durante 1 hora."
        );

        return;
    }

    const restantes = MAX_INTENTOS - intentos;

    alert(
        "El usuario o la contraseña son incorrectos.\n" +
        "Intentos restantes: " + restantes
    );

}


// ==================================================
// 5. LIMPIAR EL NOMBRE DE USUARIO
// ==================================================

if (inputUsuario) {

    inputUsuario.addEventListener("input", function () {

        this.value = this.value.toLowerCase().replace(/[^a-z0-9_]/g, "");

    });

}


// ==================================================
// 6. PROCESAR EL INICIO DE SESIÓN
// ==================================================

if (formularioLogin) {

    formularioLogin.addEventListener("submit", async function (evento) {

        evento.preventDefault();


        if (comprobarBloqueo()) {
            return;
        }


        const usuario = inputUsuario.value.trim().toLowerCase();
        const contrasena = inputContrasena.value;


        if (!usuario || !contrasena) {

            alert("Por favor, ingresa tu usuario y contraseña.");

            return;
        }


        const correoCompleto = usuario + dominioInstitucional;


        const boton = formularioLogin.querySelector('button[type="submit"]');


        try {

            boton.disabled = true;
            boton.textContent = "Verificando...";


            const credenciales = await signInWithEmailAndPassword(
                auth,
                correoCompleto,
                contrasena
            );

            const usuarioFirebase = credenciales.user;


            await reload(usuarioFirebase);

            if (
                !usuarioFirebase.email ||
                !usuarioFirebase.email.endsWith(dominioInstitucional)
            ) {

                await signOut(auth);

                alert(
                    "No puedes ingresar con un correo que no pertenezca " +
                    "al dominio institucional autorizado."
                );

                return;
            }

            // Comprobacion de correo verificado
            if (!usuarioFirebase.emailVerified) {

                await signOut(auth);

                alert(
                    "Tu correo institucional todavía no ha sido verificado.\n" +
                    "Revisa tu bandeja de entrada y confirma tu cuenta " +
                    "antes de ingresar."
                );

                return;
            }


            localStorage.removeItem(CLAVE_INTENTOS);
            localStorage.removeItem(CLAVE_BLOQUEO);


            window.location.replace("/Pagina-de-inicio.html");


        } catch (error) {

            console.error("Error al iniciar sesión:", error);


            switch (error.code) {

                case "auth/invalid-credential":
                case "auth/user-not-found":
                case "auth/wrong-password":

                    registrarIntento();

                    break;


                case "auth/invalid-email":

                    alert("El correo institucional no es válido.");

                    break;


                case "auth/too-many-requests":

                    alert(
                        "Firebase ha limitado temporalmente los intentos. " +
                        "Inténtalo nuevamente más tarde."
                    );

                    break;


                case "auth/user-disabled":

                    alert(
                        "Esta cuenta ha sido deshabilitada. " +
                        "Comunícate con el administrador."
                    );

                    break;


                case "auth/network-request-failed":

                    alert(
                        "No se pudo conectar con Firebase. " +
                        "Revisa tu conexión a internet."
                    );

                    break;


                case "auth/operation-not-allowed":

                    alert(
                        "El inicio de sesión con correo y contraseña " +
                        "no está habilitado."
                    );

                    break;


                default:

                    alert(
                        "Ocurrió un error al iniciar sesión. " +
                        "Inténtalo nuevamente."
                    );

                    break;

            }


        } finally {

            boton.disabled = false;
            boton.textContent = "Iniciar sesión";

        }

    });

}


// ==================================================
// 7. DETECTAR CUANDO EL USUARIO CAMBIA DE PESTAÑA
// ==================================================

document.addEventListener("visibilitychange", function () {

    if (document.visibilityState === "hidden") {

        if (inputContrasena) {

            inputContrasena.value = "";
            inputContrasena.setAttribute("type", "password");

        }

        const eyeIcon = document.getElementById("eye-icon");

        if (eyeIcon) {

            eyeIcon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;

        }

    }

});
