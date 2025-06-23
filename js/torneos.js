document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const menuContainer = document.getElementById('menu-container');

    // Contenedores principales de la funcionalidad
    const unirseTorneoBtn = document.getElementById('unirse-torneo-btn');
    const torneoSelectionContainer = document.getElementById('torneo-selection-container');
    const unirseTorneoContainer = document.getElementById('unirse-torneo-container');
    const passwordModal = document.getElementById('password-modal');

    // --- NUEVOS ELEMENTOS PARA EL MODAL DE CONFIRMACIÓN ---
    const confirmModal = document.getElementById('confirm-modal');
    // ========= CAMBIO: Añadir referencia al título del modal =========
    const confirmModalTitle = document.getElementById('confirm-modal-title');
    const confirmModalText = document.getElementById('confirm-modal-text');
    const confirmModalAcceptBtn = document.getElementById('confirm-modal-accept');
    const confirmModalCancelBtn = document.getElementById('confirm-modal-cancel');

    // Botones de navegación y acción
    const selectTorneoOficialBtn = document.getElementById('select-torneo-oficial');
    const selectTorneoAmigosBtn = document.getElementById('select-torneo-amigos');
    const volverMenuSelectionBtn = document.getElementById('volver-menu-selection');
    const volverMenuUnirseBtn = document.getElementById('volver-menu-unirse');
    const passwordForm = document.getElementById('password-form');
    const cancelarPasswordModalBtn = document.getElementById('cancelar-password-modal');
    
    // Elementos dinámicos
    const listaTorneosDisponibles = document.getElementById('lista-torneos-disponibles');
    const passwordModalTitle = document.getElementById('password-modal-title');
    
    // --- NUEVO ELEMENTO DEL DOM: Campo de búsqueda ---
    const searchTorneoInput = document.getElementById('searchTorneoInput');

    // --- FLUJO PRINCIPAL ---

    // Variable para almacenar el tipo de torneo seleccionado (ADMIN o PRIVADO)
    let tipoTorneoSeleccionado = '';

    // 1. Al hacer clic en "Unirse a Torneo", se muestra la pantalla de selección.
    unirseTorneoBtn.addEventListener('click', () => {
        menuContainer.style.display = 'none';
        torneoSelectionContainer.style.display = 'flex';
        // Limpiar el input de búsqueda cada vez que se vuelve a esta pantalla
        searchTorneoInput.value = ''; 
    });

    // 2. Al seleccionar "Torneo Oficial", se buscan y muestran los torneos de tipo ADMIN.
    selectTorneoOficialBtn.addEventListener('click', () => {
        torneoSelectionContainer.style.display = 'none';
        unirseTorneoContainer.style.display = 'flex';
        tipoTorneoSeleccionado = 'ADMIN'; // Establecer el tipo
        cargarTorneosDisponibles(tipoTorneoSeleccionado); // Cargar sin filtro inicial de búsqueda
    });

    // 3. Al seleccionar "Torneo de Amigos", se buscan y muestran los torneos de tipo PRIVADO.
    selectTorneoAmigosBtn.addEventListener('click', () => {
        torneoSelectionContainer.style.display = 'none';
        unirseTorneoContainer.style.display = 'flex';
        tipoTorneoSeleccionado = 'PRIVADO'; // Establecer el tipo
        cargarTorneosDisponibles(tipoTorneoSeleccionado); // Cargar sin filtro inicial de búsqueda
    });

    // --- NUEVO MANEJADOR DE EVENTOS: Filtrar por nombre ---
    searchTorneoInput.addEventListener('input', () => {
        // Cada vez que se escribe, recargar la lista con el término de búsqueda actual
        if (tipoTorneoSeleccionado) { // Asegurarse de que ya se haya seleccionado un tipo de torneo
            cargarTorneosDisponibles(tipoTorneoSeleccionado, searchTorneoInput.value.toLowerCase());
        }
    });


    // --- FUNCIONES Y MANEJADORES ---

    // Carga y muestra la lista de torneos filtrada por tipo y opcionalmente por nombre.
   async function cargarTorneosDisponibles(tipoDeTorneo, searchTerm = '') {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        showMessage("Necesitas iniciar sesión para ver los torneos.", false);
        unirseTorneoContainer.style.display = 'none';
        menuContainer.style.display = 'flex';
        return;
    }

    listaTorneosDisponibles.innerHTML = '<li>Cargando...</li>';
    try {
        let url = `http://localhost:8080/torneo/disponibles?tipo=${tipoDeTorneo}`;
        if (searchTerm) {
            url += `&nombre=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 403) {
            throw new Error('Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo.');
        }
        if (!response.ok) {
            throw new Error('No se pudieron cargar los torneos.');
        }
        
        const torneos = await response.json();
        listaTorneosDisponibles.innerHTML = '';

        if (torneos.length === 0) {
            listaTorneosDisponibles.innerHTML = `<li>No hay torneos de tipo '${tipoDeTorneo}' ${searchTerm ? `que coincidan con '${searchTerm}'` : ''} disponibles.</li>`;
            return;
        }

        torneos.forEach(torneo => {
            let infoTexto;
            if (torneo.tipo === 'ADMIN') {
                infoTexto = `Premio: ${torneo.premio} puntos - Costo: ${torneo.costoPuntos} puntos`;
            } else {
                infoTexto = 'Requiere contraseña';
            }
            
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                    <span><strong>${torneo.nombre}</strong> (${infoTexto})</span>
                    <button class="btn-unirse-ahora" data-id="${torneo.id}" data-tipo="${torneo.tipo}" data-costo="${torneo.costoPuntos}" data-nombre="${torneo.nombre}">Unirse</button>
                </div>
            `;
            listaTorneosDisponibles.appendChild(li);
        });
    } catch (error) {
        listaTorneosDisponibles.innerHTML = `<li>Error al cargar: ${error.message}</li>`;
        showMessage(error.message, false);
    }
}
    
    // Maneja el clic en el botón "Unirse" de cada torneo en la lista.
    listaTorneosDisponibles.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-unirse-ahora')) {
            const boton = e.target;
            const torneo = {
                id: boton.dataset.id,
                tipo: boton.dataset.tipo,
                costo: boton.dataset.costo,
                nombre: boton.dataset.nombre
            };

            if (torneo.tipo === 'ADMIN') {
                // ========= CAMBIO: Establecer el título del modal =========
                confirmModalTitle.textContent = 'Confirmar Unión';
                confirmModalText.textContent = `¿Quieres gastar ${torneo.costo} puntos para unirte al torneo "${torneo.nombre}"?`;
                confirmModal.style.display = 'flex';

                confirmModalAcceptBtn.onclick = () => {
                    unirseATorneoAdmin(torneo.id);
                    confirmModal.style.display = 'none';
                };

                confirmModalCancelBtn.onclick = () => {
                    confirmModal.style.display = 'none';
                };

            } else if (torneo.tipo === 'PRIVADO') {
                passwordModalTitle.textContent = `Contraseña para "${torneo.nombre}"`;
                passwordModal.style.display = 'flex';
                passwordForm.dataset.torneoId = torneo.id;
            }
        }
    });

    // --- Botones para volver y cancelar ---
    volverMenuSelectionBtn.addEventListener('click', () => {
        torneoSelectionContainer.style.display = 'none';
        menuContainer.style.display = 'flex';
    });

    volverMenuUnirseBtn.addEventListener('click', () => {
        unirseTorneoContainer.style.display = 'none';
        menuContainer.style.display = 'flex';
    });
    
    cancelarPasswordModalBtn.addEventListener('click', () => {
        passwordForm.reset();
        passwordModal.style.display = 'none';
    });

    // Lógica del formulario de contraseña
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const torneoId = e.target.dataset.torneoId;
        const password = document.getElementById('torneo-password-input').value;
        unirseATorneoPrivado(torneoId, password);
        passwordForm.reset();
        passwordModal.style.display = 'none';
    });
    
    // --- Funciones fetch para unirse ---

    async function unirseATorneoAdmin(torneoId) {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        showMessage("Debes iniciar sesión para unirte a un torneo.", false);
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/torneo/${torneoId}/unirse-oficial`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = errorText;

            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.mensaje || errorText;
            } catch (e) {
                // No es JSON, usar texto plano.
            }
            throw new Error(errorMessage);
        }
        
        showMessage('¡Te has unido al torneo!', true);
        cargarTorneosDisponibles(tipoTorneoSeleccionado, searchTorneoInput.value.toLowerCase());

    } catch (error) { 
        showMessage(error.message, false); 
    }
}

async function unirseATorneoPrivado(torneoId, password) {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        showMessage("Debes iniciar sesión para unirte a un torneo.", false);
        return;
    }

    const requestBody = {
        password: password
    };

    const url = `http://localhost:8080/torneo/${torneoId}/unirse`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            const torneoActualizado = await response.json();
            showMessage('¡Te has unido al torneo exitosamente!', true);
            cargarTorneosDisponibles(tipoTorneoSeleccionado, searchTorneoInput.value.toLowerCase());
        } else {
            const mensajeError = await response.text();
            showMessage(`${mensajeError}`, false);
        }
    } catch (error) {
        console.error("Error de conexión en unirseATorneoPrivado:", error);
        showMessage('No se pudo conectar con el servidor.', false);
    }
}
});