
/* ==========================================================================
   TIGRE MARKET - PUBLICACIÓN DE PRODUCTOS
   Firebase Authentication + Firestore + Cloudinary
   ========================================================================== */

import { auth, db } from "../backend/firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";


/* ==========================================================================
   1. CONFIGURACIÓN GENERAL
   ========================================================================== */

// Cloudinary
const CLOUDINARY_CLOUD_NAME = "nfhkqtza";
const CLOUDINARY_UPLOAD_PRESET = "tigre_market_productos";

// Fotografías
const MAX_FOTOS = 5;
const MAX_DIMENSION = 1280;
const CALIDAD_IMAGEN = 0.78;
const MAX_PESO_ORIGINAL = 10 * 1024 * 1024; // 10 MB

// Colección de Firestore
const COLECCION_PRODUCTOS = "productos";

// Página de inicio de sesión
const RUTA_LOGIN = "/frontend/index.html";

// Usuario que inició sesión
let usuarioActual = null;

// Evita que se publiquen varios productos al mismo tiempo
let publicando = false;


/* ==========================================================================
   2. ELEMENTOS HTML
   ========================================================================== */

const inputNombre = document.getElementById("nombre-producto");
const contadorSpan = document.getElementById("contador-caracteres");

const inputPrecio = document.getElementById("precio-producto");
const inputDescripcion = document.getElementById("descripcion-producto");

const inputFotos = document.getElementById("input-fotos");
const estadoFotos = document.getElementById("estado-fotos");

const formPublicar = document.getElementById("form-publicar");

const modalPub = document.getElementById("modal-verificacion-publicar");
const btnLanzarModal = document.getElementById("btn-lanzar-modal-publicar");
const btnCancelarPub = document.getElementById("btn-cancelar-publicacion");

const inputEdad = document.getElementById("modal-edad-usuario");
const inputNombreUsuario = document.getElementById("modal-nombre-usuario");
const checkTerminos = document.getElementById("check-terminos");
const btnFinalPub = document.getElementById("btn-final-publicar");

const gridPublicaciones = 
    document.getElementById("grid-mis-publicaciones");


/* ==========================================================================
   3. VALIDACIÓN DEL NOMBRE DEL PRODUCTO
   ========================================================================== */

if (inputNombre && contadorSpan) {

    inputNombre.addEventListener("input", () => {

        const actual = inputNombre.value.length;

        contadorSpan.textContent = `${actual} / 25`;

    });

}


/* ==========================================================================
   4. VALIDACIÓN DEL PRECIO
   ========================================================================== */

if (inputPrecio) {

    inputPrecio.addEventListener("input", () => {

        const valor = parseFloat(inputPrecio.value);

        if (isNaN(valor) || valor <= 1) {

            inputPrecio.setCustomValidity(
                "El precio debe ser mayor a $1.00 (sin ceros ni negativos)."
            );

        } else {

            inputPrecio.setCustomValidity("");

        }

    });

}


/* ==========================================================================
   5. COMPRESIÓN DE FOTOGRAFÍAS
   ========================================================================== */

window.fotosComprimidas = [];


