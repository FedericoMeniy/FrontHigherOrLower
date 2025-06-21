document.addEventListener('DOMContentLoaded', () => {
    const crearTorneoBtn = document.getElementById('crear-torneo-btn');
    const crearTorneoContainer = document.getElementById('crear-torneo-container');
    const menuContainer = document.getElementById('menu-container');
    const formCrearTorneo = document.getElementById('form-crear-torneo');
    const volverMenuCrearBtn = document.getElementById('volver-menu-crear');

    crearTorneoBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const titulo = crearTorneoContainer.querySelector('h2');
        const passwordInput = document.getElementById('torneo-nueva-password');
        const premioInput = document.getElementById('torneo-premio');
        const costoInput = document.getElementById('torneo-costo-entrada');
        const userRole = localStorage.getItem('userRole');

        if (userRole === 'ADMIN') {
            titulo.textContent = 'CREAR TORNEO OFICIAL';
            passwordInput.style.display = 'none';
            passwordInput.required = false;
            premioInput.style.display = 'block';
            premioInput.required = true;
            costoInput.style.display = 'block';
            costoInput.required = true;
        } else {
            titulo.textContent = 'Crear Torneo de Amigos';
            passwordInput.style.display = 'block';
            passwordInput.required = true;
            premioInput.style.display = 'none';
            premioInput.required = false;
            costoInput.style.display = 'none';
            costoInput.required = false;
        }

        menuContainer.style.display = 'none';
        crearTorneoContainer.style.display = 'flex';
    });

    volverMenuCrearBtn.addEventListener('click', () => {
        crearTorneoContainer.style.display = 'none';
        menuContainer.style.display = 'flex';
    });

    // --- LÓGICA DE ENVÍO (SUBMIT) ACTUALIZADA ---
    formCrearTorneo.addEventListener('submit', async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('jwt_token');
        if (!token) {
            showMessage("Debes iniciar sesión para poder crear un torneo.", false);
            return;
        }

        const userRole = localStorage.getItem('userRole');
        const nombre = document.getElementById('torneo-nombre').value;
        const duracion = document.getElementById('torneo-duracion').value;

        let url = '';
        let datosTorneo = {};

        if (userRole === 'ADMIN') {
            const premio = document.getElementById('torneo-premio').value;
            const costoEntrada = document.getElementById('torneo-costo-entrada').value;

            if (parseInt(premio) < 0 || parseInt(costoEntrada) < 0) {
                showMessage("El premio y el costo no pueden ser negativos.", false);
                return;
            }

            url = 'http://localhost:8080/torneo/crear-oficial';
            datosTorneo = {
                nombre: nombre,
                tiempoLimite: duracion,
                premio: parseInt(premio),
                costoEntrada: parseInt(costoEntrada)
            };
        } else {
            const password = document.getElementById('torneo-nueva-password').value;
            if (!nombre.trim() || !password.trim()) {
                showMessage("El nombre y la contraseña no pueden estar vacíos.", false);
                return;
            }
            url = 'http://localhost:8080/torneo/crear-amigos';
            datosTorneo = {
                nombreTorneo: nombre,
                password: password,
                tiempoLimite: duracion
            };
        }
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosTorneo)
            });

            if (!response.ok) {
                // Aquí se recibe el "Usuario creador no encontrado"
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