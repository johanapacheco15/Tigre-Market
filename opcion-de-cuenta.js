document.addEventListener('DOMContentLoaded', () => {
    const btnAbrir = document.getElementById('btn-abrir-cuenta');
    const btnCerrar = document.getElementById('btn-cerrar-panel');
    const overlay = document.getElementById('overlay-cuenta');
    const panel = document.getElementById('panel-cuenta');

    const abrirPanel = (e) => {
        if(e) e.preventDefault();
        panel.classList.add('activo');
        overlay.classList.add('activo');
        document.body.classList.add('modal-open');
    };

    const cerrarPanel = () => {
        panel.classList.remove('activo');
        overlay.classList.remove('activo');
        document.body.classList.remove('modal-open');
    };

    btnAbrir.addEventListener('click', abrirPanel);
    btnCerrar.addEventListener('click', cerrarPanel);
    overlay.addEventListener('click', cerrarPanel);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('activo')) {
            cerrarPanel();
        }
    });
});