async function comprimirImagen(archivo) {

    // Comprobar que sea una imagen permitida
    const formatosPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!formatosPermitidos.includes(archivo.type)) {

        throw new Error(
            `El archivo ${archivo.name} no tiene un formato permitido. Usa JPG, PNG o WebP.`
        );

    }

    // Comprobar el peso original
    if (archivo.size > MAX_PESO_ORIGINAL) {

        throw new Error(
            `La imagen ${archivo.name} supera el límite de 10 MB.`
        );

    }

    // Crear una imagen desde el archivo original
    const imagen = await createImageBitmap(archivo);

    const anchoOriginal = imagen.width;
    const altoOriginal = imagen.height;

    // Mantener proporciones y reducir únicamente cuando sea necesario
    const escala = Math.min(
        1,
        MAX_DIMENSION / Math.max(anchoOriginal, altoOriginal)
    );

    const nuevoAncho = Math.round(anchoOriginal * escala);
    const nuevoAlto = Math.round(altoOriginal * escala);

    // Crear canvas
    const canvas = document.createElement("canvas");

    canvas.width = nuevoAncho;
    canvas.height = nuevoAlto;

    const contexto = canvas.getContext("2d");

    if (!contexto) {

        imagen.close();

        throw new Error("No se pudo procesar la fotografía.");

    }

    contexto.imageSmoothingEnabled = true;
    contexto.imageSmoothingQuality = "high";

    contexto.drawImage(
        imagen,
        0,
        0,
        nuevoAncho,
        nuevoAlto
    );

    imagen.close();

    // Convertir a WebP
    const blob = await new Promise((resolve, reject) => {

        canvas.toBlob(
            (resultado) => {

                if (resultado) {

                    resolve(resultado);

                } else {

                    reject(
                        new Error("No se pudo comprimir la fotografía.")
                    );

                }

            },
            "image/webp",
            CALIDAD_IMAGEN
        );

    });

    // Liberar memoria
    canvas.width = 0;
    canvas.height = 0;

    // Si el WebP pesa más, conservar el archivo original
    if (blob.size >= archivo.size) {

        return archivo;

    }

    // Crear archivo WebP comprimido
    const nombreArchivo =
        archivo.name.replace(/\.[^/.]+$/, "") + ".webp";

    return new File(
        [blob],
        nombreArchivo,
        {
            type: "image/webp",
            lastModified: Date.now()
        }
    );

}


/* ==========================================================================
   6. PROCESAR FOTOGRAFÍAS CUANDO EL USUARIO LAS SELECCIONE
   ========================================================================== */

if (inputFotos) {

    inputFotos.addEventListener("change", async function () {

        const archivos = Array.from(this.files);

        window.fotosComprimidas = [];

        if (estadoFotos) {
            estadoFotos.textContent = "";
        }

        // Máximo 5 fotografías
        if (archivos.length > MAX_FOTOS) {

            alert("Solo puedes seleccionar un máximo de 5 fotografías.");

            this.value = "";

            return;

        }

        if (archivos.length === 0) {
            return;
        }

        inputFotos.disabled = true;

        if (estadoFotos) {
            estadoFotos.textContent = "Comprimiendo fotografías...";
        }

        try {

            let pesoOriginalTotal = 0;
            let pesoComprimidoTotal = 0;

            for (const archivo of archivos) {

                pesoOriginalTotal += archivo.size;

                const comprimida = await comprimirImagen(archivo);

                window.fotosComprimidas.push(comprimida);

                pesoComprimidoTotal += comprimida.size;

            }

            const ahorro = pesoOriginalTotal > 0
                ? (1 - pesoComprimidoTotal / pesoOriginalTotal) * 100
                : 0;

            if (estadoFotos) {

                estadoFotos.textContent =
                    window.fotosComprimidas.length +
                    " fotografías listas. Tamaño original: " +
                    (pesoOriginalTotal / 1024 / 1024).toFixed(2) +
                    " MB. Tamaño final: " +
                    (pesoComprimidoTotal / 1024 / 1024).toFixed(2) +
                    " MB. Ahorro: " +
                    Math.max(0, ahorro).toFixed(1) +
                    "%.";

            }

            console.log(
                "Fotografías comprimidas:",
                window.fotosComprimidas
            );

        } catch (error) {

            console.error("Error al comprimir:", error);

            alert(error.message);

            window.fotosComprimidas = [];

            inputFotos.value = "";

            if (estadoFotos) {
                estadoFotos.textContent =
                    "No se pudieron procesar las fotografías.";
            }

        } finally {

            inputFotos.disabled = false;

        }

    });

}


/* ==========================================================================
   7. SUBIR UNA FOTOGRAFÍA A CLOUDINARY
   ========================================================================== */

