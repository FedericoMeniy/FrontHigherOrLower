// --- NUEVO CÓDIGO INICIA AQUÍ ---
// Este bloque se encarga de revisar si ya existe un token al cargar la página.
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    const iniciarSesionBtn = document.getElementById('iniciar-sesion-btn');
    const botonesSecundarios = document.getElementById('botones-secundarios');

    if (token) {
        // Si hay un token, asumimos que el usuario está logueado
        console.log("Usuario ya autenticado, mostrando menú principal.");
        botonesSecundarios.style.display = 'flex';
        iniciarSesionBtn.style.display = 'none';
    } else {
        // Si no hay token, mostramos el botón de login
        console.log("No hay token, se requiere inicio de sesión.");
        botonesSecundarios.style.display = 'none';
        iniciarSesionBtn.style.display = 'block';
    }
});
// --- NUEVO CÓDIGO TERMINA AQUÍ ---


// --- CÓDIGO ORIGINAL INICIA AQUÍ ---
// (Este es el código que ya tenías)

const loginForm = document.getElementById('login-form');
const iniciarSesionBtn = document.getElementById('iniciar-sesion-btn');
const volverMenuBtn = document.getElementById('volver-menu');

// Iniciar sesión
iniciarSesionBtn.addEventListener('click', () => {
    menuContainer.style.display = 'none';
    loginForm.style.display = 'flex';
});

// Volver al menú desde login
volverMenuBtn.addEventListener('click', () => {
    loginForm.style.display = 'none';
    menuContainer.style.display = 'flex';
});

// Login
document.getElementById('form-login').addEventListener('submit', function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
            
            // --- LÍNEA CORREGIDA ---
            // Simplemente eliminamos la comprobación de "data.exito"
            if (ok && data.token) { 
                
                showMessage("Login exitoso!", true);
                localStorage.setItem('jwtToken', data.token); // Guardamos el token
                document.getElementById('botones-secundarios').style.display = 'flex';
                iniciarSesionBtn.style.display = 'none';
                loginForm.style.display = 'none';
                menuContainer.style.display = 'flex';
            } else {
                showMessage(data.mensaje || "Credenciales incorrectas", false);
            }
        })
        .catch(() => showMessage("No se pudo conectar con el servidor", false));
});

// Cerrar sesión
document.getElementById('cerrar-sesion-btn').addEventListener('click', () => {
    // -- Aquí va la modificación del Paso 4 --
    localStorage.removeItem('jwtToken'); // Eliminar el token

    fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => {
        if (res.ok) {
            return; 
        }
        return Promise.reject('Error del servidor al cerrar sesión');
    })
    .then(() => {
        showMessage("Sesión cerrada correctamente", true);
        document.getElementById('botones-secundarios').style.display = 'none';
        iniciarSesionBtn.style.display = 'block';
        loginForm.style.display = 'none';
        menuContainer.style.display = 'flex';
    })
    .catch(error => {
        const message = typeof error === 'string' ? error : "No se pudo conectar con el servidor";
        showMessage(message, false);
    });
});