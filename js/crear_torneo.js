// Contenido para el nuevo archivo js/crear_torneo.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const crearTorneoBtn = document.getElementById('crear-torneo-btn');
    const crearTorneoContainer = document.getElementById('crear-torneo-container');
    const menuContainer = document.getElementById('menu-container');
    const formCrearTorneo = document.getElementById('form-crear-torneo');
    const volverMenuCrearBtn = document.getElementById('volver-menu-crear');

    // --- Event Listeners ---

    // Abre la pantalla de creación de torneo
    crearTorneoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        menuContainer.style.display = 'none';
        crearTorneoContainer.style.display = 'flex';
    });

    // Vuelve al menú principal
    volverMenuCrearBtn.addEventListener('click', () => {
        crearTorneoContainer.style.display = 'none';
        menuContainer.style.display = 'flex';
    });

    // Envía el formulario para crear el torneo
    formCrearTorneo.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nombre = document.getElementById('torneo-nombre').value;
        const password = document.getElementById('torneo-nueva-password').value;
        const duracion = document.getElementById('torneo-duracion').value;

        // Validaciones básicas
        if (!nombre.trim() || !password.trim()) {
            showMessage("El nombre y la contraseña no pueden estar vacíos.", false);
            return;
        }

        const datosTorneo = { nombre, password, duracion };
        
        try {
            // **IMPORTANTE**: Este es el nuevo endpoint que necesitarás en el backend
            const response = await fetch('http://localhost:8080/torneo/crear-privado', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosTorneo)
            });

            const resultado = await response.json();

            if (!response.ok) {
                throw new Error(resultado.mensaje || 'No se pudo crear el torneo.');
            }

            showMessage('¡Torneo creado exitosamente!', true);
            formCrearTorneo.reset();
            crearTorneoContainer.style.display = 'none';
            menuContainer.style.display = 'flex';

        } catch (error) {
            showMessage(error.message, false);
        }
    });
});