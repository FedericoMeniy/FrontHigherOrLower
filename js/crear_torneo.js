document.addEventListener('DOMContentLoaded', () => {
    const crearTorneoBtn = document.getElementById('crear-torneo-btn');
    const crearTorneoContainer = document.getElementById('crear-torneo-container');
    const menuContainer = document.getElementById('menu-container');
    const formCrearTorneo = document.getElementById('form-crear-torneo');
    const volverMenuCrearBtn = document.getElementById('volver-menu-crear');

    crearTorneoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        menuContainer.style.display = 'none';
        crearTorneoContainer.style.display = 'flex';
    });

    volverMenuCrearBtn.addEventListener('click', () => {
        crearTorneoContainer.style.display = 'none';
        menuContainer.style.display = 'flex';
    });

    formCrearTorneo.addEventListener('submit', async (event) => {
        event.preventDefault();

        // --- 1. RECUPERAR EL TOKEN DEL LOCALSTORAGE ---
        const token = localStorage.getItem('jwt_token');

        // Si no hay token, el usuario no ha iniciado sesión.
        if (!token) {
            showMessage("Debes iniciar sesión para poder crear un torneo.", false);
            // Opcional: redirigir al login
            // window.location.href = '/login.html';
            return;
        }

        const nombre = document.getElementById('torneo-nombre').value;
        const password = document.getElementById('torneo-nueva-password').value;
        const duracion = document.getElementById('torneo-duracion').value;

        if (!nombre.trim() || !password.trim()) {
            showMessage("El nombre y la contraseña no pueden estar vacíos.", false);
            return;
        }

        const datosTorneo = {
            nombreTorneo: nombre,
            password: password,
            tiempoLimite: duracion
        };
        
        try {
            const response = await fetch('http://localhost:8080/torneo/crear-amigos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // --- 2. AÑADIR LA CABECERA DE AUTORIZACIÓN CON EL TOKEN ---
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosTorneo)
                // --- 3. QUITAR 'credentials: include' ---
            });

            if (!response.ok) {
                // Si el token es inválido o expiró, el servidor devolverá un 403 Forbidden.
                if (response.status === 403) {
                     throw new Error('Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo.');
                }
                const errorTexto = await response.text();
                throw new Error('Error del servidor: ' + errorTexto);
            }

            const resultado = await response.json();
            showMessage(`¡Torneo "${resultado.nombre}" creado exitosamente!`, true);
            formCrearTorneo.reset();
            crearTorneoContainer.style.display = 'none';
            menuContainer.style.display = 'flex';

        } catch (error) {
            console.error("Error en el fetch:", error);
            showMessage(error.message, false);
        }
    });
});