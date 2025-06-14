// login.js
const menuContainer = document.getElementById('menu-container');
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
            if (ok && data.exito) {
                showMessage("Login exitoso!", true);
                document.getElementById('botones-secundarios').style.display = 'block';
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
    fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showMessage("Sesión cerrada correctamente", true);
            document.getElementById('botones-secundarios').style.display = 'none';
            iniciarSesionBtn.style.display = 'flex';
            loginForm.style.display = 'none';
            menuContainer.style.display = 'flex';
        } else {
            showMessage("Error al cerrar sesión", false);
        }
    })
    .catch(() => showMessage("No se pudo conectar con el servidor", false));
});