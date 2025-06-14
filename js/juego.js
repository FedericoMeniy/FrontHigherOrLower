// juego.js
let jugadorActual = null;
let jugadorSiguiente = null;
let puntaje = 0;

// Elementos del DOM
const juegoContainer = document.getElementById('juego-container');

// Iniciar juego
async function iniciarJuegoClasico() {
    try {
        menuContainer.style.display = 'none';
        juegoContainer.style.display = 'block';

        const response1 = await fetch('http://localhost:8080/api/juego/iniciar');
        const response2 = await fetch(`http://localhost:8080/api/juego/iniciar?random=${Math.random()}`);

        jugadorActual = await response1.json();
        jugadorSiguiente = await response2.json();

        mostrarComparacion();
    } catch (error) {
        showMessage("Error al conectar con el servidor", false);
        volverAlMenu();
    }
}

function mostrarComparacion() {
    juegoContainer.innerHTML = `
        <div class="game-overlay">
            <div class="jugadores-comparacion">
                <div class="jugador">
                    <img src="${jugadorActual.imagenUrl || 'placeholder.jpg'}" alt="${jugadorActual.nombre}">
                    <h2>${jugadorActual.nombre}</h2>
                    <p>Goles: ${jugadorActual.goles}</p>
                </div>
                <div class="opciones">
                    <button onclick="jugar(true)" class="btn-mayor">Mayor o igual</button>
                    <p class="puntaje">Puntaje: ${puntaje}</p>
                    <button onclick="jugar(false)" class="btn-menor">Menor</button>
                </div>
                <div class="jugador">
                    <img src="${jugadorSiguiente.imagenUrl || 'placeholder.jpg'}" alt="${jugadorSiguiente.nombre}">
                    <h2>${jugadorSiguiente.nombre}</h2>
                    <p class="goles-ocultos">Goles: ?</p>
                </div>
            </div>
            <button onclick="volverAlMenu()" class="btn-volver">Volver al menú</button>
        </div>
    `;
}

function jugar(elegirMayor) {
    const esCorrecto = elegirMayor
        ? jugadorActual.goles <= jugadorSiguiente.goles
        : jugadorActual.goles > jugadorSiguiente.goles;

    document.querySelector('.goles-ocultos').textContent = `Goles: ${jugadorSiguiente.goles}`;

    if (esCorrecto) {
        puntaje++;
        alert("¡Correcto! 🎉");
    } else {
        alert(`¡Incorrecto! ❌\nEl jugador tenía ${jugadorSiguiente.goles} goles.`);
    }

    document.querySelector('.puntaje').textContent = `Puntaje: ${puntaje}`;
    setTimeout(iniciarJuegoClasico, 1500);
}

function volverAlMenu() {
    menuContainer.style.display = 'flex';
    juegoContainer.style.display = 'none';
    puntaje = 0;
}
