import { auth } from "../backend/firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

// Obtener elementos del formulario
const formularioLogin = document.getElementById("login");
const inputUsuario = document.getElementById("correo-login");
const inputContrasena = document.getElementById("contrasena");

// Agregar el dominio institucional
const dominioInstitucional = "@tecnaucalpan.mx";

// Limpiar el nombre de usuario mientras se escribe
if (inputUsuario) {
    inputUsuario.addEventListener("input", function () {
        this.value = this.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    });
}

// Procesar el inicio de sesión
if (formularioLogin) {

    formularioLogin.addEventListener("submit", async function (evento) {

        evento.preventDefault();

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

            // Comprobar las credenciales con Firebase Authentication
            await signInWithEmailAndPassword(
                auth,
                correoCompleto,
                contrasena
            );

            // Redireccionar si la autenticación fue exitosa
            window.location.replace("/Pagina-de-inicio.html");

        } catch (error) {

            console.error("Error al iniciar sesión:", error);

            switch (error.code) {

                case "auth/invalid-credential":
                case "auth/user-not-found":
                case "auth/wrong-password":
                    alert("El usuario o la contraseña son incorrectos.");
                    break;

                case "auth/invalid-email":
                    alert("El correo institucional no es válido.");
                    break;

                case "auth/too-many-requests":
                    alert("Demasiados intentos. Inténtalo nuevamente más tarde.");
                    break;

                case "auth/network-request-failed":
                    alert("No se pudo conectar con Firebase. Revisa tu conexión a internet.");
                    break;

                default:
                    alert("Ocurrió un error al iniciar sesión. Inténtalo nuevamente.");
                    break;
            }

            boton.disabled = false;
            boton.textContent = "Iniciar sesión";

        }

    });

}

// Detectar cuando el usuario cambia de pestaña o minimiza la ventana
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