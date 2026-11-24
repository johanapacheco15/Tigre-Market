/* =========================================================================
   1. DATOS BASE DEL PRODUCTO
   Define la estructura por defecto del artículo en caso de que no haya uno
   seleccionado previamente desde el catálogo en localStorage.
========================================================================= */
const productoActual = {
    id: 'prod-1',
    nombre: 'Mochila universitaria',
    precio: 180,
    descripcion: 'Mochila universitaria resistente con compartimento acolchado para laptop de hasta 15.6 pulgadas, bolsillos laterales para botella y cierres reforzados. Ideal para clases diarias.',
    imagenes: [
        '/frontend/img/mochila.jpg',
        '/frontend/img/calculadora.jpg'
    ]
};

/* =========================================================================
   2. VALIDACIÓN DE REGLAS DEL PRODUCTO Y RENDERIZADO EN PANTALLA
   Asegura que el nombre no pase de 25 caracteres, el precio sea mayor a $1
   sin valores negativos y la descripción no supere los 500 caracteres.
========================================================================= */
function validarYMostrarProducto(producto) {
    // Regla 1: Nombre con máximo 25 caracteres
    const nombreValido = String(producto.nombre || '').trim().slice(0, 25);

    // Regla 2: Precio mayor a 1 peso y sin permitir números negativos
    let precioNumero = Number(producto.precio);
    if (isNaN(precioNumero) || precioNumero <= 1) {
        precioNumero = 1.01;
    }
    precioNumero = Math.abs(precioNumero);

    // Regla 3: Descripción con máximo 500 caracteres
    const descripcionValida = String(producto.descripcion || '').trim().slice(0, 500);

    // Mostrar textos validados en el HTML
    document.getElementById('nombre-producto').textContent = nombreValido;
    document.getElementById('precio-producto').textContent = `$${precioNumero.toFixed(2)} MXN`;
    document.getElementById('descripcion-producto').textContent = descripcionValida;

    // Generar las miniaturas y la imagen principal de la galería
    if (Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
        const imgPrincipal = document.getElementById('imagen-principal');
        const contenedorMiniaturas = document.getElementById('contenedor-miniaturas');
        imgPrincipal.src = producto.imagenes[0];
        contenedorMiniaturas.innerHTML = '';

        producto.imagenes.forEach((ruta, index) => {
            const thumb = document.createElement('img');
            thumb.src = ruta;
            thumb.alt = `Vista ${index + 1} de ${nombreValido}`;
            thumb.className = `miniatura ${index === 0 ? 'activa' : ''}`;
            thumb.addEventListener('click', () => cambiarImagen(thumb));
            contenedorMiniaturas.appendChild(thumb);
        });
    }

    return {
        ...producto,
        nombre: nombreValido,
        precio: precioNumero,
        descripcion: descripcionValida
    };
}

/* =========================================================================
   3. CONTROL DE GALERÍA DE IMÁGENES
   Cambia la fotografía principal al hacer clic sobre cualquiera de las
   miniaturas disponibles.
========================================================================= */
function cambiarImagen(elementoMiniatura) {
    const imgPrincipal = document.getElementById('imagen-principal');
    imgPrincipal.src = elementoMiniatura.src;

    document.querySelectorAll('.miniatura').forEach(img => img.classList.remove('activa'));
    elementoMiniatura.classList.add('activa');
}

