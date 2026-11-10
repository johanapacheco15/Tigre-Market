document.addEventListener('DOMContentLoaded', () => {
    const btnAbrir = document.getElementById('btn-abrir-cuenta');
    const btnCerrar = document.getElementById('btn-cerrar-panel');
    const overlay = document.getElementById('overlay-cuenta');
    const panel = document.getElementById('panel-cuenta');
    const btnLogout = document.getElementById('btn-logout');
    const btnEliminar = document.getElementById('btn-eliminar-cuenta');

    // Función para abrir el panel
    const abrirPanel = () => {
        panel.classList.add('activo');
        overlay.classList.add('activo');
    };

    // Función para cerrar el panel
    const cerrarPanel = () => {
        panel.classList.remove('activo');
        overlay.classList.remove('activo');
    };

    // Eventos de apertura y cierre
    btnAbrir.addEventListener('click', abrirPanel);
    btnCerrar.addEventListener('click', cerrarPanel);
    overlay.addEventListener('click', cerrarPanel);

    // Cerrar con la tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('activo')) {
            cerrarPanel();
        }
    });

    // Acción para Cerrar Sesión
    btnLogout.addEventListener('click', () => {
        // Limpiar tokens o datos de sesión locales si aplica
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/frontend/views/login.html';
    });

    // Acción para Eliminar Cuenta
    btnEliminar.addEventListener('click', () => {
        const confirmacion = confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');
        if (confirmacion) {
            // Lógica para enviar petición de eliminación al servidor
            alert('Petición de eliminación enviada.');
        }
    });
});