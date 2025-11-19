/**
 * CLASE 3: Game (El Controlador Principal)
 * Orquesta todo el juego.
 */
import { Crocodile } from './bombardiro.js';
import { ObstacleManager } from './obstacleManager.js';

export class Game {
    constructor() {
        this.score = 0;
        this.isRunning = false;
        this.gameSpeed = 3; 
        this.loopId = null; // Para guardar la referencia del setInterval
        
        // Instanciar objetos
        this.hero = new Crocodile('hero');
        this.obstacleManager = new ObstacleManager('obstacles-container', this.gameSpeed);
        
        // Elementos UI
        this.scoreEl = document.getElementById('score-display');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreEl = document.getElementById('final-score');
        this.gameContainer = document.getElementById('game-container');

        // Inputs
        this.bindEvents();
    }

    bindEvents() {
        // Usamos la función flecha para que 'this' se refiera a la clase Game
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.handleInput();
        });
        document.addEventListener('mousedown', () => this.handleInput());
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
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
        
        // Pausar animaciones CSS (se asume que defines esto en tu CSS si usas parallax)
        document.querySelectorAll('.parallax-layer').forEach(el => {
             el.style.animationPlayState = 'paused';
        });
        
        this.hero.crashAnimation();
        this.finalScoreEl.textContent = this.score;
        this.gameOverScreen.classList.remove('hidden');
    }

    restart() {
        this.score = 0;
        this.addScore(0);
        this.isRunning = true;
        this.gameOverScreen.classList.add('hidden');
        
        this.hero.reset();
        this.obstacleManager.reset();
        
        // Reanudar animaciones CSS
        document.querySelectorAll('.parallax-layer').forEach(el => {
             el.style.animationPlayState = 'running';
        });

        // Iniciar Loop
        this.loopId = setInterval(() => this.loop(), 1000 / 60);
    }

    loop() {
        if (!this.isRunning) return;

        // 1. Actualizar Héroe
        this.hero.update();

        // 2. Actualizar Obstáculos (Pasamos callback para sumar puntos)
        this.obstacleManager.update((points) => this.addScore(points));

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
}