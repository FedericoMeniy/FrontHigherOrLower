// js/juego.js

// --- Variables Globales del Juego ---
const menuContainer = document.getElementById('menu-container');
const juegoContainer = document.getElementById('juego-container');
let rondaActual = null;
let puntaje = 0;

// Variable para gestionar el modo de juego
let modoDeJuego = {
    tipo: 'clasico', // puede ser 'clasico' o 'torneo'
    torneo: null      // almacenará el objeto del torneo si es modo torneo
};


// ========================================================================
// NUEVA FUNCIÓN AUXILIAR PARA DECODIFICAR EL TOKEN
// ========================================================================
/**
 * Decodifica un token JWT para extraer su contenido (payload).
 * @param {string} token El token JWT.
 * @returns {object|null} El payload del token o null si es inválido.
 */
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("Error al decodificar el token:", e);
        return null;
    }
}


/**
 * Inicia el juego en MODO CLÁSICO.
 */
function iniciarJuegoClasico() {
    modoDeJuego = { tipo: 'clasico', torneo: null };

    menuContainer.style.display = 'none';
    juegoContainer.style.display = 'block';
    puntaje = 0;

    cargarNuevaRonda();
}

/**
 * Inicia el juego en MODO TORNEO.
 * @param {object} torneo - El objeto completo del torneo seleccionado.
 */
function iniciarJuegoTorneo(torneo) {
    modoDeJuego = { tipo: 'torneo', torneo: torneo };

    // Oculta todas las demás vistas para asegurarse de que solo se vea el juego
    document.getElementById('perfil-container').style.display = 'none';
    document.getElementById('jugador-torneo-options-container').style.display = 'none';

    juegoContainer.style.display = 'block';
    puntaje = 0;

    cargarNuevaRonda();
}


/**
 * Carga una nueva ronda dependiendo del modo de juego.
 */
async function cargarNuevaRonda() {
    let url = '';

    if (modoDeJuego.tipo === 'torneo') {
        url = `http://localhost:8080/juego/${modoDeJuego.torneo.id}/nueva-ronda`;
    } else {
        url = 'http://localhost:8080/juego/ronda';
    }

    try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        rondaActual = await response.json();
        mostrarPantallaDeJuego();
    } catch (error) {
        showMessage(`Error al iniciar la ronda: ${error.message}`, false);
        volverAlMenu();
    }
}

/**
 * Genera y muestra el HTML para la comparación de jugadores.
 */
function mostrarPantallaDeJuego() {
    if (!rondaActual) {
        console.error("No hay datos de la ronda para mostrar.");
        return;
    }

    const textoPregunta = formatearPregunta(rondaActual.pregunta);
    const futbolista1 = rondaActual.futbolista1;
    const futbolista2 = rondaActual.futbolista2;
    const valorF1 = rondaActual.valorFutbolista1;

    juegoContainer.innerHTML = `
        <div class="game-overlay">
            <div class="jugadores-comparacion">
                <div class="jugador">
                    <img src="${futbolista1.imagenURL || 'img/placeholder.jpg'}" alt="${futbolista1.nombre}" onerror="this.onerror=null;this.src='https://placehold.co/150x150/2c3e50/ffffff?text=Jugador';">
                    <h2>${futbolista1.nombre}</h2>
                    <p class="estadistica-pregunta">${textoPregunta}</p>
                    <p class="estadistica-valor">${valorF1}</p>
                </div>
                
                <div class="opciones">
                    <p class="puntaje">Puntaje: <strong>${puntaje}</strong></p>
                    
                    <p class="pregunta-texto">¿${futbolista2.nombre} tiene más, menos o igual?</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
                        <button onclick="jugar('higher')" class="btn btn-mayor"><i class="fa-solid fa-arrow-up"></i> Higher</button>
                        <button onclick="jugar('equal')" class="btn btn-igual"><i class="fa-solid fa-equals"></i> Equal</button>
                        <button onclick="jugar('lower')" class="btn btn-menor"><i class="fa-solid fa-arrow-down"></i> Lower</button>
                    </div>
                </div>

                <div class="jugador">
                     <img src="${futbolista2.imagenURL || 'img/placeholder.jpg'}" alt="${futbolista2.nombre}" onerror="this.onerror=null;this.src='https://placehold.co/150x150/2c3e50/ffffff?text=Jugador';">
                    <h2>${futbolista2.nombre}</h2>
                    <p class="estadistica-pregunta">${textoPregunta}</p>
                    <p class="estadistica-valor valor-oculto">?</p>
                </div>
            </div>
            <button onclick="volverAlMenu()" class="btn-volver">Salir de la Partida</button>
        </div>
    `;
}

/**
 * Procesa la elección del usuario.
 */
