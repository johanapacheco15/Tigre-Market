/*=====================================
script que se encarga de que la hamburguesa se muestre en pantallas pequeñas
======================================*/
const btnHamburguesa = document.getElementById('btn-hamburguesa');
const menuNavegacion = document.getElementById('menu-navegacion');

btnHamburguesa.addEventListener('click', () => {
    menuNavegacion.classList.toggle('activo');
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
