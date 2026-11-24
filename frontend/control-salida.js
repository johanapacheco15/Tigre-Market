import { auth } from "../backend/firebase.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

// Detectar cuando el usuario presiona el botón de retroceso
history.pushState({ paginaProtegida: true }, "", location.href);

window.addEventListener("popstate", async function () {

    try {

        await signOut(auth);

        window.location.replace("/index.html");

    } catch (error) {

        console.error("Error al cerrar sesión:", error);

        window.location.replace("/index.html");

    }

});

// Detectar cuando el usuario intenta entrar a un sitio externo
document.addEventListener("click", async function (evento) {

    const enlace = evento.target.closest("a[href]");

    if (!enlace) return;

    // No intervenir en enlaces que abren otra pestaña
    if (enlace.target === "_blank") return;

    // No intervenir en descargas
    if (enlace.hasAttribute("download")) return;

    const destino = new URL(enlace.href, window.location.href);

    // Comprobar si el destino es externo
    if (
        (destino.protocol === "http:" || destino.protocol === "https:") &&
        destino.origin !== window.location.origin
    ) {

        evento.preventDefault();

        try {

            await signOut(auth);

            window.location.href = destino.href;

        } catch (error) {

            console.error("Error al cerrar sesión:", error);

            alert("No se pudo cerrar la sesión. Inténtalo nuevamente.");

        }

    }

}, true);