// ==========================================
// 1. VISIBILIDAD DE LA CONTRASEÑA
// ==========================================
const togglePasswordBtn = document.getElementById('toggle-password');
const passwordInput = document.getElementById('contrasena');
const eyeIcon = document.getElementById('eye-icon');

if (togglePasswordBtn && passwordInput && eyeIcon) {
    togglePasswordBtn.addEventListener('click', function() {
        const currentType = passwordInput.getAttribute('type');
        const newType = currentType === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', newType);

        if (newType === 'text') {
            eyeIcon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            `;
        } else {
            eyeIcon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;
        }
    });
}

// ==========================================
// 2. VALIDACIÓN DE CONTRASEÑA Y REQUISITOS
// ==========================================
const botonRegistro = document.getElementById('boton-registro');
const checkPrivacidad = document.getElementById('privacidad');
const checkDatos = document.getElementById('confirmar-datos');

// Elementos visuales de la lista de requisitos
const reqlongitud = document.getElementById('req-longitud');
const reqmayuscula = document.getElementById('req-mayuscula');
const reqminuscula = document.getElementById('req-minuscula');
const reqnumero = document.getElementById('req-numero');
const reqespecial = document.getElementById('req-especial');

function validarFormulario() {
    if (!passwordInput) return;

    const password = passwordInput.value;

    // Reglas individuales (con el carácter especial corregido y seguro)
    const esLongitud = password.length >= 8;
    const esMayuscula = /[A-Z]/.test(password);
    const esMinuscula = /[a-z]/.test(password);
    const esNumero = /[0-9]/.test(password);
    const esEspecial = /[!@#$%^&*_\-\+=\[\]{}|;:,.<>?]/.test(password);

    // Actualizar clases CSS visuales para cada requisito en tiempo real
    if (reqlongitud) {
        reqlongitud.className = esLongitud ? 'valido' : 'invalido';
    }
    if (reqmayuscula) {
        reqmayuscula.className = esMayuscula ? 'valido' : 'invalido';
    }
    if (reqminuscula) {
        reqminuscula.className = esMinuscula ? 'valido' : 'invalido';
    }
    if (reqnumero) {
        reqnumero.className = esNumero ? 'valido' : 'invalido';
    }
    if (reqespecial) {
        reqespecial.className = esEspecial ? 'valido' : 'invalido';
    }

    // Comprobar si todo es válido
    const contrasenaValida = esLongitud && esMayuscula && esMinuscula && esNumero && esEspecial;
    const casillasMarcadas = checkPrivacidad && checkDatos && checkPrivacidad.checked && checkDatos.checked;

    // Habilitar o deshabilitar el botón de registro
    if (botonRegistro) {
        botonRegistro.disabled = !(contrasenaValida && casillasMarcadas);
    }
}

// Eventos de escucha
if (passwordInput) {
    passwordInput.addEventListener('input', validarFormulario);
}

if (checkPrivacidad) {
    checkPrivacidad.addEventListener('change', validarFormulario);
}

if (checkDatos) {
    checkDatos.addEventListener('change', validarFormulario);
}

// Estado inicial al cargar la página
validarFormulario();

// ==========================================
// 3. RESTRICCIÓN: SOLO NÚMEROS EN TELÉFONO
// ==========================================
const telefonoInput = document.getElementById('telefono');

if (telefonoInput) {
    telefonoInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

// ==========================================
// 4. LIMPIAR CAMPOS AL CAMBIAR DE PESTAÑA
// ==========================================
document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "hidden") {
        const sensitiveFields = ['nombre', 'edad', 'correo-login', 'telefono', 'contrasena'];

        sensitiveFields.forEach(id => {
            const inputElement = document.getElementById(id);
            if (inputElement) {
                inputElement.value = "";
            }
        });

        if (checkPrivacidad) checkPrivacidad.checked = false;
        if (checkDatos) checkDatos.checked = false;

        if (passwordInput) {
            passwordInput.setAttribute('type', 'password');
        }

        if (eyeIcon) {
            eyeIcon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;
        }

        const requisitosItems = [reqlongitud, reqmayuscula, reqminuscula, reqnumero, reqespecial];
        requisitosItems.forEach(item => {
            if (item) {
                item.classList.remove('valido');
                item.classList.add('invalido');
            }
        });

        validarFormulario();
    }
});
    
    // REGISTRO DE USUARIOS CON FIREBASE

    const formularioRegistro = document.getElementById('registro');

    if (formularioRegistro) {
        formularioRegistro.addEventListener('submit', async function(e) {
            e.preventDefault();

            console.log("SE PRESIONÓ EL BOTÓN DE REGISTRO");

            const nombre = document.getElementById('nombre').value.trim();
            const usuarioCorreo = document.getElementById('correo-login').value.trim().toLowerCase();
            const correo = usuarioCorreo + "@tecnaucalpan.mx";
            const edad = Number(document.getElementById('edad').value);
            const telefono = document.getElementById('telefono').value.trim();
            const contrasena = passwordInput.value;

            const checkPrivacidad = document.getElementById('privacidad');
            const checkDatos = document.getElementById('confirmar-datos');

            const contraseñaValida =
                contrasena.length >= 8 &&
                /[A-Z]/.test(contrasena) &&
                /[a-z]/.test(contrasena) &&
                /[0-9]/.test(contrasena) &&
                /[\W_]/.test(contrasena);

            if (!nombre || !usuarioCorreo || !edad || !telefono || !contrasena) {
                alert("Por favor, completa todos los campos.");
                return;
            }

            if (!Number.isInteger(edad) || edad < 13 || edad > 120) {
                alert("Introduce una edad válida.");
                return;
            }

            if (!/^[a-z0-9_]+$/.test(usuarioCorreo)) {
                alert("El correo institucional contiene caracteres no permitidos.");
                return;
            }

            if (telefono.length !== 10) {
                alert("El teléfono debe contener 10 números.");
                return;
            }

            if (!contraseñaValida) {
                alert("La contraseña no cumple con todos los requisitos.");
                return;
            }

            if (!checkPrivacidad.checked || !checkDatos.checked) {
                alert("Debes aceptar las políticas de privacidad y confirmar tus datos.");
                return;
            }

            const botonRegistro = formularioRegistro.querySelector('button[type="submit"]');
            botonRegistro.disabled = true;

            try {
                console.log("Intentando crear cuenta en Authentication...");

                const credencial = await createUserWithEmailAndPassword(
                    auth,
                    correo,
                    contrasena
                );

                const usuario = credencial.user;

                console.log("Cuenta creada. Guardando datos en Firestore...");

                await setDoc(doc(db, "usuarios", usuario.uid), {
                    nombre: nombre,
                    correo: correo,
                    edad: edad,
                    telefono: telefono,
                    fechaRegistro: serverTimestamp(),
                    rol: "usuario"
                });

                console.log("REGISTRO COMPLETADO CORRECTAMENTE");

                alert("¡Registro exitoso! Ya puedes iniciar sesión en Tiger Market.");

                formularioRegistro.reset();
                window.location.href = "index.html";

            } catch (error) {
                console.error("Error durante el registro:", error);

                if (error.code === "auth/email-already-in-use") {
                    alert("Este correo electrónico ya está registrado.");
                } else if (error.code === "auth/invalid-email") {
                    alert("El correo electrónico no es válido.");
                } else if (error.code === "auth/weak-password") {
                    alert("La contraseña no cumple con los requisitos de Firebase.");
                } else if (error.code === "permission-denied" ||
                           error.code === "firestore/permission-denied") {
                    alert("Firebase rechazó el registro. Revisa las reglas de Firestore.");
                } else {
                    alert("Ocurrió un error: " + error.message);
                }

            } finally {
                botonRegistro.disabled = false;
            }
        });
    }