function jugar(eleccion) {
    if (!rondaActual) return;

    const valorF1 = rondaActual.valorFutbolista1;
    const valorF2 = rondaActual.valorFutbolista2;

    let esCorrecto = false;
    if (eleccion === 'higher') esCorrecto = valorF2 > valorF1;
    else if (eleccion === 'lower') esCorrecto = valorF2 < valorF1;
    else if (eleccion === 'equal') esCorrecto = valorF2 === valorF1;

    const valorOcultoEl = document.querySelector('.valor-oculto');
    if (valorOcultoEl) {
        valorOcultoEl.classList.remove('valor-oculto');
        valorOcultoEl.textContent = valorF2;
    }

    document.querySelectorAll('.opciones button').forEach(btn => btn.disabled = true);

    if (esCorrecto) {
        puntaje++;
        showMessage("¡Correcto! 🎉", true);
        document.querySelector('.puntaje').textContent = `Puntaje: ${puntaje}`;
        setTimeout(cargarNuevaRonda, 2000);
    } else {
        showMessage(`¡Incorrecto! ❌ La respuesta era ${valorF2}.`, false);
        setTimeout(finalizarPartida, 1500); // Dar tiempo a que el usuario vea el mensaje
    }
}


// ========================================================================
// VERSIÓN CORREGIDA DE LA FUNCIÓN
// ========================================================================
/**
 * Al finalizar una partida, decide a qué endpoint guardar el puntaje.
 */
async function finalizarPartida() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        console.error("No se encontró token.");
        mostrarPantallaDeDerrota();
        return;
    }

    let url = '';
    let requestBody = {};

    if (modoDeJuego.tipo === 'torneo') {
        // Obtenemos el ID del jugador desde el token
        const userData = parseJwt(token);
        if (!userData || !userData.userId) { // Asumo que el ID está como 'userId'
            showMessage("Error: No se pudo obtener la información del jugador desde el token.", false);
            mostrarPantallaDeDerrota();
            return;
        }

        if (!modoDeJuego.torneo || !modoDeJuego.torneo.id) {
            console.error("Error crítico: Se intentó finalizar una partida de torneo sin un ID de torneo válido.", modoDeJuego.torneo);
            showMessage("Error: No se pudo identificar el torneo para guardar la partida.", false);
            mostrarPantallaDeDerrota();
            return;
        }

        url = `http://localhost:8080/juego/registrar-partida-torneo`;

        // CORRECCIÓN: Se construye el cuerpo con los nombres de campo correctos
        requestBody = {
            idTorneo: modoDeJuego.torneo.id,
            idJugador: userData.userId,
            puntosObtenidos: puntaje
        };

    } else {
        url = `http://localhost:8080/juego/guardar-puntaje`;
        requestBody = { puntos: puntaje };
    }

    // Se intenta guardar incluso si el puntaje es 0 (para registrar la partida jugada)
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al guardar el puntaje');
        }

    } catch (error) {
        showMessage(`Error al guardar la partida: ${error.message}`, false);
        console.error(`Error en finalizarPartida (${modoDeJuego.tipo}):`, error);
    }

    // Siempre mostramos la pantalla de derrota al final
    mostrarPantallaDeDerrota();
}


/**
 * Muestra la pantalla de derrota con botones diferentes según el modo de juego.
 */
function mostrarPantallaDeDerrota() {
    let botonesHTML = '';

    if (modoDeJuego.tipo === 'torneo') {
        botonesHTML = `
            <button onclick="volverAlPerfil()" class="btn">Volver a Mi Perfil</button>
        `;
    } else {
        botonesHTML = `
            <button onclick="iniciarJuegoClasico()" class="btn">Volver a Jugar</button>
            <button onclick="volverAlMenu()" class="btn-volver">Volver al Menú</button>
        `;
    }

    juegoContainer.innerHTML = `
        <div class="game-overlay">
            <div class="login-box" style="text-align: center;">
                <h2 style="color: #e74c3c; font-size: 2.5em;">¡Fin de la Partida!</h2>
                <p style="font-size: 1.5em; color: #333; margin: 20px 0;">Puntaje Obtenido: ${puntaje}</p>
                <div class="buttons" style="margin-top: 30px; display: flex; flex-direction: column; gap: 15px; align-items: center;">
                    ${botonesHTML}
                </div>
            </div>
        </div>
    `;
}

/**
 * Vuelve al menú principal.
 */
function volverAlMenu() {
    menuContainer.style.display = 'flex';
    juegoContainer.style.display = 'none';
}

/**
 * Vuelve a la pantalla de perfil.
 */
function volverAlPerfil() {
    const perfilContainer = document.getElementById('perfil-container');
    if (perfilContainer) {
        juegoContainer.style.display = 'none';
        perfilContainer.style.display = 'flex';
        // Disparamos un clic en el botón de torneos inscritos para refrescar la lista.
        // Esto mejora la experiencia del usuario.
        document.getElementById('ver-inscriptos-btn').click();
    } else {
        volverAlMenu();
    }
}

/**
 * Formatea el enum de la pregunta para ser legible.
 */
function formatearPregunta(preguntaEnum) {
    if (!preguntaEnum) return '';
    switch (preguntaEnum) {
        case 'MAS_GOLES': return 'Goles';
        case 'MAS_ASISTENCIAS': return 'Asistencias';
        case 'MAS_TARJETAS_ROJAS': return 'Tarjetas Rojas';
        case 'MAS_TARJETAS_AMARILLAS': return 'Tarjetas Amarillas';
        default: return preguntaEnum.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
}