// js/juego.js

// Variables para almacenar los datos del juego
let jugadorActual = null;
let jugadorSiguiente = null;
let estadisticaActual = ''; // Ej: 'goles', 'asistencias'
let puntaje = 0;

// Elementos del DOM
const menuContainer = document.getElementById('menu-container');
const juegoContainer = document.getElementById('juego-container');

/**
 * Inicia el modo de juego clásico.
 * Se comunica con el backend para obtener los jugadores y la estadística.
 */
async function iniciarJuegoClasico() {
    // Oculta el menú y muestra el contenedor del juego
    menuContainer.style.display = 'none';
    juegoContainer.style.display = 'block';

    try {
        // Hacemos UNA SOLA llamada al backend para obtener toda la información necesaria
        const response = await fetch('http://localhost:8080/api/juego/iniciar');
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del juego desde el servidor.');
        }

        const data = await response.json();

        // Guardamos los datos recibidos
        jugadorActual = data.jugadorActual;
        jugadorSiguiente = data.jugadorSiguiente;
        estadisticaActual = data.estadisticaActual; // El backend nos dice qué comparar

        // Mostramos la pantalla de comparación
        mostrarComparacion();

    } catch (error) {
        console.error("Error al iniciar el juego:", error);
        showMessage("Error al conectar con el servidor", false);
        volverAlMenu(); // Si hay un error, volvemos al menú
    }
}

/**
 * Genera y muestra el HTML para la comparación de jugadores.
 */
function mostrarComparacion() {
    // Capitalizamos la primera letra de la estadística para mostrarla
    const estadisticaCapitalizada = estadisticaActual.charAt(0).toUpperCase() + estadisticaActual.slice(1);

    juegoContainer.innerHTML = `
        <div class="game-overlay">
            <div class="jugadores-comparacion">
                <div class="jugador">
                    <img src="${jugadorActual.imagenUrl || 'img/placeholder.jpg'}" alt="${jugadorActual.nombre}">
                    <h2>${jugadorActual.nombre}</h2>
                    <p>${estadisticaCapitalizada}: ${jugadorActual.estadisticas[estadisticaActual]}</p>
                </div>

                <div class="opciones">
                    <p class="puntaje">Puntaje: ${puntaje}</p>
                    <button onclick="jugar('higher')" class="btn-mayor">Higher</button>
                    <button onclick="jugar('lower')" class="btn-menor">Lower</button>
                </div>

                <div class="jugador">
                    <img src="${jugadorSiguiente.imagenUrl || 'img/placeholder.jpg'}" alt="${jugadorSiguiente.nombre}">
                    <h2>${jugadorSiguiente.nombre}</h2>
                    <p class="goles-ocultos">${estadisticaCapitalizada}: ?</p>
                </div>
            </div>
            <button onclick="volverAlMenu()" class="btn-volver">Volver al menú</button>
        </div>
    `;
}

/**
 * Procesa la elección del usuario (Higher o Lower).
 * @param {string} eleccion - La elección del usuario: 'higher' o 'lower'.
 */
function jugar(eleccion) {
    const valorActual = jugadorActual.estadisticas[estadisticaActual];
    const valorSiguiente = jugadorSiguiente.estadisticas[estadisticaActual];

    let esCorrecto = false;
    if (eleccion === 'higher') {
        esCorrecto = valorSiguiente >= valorActual;
    } else { // 'lower'
        esCorrecto = valorSiguiente < valorActual;
    }

    // Muestra la estadística oculta del segundo jugador
    const estadisticaCapitalizada = estadisticaActual.charAt(0).toUpperCase() + estadisticaActual.slice(1);
    document.querySelector('.goles-ocultos').textContent = `${estadisticaCapitalizada}: ${valorSiguiente}`;

    // Deshabilita los botones para evitar clics múltiples
    document.querySelectorAll('.opciones button').forEach(btn => btn.disabled = true);

    if (esCorrecto) {
        puntaje++;
        showMessage("¡Correcto! 🎉", true);
    } else {
        showMessage(`¡Incorrecto! ❌ Tenía ${valorSiguiente}`, false);
    }

    // Actualiza el puntaje en la pantalla
    document.querySelector('.puntaje').textContent = `Puntaje: ${puntaje}`;

    // Después de un momento, carga la siguiente ronda o termina el juego
    setTimeout(iniciarJuegoClasico, 2000); // Espera 2 segundos antes de la siguiente ronda
}

/**
 * Vuelve al menú principal y resetea el puntaje.
 */
function volverAlMenu() {
    menuContainer.style.display = 'flex';
    juegoContainer.style.display = 'none';
    puntaje = 0; // Resetea el puntaje al salir
}