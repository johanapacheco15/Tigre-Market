    /* ==========================================================================
       1. VALIDACIÓN Y CONTADOR DE CARACTERES PARA EL NOMBRE DEL PRODUCTO (MÁX 25)
       ========================================================================== */
    const inputNombre = document.getElementById('nombre-producto');
    const contadorSpan = document.getElementById('contador-caracteres');

    // Actualiza el contador dinámicamente conforme el usuario escribe
    inputNombre.addEventListener('input', () => {
        const actual = inputNombre.value.length;
        contadorSpan.textContent = `${actual} / 25`;
    });


    /* ==========================================================================
       2. VALIDACIÓN ESTRICTA DEL PRECIO (> $1, SIN CEROS NI NEGATIVOS)
       ========================================================================== */
    const inputPrecio = document.getElementById('precio-producto');

    // Valida en tiempo real que el valor numérico no sea cero, negativo o menor a 1.01
    inputPrecio.addEventListener('input', () => {
        const valor = parseFloat(inputPrecio.value);
        if (isNaN(valor) || valor <= 1) {
            inputPrecio.setCustomValidity("El precio debe ser mayor a $1.00 (sin ceros ni negativos).");
        } else {
            inputPrecio.setCustomValidity("");
        }
    });


    /* ==========================================================================
       3. CONTROL DEL MODAL DE VERIFICACIÓN Y GUARDADO DE PUBLICACIÓN
       ========================================================================== */
    const modalPub = document.getElementById('modal-verificacion-publicar');
    const btnLanzarModal = document.getElementById('btn-lanzar-modal-publicar');
    const btnCancelarPub = document.getElementById('btn-cancelar-publicacion');
    
    const inputEdad = document.getElementById('modal-edad-usuario');
    const inputNombreUsuario = document.getElementById('modal-nombre-usuario');
    const checkTerminos = document.getElementById('check-terminos');
    const btnFinalPub = document.getElementById('btn-final-publicar');
    const formPublicar = document.getElementById('form-publicar');

    btnLanzarModal.addEventListener('click', () => {
        if (formPublicar.checkValidity()) {
            modalPub.classList.add('activo');
        } else {
            formPublicar.reportValidity();
        }
    });

    btnCancelarPub.addEventListener('click', () => {
        modalPub.classList.remove('activo');
    });

    function evaluarHabilitacionPublicacion() {
        const edadValida = parseInt(inputEdad.value) >= 18;
        const terminosAceptados = checkTerminos.checked;

        if (edadValida && terminosAceptados) {
            btnFinalPub.disabled = false;
            btnFinalPub.classList.remove('btn-publicar-inactivo');
            btnFinalPub.classList.add('btn-publicar-activo');
        } else {
            btnFinalPub.disabled = true;
            btnFinalPub.classList.remove('btn-publicar-activo');
            btnFinalPub.classList.add('btn-publicar-inactivo');
        }
    }

    inputEdad.addEventListener('input', evaluarHabilitacionPublicacion);
    checkTerminos.addEventListener('change', evaluarHabilitacionPublicacion);

        /* ==========================================================================
       3.1. GUARDAR PUBLICACIÓN EN LOCALSTORAGE ESTO SE CAMBIA POR UNA BASE DE DATOS EN EL FUTURO
       ========================================================================== */
    btnFinalPub.addEventListener('click', () => {
        if (btnFinalPub.disabled) return;

        const inputFotos = document.getElementById('input-fotos');
        const nombreProd = document.getElementById('nombre-producto').value.trim();
        const precioProd = parseFloat(document.getElementById('precio-producto').value).toFixed(2);
        const descProd = document.getElementById('descripcion-producto').value.trim();
        const vendedor = inputNombreUsuario.value.trim() || 'Usuario Tigre';

        const guardarEnStorage = (imagenBase64) => {
            const publicaciones = JSON.parse(localStorage.getItem('tigre_publicaciones')) || [];
            
            publicaciones.unshift({
                id: Date.now(),
                nombre: nombreProd,
                precio: precioProd,
                descripcion: descProd,
                imagen: imagenBase64,
                vendedor: vendedor
            });

            localStorage.setItem('tigre_publicaciones', JSON.stringify(publicaciones));
            
            // Limpiar formulario, cerrar modal y actualizar la lista
            formPublicar.reset();
            contadorSpan.textContent = '0 / 25';
            inputEdad.value = '';
            checkTerminos.checked = false;
            evaluarHabilitacionPublicacion();
            modalPub.classList.remove('activo');
            
            renderizarPublicaciones();
            alert('¡Producto publicado con éxito en Tigre Market!');
        };

        // Leer la primera imagen seleccionada para guardarla en formato Base64
        if (inputFotos.files && inputFotos.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => guardarEnStorage(e.target.result);
            reader.readAsDataURL(inputFotos.files[0]);
        } else {
            guardarEnStorage('/frontend/img/producto-default.jpg');
        }
    });


    /* ==========================================================================
       4. RENDERIZAR Y ELIMINAR PUBLICACIONES DEL USUARIO
       ========================================================================== */
    const gridPublicaciones = document.getElementById('grid-mis-publicaciones');

    function renderizarPublicaciones() {
        if (!gridPublicaciones) return;

        const publicaciones = JSON.parse(localStorage.getItem('tigre_publicaciones')) || [];
        gridPublicaciones.innerHTML = '';

        if (publicaciones.length === 0) {
            gridPublicaciones.innerHTML = '<p class="mensaje-sin-publicaciones">Aún no has publicado ningún producto.</p>';
            return;
        }

        publicaciones.forEach((pub) => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'card-publicacion';
            tarjeta.innerHTML = `
                <div>
                    <img src="${pub.imagen}" alt="${pub.nombre}">
                    <h3>${pub.nombre}</h3>
                    <span class="precio-pub">$${pub.precio} MXN</span>
                    <p>${pub.descripcion}</p>
                </div>
                <button type="button" class="btn-eliminar-pub" data-id="${pub.id}">Eliminar publicación</button>
            `;
            gridPublicaciones.appendChild(tarjeta);
        });

        // Asignar evento de eliminación a cada botón generado
        document.querySelectorAll('.btn-eliminar-pub').forEach((boton) => {
            boton.addEventListener('click', (e) => {
                const idEliminar = parseInt(e.target.getAttribute('data-id'));
                eliminarPublicacion(idEliminar);
            });
        });
    }

    function eliminarPublicacion(id) {
        let publicaciones = JSON.parse(localStorage.getItem('tigre_publicaciones')) || [];
        publicaciones = publicaciones.filter(pub => pub.id !== id);
        localStorage.setItem('tigre_publicaciones', JSON.stringify(publicaciones));
        renderizarPublicaciones();
    }

    // Cargar las publicaciones guardadas al abrir la página
    renderizarPublicaciones();


