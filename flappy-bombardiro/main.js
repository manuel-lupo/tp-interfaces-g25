import { Game } from "./clases/game.js";

export function initGame() {
    const hero = document.getElementById("hero");
    const obs = document.getElementById("obstacles-container");

    if (!hero || !obs) {
        console.error("❌ DOM del juego NO cargado todavía");
        return null;
    }

    const game = new Game();
    game.init();

    console.log("✅ Juego iniciado correctamente");
    return game;
}
