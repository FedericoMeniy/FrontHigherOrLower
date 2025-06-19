// Contenido completo y correcto para js/crear_torneo.js
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosTorneo)
            });

            if (!response.ok) {
                const errorTexto = await response.text();
                throw new Error('Error del servidor: ' + errorTexto);
            }

            const resultado = await response.json();
            showMessage('¡Torneo creado exitosamente!', true);
            formCrearTorneo.reset();
            crearTorneoContainer.style.display = 'none';
            menuContainer.style.display = 'flex';

        } catch (error) {
            console.error("Error en el fetch:", error);
            showMessage(error.message, false);
        }
    });
});