/* ==========================================================================
    5. FUNCIONES GLOBALES PARA ABRIR Y CERRAR EL PANEL LATERAL DE CUENTA
    ========================================================================== */
    // Funciones globales para abrir y cerrar el panel lateral
function abrirPanelCuenta() {
    const panel = document.getElementById('panel-cuenta');
    const overlay = document.getElementById('overlay-cuenta');
    if (panel && overlay) {
        panel.classList.add('activo');
        overlay.classList.add('activo');
        document.body.style.overflow = 'hidden'; // Bloquea el scroll del fondo
    }
}

function cerrarPanelCuenta() {
    const panel = document.getElementById('panel-cuenta');
    const overlay = document.getElementById('overlay-cuenta');
    if (panel && overlay) {
        panel.classList.remove('activo');
        overlay.classList.remove('activo');
        document.body.style.overflow = 'auto'; // Restaura el scroll
    }
}

// Lógica al cargar el documento (Modal de Logout y eventos de teclado)
document.addEventListener('DOMContentLoaded', () => {
    const btnLogout = document.getElementById('btn-logout');
    const modalLogout = document.getElementById('modal-logout');
    const btnCancelar = document.getElementById('btn-cancelar-logout');
    const btnConfirmar = document.getElementById('btn-confirmar-logout');

    // Mostrar modal personalizado al hacer clic en "Cerrar Sesión"
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            // Cerramos el panel lateral primero para que no estorbe
            cerrarPanelCuenta();
            if (modalLogout) modalLogout.classList.add('activo');
        });
    }

    // Cancelar cierre de sesión
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            if (modalLogout) modalLogout.classList.remove('activo');
        });
    }

    // Confirmar cierre de sesión
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', () => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/frontend/index.html'; // Redirige al login
        });
    }

    // Cierra el panel o el modal al presionar la tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarPanelCuenta();
            if (modalLogout) modalLogout.classList.remove('activo');
        }
    });
});



// ==========================================
// COMPRESIÓN DE FOTOGRAFÍAS DE PRODUCTOS
// ==========================================

// Configuración
const MAX_FOTOS = 5;
const MAX_DIMENSION = 1600;
const CALIDAD_IMAGEN = 0.86;
const MAX_PESO_ORIGINAL = 15 * 1024 * 1024; // 15 MB

// Obtener elementos HTML
const inputFotos = document.getElementById("input-fotos");
const estadoFotos = document.getElementById("estado-fotos");

// Aquí se guardarán las fotografías comprimidas
// Estarán disponibles para el proceso de publicación.
window.fotosComprimidas = [];


// ==========================================
// FUNCIÓN PARA COMPRIMIR UNA FOTOGRAFÍA
// ==========================================

