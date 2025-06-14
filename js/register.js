// register.js
const registroLink = document.getElementById('registro-link');
const registerForm = document.getElementById('register-form');
const formRegister = document.getElementById('form-register');
const volverLoginBtn = document.getElementById('volver-login');

// Ir al registro
registroLink.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
});

// Volver al menú desde registro
volverLoginBtn.addEventListener('click', () => {
    registerForm.style.display = 'none';
    menuContainer.style.display = 'flex';
});

// Registro
formRegister.addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email-register').value;
    const password = document.getElementById('password-register').value;
    const tipoRol = document.getElementById('role').value;

    fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, tipoRol })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showMessage("Registro exitoso. Iniciá sesión para continuar.", true);
                formRegister.reset();
                registerForm.style.display = 'none';
                loginForm.style.display = 'flex';
            } else {
                showMessage(data.mensaje || "Error al registrarse", false);
            }
        })
        .catch(() => showMessage("No se pudo conectar con el servidor", false));
});
