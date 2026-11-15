/* ==========================================================
   1. LIMPIAR Y VALIDAR EL CAMPO DE CORREO
========================================================== */

    document.addEventListener("visibilitychange", function() {
        if (document.visibilityState === "hidden") {

/* ==========================================================
    2. LISTA DE CAMPOS CUYOS VALORES DEBEN BORRASE 
========================================================== */

            const sensitiveFields = [
                'nombre', 
                'edad', 
                'correo', 
                'telefono', 
                'contrasena',
                'correo-login'
            ];

            sensitiveFields.forEach(id => {
                const inputElement = document.getElementById(id);
                if (inputElement) {
                    inputElement.value = "";
                }
            });

/* ==========================================================
    3. OCULTA LA CONTRASEÑA SI EL CAMPO ESTA DISPONIBLE 
========================================================== */

            if (passwordInput) {
                passwordInput.setAttribute('type', 'password');
            }

            if (eyeIcon) {
                eyeIcon.innerHTML = `
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                `;
            }
        }
    });

/* ==========================================================
   2. LIMPIAR Y VALIDAR EL CAMPO DE CORREO
========================================================== */

const inputUsuario = document.getElementById('correo-login');

    inputUsuario.addEventListener('input', function(event) {
        let valorLimpio = this.value.toLowerCase().replace(/[^a-z0-9._]/g, '');
    
        this.value = valorLimpio;
    });