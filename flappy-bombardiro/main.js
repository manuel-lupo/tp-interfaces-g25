import { Game } from './clases/game.js';

// --- Inicialización ---
const bombardiroGame = new Game();
document.getElementById("btn-play").addEventListener('click', ()=>{
    console.log("Iniciando juego Bombardiro");
    bombardiroGame.init();
})