/* =========================================================================
   4. INICIALIZACIÓN DE EVENTOS AL CARGAR EL DOCUMENTO
   Conecta la lógica de carrito, favoritos (para "Mi perfil") y el sistema
   de opiniones con 5 estrellas.
========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
    const guardado = JSON.parse(localStorage.getItem('productoSeleccionado'));
    const productoValidado = validarYMostrarProducto(guardado || productoActual);

    const btnCarrito = document.getElementById('btn-agregar-carrito');
    const btnFavoritos = document.getElementById('btn-agregar-favoritos');
    const mensajeAccion = document.getElementById('mensaje-accion');

    /* ---------------------------------------------------------------------
       4.1 Gestión de Favoritos (vinculado a la sección "Mi perfil")
       Comprueba si el producto ya está guardado y permite agregarlo o
       quitarlo de 'favoritosTigreMarket' en localStorage.
    --------------------------------------------------------------------- */
    const verificarFavorito = () => {
        const favoritos = JSON.parse(localStorage.getItem('favoritosTigreMarket')) || [];
        const existe = favoritos.some(item => item.id === productoValidado.id);
        if (existe) {
            btnFavoritos.classList.add('en-favoritos');
            btnFavoritos.innerHTML = '&#9829; En tus favoritos';
        } else {
            btnFavoritos.classList.remove('en-favoritos');
            btnFavoritos.innerHTML = '&#9825; Agregar a favoritos';
        }
    };
    verificarFavorito();

    btnFavoritos.addEventListener('click', () => {
        let favoritos = JSON.parse(localStorage.getItem('favoritosTigreMarket')) || [];
        const indice = favoritos.findIndex(item => item.id === productoValidado.id);

        if (indice === -1) {
            favoritos.push({
                id: productoValidado.id,
                nombre: productoValidado.nombre,
                precio: productoValidado.precio,
                imagen: productoValidado.imagenes[0]
            });
            mensajeAccion.textContent = `"${productoValidado.nombre}" se guardó en Favoritos de Mi perfil.`;
        } else {
            favoritos.splice(indice, 1);
            mensajeAccion.textContent = `"${productoValidado.nombre}" se eliminó de tus Favoritos.`;
        }

        localStorage.setItem('favoritosTigreMarket', JSON.stringify(favoritos));
        verificarFavorito();
    });

    /* ---------------------------------------------------------------------
       4.2 Gestión del Carrito de Compras
       Agrega el producto a 'carritoTigreMarket' o incrementa su cantidad
       si ya había sido añadido anteriormente.
    --------------------------------------------------------------------- */
    btnCarrito.addEventListener('click', () => {
        const carrito = JSON.parse(localStorage.getItem('carritoTigreMarket')) || [];
        const indiceExistente = carrito.findIndex(item => item.id === productoValidado.id);

        if (indiceExistente !== -1) {
            carrito[indiceExistente].cantidad += 1;
        } else {
            carrito.push({
                id: productoValidado.id,
                nombre: productoValidado.nombre,
                precio: productoValidado.precio,
                imagen: productoValidado.imagenes[0],
                cantidad: 1
            });
        }

        localStorage.setItem('carritoTigreMarket', JSON.stringify(carrito));
        mensajeAccion.textContent = `"${productoValidado.nombre}" se agregó al carrito.`;
    });

    /* ---------------------------------------------------------------------
       4.3 Sistema de Comentarios y Calificación de 5 Estrellas
       Permite elegir de 1 a 5 estrellas, escribir una reseña opcional,
       calcular el promedio general y guardar las opiniones por producto.
    --------------------------------------------------------------------- */
    const estrellasBtns = document.querySelectorAll('.estrella-btn');
    const inputEstrellas = document.getElementById('valor-estrellas');
    const formComentario = document.getElementById('form-comentario');
    const listaComentarios = document.getElementById('lista-comentarios');

    // Ilumina las estrellas seleccionadas por el usuario
    estrellasBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const valor = Number(btn.dataset.valor);
            inputEstrellas.value = valor;
            estrellasBtns.forEach(b => {
                b.classList.toggle('activa', Number(b.dataset.valor) <= valor);
            });
        });
    });

    // Carga opiniones previas almacenadas para este producto
    const claveComentarios = `comentarios_${productoValidado.id}`;
    let comentarios = JSON.parse(localStorage.getItem(claveComentarios)) || [
        {
            autor: 'Carlos M.',
            estrellas: 5,
            texto: 'Excelente estado y entrega rápida dentro de la facultad.',
            fecha: '20/11/2026'
        }
    ];

    // Dibuja todas las opiniones en pantalla y actualiza el promedio
    function renderizarComentarios() {
        listaComentarios.innerHTML = '';
        let suma = 0;

        comentarios.forEach(c => {
            suma += c.estrellas;
            const estrellasTexto = '★'.repeat(c.estrellas) + '☆'.repeat(5 - c.estrellas);

            const div = document.createElement('div');
            div.className = 'item-comentario';
            div.innerHTML = `
                <div class="item-comentario-header">
                    <span class="item-autor">${c.autor}</span>
                    <span class="item-fecha">${c.fecha}</span>
                </div>
                <div class="item-estrellas">${estrellasTexto}</div>
                ${c.texto ? `<p class="item-texto">${c.texto}</p>` : ''}
            `;
            listaComentarios.appendChild(div);
        });

        const promedio = comentarios.length ? (suma / comentarios.length).toFixed(1) : '0.0';
        const estrellasRedondeadas = Math.round(Number(promedio));
        document.getElementById('promedio-estrellas').textContent =
            '★'.repeat(estrellasRedondeadas) + '☆'.repeat(5 - estrellasRedondeadas);
        document.getElementById('texto-promedio').textContent =
            `${promedio} (${comentarios.length} ${comentarios.length === 1 ? 'opinión' : 'opiniones'})`;
    }

    renderizarComentarios();

    // Guarda una nueva opinión al enviar el formulario
    formComentario.addEventListener('submit', (e) => {
        e.preventDefault();
        const autor = document.getElementById('nombre-usuario-comentario').value.trim();
        const estrellas = Math.min(5, Math.max(1, Number(inputEstrellas.value) || 5));
        const texto = document.getElementById('texto-comentario').value.trim();

        if (!autor) return;

        const hoy = new Date().toLocaleDateString('es-MX');
        comentarios.unshift({ autor, estrellas, texto, fecha: hoy });
        localStorage.setItem(claveComentarios, JSON.stringify(comentarios));

        formComentario.reset();
        inputEstrellas.value = '5';
        estrellasBtns.forEach(b => b.classList.add('activa'));
        renderizarComentarios();
    });
});

/* =========================================================================
   REGISTRO DEL ULTIMO PRODUCTO VISTO.
   Guarda la URL y los datos del producto actual para poder volver a el
   desde la pagina de inicio o desde la busqueda.
========================================================================= */
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