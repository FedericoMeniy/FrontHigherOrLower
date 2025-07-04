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

    fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password})
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(errorData => {
                 // Lanzamos un error con el mensaje del backend
                throw new Error(errorData.error || 'Ocurrio un error desconocido.');
            });
        }
        // Si el registro fue exitoso, el cuerpo de la respuesta contiene el token
        return res.json();
    })
    .then(data => {
        // --- AQUÍ ESTÁ EL CAMBIO PRINCIPAL ---
        // Guardamos el token para que el usuario inicie sesión automáticamente
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('userRole', data.tipoRol);
        
        // Actualizamos la UI, informando al usuario que ya está conectado
        showMessage("Registro exitoso! Ya estás conectado.", true);
        formRegister.reset();
        
        // Lógica para mostrar/ocultar botones
        document.getElementById('botones-secundarios').style.display = 'flex';
        iniciarSesionBtn.style.display = 'none';
        registerForm.style.display = 'none';
        menuContainer.style.display = 'flex';

        const unirseTorneoBtn = document.getElementById('unirse-torneo-btn');
        if (unirseTorneoBtn) { // Primero, nos aseguramos de que el botón exista
            if (data.tipoRol === 'ADMIN') {
                unirseTorneoBtn.style.display = 'none';
            } else {
                unirseTorneoBtn.style.display = 'block';
            }
        }
    })
    .catch(error => {
        const message = error.message && error.message !== 'Failed to fetch'
                ? error.message
                : "No se pudo conectar con el servidor";
        showMessage(message, false);
    });
});
