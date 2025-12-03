/**
 * CLASE 3: Game (El Controlador Principal)
 * Orquesta todo el juego.
 */
import { Crocodile } from './bombardiro.js';
import { ObstacleManager } from './obstacleManager.js';
import { AnimatedElement } from '../spritesheet.js'; 

export class Game {
    constructor() {
        this.score = 0;
        this.isRunning = false;
        this.gameSpeed = 3;
        this.loopId = null; // Para guardar la referencia del setInterval
        this.winPoints = 43;
        this.animatedElements = []; // Nuevo array para gestionar los elementos
        // Instanciar objetos
        this.hero = new Crocodile('hero');
        this.obstacleManager = new ObstacleManager('obstacles-container', this.gameSpeed);

        // Elementos UI
        this.scoreEl = document.getElementById('score-display');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.gameWinScreen = document.getElementById('game-win-screen');
        this.finalScoreLoose = document.getElementById('final-defeat-score');
        this.finalScoreWin = document.getElementById('final-win-score');
        this.gameContainer = document.getElementById('game-container');
        document.getElementById('restartGame-btn').addEventListener('click', () => this.restart());

        // Inputs
        this.bindEvents();
    }

    bindEvents() {
        const restartLose = document.getElementById("restart-btn");
        const restartWin  = document.getElementById("restartGame-btn");
        // Listener del salto (solo cuando NO hay modales)
        document.addEventListener("keydown", (e) => {
            if (e.code === "Space") {
                e.preventDefault()
                // Si NO hay modal visible → SPACE impulsa el cocodrilo
                this.handleInput();
            }
        });

        this.gameContainer.addEventListener('click', (e)=> {
            if (this.isRunning){
                this.handleInput()
            }
        })

        // Clicks normales de los botones (por si se usa mouse)
        restartLose?.addEventListener("click", () => this.restart());
        restartWin?.addEventListener("click", () => this.restart());
    }


    handleInput() {
        this.hero.jump();
    }

    addScore(points) {
        this.score += points;
        this.scoreEl.textContent = `Puntaje: ${this.score}`;
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.loopId);

        // Pausar animaciones CSS (se asume que defines esto en tu CSS si usas parallax)
        document.querySelectorAll('.parallax-layer').forEach(el => {
            el.style.animationPlayState = 'paused';
        });

        this.hero.crashAnimation();
        this.finalScoreLoose.textContent = this.score;
        this.gameOverScreen.classList.remove('hidden');
    }

    restart() {
        this.score = 0;
        if (this.scoreEl) this.scoreEl.textContent = `Puntaje: ${this.score}`;

        this.isRunning = true;
        this.gameOverScreen.classList.add('hidden');
        this.gameWinScreen.classList.add('hidden');

        this.hero.reset();
        this.obstacleManager.reset();

        this.animatedElements.forEach(element => element.remove());
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

    checkWinCondition() {

        if (this.score >= this.winPoints) {
            clearInterval(this.loopId);

            document.querySelectorAll('.parallax-layer').forEach(el => {
                el.style.animationPlayState = 'paused';
            });

            this.finalScoreWin.textContent = this.score;
            this.gameWinScreen.classList.remove('hidden');
        }else{
            return;
        }

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
        this.isRunning = true;
        this.restart();
    }


    createAnimatedBirds() {
    const gameContainerWidth = this.gameContainer.clientWidth;
    const gameContainerHeight = this.gameContainer.clientHeight;
    
    const birdSpriteUrl = '../../imagenes/flappy/spritesheet.png'; 
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
}