async function comprimirImagen(archivo) {

    // Comprobar que el archivo sea una imagen
    if (!archivo.type.startsWith("image/")) {
        throw new Error("El archivo seleccionado no es una imagen.");
    }

    // Evitar archivos originales demasiado grandes
    if (archivo.size > MAX_PESO_ORIGINAL) {
        throw new Error(
            "La imagen " + archivo.name +
            " supera el límite de 15 MB."
        );
    }

    // Crear una imagen a partir del archivo original
    const imagen = await createImageBitmap(archivo);

    // Obtener dimensiones originales
    const anchoOriginal = imagen.width;
    const altoOriginal = imagen.height;

    // Calcular el tamaño sin deformar la fotografía
    const escala = Math.min(
        1,
        MAX_DIMENSION / Math.max(anchoOriginal, altoOriginal)
    );

    const nuevoAncho = Math.round(anchoOriginal * escala);
    const nuevoAlto = Math.round(altoOriginal * escala);

    // Crear un lienzo para procesar la fotografía
    const canvas = document.createElement("canvas");

    canvas.width = nuevoAncho;
    canvas.height = nuevoAlto;

    const contexto = canvas.getContext("2d");

    // Mejorar el suavizado al reducir dimensiones
    contexto.imageSmoothingEnabled = true;
    contexto.imageSmoothingQuality = "high";

    // Dibujar la fotografía en el nuevo tamaño
    contexto.drawImage(
        imagen,
        0,
        0,
        nuevoAncho,
        nuevoAlto
    );

    // Liberar recursos de la imagen original
    imagen.close();

    // Convertir el lienzo a formato WebP
    const blob = await new Promise((resolve, reject) => {

        canvas.toBlob(
            function(resultado) {

                if (resultado) {
                    resolve(resultado);
                } else {
                    reject(new Error("No se pudo comprimir la imagen."));
                }

            },
            "image/webp",
            CALIDAD_IMAGEN
        );

    });

    // Liberar memoria del lienzo
    canvas.width = 0;
    canvas.height = 0;

    // Si el resultado pesa más que el original,
    // conservar el original en lugar de aumentar su tamaño.
    if (blob.size >= archivo.size) {
        return archivo;
    }

    // Crear un archivo comprimido
    const nombreArchivo =
        archivo.name.replace(/\.[^/.]+$/, "") + ".webp";

    const imagenComprimida = new File(
        [blob],
        nombreArchivo,
        {
            type: "image/webp",
            lastModified: Date.now()
        }
    );

    return imagenComprimida;
}


// ==========================================
// EVENTO AL SELECCIONAR FOTOGRAFÍAS
// ==========================================

if (inputFotos) {

    inputFotos.addEventListener("change", async function() {

        const archivos = Array.from(this.files);

        // Reiniciar las fotografías anteriores
        window.fotosComprimidas = [];

        if (estadoFotos) {
            estadoFotos.textContent = "";
        }

        // Comprobar que no excedan las 5 fotografías
        if (archivos.length > MAX_FOTOS) {

            alert("Solo puedes seleccionar un máximo de 5 fotografías.");

            this.value = "";
            return;
        }

        if (archivos.length === 0) {
            return;
        }

        // Deshabilitar el campo mientras se comprimen
        inputFotos.disabled = true;

        if (estadoFotos) {
            estadoFotos.textContent = "Comprimiendo fotografías...";
        }

        try {

            let pesoOriginalTotal = 0;
            let pesoComprimidoTotal = 0;

            // Procesar cada fotografía
            for (const archivo of archivos) {

                pesoOriginalTotal += archivo.size;

                const imagenComprimida = await comprimirImagen(archivo);

                window.fotosComprimidas.push(imagenComprimida);

                pesoComprimidoTotal += imagenComprimida.size;
            }

            // Calcular ahorro de espacio
            const ahorro = pesoOriginalTotal > 0
                ? (1 - pesoComprimidoTotal / pesoOriginalTotal) * 100
                : 0;

            // Mostrar resultados
            if (estadoFotos) {

                estadoFotos.textContent =
                    window.fotosComprimidas.length +
                    " fotografías listas. " +
                    "Tamaño original: " +
                    (pesoOriginalTotal / 1024 / 1024).toFixed(2) +
                    " MB. Tamaño final: " +
                    (pesoComprimidoTotal / 1024 / 1024).toFixed(2) +
                    " MB. Ahorro: " +
                    Math.max(0, ahorro).toFixed(1) + "%.";
            }

            console.log("Fotografías originales:", archivos);
            console.log("Fotografías comprimidas:", window.fotosComprimidas);

        } catch (error) {

            console.error("Error al comprimir fotografías:", error);

            alert(error.message);

            window.fotosComprimidas = [];
            inputFotos.value = "";

            if (estadoFotos) {
                estadoFotos.textContent = "No se pudieron procesar las fotografías.";
            }

        } finally {

            inputFotos.disabled = false;
        }

    });

}
