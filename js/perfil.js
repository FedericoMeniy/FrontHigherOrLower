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
    const perfilLeyenda = document.getElementById('perfil-leyenda');

    // --- Elementos del Modal de Modificación ---
    const modificarTorneoContainer = document.getElementById('modificar-torneo-container');
    const formModificarTorneo = document.getElementById('form-modificar-torneo');
    const cancelarModificarBtn = document.getElementById('cancelar-modificar-torneo');

    // --- Elementos del Modal de Confirmación para Borrar ---
    const confirmModal = document.getElementById('confirm-modal');
    const confirmModalTitle = document.getElementById('confirm-modal-title');
    const confirmModalText = document.getElementById('confirm-modal-text');
    const confirmModalAcceptBtn = document.getElementById('confirm-modal-accept');
    const confirmModalCancelBtn = document.getElementById('confirm-modal-cancel');
    
    // --- Opciones de Admin ---
    const torneoAdminOptionsContainer = document.getElementById('torneo-admin-options-container');
    const adminOptionsTitle = document.getElementById('admin-options-title');
    const adminVerTablaBtn = document.getElementById('admin-ver-tabla-btn');
    const adminModificarBtn = document.getElementById('admin-modificar-btn');
    const adminEliminarBtn = document.getElementById('admin-eliminar-btn');
    const volverPerfilAdminOptionsBtn = document.getElementById('volver-perfil-admin-options');

    // --- Elementos para la Vista de la Tabla ---
    const torneoTablaContainer = document.getElementById('torneo-tabla-container');
    const tablaTorneoTitle = document.getElementById('tabla-torneo-title');
    const tablaTorneoContent = document.getElementById('tabla-torneo-content');
    const volverAdminOptionsTablaBtn = document.getElementById('volver-admin-options-tabla');

    let torneoSeleccionado = null; 

    // Evento para mostrar la pantalla de perfil
    perfilBtn.addEventListener('click', () => {
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'ADMIN') {
            verInscriptosBtn.style.display = 'none';
            perfilLeyenda.style.display = 'none';
        } else {
            verInscriptosBtn.style.display = 'block';
            perfilLeyenda.style.display = 'flex';
        }
        
        menuContainer.style.display = 'none';
        perfilContainer.style.display = 'flex';
        limpiarVistaTorneos();
        cargarDatosBasicosPerfil();
    });

    // Evento para volver al menú
    volverMenuPerfilBtn.addEventListener('click', () => {
        perfilContainer.style.display = 'none';
        menuContainer.style.display = 'flex';
    });

    // Eventos para ver torneos inscriptos y creados
    verInscriptosBtn.addEventListener('click', () => cargarTorneos('inscriptos'));
    verCreadosBtn.addEventListener('click', () => cargarTorneos('creados'));
    
    // Lógica para el modal de Modificar
    formModificarTorneo.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!torneoSeleccionado) {
            showMessage("Error: No se ha seleccionado un torneo para modificar.", false);
            return;
        }
        const datosActualizados = {
            nombre: torneoSeleccionado.nombre,
            tiempoLimite: torneoSeleccionado.tiempoLimite,
            premio: parseInt(document.getElementById('modificar-torneo-premio').value),
            costoEntrada: parseInt(document.getElementById('modificar-torneo-costo').value)
        };
        actualizarTorneo(torneoSeleccionado.id, datosActualizados);
    });

    cancelarModificarBtn.addEventListener('click', () => {
        modificarTorneoContainer.style.display = 'none';
    });

    // Manejo de clics en la lista de torneos
    torneosLista.addEventListener('click', (e) => {
        const target = e.target.closest('.torneo-item'); 
        if (target && target.classList.contains('admin-actions-available')) {
            torneoSeleccionado = JSON.parse(target.dataset.torneo);
            perfilContainer.style.display = 'none';
            adminOptionsTitle.textContent = `Gestionar "${torneoSeleccionado.nombre}"`;
            torneoAdminOptionsContainer.style.display = 'flex';
        }
    });

    // --- Lógica para la pantalla de opciones de admin ---
    
    volverPerfilAdminOptionsBtn.addEventListener('click', () => {
        torneoAdminOptionsContainer.style.display = 'none';
        perfilContainer.style.display = 'flex';
        torneoSeleccionado = null; 
    });

    adminVerTablaBtn.addEventListener('click', () => {
        if (!torneoSeleccionado) return;
        torneoAdminOptionsContainer.style.display = 'none';
        torneoTablaContainer.style.display = 'flex';
        tablaTorneoTitle.textContent = `Tabla de Posiciones: "${torneoSeleccionado.nombre}"`;
        cargarTablaTorneo(torneoSeleccionado.id);
    });

    adminModificarBtn.addEventListener('click', () => {
        if (!torneoSeleccionado) return;
        document.getElementById('modificar-torneo-id').value = torneoSeleccionado.id;
        document.getElementById('modificar-torneo-premio').value = torneoSeleccionado.premio;
        document.getElementById('modificar-torneo-costo').value = torneoSeleccionado.costoEntrada;
        modificarTorneoContainer.style.display = 'flex';
    });

    adminEliminarBtn.addEventListener('click', () => {
        if (!torneoSeleccionado) return;
        confirmModalTitle.textContent = 'Confirmar Eliminación';
        confirmModalText.textContent = `¿Estás seguro de que quieres eliminar el torneo "${torneoSeleccionado.nombre}"? Esta acción no se puede deshacer.`;
        confirmModal.style.display = 'flex';

        confirmModalAcceptBtn.onclick = () => {
            eliminarTorneo(torneoSeleccionado.id);
            confirmModal.style.display = 'none';
            torneoAdminOptionsContainer.style.display = 'none';
            perfilContainer.style.display = 'flex';
        };
        confirmModalCancelBtn.onclick = () => {
            confirmModal.style.display = 'none';
        };
    });

    // --- Lógica para la vista de la tabla ---

    volverAdminOptionsTablaBtn.addEventListener('click', () => {
        torneoTablaContainer.style.display = 'none';
        torneoAdminOptionsContainer.style.display = 'flex';
    });

    async function cargarTablaTorneo(torneoId) {
        tablaTorneoContent.innerHTML = '<p>Cargando tabla...</p>';
        const token = localStorage.getItem('jwt_token');

        // ========= CORRECCIÓN 1: URL del endpoint corregida a /leaderboard =========
        const url = `http://localhost:8080/torneo/${torneoId}/leaderboard`;

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorTexto = await response.text();
                throw new Error(errorTexto || 'No se pudo cargar la tabla del torneo.');
            }
            const datosTabla = await response.json();
            renderizarTabla(datosTabla);
        } catch (error) {
            tablaTorneoContent.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    }

    function renderizarTabla(datos) {
        if (!datos || datos.length === 0) {
            tablaTorneoContent.innerHTML = '<p>Aún no hay participantes o puntajes en este torneo.</p>';
            return;
        }

        let tablaHTML = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Posición</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Usuario</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Puntaje</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Partidas Jugadas</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // ========= CORRECCIÓN 2: Se usan los nombres de propiedad correctos y se calcula la posición =========
        datos.forEach((item, index) => {
            tablaHTML += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${item.jugador.nombreUsuario}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${item.puntaje}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${item.partidasJugadas}</td>
                </tr>
            `;
        });

        tablaHTML += '</tbody></table>';
        tablaTorneoContent.innerHTML = tablaHTML;
    }

    // --- Funciones de Carga de Datos y API (sin cambios) ---

    async function cargarDatosBasicosPerfil() {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            showMessage("Necesitas iniciar sesión para ver tu perfil.", false);
            return;
        }
        try {
            const response = await fetch('http://localhost:8080/perfil', {
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
    
    async function cargarTorneos(tipoLista) {
        const token = localStorage.getItem('jwt_token');
        if (!token) return;
        try {
            const response = await fetch(`http://localhost:8080/torneo/${tipoLista}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Error al cargar los torneos.`);
            const torneos = await response.json();
            const titulo = tipoLista === 'inscriptos' ? 'Mis Torneos Inscriptos' : 'Mis Torneos Creados';
            renderizarTorneos(torneos, titulo);
        } catch (error) {
            showMessage(error.message, false);
        }
    }

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
        const esAdmin = localStorage.getItem('userRole') === 'ADMIN';
        const esVistaCreados = titulo.includes('Creados');
        torneos.forEach(torneo => {
            const li = document.createElement('li');
            const claseTipo = torneo.tipo === 'ADMIN' ? 'torneo-oficial' : 'torneo-amigos';
            li.className = `torneo-item ${claseTipo}`;
            if (esAdmin && esVistaCreados && torneo.tipo === 'ADMIN') {
                li.classList.add('admin-actions-available');
                li.dataset.torneo = JSON.stringify(torneo);
            }
            li.textContent = torneo.nombre;
            torneosLista.appendChild(li);
        });
    }

    async function actualizarTorneo(torneoId, datos) {
        const token = localStorage.getItem('jwt_token');
        try {
            const response = await fetch(`http://localhost:8080/torneo/${torneoId}/actualizar-oficial`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datos)
            });
            if (!response.ok) {
                const errorTexto = await response.text();
                throw new Error(errorTexto || "Error al actualizar el torneo.");
            }
            const torneoActualizado = await response.json();
            showMessage(`Torneo "${torneoActualizado.nombre}" actualizado con éxito.`, true);
            modificarTorneoContainer.style.display = 'none';
            torneoAdminOptionsContainer.style.display = 'none'; 
            perfilContainer.style.display = 'flex'; 
            cargarTorneos('creados');
        } catch (error) {
            showMessage(error.message, false);
        }
    }

    async function eliminarTorneo(torneoId) {
        const token = localStorage.getItem('jwt_token');
        try {
            const response = await fetch(`http://localhost:8080/torneo/${torneoId}/eliminar`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorTexto = await response.text();
                throw new Error(errorTexto || "Error al eliminar el torneo.");
            }
            showMessage('Torneo eliminado con éxito.', true);
            cargarTorneos('creados');
        } catch (error) {
            showMessage(error.message, false);
        }
    }

    function limpiarVistaTorneos() {
        torneosTitulo.textContent = '';
        torneosLista.innerHTML = '';
    }
});