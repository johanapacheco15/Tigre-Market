
/*=============================================
   1. SCRIPT PARA MOSTRAR VISTA PREVIA DE IMAGEN SELECCIONADA EN EL FORMULARIO DE EDICIÓN DE PERFIL
   ===============================================*/
//Script para mostrar la vista previa de la imagen seleccionada en el formulario de edición de perfil
document.addEventListener('DOMContentLoaded', () => {
    const inputFile = document.getElementById('input-file-avatar');
    const imgPreview = document.getElementById('img-preview');

    if (inputFile) {
        inputFile.addEventListener('change', (e) => {
            const archivo = e.target.files[0];
            if (archivo) {
                // Crear una URL temporal para mostrar la vista previa de la imagen seleccionada
                const urlTemporal = URL.createObjectURL(archivo);
                imgPreview.src = urlTemporal;
            }
        });
    }
});

/*=============================================
   2. SCRIPT PARA CARGAR DATOS DEL USUARIO DESDE LOCALSTORAGE EN EL FORMULARIO DE EDICIÓN DE PERFIL CAMBIADO POR UNA BASE DE DATOS EN EL FUTURO
   ===============================================*/
//Cargar datos del usuario desde el localStorage y mostrarlos en el formulario de edición de perfil//
//Se puede cambiar la forma editar si se obtiene de otra manera.//
document.addEventListener('DOMContentLoaded', () => {
    // Ejemplo de recuperación desde localStorage (ajusta los nombres de tus llaves)
    const nombreGuardado = localStorage.getItem('usuario_nombre');
    const correoGuardado = localStorage.getItem('usuario_correo');

    const inputNombre = document.getElementById('perfil-nombre');
    const inputCorreo = document.getElementById('perfil-correo');

    if (nombreGuardado && inputNombre) {
        inputNombre.value = nombreGuardado;
    }

    if (correoGuardado && inputCorreo) {
        inputCorreo.value = correoGuardado;
    }
});

/*=============================================
   3. SCRIPT PARA VENTANA EMERGENTE DE CAMBIO DE IMAGEN DE PERFIL 
   ===============================================*/
//Ventana emergente para el cambio de imagen de perfil//
document.addEventListener('DOMContentLoaded', () => {
    const btnAbrirModal = document.getElementById('btn-abrir-modal-foto');
    const modalFoto = document.getElementById('modal-cambiar-foto');
    const btnCancelar = document.getElementById('btn-cancelar-foto');
    const btnGuardar = document.getElementById('btn-guardar-foto');
    
    const inputFile = document.getElementById('input-file-modal');
    const imgPreviewModal = document.getElementById('img-preview-modal');
    const imgPerfilActual = document.getElementById('img-perfil-actual');
    const textoArchivo = document.getElementById('nombre-archivo-seleccionado');

    let imagenSeleccionadaURL = null;

    // 1. Abrir el modal
    if (btnAbrirModal) {
        btnAbrirModal.addEventListener('click', () => {
            // Sincronizar la imagen actual con la vista previa del modal
            imgPreviewModal.src = imgPerfilActual.src;
            textoArchivo.textContent = 'Ningún archivo seleccionado';
            inputFile.value = ''; // Limpiar selección anterior
            imagenSeleccionadaURL = null;
            
            modalFoto.classList.add('activo');
        });
    }

    // 2. Detectar cuando el usuario elige una imagen
    if (inputFile) {
        inputFile.addEventListener('change', (e) => {
            const archivo = e.target.files[0];
            if (archivo) {
                textoArchivo.textContent = archivo.name;
                imagenSeleccionadaURL = URL.createObjectURL(archivo);
                imgPreviewModal.src = imagenSeleccionadaURL;
            }
        });
    }

    // 3. Guardar cambios y actualizar la foto en la vista
    if (btnGuardar) {
        btnGuardar.addEventListener('click', () => {
            if (imagenSeleccionadaURL) {
                // Actualiza la imagen en la página de perfil
                imgPerfilActual.src = imagenSeleccionadaURL;
                
                // Si también tienes el panel lateral en esta vista, puedes actualizarlo de una vez:
                const imgPanelLateral = document.getElementById('foto-perfil');
                if (imgPanelLateral) imgPanelLateral.src = imagenSeleccionadaURL;

                // Aquí iría tu lógica fetch() o Firebase para subir el archivo real al servidor
                
                modalFoto.classList.remove('activo');
            } else {
                alert('Por favor, selecciona una imagen primero.');
            }
        });
    }

    // 4. Cerrar el modal al cancelar o presionar ESC
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            modalFoto.classList.remove('activo');
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalFoto && modalFoto.classList.contains('activo')) {
            modalFoto.classList.remove('activo');
        }
    });
});

/*============================================
   SE GUARDAN LOS PRODUCTOS FAVORITOS EN LOCALSTORAGE ESTO SE CAMBIA POR UNA BASE DE DATOS EN EL FUTURO
=============================================*/
//GUARDADO DE PRODUCTOS FAVORITOS EN LOCALSTORAGE//
function moverAlCarrito(idProducto) {
    const tarjeta = document.getElementById(`producto-${idProducto}`);
    if (!tarjeta) return;

    // 1. Extraer los datos directamente del HTML de esa tarjeta
    const nombre = tarjeta.querySelector('h3').textContent;
    const precioTexto = tarjeta.querySelector('.precio').textContent;
    // Limpiar el texto "$599.00 MXN" para quedarnos solo con el número 599.00
    const precio = parseFloat(precioTexto.replace(/[^0-9.]/g, '')); 
    const imagen = tarjeta.querySelector('img').getAttribute('src');

    // 2. Obtener el carrito actual (usa la misma llave que en tu carrito.js)
    let carrito = JSON.parse(localStorage.getItem('tigre_carrito')) || [];

    // 3. Verificar si ya existe para sumar cantidad o agregarlo nuevo
    const indexExistente = carrito.findIndex(item => item.id === idProducto);
    
    if (indexExistente !== -1) {
        carrito[indexExistente].cantidad += 1;
    } else {
        carrito.push({
            id: idProducto,
            nombre: nombre,
            precio: precio,
            imagen: imagen,
            cantidad: 1
        });
    }

    // 4. Guardar de vuelta en localStorage
    localStorage.setItem('tigre_carrito', JSON.stringify(carrito));
    alert(`"${nombre}" se agregó a tu carrito.`);
}

// ==========================================
// 1. QUITAR DE FAVORITOS TEMPORALMENTE DESDE LA VISTA Y LOCALSTORAGE CAMBIADO POR UNA BASE DE DATOS EN EL FUTURO
// ==========================================
function quitarFavorito(idProducto) {
    // Confirmar o eliminar directamente de la vista y del localStorage
    const tarjeta = document.getElementById(`producto-${idProducto}`);
    
    if (tarjeta) {
        // Efecto visual de desvanecimiento opcional
        tarjeta.style.transition = "opacity 0.3s ease";
        tarjeta.style.opacity = "0";
        
        setTimeout(() => {
            tarjeta.remove(); // Elimina la tarjeta del HTML
            
            // Actualizar el almacenamiento local (localStorage)
            let favoritos = JSON.parse(localStorage.getItem('tigre_favoritos')) || [];
            favoritos = favoritos.filter(id => id !== idProducto);
            localStorage.setItem('tigre_favoritos', JSON.stringify(favoritos));

            // Comprobar si la lista se quedó vacía
            verificarListaVacia();
        }, 300);
    }
}