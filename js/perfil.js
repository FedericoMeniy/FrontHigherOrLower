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

    // --- Elementos para Torneos ---
    const verInscriptosBtn = document.getElementById('ver-inscriptos-btn');
    const verCreadosBtn = document.getElementById('ver-creados-btn');
    const torneosTitulo = document.getElementById('perfil-torneos-titulo');
    const torneosLista = document.getElementById('perfil-torneos-lista');
    const perfilLeyenda = document.getElementById('perfil-leyenda'); // NUEVO ELEMENTO A CONTROLAR

    // 1. Evento para mostrar la pantalla de perfil
    perfilBtn.addEventListener('click', () => {
        const userRole = localStorage.getItem('userRole');

        // *** NUEVA LÓGICA PARA PERSONALIZAR VISTA DE ADMIN ***
        if (userRole === 'ADMIN') {
            // Ocultar elementos que no son relevantes para el admin
            verInscriptosBtn.style.display = 'none';
            perfilLeyenda.style.display = 'none';
        } else {
            // Asegurarse de que los elementos sean visibles para otros usuarios
            verInscriptosBtn.style.display = 'block';
            perfilLeyenda.style.display = 'flex';
        }
        
        menuContainer.style.display = 'none';
        perfilContainer.style.display = 'flex';
        limpiarVistaTorneos();
        cargarDatosBasicosPerfil();
    });

    // 2. Evento para volver al menú
    volverMenuPerfilBtn.addEventListener('click', () => {
        perfilContainer.style.display = 'none';
        menuContainer.style.display = 'flex';
    });

    // 3. Evento para el botón "Inscriptos"
    verInscriptosBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('jwt_token');
        if (!token) return;

        try {
            const response = await fetch('http://localhost:8080/torneo/inscriptos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al cargar los torneos en los que estás inscripto.');
            }

            const torneos = await response.json();
            renderizarTorneos(torneos, 'Mis Torneos Inscriptos');

        } catch (error) {
            showMessage(error.message, false);
        }
    });

    // 4. Evento para el botón "Creados"
    verCreadosBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('jwt_token');
        if (!token) return;

        try {
            const response = await fetch('http://localhost:8080/torneo/creados', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error al cargar los torneos que has creado.');
            }

            const torneos = await response.json();
            renderizarTorneos(torneos, 'Mis Torneos Creados');

        } catch (error) {
            showMessage(error.message, false);
        }
    });

    // 5. Función para cargar los datos BÁSICOS del perfil
    async function cargarDatosBasicosPerfil() {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            showMessage("Necesitas iniciar sesión para ver tu perfil.", false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/perfil', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('No se pudieron cargar los datos del perfil.');
            
            const data = await response.json();

            perfilUsuarioSpan.textContent = data.username;
            perfilEmailSpan.textContent = data.email;
            perfilPuntosSpan.textContent = data.puntosTotales;

        } catch (error) {
            showMessage(error.message, false);
            perfilContainer.style.display = 'none';
            menuContainer.style.display = 'flex';
        }
    }

    // 6. Función para renderizar una lista de torneos
    function renderizarTorneos(torneos, titulo) {
        limpiarVistaTorneos();
        torneosTitulo.textContent = titulo;

        if (!torneos || torneos.length === 0) {
            const mensaje = titulo.includes('Inscriptos') 
                ? 'No estás inscripto en ningún torneo.' 
                : 'No has creado ningún torneo.';
            torneosLista.innerHTML = `<li>${mensaje}</li>`;
            return;
        }

        torneos.forEach(torneo => {
            const li = document.createElement('li');
            const claseTipo = torneo.tipo === 'ADMIN' ? 'torneo-oficial' : 'torneo-amigos';
            li.className = `torneo-item ${claseTipo}`;
            li.textContent = torneo.nombre;
            torneosLista.appendChild(li);
        });
    }

    // 7. Función para limpiar la vista
    function limpiarVistaTorneos() {
        torneosTitulo.textContent = '';
        torneosLista.innerHTML = '';
    }
});