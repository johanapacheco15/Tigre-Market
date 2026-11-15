let carrito = JSON.parse(localStorage.getItem("miCarrito")) || [];

// Elementos del carrito
const listaCarrito = document.getElementById("lista-carrito");
const subtotalElemento = document.getElementById("subtotal");
const totalElemento = document.getElementById("total");
const botonConfirmar = document.getElementById("confirmar-pedido");
const mensaje = document.getElementById("mensaje");

// Formato de precios
function formatoPrecio(precio) {
    return precio.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN"
    });
}

// Guardar los productos
function guardarCarrito() {
    localStorage.setItem("miCarrito", JSON.stringify(carrito));
}

// AGREGAR PRODUCTOS DESDE INICIO
const catalogo = document.getElementById("catalogo");

if (catalogo) {
    catalogo.addEventListener("click", function(evento) {
        const boton = evento.target.closest(".agregar");

        if (!boton) return;

        const id = boton.dataset.id;
        const nombre = boton.dataset.nombre;
        const precio = Number(boton.dataset.precio);

        const existente = carrito.find(function(producto) {
            return producto.id === id;
        });

        if (existente) {
            existente.cantidad++;
        } else {
            carrito.push({
                id: id,
                nombre: nombre,
                precio: precio,
                cantidad: 1
            });
        }

        guardarCarrito();

        alert(nombre + " se agregó al carrito.");
    });
}

// MOSTRAR LOS PRODUCTOS DEL CARRITO
function mostrarCarrito() {
    if (!listaCarrito) return;

    listaCarrito.innerHTML = "";

    let total = 0;

    if (carrito.length === 0) {
        listaCarrito.innerHTML =
            "<p>Tu carrito está vacío. Agrega productos para comenzar.</p>";
    }

    carrito.forEach(function(producto) {
        const importe = producto.precio * producto.cantidad;
        total += importe;

        const articulo = document.createElement("article");
        articulo.className = "producto-carrito";

        const informacion = document.createElement("div");

        const nombre = document.createElement("h3");
        nombre.textContent = producto.nombre;

        const precio = document.createElement("p");
        precio.textContent =
            "Precio: " + formatoPrecio(producto.precio);

        const subtotal = document.createElement("p");
        subtotal.textContent =
            "Subtotal: " + formatoPrecio(importe);

        informacion.append(nombre, precio, subtotal);

        const controles = document.createElement("div");
        controles.className = "controles-cantidad";

        const restar = document.createElement("button");
        restar.textContent = "−";
        restar.addEventListener("click", function() {
            cambiarCantidad(producto.id, -1);
        });

        const cantidad = document.createElement("span");
        cantidad.textContent = producto.cantidad;

        const sumar = document.createElement("button");
        sumar.textContent = "+";
        sumar.addEventListener("click", function() {
            cambiarCantidad(producto.id, 1);
        });

        const quitar = document.createElement("button");
        quitar.textContent = "Quitar";
        quitar.className = "boton-quitar";

        quitar.addEventListener("click", function() {
            quitarProducto(producto.id);
        });

        controles.append(restar, cantidad, sumar, quitar);
        articulo.append(informacion, controles);
        listaCarrito.appendChild(articulo);
    });

    subtotalElemento.textContent = formatoPrecio(total);
    totalElemento.textContent = formatoPrecio(total);
}

// AUMENTAR O DISMINUIR CANTIDAD
function cambiarCantidad(id, cambio) {
    const producto = carrito.find(function(item) {
        return item.id === id;
    });

    if (!producto) return;

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {
        quitarProducto(id);
        return;
    }

    guardarCarrito();
    mostrarCarrito();
}

// ELIMINAR PRODUCTOS
function quitarProducto(id) {
    carrito = carrito.filter(function(producto) {
        return producto.id !== id;
    });

    guardarCarrito();
    mostrarCarrito();

    if (mensaje) {
        mensaje.textContent = "Producto eliminado del carrito.";
    }
}

// CONFIRMAR PEDIDO

const ventanaExito = document.getElementById("ventana-exito");
const cerrarExito = document.getElementById("cerrar-exito");

if (botonConfirmar) {
    botonConfirmar.addEventListener("click", function() {

        if (carrito.length === 0) {
            mensaje.textContent = "Tu carrito está vacío.";
            return;
        }

        ventanaExito.style.display = "flex";

    });
}

// CERRAR VENTANA

if (cerrarExito) {
    cerrarExito.addEventListener("click", function() {

        ventanaExito.style.display = "none";

        carrito = [];
        guardarCarrito();
        mostrarCarrito();

    });
}

// ACTUALIZAR LA PÁGINA DEL CARRITO
mostrarCarrito();

//Guardado en favoritos si no funciona ignorar por ahora//
document.addEventListener('DOMContentLoaded', () => {
    renderizarCarrito();
});

function renderizarCarrito() {
    // Leer los productos guardados desde Favoritos o la Tienda
    const carrito = JSON.parse(localStorage.getItem('tigre_carrito')) || [];
    
    // Reemplaza 'contenedor-productos-carrito' por el ID real que usaste en tu carrito.html
    const contenedor = document.getElementById('contenedor-productos-carrito'); 
    const totalElemento = document.getElementById('total-carrito'); // ID donde muestras el total a pagar

    if (!contenedor) return;

    contenedor.innerHTML = ''; // Limpiar contenido previo
    let totalGeneral = 0;

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío.</p>';
        if (totalElemento) totalElemento.textContent = '$0.00 MXN';
        return;
    }

    carrito.forEach((producto, index) => {
        const subtotal = producto.precio * producto.cantidad;
        totalGeneral += subtotal;

        // Adapta estas clases HTML a las que ya diseñaste en tu carrito.css
        contenedor.innerHTML += `
            <div class="item-carrito">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <div class="item-info">
                    <h4>${producto.nombre}</h4>
                    <p>$${producto.precio.toFixed(2)} MXN</p>
                </div>
                <div class="item-cantidad">
                    <span>Cant: ${producto.cantidad}</span>
                </div>
                <button onclick="eliminarDelCarrito(${index})" class="btn-eliminar">Eliminar</button>
            </div>
        `;
    });

    if (totalElemento) {
        totalElemento.textContent = `$${totalGeneral.toFixed(2)} MXN`;
    }
}

function eliminarDelCarrito(index) {
    let carrito = JSON.parse(localStorage.getItem('tigre_carrito')) || [];
    carrito.splice(index, 1); // Quita el elemento por su posición
    localStorage.setItem('tigre_carrito', JSON.stringify(carrito));
    renderizarCarrito(); // Vuelve a dibujar el carrito actualizado
}