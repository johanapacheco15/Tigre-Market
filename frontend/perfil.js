// VISTA PREVIA DE LA FOTO DE PERFIL

        const cambiarFoto = document.getElementById("cambiar-foto");

        const imagenPerfil = document.getElementById("imagen-perfil");

        cambiarFoto.addEventListener("change", function() {

            const archivo = this.files[0];

            if (archivo) {

                imagenPerfil.src = URL.createObjectURL(archivo);

            }

        });


        // MENSAJE DE CONFIRMACIÓN DEL FORMULARIO

        const formulario = document.getElementById("form-perfil");

        formulario.addEventListener("submit", function(event) {

            event.preventDefault();

            document.getElementById("mensaje-perfil").textContent =
                "¡Tus cambios se han guardado correctamente!";

        });