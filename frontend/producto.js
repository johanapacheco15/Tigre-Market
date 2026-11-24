
/* =========================================================================
   TIGRE MARKET - DETALLES DEL PRODUCTO
   Consulta Firestore y muestra las fotografías de Cloudinary.
========================================================================= */

import { db, auth } from "../backend/firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";


/* =========================================================================
   1. ELEMENTOS HTML
========================================================================= */

const nombreProducto = document.getElementById("nombre-producto");
const precioProducto = document.getElementById("precio-producto");
const descripcionProducto = document.getElementById("descripcion-producto");

const vendedorProducto = document.getElementById("vendedor-producto");
const fechaProducto = document.getElementById("fecha-producto");

const imagenPrincipal = document.getElementById("imagen-principal");
const contenedorMiniaturas = document.getElementById("contenedor-miniaturas");

const btnCarrito = document.getElementById("btn-agregar-carrito");
const btnFavoritos = document.getElementById("btn-agregar-favoritos");
const mensajeAccion = document.getElementById("mensaje-accion");

const IMAGEN_DEFAULT = "/frontend/img/producto-default.jpg";

let productoActual = null;


/* =========================================================================
   2. OBTENER EL ID DEL PRODUCTO DESDE LA URL
========================================================================= */

const parametrosURL = new URLSearchParams(window.location.search);

const idProducto = parametrosURL.get("id");


/* =========================================================================
   3. CAMBIAR IMAGEN PRINCIPAL
========================================================================= */

function cambiarImagen(elementoMiniatura) {

    imagenPrincipal.src = elementoMiniatura.src;

    document.querySelectorAll(".miniatura").forEach(imagen => {
        imagen.classList.remove("activa");
    });

    elementoMiniatura.classList.add("activa");

}


/* =========================================================================
   4. MOSTRAR LAS FOTOGRAFÍAS DEL PRODUCTO
========================================================================= */

function mostrarImagenes(imagenes, nombre) {

    contenedorMiniaturas.innerHTML = "";

    // Recuperar las direcciones de las imágenes de Cloudinary.
    const fotografias = Array.isArray(imagenes)
        ? imagenes.map(imagen =>
            typeof imagen === "string" ? imagen : imagen?.url
        ).filter(Boolean)
        : [];

    // Si no existen fotografías, utilizar la imagen predeterminada.
    if (fotografias.length === 0) {

        imagenPrincipal.src = IMAGEN_DEFAULT;
        return;

    }

    // Mostrar la primera fotografía como imagen principal.
    imagenPrincipal.src = fotografias[0];
    imagenPrincipal.alt = nombre;

    // Crear las miniaturas de todas las fotografías.
    fotografias.forEach((ruta, index) => {

        const miniatura = document.createElement("img");

        miniatura.src = ruta;
        miniatura.alt = `Fotografía ${index + 1} de ${nombre}`;

        miniatura.classList.add("miniatura");

        if (index === 0) {
            miniatura.classList.add("activa");
        }

        miniatura.addEventListener("click", () => {
            cambiarImagen(miniatura);
        });

        contenedorMiniaturas.appendChild(miniatura);

    });

}


/* =========================================================================
   5. MOSTRAR LOS DATOS DEL PRODUCTO
========================================================================= */

function mostrarProducto(producto, id) {

    // Guardar los datos del producto seleccionado.
    productoActual = {
        ...producto,
        id: id
    };

    // Mostrar información general.
    nombreProducto.textContent =
        producto.nombre || "Producto sin nombre";

    precioProducto.textContent =
        `$${Number(producto.precio || 0).toFixed(2)} MXN`;

    descripcionProducto.textContent =
        producto.descripcion || "Sin descripción disponible.";

    vendedorProducto.textContent =
        `Vendedor: ${producto.vendedor || "No disponible"}`;

    // Mostrar fecha de publicación.
    let fecha = "No disponible";

    if (producto.fechaPublicacion) {

        const fechaReal = producto.fechaPublicacion.toDate
            ? producto.fechaPublicacion.toDate()
            : new Date(producto.fechaPublicacion);

        if (!isNaN(fechaReal.getTime())) {
            fecha = fechaReal.toLocaleDateString("es-MX");
        }

    }

    fechaProducto.textContent =
        `Fecha de publicación: ${fecha}`;

    // Mostrar todas las fotografías.
    mostrarImagenes(
        producto.imagenes,
        producto.nombre || "Producto"
    );

    // Actualizar título de la pestaña.
    document.title =
        `${producto.nombre || "Producto"} | Tigre Market`;

}


/* =========================================================================
   6. CONSULTAR EL PRODUCTO EN FIRESTORE
========================================================================= */

async function cargarProducto() {

    if (!idProducto) {

        nombreProducto.textContent = "No se seleccionó ningún producto.";
        return;

    }

    try {

        // Buscar el documento mediante su ID.
        const referencia = doc(db, "productos", idProducto);

        const consulta = await getDoc(referencia);

        // Comprobar que el producto exista.
        if (!consulta.exists()) {

            nombreProducto.textContent = "Producto no encontrado.";

            descripcionProducto.textContent =
                "El producto ya no está disponible.";

            precioProducto.textContent = "";

            return;

        }

        // Recuperar los datos registrados en Firestore.
        const producto = consulta.data();

        // Mostrar los datos en pantalla.
        mostrarProducto(producto, consulta.id);

        // Actualizar el estado de favoritos.
        verificarFavorito();

    } catch (error) {

        console.error("Error al consultar el producto:", error);

        nombreProducto.textContent =
            "No fue posible cargar el producto.";

        descripcionProducto.textContent =
            "Ocurrió un error al consultar la información.";

    }

}