async function subirImagenCloudinary(archivo) {

    const URL_CLOUDINARY =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    const datos = new FormData();

    datos.append("file", archivo);
    datos.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const respuesta = await fetch(URL_CLOUDINARY, {
        method: "POST",
        body: datos
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {

        console.error("Error de Cloudinary:", resultado);

        throw new Error(
            resultado.error?.message ||
            "No se pudo subir una fotografía a Cloudinary."
        );

    }

    // URL original proporcionada por Cloudinary
    const urlOriginal = resultado.secure_url;

    // Transformaciones de entrega para reducir el peso de descarga
    const urlOptimizada = urlOriginal.replace(
        "/upload/",
        "/upload/f_auto,q_auto:eco/"
    );

    return {

        url: urlOptimizada,

        public_id: resultado.public_id

    };

}


/* ==========================================================================
   8. SUBIR TODAS LAS FOTOGRAFÍAS DEL PRODUCTO
   ========================================================================== */

async function subirTodasLasImagenes() {

    const imagenesSubidas = [];

    // Si no se seleccionaron fotografías, usar la imagen predeterminada
    if (window.fotosComprimidas.length === 0) {

        return [
            {
                url: "/frontend/img/producto-default.jpg",
                public_id: null
            }
        ];

    }

    // Subir fotografías una por una
    for (let i = 0; i < window.fotosComprimidas.length; i++) {

        if (estadoFotos) {

            estadoFotos.textContent =
                `Subiendo fotografía ${i + 1} de ${window.fotosComprimidas.length}...`;

        }

        const resultado = await subirImagenCloudinary(
            window.fotosComprimidas[i]
        );

        imagenesSubidas.push(resultado);

    }

    return imagenesSubidas;

}


/* ==========================================================================
   9. CONTROL DEL MODAL DE VERIFICACIÓN
   ========================================================================== */

function evaluarHabilitacionPublicacion() {

    if (!inputEdad || !checkTerminos || !btnFinalPub) {
        return;
    }

    const edadValida = parseInt(inputEdad.value, 10) >= 18;

    const terminosAceptados = checkTerminos.checked;

    if (edadValida && terminosAceptados) {

        btnFinalPub.disabled = false;

        btnFinalPub.classList.remove("btn-publicar-inactivo");

        btnFinalPub.classList.add("btn-publicar-activo");

    } else {

        btnFinalPub.disabled = true;

        btnFinalPub.classList.remove("btn-publicar-activo");

        btnFinalPub.classList.add("btn-publicar-inactivo");

    }

}


if (btnLanzarModal && formPublicar && modalPub) {

    btnLanzarModal.addEventListener("click", (e) => {

        e.preventDefault();

        if (formPublicar.checkValidity()) {

            modalPub.classList.add("activo");

        } else {

            formPublicar.reportValidity();

        }

    });

}


if (btnCancelarPub && modalPub) {

    btnCancelarPub.addEventListener("click", () => {

        modalPub.classList.remove("activo");

    });

}


if (inputEdad) {

    inputEdad.addEventListener(
        "input",
        evaluarHabilitacionPublicacion
    );

}


if (checkTerminos) {

    checkTerminos.addEventListener(
        "change",
        evaluarHabilitacionPublicacion
    );

}


/* ==========================================================================
   10. PUBLICAR PRODUCTO EN FIRESTORE Y CLOUDINARY
   ========================================================================== */

if (btnFinalPub) {

    btnFinalPub.addEventListener("click", async (e) => {

        e.preventDefault();

        if (btnFinalPub.disabled || publicando) {
            return;
        }

        if (!usuarioActual) {

            alert("Debes iniciar sesión para publicar un producto.");

            return;

        }

        if (!formPublicar || !formPublicar.checkValidity()) {

            formPublicar?.reportValidity();

            return;

        }

        if (!inputEdad || parseInt(inputEdad.value, 10) < 18) {

            alert("Debes confirmar que tienes al menos 18 años.");

            return;

        }

        if (!checkTerminos || !checkTerminos.checked) {

            alert("Debes aceptar los términos y condiciones.");

            return;

        }

        const nombreProd = inputNombre.value.trim();

        const precioProd = parseFloat(inputPrecio.value);

        const descripcionProd = inputDescripcion.value.trim();

        const vendedor =
            inputNombreUsuario?.value.trim() ||
            usuarioActual.displayName ||
            usuarioActual.email.split("@")[0];

        if (!nombreProd || !descripcionProd || !Number.isFinite(precioProd) || precioProd <= 1) {

            alert("Revisa los datos del producto antes de publicarlo.");

            return;

        }

        // Comprobar que las fotografías ya terminaron de procesarse
        if (inputFotos?.files.length > 0 &&
            window.fotosComprimidas.length !== inputFotos.files.length) {

            alert("Espera a que terminen de procesarse las fotografías.");

            return;

        }

        publicando = true;

        btnFinalPub.disabled = true;

        btnFinalPub.textContent = "Publicando...";

        try {

            // 1. Subir las fotografías a Cloudinary
            const imagenes = await subirTodasLasImagenes();

            // 2. Crear el producto en Firestore
            const producto = {

                nombre: nombreProd,

                precio: precioProd,

                descripcion: descripcionProd,

                vendedor: vendedor,

                propietarioUid: usuarioActual.uid,

                imagenes: imagenes,

                fechaPublicacion: serverTimestamp()

            };

            await addDoc(
                collection(db, COLECCION_PRODUCTOS),
                producto
            );

            // 3. Limpiar el formulario
            formPublicar.reset();

            window.fotosComprimidas = [];

            if (contadorSpan) {
                contadorSpan.textContent = "0 / 25";
            }

            if (estadoFotos) {
                estadoFotos.textContent = "";
            }

            evaluarHabilitacionPublicacion();

            // 4. Cerrar modal
            if (modalPub) {
                modalPub.classList.remove("activo");
            }

            // 5. Actualizar publicaciones
            await renderizarPublicaciones();

            alert("¡Producto publicado con éxito en Tigre Market!");

        } catch (error) {

            console.error("Error al publicar producto:", error);

            alert(
                "No se pudo publicar el producto. " +
                "Revisa tu conexión e inténtalo nuevamente.\n\n" +
                error.message
            );

        } finally {

            publicando = false;

            btnFinalPub.textContent = "Publicar";

            evaluarHabilitacionPublicacion();

        }

    });

}


/* ==========================================================================
   11. MOSTRAR LAS PUBLICACIONES DEL USUARIO EN FIRESTORE
   ========================================================================== */

async function renderizarPublicaciones() {

    if (!gridPublicaciones || !usuarioActual) {
        return;
    }

    gridPublicaciones.innerHTML = "";

    try {

        const consulta = query(
            collection(db, COLECCION_PRODUCTOS),
            where("propietarioUid", "==", usuarioActual.uid)
        );

        const resultado = await getDocs(consulta);

        if (resultado.empty) {

            const mensaje = document.createElement("p");

            mensaje.className = "mensaje-sin-publicaciones";

            mensaje.textContent =
                "Aún no has publicado ningún producto.";

            gridPublicaciones.appendChild(mensaje);

            return;

        }

        resultado.forEach((documento) => {

            const pub = documento.data();

            const tarjeta = document.createElement("div");

            tarjeta.className = "card-publicacion";

            // Contenedor de información
            const contenido = document.createElement("div");

            // Imagen
            const imagen = document.createElement("img");

            imagen.src =
                pub.imagenes?.[0]?.url ||
                "/frontend/img/producto-default.jpg";

            imagen.alt = pub.nombre || "Producto publicado";

            imagen.loading = "lazy";

            // Nombre
            const nombre = document.createElement("h3");

            nombre.textContent = pub.nombre || "Producto sin nombre";

            // Precio
            const precio = document.createElement("span");

            precio.className = "precio-pub";

            precio.textContent =
                `$${Number(pub.precio).toFixed(2)} MXN`;

            // Descripción
            const descripcion = document.createElement("p");

            descripcion.textContent =
                pub.descripcion || "Sin descripción.";

            // Botón de eliminar
            const botonEliminar = document.createElement("button");

            botonEliminar.type = "button";

            botonEliminar.className = "btn-eliminar-pub";

            botonEliminar.textContent = "Eliminar publicación";

            botonEliminar.addEventListener("click", () => {

                eliminarPublicacion(documento.id);

            });

            // Construir tarjeta
            contenido.appendChild(imagen);

            contenido.appendChild(nombre);

            contenido.appendChild(precio);

            contenido.appendChild(descripcion);

            tarjeta.appendChild(contenido);

            tarjeta.appendChild(botonEliminar);

            gridPublicaciones.appendChild(tarjeta);

        });

    } catch (error) {

        console.error("Error al consultar publicaciones:", error);

        gridPublicaciones.textContent =
            "No se pudieron cargar tus publicaciones.";

    }

}


/* ==========================================================================
   12. ELIMINAR PUBLICACIÓN DE FIRESTORE
   ========================================================================== */

async function eliminarPublicacion(id) {

    if (!usuarioActual) {
        return;
    }

    const confirmar = confirm(
        "¿Estás seguro de que deseas eliminar esta publicación?"
    );

    if (!confirmar) {
        return;
    }

    try {

        await deleteDoc(
            doc(db, COLECCION_PRODUCTOS, id)
        );

        await renderizarPublicaciones();

        alert("La publicación se eliminó correctamente.");

    } catch (error) {

        console.error("Error al eliminar publicación:", error);

        alert("No se pudo eliminar la publicación.");

    }

}


/* ==========================================================================
   13. PANEL LATERAL DE CUENTA
   ========================================================================== */

function abrirPanelCuenta() {

    const panel = document.getElementById("panel-cuenta");

    const overlay = document.getElementById("overlay-cuenta");

    if (panel && overlay) {

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


// Permite que los botones del HTML puedan utilizar estas funciones
window.abrirPanelCuenta = abrirPanelCuenta;

window.cerrarPanelCuenta = cerrarPanelCuenta;


/* ==========================================================================
   14. CIERRE DE SESIÓN
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const btnLogout = document.getElementById("btn-logout");

    const modalLogout = document.getElementById("modal-logout");

    const btnCancelar = document.getElementById("btn-cancelar-logout");

    const btnConfirmar = document.getElementById("btn-confirmar-logout");


    // Abrir modal de cierre de sesión
    if (btnLogout) {

        btnLogout.addEventListener("click", (e) => {

            e.preventDefault();

            cerrarPanelCuenta();

            if (modalLogout) {
                modalLogout.classList.add("activo");
            }

        });

    }


    // Cancelar cierre de sesión
    if (btnCancelar) {

        btnCancelar.addEventListener("click", () => {

            if (modalLogout) {
                modalLogout.classList.remove("activo");
            }

        });

    }


    // Confirmar cierre de sesión
    if (btnConfirmar) {

        btnConfirmar.addEventListener("click", async () => {

            try {

                await signOut(auth);

                window.location.href = RUTA_LOGIN;

            } catch (error) {

                console.error("Error al cerrar sesión:", error);

                alert("No se pudo cerrar la sesión.");

            }

        });

    }


    // Cerrar panel o modal con ESC
    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            cerrarPanelCuenta();

            if (modalLogout) {
                modalLogout.classList.remove("activo");
            }

        }

    });

});


/* ==========================================================================
   15. COMPROBAR SESIÓN DE FIREBASE
   ========================================================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        usuarioActual = null;

        window.location.href = RUTA_LOGIN;

        return;

    }

    // Comprobar correo institucional
    const correoInstitucional =
        user.email &&
        /^[^@]+@tecnaucalpan\.mx$/i.test(user.email);

    // Comprobar que el correo esté verificado
    if (!correoInstitucional || !user.emailVerified) {

        alert(
            "Debes iniciar sesión con una cuenta institucional verificada."
        );

        await signOut(auth);

        window.location.href = RUTA_LOGIN;

        return;

    }

    usuarioActual = user;

    // Cargar publicaciones del usuario
    await renderizarPublicaciones();

});
/*=====================================
script que modifica el panel de opciones de cuenta en pantallas pequeñas
======================================*/
function abrirPanelCuenta() {
    const menuNavegacion = document.getElementById('menu-navegacion');
    if (menuNavegacion) {
        menuNavegacion.classList.remove('activo');
    }

    const panel = document.getElementById('panel-cuenta');
    const overlay = document.getElementById('overlay-cuenta');
    if (panel && overlay) {
        panel.classList.add('activo');
        overlay.classList.add('activo');
        document.body.style.overflow = 'hidden';
    }
}
