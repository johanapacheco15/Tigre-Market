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
/*=====================================
script que se encarga de que la hamburguesa se muestre en pantallas pequeñas
======================================*/
const btnHamburguesa = document.getElementById('btn-hamburguesa');
const menuNavegacion = document.getElementById('menu-navegacion');

btnHamburguesa.addEventListener('click', () => {
    menuNavegacion.classList.toggle('activo');
});