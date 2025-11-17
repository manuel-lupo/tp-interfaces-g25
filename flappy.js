// --- Elementos del DOM ---
const bird = document.getElementById('bird');
const gameContainer = document.getElementById('game-container');
const obstaclesContainer = document.getElementById('obstacles-container');
const scoreDisplay = document.getElementById('score-display');
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');

// --- Configuración del Juego ---
let birdY = 250;
let birdVelocity = 0;
const gravity = 0.5;
const jumpImpulse = -9;
let gameSpeed = 5; // Velocidad con la que se mueven los obstáculos
let score = 0;
let gameLoopInterval;
let obstacleInterval;
let isGameOver = false;

// --- Bucle Principal del Juego ---
function gameLoop() {
    if (isGameOver) return;

    // 1. Mover el Pájaro (Req 1)
    birdVelocity += gravity;
    birdY += birdVelocity;
    
    // Evitar que se salga por arriba
    if (birdY < 0) birdY = 0;
    
    bird.style.top = birdY + 'px';

    // 2. Mover Obstáculos y Bonus
    moveElements();

    // 3. Detectar Colisiones (Req 5)
    checkCollisions();

    // 4. Detectar colisión con el suelo
    if (birdY > (gameContainer.clientHeight - bird.clientHeight)) {
        endGame();
    }
}

// --- Control del Jugador (Req 1) ---
function jump() {
    if (isGameOver) return;
    
    birdVelocity = jumpImpulse;
    
    // Activar animación de aleteo (Req 2)
    bird.classList.add('flapping');
    // Quitar la clase después de la animación
    setTimeout(() => {
        bird.classList.remove('flapping');
    }, 300);
}
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        jump();
    }
});
document.addEventListener('mousedown', jump); // Para clicks

// --- Generación de Obstáculos y Bonus (Req 5) ---
function createObstacle() {
    if (isGameOver) return;

    const obstacleGap = 180; // Espacio entre tuberías
    const minHeight = 100;
    const maxHeight = 400;
    
    // Altura aleatoria para el hueco
    const gapTop = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    const topPipeHeight = gapTop;
    const bottomPipeHeight = gameContainer.clientHeight - gapTop - obstacleGap;

    // Tubería de arriba
    const topPipe = document.createElement('div');
    topPipe.className = 'obstacle top';
    topPipe.style.height = topPipeHeight + 'px';
    topPipe.style.bottom = (gameContainer.clientHeight - topPipeHeight) + 'px';
    topPipe.style.left = '800px'; // Empezar fuera de pantalla
    obstaclesContainer.appendChild(topPipe);

    // Tubería de abajo
    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'obstacle bottom';
    bottomPipe.style.height = bottomPipeHeight + 'px';
    bottomPipe.style.bottom = '0px';
    bottomPipe.style.left = '800px';
    obstaclesContainer.appendChild(bottomPipe);

    // Crear un bonus (Req 5)
    if (Math.random() > 0.5) { // 50% de probabilidad
        createBonus(gapTop + obstacleGap / 2);
    }
}

function createBonus(yPosition) {
    const bonus = document.createElement('div');
    bonus.className = 'bonus';
    bonus.style.top = (yPosition - 15) + 'px'; // Centrado en el hueco
    bonus.style.left = '850px'; // Un poco después de la tubería
    obstaclesContainer.appendChild(bonus);
}

// --- Movimiento y Colisiones ---
function moveElements() {
    // Mover todos los obstáculos y bonus
    const allElements = document.querySelectorAll('.obstacle, .bonus');
    allElements.forEach(el => {
        let elLeft = parseFloat(el.style.left);
        elLeft -= gameSpeed;
        el.style.left = elLeft + 'px';

        // Eliminar si se sale de pantalla
        if (elLeft < -100) {
            el.remove();
        }

        // Incrementar puntaje (Req 6)
        if (el.classList.contains('obstacle') && 
            !el.passed && 
            elLeft < (bird.offsetLeft - bird.clientWidth)) {
            
            el.passed = true;
            // Solo contamos las tuberías de abajo para no duplicar
            if (el.classList.contains('bottom')) {
                updateScore(score + 1);
            }
        }
    });
}

function checkCollisions() {
    const birdRect = bird.getBoundingClientRect();

    // Colisión con Obstáculos (Req 5)
    document.querySelectorAll('.obstacle').forEach(obstacle => {
        const obsRect = obstacle.getBoundingClientRect();
        if (isColliding(birdRect, obsRect)) {
            endGame();
        }
    });

    // Colisión con Bonus (Req 5)
    document.querySelectorAll('.bonus').forEach(bonus => {
        const bonusRect = bonus.getBoundingClientRect();
        if (isColliding(birdRect, bonusRect)) {
            bonus.remove();
            updateScore(score + 5); // Bonus de 5 puntos
            // Podríamos añadir una animación de "moneda" aquí
        }
    });
}

// Función helper de colisión
function isColliding(rect1, rect2) {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

// --- Lógica de Puntuación y Fin de Juego (Req 6) ---
function updateScore(newScore) {
    score = newScore;
    scoreDisplay.textContent = 'Puntaje: ' + score;
}

function endGame() {
    isGameOver = true;
    clearInterval(gameLoopInterval);
    clearInterval(obstacleInterval);
    
    // Detener todas las animaciones CSS (parallax, sprites)
    document.querySelectorAll('.parallax-layer, #other-bird-sprite').forEach(el => {
        el.style.animationPlayState = 'paused';
    });
    
    // Animación de colisión (Req 5)
    bird.classList.add('crashed');

    // Mostrar pantalla de Game Over
    gameOverScreen.classList.remove('hidden');
}

function startGame() {
    // Resetear todo
    isGameOver = false;
    birdY = 250;
    birdVelocity = 0;
    score = 0;
    updateScore(0);
    obstaclesContainer.innerHTML = ''; // Limpiar tuberías
    
    bird.style.top = birdY + 'px';
    bird.classList.remove('crashed'); // Quitar animación de choque
    gameOverScreen.classList.add('hidden');
    
    // Reiniciar animaciones CSS
    document.querySelectorAll('.parallax-layer, #other-bird-sprite').forEach(el => {
        el.style.animationPlayState = 'running';
    });

    // Iniciar bucles
    gameLoopInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
    obstacleInterval = setInterval(createObstacle, 2000); // Nueva tubería cada 2 seg
}

// --- Iniciar Juego ---
restartBtn.addEventListener('click', startGame);
startGame(); // Iniciar el juego la primera vez