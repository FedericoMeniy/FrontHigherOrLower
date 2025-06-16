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
    // Asegúrate de que la variable 'menuContainer' esté disponible globalmente
    if (typeof menuContainer !== 'undefined') {
        menuContainer.style.display = 'none';
    } else {
        console.error("La variable 'menuContainer' no está definida. Asegúrate de declararla en un script que se cargue antes que juego.js");
        // Intenta obtenerla de todas formas para no bloquear el juego
        document.getElementById('menu-container').style.display = 'none';
    }
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
        // Hacemos la llamada al nuevo endpoint del backend
        const response = await fetch('http://localhost:8080/api/juego/ronda');
        if (!response.ok) {
            // Si el backend devuelve un error (ej: 404, 503), lanzamos una excepción
            const errorData = await response.text(); // Intenta leer el cuerpo del error
            throw new Error(`Error del servidor: ${response.status}. ${errorData}`);
        }

        rondaActual = await response.json(); // Guardamos los datos de la ronda

        // Mostramos la pantalla de comparación con los nuevos datos
        mostrarPantallaDeJuego();

    } catch (error) {
        console.error("Error al cargar la nueva ronda:", error);
        showMessage("Error al conectar con el servidor para iniciar la ronda. ¿Está el backend funcionando?", false);
        volverAlMenu(); // Si hay un error, volvemos al menú
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

    // Usamos la función auxiliar para hacer la pregunta más legible
    const textoPregunta = formatearPregunta(rondaActual.pregunta);

    // Los datos ahora vienen directamente del objeto 'rondaActual'
    const futbolista1 = rondaActual.futbolista1;
    const futbolista2 = rondaActual.futbolista2; // <-- ¡CORREGIDO! Antes decía rondaondaActual.
    const valorF1 = rondaActual.valorFutbolista1;

    juegoContainer.innerHTML = `
        <div class="game-overlay">
            <div class="jugadores-comparacion">
                <!-- Jugador 1 (Izquierda) -->
                <div class="jugador">
                    <img src="${futbolista1.imagenURL || 'img/placeholder.jpg'}" alt="${futbolista1.nombre}" onerror="this.onerror=null;this.src='https://placehold.co/150x150/2c3e50/ffffff?text=Jugador';">
                    <h2>${futbolista1.nombre}</h2>
                    <p class="estadistica-pregunta">${textoPregunta}</p>
                    <p class="estadistica-valor">${valorF1}</p>
                </div>

                <!-- Opciones y Puntaje (Centro) -->
                <div class="opciones">
                    <p class="puntaje">Puntaje: ${puntaje}</p>
                    <button onclick="jugar('higher')" class="btn-mayor">Higher</button>
                    <button onclick="jugar('lower')" class="btn-menor">Lower</button>
                    <p class="pregunta-texto">¿${futbolista2.nombre} tiene más o menos?</p>
                </div>

                <!-- Jugador 2 (Derecha) -->
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
 * Procesa la elección del usuario (Higher o Lower).
 * La lógica de comparación ahora se hace en el frontend.
 * @param {string} eleccion - La elección del usuario: 'higher' o 'lower'.
 */
function jugar(eleccion) {
    if (!rondaActual) return; // No hacer nada si los datos de la ronda no están cargados

    const valorF1 = rondaActual.valorFutbolista1;
    const valorF2 = rondaActual.valorFutbolista2;

    let esCorrecto = false;
    if (eleccion === 'higher') {
        esCorrecto = valorF2 >= valorF1; // Se considera correcto si es igual o mayor
    } else { // 'lower'
        esCorrecto = valorF2 < valorF1;
    }

    // Muestra el valor oculto del segundo jugador
    const valorOcultoEl = document.querySelector('.valor-oculto');
    if (valorOcultoEl) {
        valorOcultoEl.classList.remove('valor-oculto');
        valorOcultoEl.textContent = valorF2;
    }


    // Deshabilita los botones para evitar clics múltiples
    document.querySelectorAll('.opciones button').forEach(btn => btn.disabled = true);

    // Muestra el mensaje de correcto o incorrecto
    if (esCorrecto) {
        puntaje++;
        showMessage("¡Correcto! 🎉", true);
    } else {
        showMessage(`¡Incorrecto! ❌ La respuesta era ${valorF2}`, false);
    }

    // Actualiza el puntaje en la pantalla
    document.querySelector('.puntaje').textContent = `Puntaje: ${puntaje}`;

    // Después de un momento, carga la siguiente ronda
    setTimeout(cargarNuevaRonda, 2500); // Espera 2.5 segundos antes de la siguiente ronda
}

/**
 * Vuelve al menú principal.
 */
function volverAlMenu() {
    if (typeof menuContainer !== 'undefined') {
        menuContainer.style.display = 'flex';
    } else {
        document.getElementById('menu-container').style.display = 'flex';
    }
    juegoContainer.style.display = 'none';
}

/**
 * Función auxiliar para convertir el enum de la pregunta del backend
 * en un texto legible para el usuario.
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
            // Reemplaza guiones bajos por espacios y capitaliza
            return preguntaEnum.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
}
