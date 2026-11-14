
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