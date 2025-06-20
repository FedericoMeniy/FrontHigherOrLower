document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const perfilBtn = document.getElementById('perfil-btn');
    const perfilContainer = document.getElementById('perfil-container');
    const menuContainer = document.getElementById('menu-container');
    const volverMenuPerfilBtn = document.getElementById('volver-menu-perfil');

    // --- Elementos para mostrar datos ---
    const perfilUsuarioSpan = document.getElementById('perfil-username');
    const perfilEmailSpan = document.getElementById('perfil-email');
    const perfilPuntosSpan = document.getElementById('perfil-puntos');

    // 1. Evento para mostrar la pantalla de perfil
    perfilBtn.addEventListener('click', () => {
        menuContainer.style.display = 'none';
        perfilContainer.style.display = 'flex';
        cargarDatosPerfil(); // Cargar los datos al abrir la pantalla
    });

    // 2. Evento para volver al menú
    volverMenuPerfilBtn.addEventListener('click', () => {
        perfilContainer.style.display = 'none';
        menuContainer.style.display = 'flex';
    });

    // 3. Función para cargar los datos del perfil desde el backend
    async function cargarDatosPerfil() {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            showMessage("Necesitas iniciar sesión para ver tu perfil.", false);
            // Opcional: redirigir al menú si no hay token
            perfilContainer.style.display = 'none';
            menuContainer.style.display = 'flex';
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/perfil', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                 if (response.status === 401) {
                    throw new Error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
                }
                throw new Error('No se pudieron cargar los datos del perfil.');
            }

            const data = await response.json();

            // Actualizar el HTML con los datos recibidos
            perfilUsuarioSpan.textContent = data.username;
            perfilEmailSpan.textContent = data.email;
            perfilPuntosSpan.textContent = data.puntosTotales;

        } catch (error) {
            showMessage(error.message, false);
            // Si hay un error, volver al menú
            perfilContainer.style.display = 'none';
            menuContainer.style.display = 'flex';
        }
    }
});