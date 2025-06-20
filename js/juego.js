// js/juego.js

// --- Variables Globales del Juego ---
// Elementos del DOM 
const menuContainer = document.getElementById('menu-container'); 
const juegoContainer = document.getElementById('juego-container');
let rondaActual = null; // Almacenará toda la información de la ronda que viene del backend
let puntaje = 0;

/**
 * Función que se llama desde el botón en index.html.
 * Prepara el entorno para el juego y carga la primera ronda.
 */
function iniciarJuegoClasico() {
    // Oculta el menú y muestra el contenedor del juego
    menuContainer.style.display = 'none';
    juegoContainer.style.display = 'block';
    puntaje = 0; // Resetea el puntaje al iniciar un nuevo juego

    // Carga la primera ronda
    cargarNuevaRonda();
}

/**
 * Se comunica con el backend para obtener los datos de una nueva ronda.
 */
async function cargarNuevaRonda() {
    try {
        const response = await fetch('http://localhost:8080/api/juego/ronda');
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Error del servidor: ${response.status}. ${errorData}`);
        }
        rondaActual = await response.json();
        mostrarPantallaDeJuego();
    } catch (error) {
        console.error("Error al cargar la nueva ronda:", error);
        showMessage("Error al conectar con el servidor para iniciar la ronda.", false);
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
                    <p class="puntaje">Puntaje: ${puntaje}</p>
                    <button onclick="jugar('higher')" class="btn-mayor">Higher</button>
                    <button onclick="jugar('equal')" class="btn-igual">Equal</button>
                    <button onclick="jugar('lower')" class="btn-menor">Lower</button>
                    <p class="pregunta-texto">¿${futbolista2.nombre} tiene más o menos?</p>
                </div>

                <div class="jugador">
                     <img src="${futbolista2.imagenURL || 'img/placeholder.jpg'}" alt="${futbolista2.nombre}" onerror="this.onerror=null;this.src='https://placehold.co/150x150/2c3e50/ffffff?text=Jugador';">
                    <h2>${futbolista2.nombre}</h2>
                    <p class="estadistica-pregunta">${textoPregunta}</p>
                    <p class="estadistica-valor valor-oculto">?</p>
                </div>
            </div>
            <button onclick="volverAlMenu()" class="btn-volver">Volver al menú</button>
        </div>
    `;
}

/**
 * Procesa la elección del usuario (Higher, Lower o Equal).
 * @param {string} eleccion - La elección del usuario: 'higher', 'lower' o 'equal'.
 */
function jugar(eleccion) {
    if (!rondaActual) return;

    const valorF1 = rondaActual.valorFutbolista1;
    const valorF2 = rondaActual.valorFutbolista2;

    let esCorrecto = false;
    if (eleccion === 'higher') {
        esCorrecto = valorF2 > valorF1;
    } else if (eleccion === 'lower') {
        esCorrecto = valorF2 < valorF1;
    } else if (eleccion === 'equal') {
        esCorrecto = valorF2 === valorF1;
    }

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
        setTimeout(mostrarPantallaDeDerrota, 2000); // Llama a la nueva pantalla de derrota
    }
}

/**
 * NUEVA FUNCIÓN: Muestra la pantalla de derrota.
 */
function mostrarPantallaDeDerrota() {
    juegoContainer.innerHTML = `
        <div class="game-overlay">
            <div class="login-box" style="text-align: center;">
                <h2 style="color: #e74c3c; font-size: 2.5em;">¡Has Perdido!</h2>
                <p style="font-size: 1.5em; color: #333; margin: 20px 0;">Puntaje Obtenido: ${puntaje}</p>
                <div class="buttons" style="margin-top: 30px; display: flex; flex-direction: column; gap: 15px; align-items: center;">
                    <button onclick="iniciarJuegoClasico()" class="btn">Volver a Jugar</button>
                    <button onclick="volverAlMenu()" class="btn-volver">Volver al Menú</button>
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
 * Formatea el enum de la pregunta para ser legible.
 * @param {string} preguntaEnum - El valor del enum (ej: "MAS_GOLES").
 * @returns {string} - Un texto descriptivo.
 */
function formatearPregunta(preguntaEnum) {
    switch (preguntaEnum) {
        case 'MAS_GOLES':
            return 'Goles';
        case 'MAS_ASISTENCIAS':
            return 'Asistencias';
        case 'MAS_TARJETAS_ROJAS':
            return 'Tarjetas Rojas';
        case 'MAS_TARJETAS_AMARILLAS':
            return 'Tarjetas Amarillas';
        case 'MAS_PARTIDOS_JUGADOS':
            return 'Partidos Jugados';
        default:
            return preguntaEnum.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
}