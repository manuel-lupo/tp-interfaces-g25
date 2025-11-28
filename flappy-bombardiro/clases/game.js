
import { Crocodile } from './bombardiro.js';
import { ObstacleManager } from './obstacleManager.js';
import { AnimatedElement } from '../spritesheet.js';

export class Game {
    constructor() {
        this.score = 0;
        this.isRunning = false;
        this.gameSpeed = 3;
        this.loopId = null; // Para guardar la referencia del setInterval
        this.winPoints = 2;
        this.animatedElements = []; // Nuevo array para gestionar los elementos

        this.gameContainer = document.getElementById('game-container');

        // Elementos UI
        this.scoreEl = document.getElementById('score-display');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.gameWinScreen = document.getElementById('game-win-screen');
        this.finalScoreLoose = document.getElementById('final-defeat-score');
        this.finalScoreWin = document.getElementById('final-win-score');

        document.getElementById('restartGame-btn').addEventListener('click', () => this.restart());

        const containerWidth = this.gameContainer ? this.gameContainer.clientWidth : 800;
        // Instanciar objetos
        this.hero = new Crocodile('hero');
        this.obstacleManager = new ObstacleManager('obstacles-container', this.gameSpeed, containerWidth);

        // Inputs
        this.bindEvents();
    }

    destroy() {
        this.isRunning = false;
        if (this.loopId) clearInterval(this.loopId);
        // Eliminar eventos si fuera necesario, o limpiar memoria
    }

    bindEvents() {
        const restartLose = document.getElementById("restart-btn");
        const restartWin = document.getElementById("restartGame-btn");
        const modalLose = document.getElementById("game-over-screen");
        const modalWin = document.getElementById("game-win-screen");

        // Listener del salto (solo cuando NO hay modales)
        document.addEventListener("keydown", (e) => {
            e.preventDefault();
            if (e.code === "Space") {
                const isLoseVisible = modalLose && !modalLose.classList.contains("hidden");
                const isWinVisible = modalWin && !modalWin.classList.contains("hidden");

                // Si hay modal → usar SPACE para reiniciar
                if (isLoseVisible) {
                    e.preventDefault();
                    restartLose?.click();
                    return;
                }

                if (isWinVisible) {
                    e.preventDefault();
                    restartWin?.click();
                    return;
                }

                // Si NO hay modal visible → SPACE impulsa el cocodrilo
                this.handleInput();
            }
        });

        // Clicks normales de los botones (por si se usa mouse)
        restartLose?.addEventListener("click", () => this.restart());
        restartWin?.addEventListener("click", () => this.restart());
    }


    handleInput() {
        if (!this.isRunning) return;
        this.hero.jump();
    }

    addScore(points) {
        this.score += points;
        this.scoreEl.textContent = `Puntaje: ${this.score}`;
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.loopId);

        // Pausar animaciones CSS
        document.querySelectorAll('.parallax-layer').forEach(el => {
            el.style.animationPlayState = 'paused';
        });

        this.hero.crashAnimation();
        this.finalScoreLoose.textContent = this.score;
        this.gameOverScreen.classList.remove('hidden');
    }

    checkWinCondition() {
        if (this.score >= this.winPoints) {
            this.isRunning = false;
            clearInterval(this.loopId);

            document.querySelectorAll('.parallax-layer').forEach(el => {
                el.style.animationPlayState = 'paused';
            });

            this.finalScoreWin.textContent = this.score;
            this.gameWinScreen.classList.remove('hidden');
        }
    }
    restart() {
        this.score = 0;
        if (this.scoreEl) this.scoreEl.textContent = `Puntaje: ${this.score}`;

        this.isRunning = true;
        this.gameOverScreen.classList.add('hidden');
        this.gameWinScreen.classList.add('hidden');

        this.hero.reset();
        this.obstacleManager.reset();

        this.animatedElements.forEach(element => {
            if (element.remove) element.remove(); 
        });
        this.animatedElements = [];
        if (this.gameContainer) {
            this.createAnimatedBirds();
        } else {
            console.warn('Game.restart: #game-container no encontrado.');
        }

        // Reanudar animaciones CSS
        document.querySelectorAll('.parallax-layer').forEach(el => {
            el.style.animationPlayState = 'running';
        });

        // Evitar múltiples intervalos
        if (this.loopId) clearInterval(this.loopId);
        this.loopId = setInterval(() => this.loop(), 1000 / 60);
    }


    loop() {
        if (!this.isRunning) return;

        this.animatedElements.forEach(element => element.update());

        // 1. Actualizar Héroe
        this.hero.update();

        // 2. Actualizar Obstáculos (Pasamos callback para sumar puntos)
        this.obstacleManager.update((points) => this.addScore(points));

        this.checkWinCondition();

        // 3. Chequear Colisiones (Héroe vs Suelo)
        const containerHeight = this.gameContainer.clientHeight;
        if (this.hero.y > (containerHeight - this.hero.height)) {
            this.gameOver();
        }

        // 4. Chequear Colisiones (Héroe vs Obstáculos/Bonus)
        this.obstacleManager.checkCollisions(
            this.hero.getRect(),
            () => this.gameOver(),
            (points) => this.addScore(points)
        );
    }

    init() {
        this.restart();
    }

    createAnimatedBirds() {
    const gameContainerWidth = this.gameContainer.clientWidth;
    const gameContainerHeight = this.gameContainer.clientHeight;
    
    const birdSpriteUrl = '../imagenes/flappy/spritesheet.png'; 
    const frameWidth = 60; 
    const frameHeight = 45; 
    const frameCount = 4;
    const animationDuration = 0.4;

        for (let i = 0; i < 3; i++) { // Crea 3 pájaros de ejemplo
            const randomX = Math.random() * gameContainerWidth;
            const randomY = Math.random() * (gameContainerHeight - frameHeight - 150) + 50;

            const bird = new AnimatedElement(
                this.gameContainer,
                randomX,
                randomY,
                frameWidth,
                frameHeight,
                birdSpriteUrl,
                frameCount,
                animationDuration
            );
            this.animatedElements.push(bird);
        }
    }

    createAnimatedBirds() {
        if(!this.gameContainer) return;

        const gameContainerWidth = this.gameContainer.clientWidth;
        const gameContainerHeight = this.gameContainer.clientHeight;
        
        // RUTA CORREGIDA (Como discutimos antes)
        const birdSpriteUrl = '../imagenes/flappy/spritesheet.png'; 
        
        for (let i = 0; i < 3; i++) { 
            const randomX = Math.random() * gameContainerWidth;
            const randomY = Math.random() * (gameContainerHeight - 200) + 50;
        
            const bird = new AnimatedElement(
                this.gameContainer, 
                randomX, 
                randomY, 
                60, 45, birdSpriteUrl, 4, 0.4
            );
            this.animatedElements.push(bird);
        }
    }
}