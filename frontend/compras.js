/* =========================================
   BOTONES VER PRODUCTO
========================================= */

document.querySelectorAll(".ver-producto").forEach(function(boton) {

    boton.addEventListener("click", function() {

        alert(
            boton.dataset.nombre + "\n" +
            boton.dataset.descripcion + "\nPrecio: $" +
            boton.dataset.precio + " MXN"
        );

    });

});


/* =========================================
   ELEMENTOS DE BÚSQUEDA Y FILTROS
========================================= */

const buscador = document.getElementById("buscador-producto");

const filtroCategoria = document.getElementById("filtro-categoria");

const filtroColor = document.getElementById("filtro-color");

const filtroPresupuesto = document.getElementById("filtro-presupuesto");

const botonLimpiar = document.getElementById("limpiar-filtros");


/* =========================================
   FUNCIÓN PARA FILTRAR PRODUCTOS
========================================= */

function filtrarProductos() {

    const texto = buscador.value.trim().toLowerCase();

    const categoriaElegida = filtroCategoria.value;

    const colorElegido = filtroColor.value;

    const presupuesto = filtroPresupuesto.value;

    const tarjetas = document.querySelectorAll(".tarjeta-producto");


    tarjetas.forEach(function(tarjeta) {

        const nombre = tarjeta.dataset.producto.toLowerCase();

        const categoria = tarjeta.dataset.categoria.toLowerCase();

        const color = tarjeta.dataset.color.toLowerCase();

        const precio = Number(tarjeta.dataset.precio);


        const coincideProducto = nombre.includes(texto);

        const coincideCategoria =
            categoriaElegida === "todas" ||
            categoria === categoriaElegida;

        const coincideColor =
            colorElegido === "todos" ||
            color === colorElegido;

        const coincidePrecio =
            presupuesto === "" ||
            precio <= Number(presupuesto);


        if (
            coincideProducto &&
            coincideCategoria &&
            coincideColor &&
            coincidePrecio
        ) {

            tarjeta.style.display = "";

        } else {

            tarjeta.style.display = "none";

        }

    });

}


/* =========================================
   EVENTOS DE BÚSQUEDA Y FILTROS
========================================= */

buscador.addEventListener("input", filtrarProductos);

filtroCategoria.addEventListener("change", filtrarProductos);

filtroColor.addEventListener("change", filtrarProductos);

filtroPresupuesto.addEventListener("input", filtrarProductos);


/* =========================================
   BUSCAR DESDE LA PÁGINA DE INICIO
========================================= */

const parametros = new URLSearchParams(window.location.search);

const busquedaInicial = parametros.get("buscar");

if (busquedaInicial) {

    buscador.value = busquedaInicial;

    filtrarProductos();

}


/* =========================================
   LIMPIAR FILTROS
========================================= */

botonLimpiar.addEventListener("click", function() {

    buscador.value = "";

    filtroCategoria.value = "todas";

    filtroColor.value = "todos";

    filtroPresupuesto.value = "";

    filtrarProductos();

});