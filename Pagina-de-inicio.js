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
const btnCuenta = document.getElementById('btn-cuenta');
const panelCuenta = document.getElementById('panel-cuenta');
const overlayCuenta = document.getElementById('overlay-cuenta');
