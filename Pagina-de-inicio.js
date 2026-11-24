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
