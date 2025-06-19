// Contenido para js/torneos.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const menuContainer = document.getElementById('menu-container');

    // Contenedores principales de la funcionalidad
    const unirseTorneoBtn = document.getElementById('unirse-torneo-btn');
    const torneoSelectionContainer = document.getElementById('torneo-selection-container');
    const unirseTorneoContainer = document.getElementById('unirse-torneo-container');
    const passwordModal = document.getElementById('password-modal');

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
    
    // --- FLUJO PRINCIPAL ---

    // 1. Al hacer clic en "Unirse a Torneo", se muestra la pantalla de selección.
    unirseTorneoBtn.addEventListener('click', () => {
        menuContainer.style.display = 'none';
        torneoSelectionContainer.style.display = 'flex';
    });

    // 2. Al seleccionar "Torneo Oficial", se buscan y muestran los torneos de tipo ADMIN.
    selectTorneoOficialBtn.addEventListener('click', () => {
        torneoSelectionContainer.style.display = 'none';
        unirseTorneoContainer.style.display = 'flex';
        cargarTorneosDisponibles('ADMIN');
    });

    // 3. Al seleccionar "Torneo de Amigos", se buscan y muestran los torneos de tipo PRIVADO.
    selectTorneoAmigosBtn.addEventListener('click', () => {
        torneoSelectionContainer.style.display = 'none';
        unirseTorneoContainer.style.display = 'flex';
        cargarTorneosDisponibles('PRIVADO');
    });

    // --- FUNCIONES Y MANEJADORES ---

    // Carga y muestra la lista de torneos filtrada por tipo.
    async function cargarTorneosDisponibles(tipoDeTorneo) {
        listaTorneosDisponibles.innerHTML = '<li>Cargando...</li>';
        try {
            // **IMPORTANTE**: El endpoint ahora debe aceptar un filtro, ej: /disponibles?tipo=ADMIN
            const response = await fetch(`http://localhost:8080/api/torneos/disponibles?tipo=${tipoDeTorneo}`);
            if (!response.ok) throw new Error('No se pudieron cargar los torneos.');
            
            const torneos = await response.json();
            listaTorneosDisponibles.innerHTML = ''; // Limpiar

            if (torneos.length === 0) {
                 listaTorneosDisponibles.innerHTML = `<li>No hay torneos de tipo '${tipoDeTorneo}' disponibles.</li>`;
                 return;
            }

            torneos.forEach(torneo => {
                const costoTexto = torneo.tipo === 'ADMIN' ? `Costo: ${torneo.costoPuntos} puntos` : 'Requiere contraseña';
                const li = document.createElement('li');
                li.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                        <span><strong>${torneo.nombre}</strong> (${costoTexto})</span>
                        <button class="btn-unirse-ahora" data-id="${torneo.id}" data-tipo="${torneo.tipo}" data-costo="${torneo.costoPuntos}" data-nombre="${torneo.nombre}">Unirse</button>
                    </div>
                `;
                listaTorneosDisponibles.appendChild(li);
            });
        } catch (error) {
            listaTorneosDisponibles.innerHTML = `<li>Error al cargar los torneos.</li>`;
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
                if (confirm(`¿Quieres gastar ${torneo.costo} puntos para unirte al torneo "${torneo.nombre}"?`)) {
                    unirseATorneoAdmin(torneo.id);
                }
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
    
    // Funciones fetch para unirse
    async function unirseATorneoAdmin(torneoId) {
        try {
            const response = await fetch('http://localhost:8080/api/torneos/unirse/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ torneoId })
            });
            const resultado = await response.json();
            if (!response.ok) throw new Error(resultado.mensaje || 'Error');
            showMessage('¡Te has unido al torneo!', true);
            cargarTorneosDisponibles('ADMIN');
        } catch (error) { showMessage(error.message, false); }
    }

    async function unirseATorneoPrivado(torneoId, password) {
        try {
            const response = await fetch('http://localhost:8080/api/torneos/unirse/privado', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ torneoId, password })
            });
            const resultado = await response.json();
            if (!response.ok) throw new Error(resultado.mensaje || 'Error');
            showMessage('¡Te has unido al torneo!', true);
            cargarTorneosDisponibles('PRIVADO');
        } catch (error) { showMessage(error.message, false); }
    }
});