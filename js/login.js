// Contenido completo y FINAL para js/login.js

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
        body: JSON.stringify({ email, password }),
        // Ya no necesitamos 'credentials: include'
    })
    .then(res => {
        // Si la respuesta no es "ok", leemos el JSON del error para un mensaje más claro
        if (!res.ok) {
            return res.json().then(errorBody => {
                throw new Error(errorBody.message);
            });
        }
        // Si es "ok", obtenemos el cuerpo de la respuesta que contiene el token
        return res.json();
    })
    .then(data => {
        // --- AQUÍ ESTÁ EL CAMBIO PRINCIPAL ---
        // Guardamos el token en el localStorage del navegador
        localStorage.setItem('jwt_token', data.token);

        // El resto es tu lógica para la UI
        showMessage("Login exitoso!", true);
        document.getElementById('botones-secundarios').style.display = 'flex';
        iniciarSesionBtn.style.display = 'none';
        loginForm.style.display = 'none';
        menuContainer.style.display = 'flex';
    })
    .catch((error) => {
        showMessage(error.message, false);
    });
});

// Cerrar sesión
document.getElementById('cerrar-sesion-btn').addEventListener('click', () => {
    // 1. Borramos el token del localStorage
    localStorage.removeItem('jwt_token');

    // 2. Actualizamos la interfaz de usuario
    showMessage("Sesión cerrada correctamente", true);
    document.getElementById('botones-secundarios').style.display = 'none';
    iniciarSesionBtn.style.display = 'block'; // Usamos block para que vuelva a ser visible
    loginForm.style.display = 'none';
    menuContainer.style.display = 'flex';
});