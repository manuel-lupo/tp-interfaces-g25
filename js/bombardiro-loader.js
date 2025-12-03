const playBtn = document.getElementById("btn-play");
const gameContainer = document.getElementById("game-container");

let gameInstance = null;

const fetchGame = async () => {
    const res = await fetch("../flappy-bombardiro/index.html");
    return await res.text();
};

playBtn.addEventListener("click", async () => {
    const html = await fetchGame();
    gameContainer.innerHTML = html;

    // Esperar a que el DOM recién insertado exista físicamente
    requestAnimationFrame(() => {
        if (gameInstance) {
            gameInstance = null;
        }

        // Import dinámico del juego UNA SOLA VEZ
        import("../flappy-bombardiro/main.js").then(module => {
            gameInstance = module.initGame();
            window.gameInstance = gameInstance; // solo para debug
        });
    });
});
