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

    // --- NUEVO: Elementos del Modal de Modificación ---
    const modificarTorneoContainer = document.getElementById('modificar-torneo-container');
    const formModificarTorneo = document.getElementById('form-modificar-torneo');
    const cancelarModificarBtn = document.getElementById('cancelar-modificar-torneo');

    // --- NUEVO: Elementos del Modal de Confirmación para Borrar ---
    const confirmModal = document.getElementById('confirm-modal');
    const confirmModalText = document.getElementById('confirm-modal-text');
    const confirmModalAcceptBtn = document.getElementById('confirm-modal-accept');
    const confirmModalCancelBtn = document.getElementById('confirm-modal-cancel');


    // 1. Evento para mostrar la pantalla de perfil
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

    // 2. Evento para volver al menú
    volverMenuPerfilBtn.addEventListener('click', () => {
        perfilContainer.style.display = 'none';
        menuContainer.style.display = 'flex';
    });

    // 3. Evento para el botón "Inscriptos"
    verInscriptosBtn.addEventListener('click', async () => {
        cargarTorneos('inscriptos');
    });

    // 4. Evento para el botón "Creados"
    verCreadosBtn.addEventListener('click', async () => {
        cargarTorneos('creados');
    });
    
    // --- NUEVO: Lógica para el modal de Modificar ---
    formModificarTorneo.addEventListener('submit', (e) => {
        e.preventDefault();
        const torneoId = document.getElementById('modificar-torneo-id').value;

        const datosActualizados = {
            nombre: document.getElementById('modificar-torneo-nombre').value,
            premio: parseInt(document.getElementById('modificar-torneo-premio').value),
            costoEntrada: parseInt(document.getElementById('modificar-torneo-costo').value),
            tiempoLimite: document.getElementById('modificar-torneo-duracion').value
        };
        
        actualizarTorneo(torneoId, datosActualizados);
    });

    cancelarModificarBtn.addEventListener('click', () => {
        modificarTorneoContainer.style.display = 'none';
    });


    // --- NUEVO: Manejo de clics en la lista de torneos para Modificar/Borrar ---
    torneosLista.addEventListener('click', (e) => {
        const target = e.target;

        // Botón Modificar
        if (target.classList.contains('btn-modificar')) {
            const torneo = JSON.parse(target.dataset.torneo);
            
            // Llenar el formulario con los datos actuales
            document.getElementById('modificar-torneo-id').value = torneo.id;
            document.getElementById('modificar-torneo-nombre').value = torneo.nombre;
            document.getElementById('modificar-torneo-premio').value = torneo.premio;
            document.getElementById('modificar-torneo-costo').value = torneo.costoEntrada;
            document.getElementById('modificar-torneo-duracion').value = torneo.tiempoLimite;

            // Mostrar el modal
            modificarTorneoContainer.style.display = 'flex';
        }

        // Botón Eliminar
        if (target.classList.contains('btn-eliminar')) {
            const torneoId = target.dataset.id;
            const torneoNombre = target.dataset.nombre;

            // Mostrar el modal de confirmación
            confirmModalText.textContent = `¿Estás seguro de que quieres eliminar el torneo "${torneoNombre}"? Esta acción no se puede deshacer.`;
            confirmModal.style.display = 'flex';

            // Asignar evento al botón de aceptar
            confirmModalAcceptBtn.onclick = () => {
                eliminarTorneo(torneoId);
                confirmModal.style.display = 'none';
            };

            // Asignar evento al botón de cancelar
            confirmModalCancelBtn.onclick = () => {
                confirmModal.style.display = 'none';
            };
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
    
    // MODIFICADO: Unificamos la carga de torneos
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


    // 6. MODIFICADO: Función para renderizar una lista de torneos con botones
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

            // Contenedor flexible para el nombre y los botones
            let contenidoHTML = `<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <span>${torneo.nombre}</span>`;

            // NUEVO: Agregamos botones si es admin y está en la vista de "Creados"
            if (esAdmin && esVistaCreados && torneo.tipo === 'ADMIN') {
                 // Usamos data-attributes para pasar toda la info del torneo al JS
                contenidoHTML += `<div class="torneo-actions">
                                      <button class="btn-modificar" style="margin-right: 5px; background-color: #f39c12;" data-torneo='${JSON.stringify(torneo)}'>Modificar</button>
                                      <button class="btn-eliminar" style="background-color: #c0392b;" data-id="${torneo.id}" data-nombre="${torneo.nombre}">Eliminar</button>
                                  </div>`;
            }

            contenidoHTML += `</div>`;
            li.innerHTML = contenidoHTML;
            torneosLista.appendChild(li);
        });
    }

    // --- NUEVO: Funciones para interactuar con la API ---

    /**
     * Envía la petición para actualizar un torneo oficial
     * @param {string} torneoId - El ID del torneo a actualizar
     * @param {object} datos - Los nuevos datos del torneo
     */
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
            modificarTorneoContainer.style.display = 'none'; // Ocultar modal
            cargarTorneos('creados'); // Recargar la lista de torneos

        } catch (error) {
            showMessage(error.message, false);
        }
    }

    /**
     * Envía la petición para eliminar un torneo oficial
     * @param {string} torneoId - El ID del torneo a eliminar
     */
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
            cargarTorneos('creados'); // Recargar la lista para que desaparezca el torneo eliminado

        } catch (error) {
            showMessage(error.message, false);
        }
    }

    // 7. Función para limpiar la vista
    function limpiarVistaTorneos() {
        torneosTitulo.textContent = '';
        torneosLista.innerHTML = '';
    }
});