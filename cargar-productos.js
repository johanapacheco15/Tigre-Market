
import { db } from "./backend/firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// Identificamos el espacio donde aparecerán los productos.
const catalogo = document.getElementById("catalogo");
const mensajeCatalogo = document.getElementById("mensaje-catalogo");

// Función para consultar y mostrar todos los productos.
async function cargarProductos() {

    try {

        // Consultamos todos los documentos de la colección productos.
        const consulta = await getDocs(collection(db, "productos"));

        // Eliminamos el mensaje de carga.
        catalogo.innerHTML = "";

        // Comprobamos si existen productos publicados.
        if (consulta.empty) {

            mensajeCatalogo.textContent = "Todavía no hay productos disponibles.";
            catalogo.appendChild(mensajeCatalogo);
            return;

        }

        // Recorremos cada producto encontrado en Firestore.
        consulta.forEach((documento) => {

            // Obtenemos los datos del producto.
            const producto = documento.data();

            // Obtenemos el identificador único del documento.
            const id = documento.id;

            // Recuperamos la primera imagen del producto.
            const imagen = producto.imagenes?.[0]?.url ||
                "/frontend/img/producto-default.jpg";

            // Creamos la tarjeta del producto.
            const tarjeta = document.createElement("div");
            tarjeta.classList.add("producto");

            // Creamos el nombre.
            const nombre = document.createElement("h3");
            nombre.textContent = producto.nombre || "Producto sin nombre";

            // Creamos la imagen.
            const foto = document.createElement("img");
            foto.src = imagen;
            foto.alt = producto.nombre || "Imagen del producto";
            foto.classList.add("foto-producto");

            // Creamos la descripción.
            const descripcion = document.createElement("p");
            descripcion.textContent = producto.descripcion || "Sin descripción.";

            // Creamos el precio.
            const precio = document.createElement("p");
            precio.classList.add("precio");
            precio.textContent = `$${Number(producto.precio).toFixed(2)} MXN`;

            // Creamos el botón para consultar el producto.
            const botonVer = document.createElement("button");
            botonVer.textContent = "Ver producto";

            botonVer.addEventListener("click", () => {

            window.location.href = `/frontend/producto.html?id=${id}`;

        });

            // Creamos el botón para agregar al carrito.
            const botonAgregar = document.createElement("button");
            botonAgregar.classList.add("agregar");
            botonAgregar.textContent = "Agregar al carrito";

            botonAgregar.dataset.id = id;
            botonAgregar.dataset.nombre = producto.nombre || "Producto";
            botonAgregar.dataset.precio = producto.precio;
            botonAgregar.dataset.imagen = imagen;

            // Agregamos todos los elementos a la tarjeta.
            tarjeta.appendChild(nombre);
            tarjeta.appendChild(foto);
            tarjeta.appendChild(descripcion);
            tarjeta.appendChild(precio);
            tarjeta.appendChild(botonVer);
            tarjeta.appendChild(botonAgregar);

            // Insertamos la tarjeta en el catálogo.
            catalogo.appendChild(tarjeta);

        });

    } catch (error) {

        console.error("Error al cargar los productos:", error);

        catalogo.innerHTML = "<p>No fue posible cargar los productos. Intenta nuevamente.</p>";

    }

}

// Ejecutamos la función.
cargarProductos();