/* =========================================================================
   7. SISTEMA DE FAVORITOS
========================================================================= */

function verificarFavorito() {

    if (!productoActual || !btnFavoritos) return;

    const favoritos =
        JSON.parse(localStorage.getItem("favoritosTigreMarket")) || [];

    const existe = favoritos.some(item =>
        item.id === productoActual.id
    );

    if (existe) {

        btnFavoritos.classList.add("en-favoritos");
        btnFavoritos.textContent = "♥ En tus favoritos";

    } else {

        btnFavoritos.classList.remove("en-favoritos");
        btnFavoritos.textContent = "♡ Agregar a favoritos";

    }

}


if (btnFavoritos) {

    btnFavoritos.addEventListener("click", () => {

        if (!productoActual) return;

        let favoritos =
            JSON.parse(localStorage.getItem("favoritosTigreMarket")) || [];

        const indice = favoritos.findIndex(item =>
            item.id === productoActual.id
        );

        if (indice === -1) {

            favoritos.push({
                id: productoActual.id,
                nombre: productoActual.nombre,
                precio: productoActual.precio,
                imagen: productoActual.imagenes?.[0]?.url ||
                    productoActual.imagenes?.[0] ||
                    IMAGEN_DEFAULT
            });

            mensajeAccion.textContent =
                `"${productoActual.nombre}" se guardó en favoritos.`;

        } else {

            favoritos.splice(indice, 1);

            mensajeAccion.textContent =
                `"${productoActual.nombre}" se eliminó de favoritos.`;

        }

        localStorage.setItem(
            "favoritosTigreMarket",
            JSON.stringify(favoritos)
        );

        verificarFavorito();

    });

}


/* =========================================================================
   8. SISTEMA DE CARRITO
========================================================================= */

if (btnCarrito) {

    btnCarrito.addEventListener("click", () => {

        if (!productoActual) return;

        const carrito =
            JSON.parse(localStorage.getItem("carritoTigreMarket")) || [];

        const indice = carrito.findIndex(item =>
            item.id === productoActual.id
        );

        if (indice !== -1) {

            carrito[indice].cantidad += 1;

        } else {

            carrito.push({

                id: productoActual.id,
                nombre: productoActual.nombre,
                precio: Number(productoActual.precio),

                imagen: productoActual.imagenes?.[0]?.url ||
                    productoActual.imagenes?.[0] ||
                    IMAGEN_DEFAULT,

                cantidad: 1

            });

        }

        localStorage.setItem(
            "carritoTigreMarket",
            JSON.stringify(carrito)
        );

        mensajeAccion.textContent =
            `"${productoActual.nombre}" se agregó al carrito.`;

    });

}


/* =========================================================================
   9. MENÚ DE NAVEGACIÓN Y PANEL DE CUENTA
========================================================================= */

const btnHamburguesa =
    document.getElementById("btn-hamburguesa");

const menuNavegacion =
    document.getElementById("menu-navegacion");


if (btnHamburguesa && menuNavegacion) {

    btnHamburguesa.addEventListener("click", () => {
        menuNavegacion.classList.toggle("activo");
    });

}


function abrirPanelCuenta() {

    const panel = document.getElementById("panel-cuenta");
    const overlay = document.getElementById("overlay-cuenta");

    if (panel && overlay) {

        menuNavegacion?.classList.remove("activo");

        panel.classList.add("activo");
        overlay.classList.add("activo");

        document.body.style.overflow = "hidden";

    }

}


function cerrarPanelCuenta() {

    const panel = document.getElementById("panel-cuenta");
    const overlay = document.getElementById("overlay-cuenta");

    if (panel && overlay) {

        panel.classList.remove("activo");
        overlay.classList.remove("activo");

        document.body.style.overflow = "auto";

    }

}

window.abrirPanelCuenta = abrirPanelCuenta;
window.cerrarPanelCuenta = cerrarPanelCuenta;


/* =========================================================================
   10. CIERRE DE SESIÓN
========================================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const btnLogout = document.getElementById("btn-logout");
    const modalLogout = document.getElementById("modal-logout");

    const btnCancelar =
        document.getElementById("btn-cancelar-logout");

    const btnConfirmar =
        document.getElementById("btn-confirmar-logout");

    if (btnLogout) {

        btnLogout.addEventListener("click", (e) => {

            e.preventDefault();

            cerrarPanelCuenta();

            modalLogout?.classList.add("activo");

        });

    }

    if (btnCancelar) {

        btnCancelar.addEventListener("click", () => {
            modalLogout?.classList.remove("activo");
        });

    }

    if (btnConfirmar) {

        btnConfirmar.addEventListener("click", async () => {

            try {

                await signOut(auth);

                window.location.href = "/frontend/index.html";

            } catch (error) {

                console.error("Error al cerrar sesión:", error);

                alert("No se pudo cerrar la sesión.");

            }

        });

    }

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            cerrarPanelCuenta();

            modalLogout?.classList.remove("activo");

        }

    });

});


/* =========================================================================
   11. INICIAR CONSULTA DEL PRODUCTO
========================================================================= */

cargarProducto();
