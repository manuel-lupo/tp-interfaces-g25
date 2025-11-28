
import { Game } from './clases/game.js';

// --- IMPORTANTE: Variable para guardar el juego que está corriendo ---
let juegoActual = null; 
// -------------------------------------------------------------------

// 1. Seleccionamos los elementos clave
const btnPlay = document.getElementById('btn-play');
const gameContainer = document.getElementById('game-container');

// 2. Plantilla HTML (Tu código estaba bien aquí)
function getGameTemplate() {
    return `
        <div class="parallax-layer layer-1"></div>
        <div class="parallax-layer layer-2"></div>
        <div class="parallax-layer layer-3"></div>
        <div class="parallax-layer layer-4"></div>
        
        <div id="hero"></div>
        <div id="obstacles-container"></div>
        <div id="score-display">Puntaje: 0</div>

        <div id="game-over-screen" class="go-modal hidden">
            <h2>¡TE ESTRELLASTE EN EL BRONX!</h2>
            <p>Puntaje final: <span id="final-defeat-score"></span></p>
            <button id="restart-btn">Reintentar Misión</button>
            <img src="../imagenes/flappy/Jay-zcara.png" class="jayz" alt="jayz">
            <img src="../imagenes/flappy/spidermancara.png" class="spidey" alt="spiderman">
        </div>

        <div id="game-win-screen" class="go-modal hidden">
            <h2>¡MISION CUMPLIDA!</h2>
            <p>Puntaje final: <span id="final-win-score"></span></p>
            <button id="restartGame-btn">Jugar de nuevo</button>
            <img src="../imagenes/flappy/Jay-zcara.png" class="jayz" alt="jayz">
            <img src="../imagenes/flappy/spidermancara.png" class="spidey" alt="spiderman">
        </div>
    `;
}

// 3. Listener del botón
if (btnPlay) {
    btnPlay.addEventListener('click', () => {
        iniciarJuego();
    });
}

function iniciarJuego() {
    // --- PASO CRÍTICO: MATAR EL JUEGO ANTERIOR ---
    if (juegoActual) {
        // Si agregaste el método destroy() en game.js, esto detiene el bucle anterior
        if (typeof juegoActual.destroy === 'function') {
            juegoActual.destroy();
        } else {
            // Fallback por si no has actualizado game.js todavía:
            juegoActual.isRunning = false;
            if(juegoActual.loopId) clearInterval(juegoActual.loopId);
        }
        juegoActual = null;
    }
    // ---------------------------------------------

    // A. Limpiamos
    gameContainer.innerHTML = '';
    
    // B. Inyectamos
    gameContainer.innerHTML = getGameTemplate();

    // C. Ajustes de estilo para evitar que se rompa el layout
    gameContainer.style.position = 'relative'; 
    gameContainer.style.overflow = 'hidden'; // Asegura que no se desborde nada
    gameContainer.classList.add('active-game');

    // Scroll suave hacia el juego
    gameContainer.scrollIntoView({ behavior: 'smooth' });

    // D. Instanciamos y guardamos en la variable GLOBAL
    juegoActual = new Game();
    juegoActual.init();
}