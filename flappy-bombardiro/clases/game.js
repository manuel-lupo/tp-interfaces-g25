import { Crocodile } from './bombardiro.js';
import { ObstacleManager } from './obstacleManager.js';
import { AnimatedElement } from '../spritesheet.js'; 

export class Game {
    constructor() {
        this.score = 0;
        this.isRunning = false;
        this.gameSpeed = 3;
        this.loopId = null;
        this.winPoints = 10;
        this.animatedElements = [];

        // 1. Obtener contenedor
        this.gameContainer = document.getElementById('game-container');
        
        // Elementos UI
        this.scoreEl = document.getElementById('score-display');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.gameWinScreen = document.getElementById('game-win-screen');
        this.finalScoreLoose = document.getElementById('final-defeat-score');
        this.finalScoreWin = document.getElementById('final-win-score');
        
        // 2. CALCULAR ANCHO REAL (Para que los obstáculos no nazcan en 0)
        // Si el contenedor no cargó aún, usamos 800 como respaldo
        const containerWidth = this.gameContainer ? this.gameContainer.clientWidth : 800;
        
        // Instancias
        this.hero = new Crocodile('hero');
        // Pasamos el ancho al manager
        this.obstacleManager = new ObstacleManager('obstacles-container', this.gameSpeed, containerWidth);

        this.bindEvents();
    }

    destroy() {
        this.isRunning = false;
        if (this.loopId) clearInterval(this.loopId);
    }

    bindEvents() {
        const restartLose = document.getElementById("restart-btn");
        const restartWin  = document.getElementById("restartGame-btn");

        document.addEventListener("keydown", (e) => {
            if (e.code === "Space") {
                e.preventDefault(); // EVITA EL SCROLL DE LA PÁGINA
                
                if (this.gameOverScreen && !this.gameOverScreen.classList.contains("hidden")) {
                    this.restart();
                    return;
                }
                if (this.gameWinScreen && !this.gameWinScreen.classList.contains("hidden")) {
                    this.restart();
                    return;
                }
                if (this.isRunning) this.hero.jump();
            }
        });

        if(restartLose) restartLose.addEventListener("click", () => this.restart());
        if(restartWin) restartWin.addEventListener("click", () => this.restart());
    }

    addScore(points) {
        this.score += points;
        if(this.scoreEl) this.scoreEl.textContent = `Puntaje: ${this.score}`;
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.loopId);
        document.querySelectorAll('.parallax-layer').forEach(el => el.style.animationPlayState = 'paused');
        this.hero.crashAnimation();
        if(this.finalScoreLoose) this.finalScoreLoose.textContent = this.score;
        if(this.gameOverScreen) this.gameOverScreen.classList.remove('hidden');
    }

    restart() {
        this.score = 0;
        if (this.scoreEl) this.scoreEl.textContent = `Puntaje: ${this.score}`;
        this.isRunning = true;
        
        if(this.gameOverScreen) this.gameOverScreen.classList.add('hidden');
        if(this.gameWinScreen) this.gameWinScreen.classList.add('hidden');

        this.hero.reset();
        this.obstacleManager.reset();

        // Limpiar pájaros viejos
        this.animatedElements.forEach(el => { if(el.remove) el.remove(); });
        this.animatedElements = [];
        
        if (this.gameContainer) this.createAnimatedBirds();

        // Reiniciar CSS Parallax
        document.querySelectorAll('.parallax-layer').forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight; 
            el.style.animation = ''; 
            el.style.animationPlayState = 'running';
        });

        if (this.loopId) clearInterval(this.loopId);
        this.loopId = setInterval(() => this.loop(), 1000 / 60);
    }

    loop() {
        if (!this.isRunning) return;

        this.animatedElements.forEach(el => el.update());
        this.hero.update();
        this.obstacleManager.update((p) => this.addScore(p));
        
        // Check Victoria
        if (this.score >= this.winPoints) {
            this.isRunning = false;
            clearInterval(this.loopId);
            document.querySelectorAll('.parallax-layer').forEach(el => el.style.animationPlayState = 'paused');
            if(this.finalScoreWin) this.finalScoreWin.textContent = this.score;
            if(this.gameWinScreen) this.gameWinScreen.classList.remove('hidden');
        }

        // Check Suelo (Evita que vuele infinitamente)
        if (this.gameContainer && this.hero.y > (this.gameContainer.clientHeight - this.hero.height)) {
            this.gameOver();
        }

        // Check Colisiones
        this.obstacleManager.checkCollisions(
            this.hero.getRect(),
            () => this.gameOver(),
            (p) => this.addScore(p)
        );
    }

    init() {
        this.restart();
    }

    createAnimatedBirds() {
        if(!this.gameContainer) return;
        
        // --- AQUÍ ESTÁ EL ARREGLO DE LOS SPRITES ---
        // Usamos ../ para salir de la carpeta js y buscar imagenes
        const birdSpriteUrl = '../imagenes/flappy/spritesheet.png'; 
        
        const w = this.gameContainer.clientWidth;
        const h = this.gameContainer.clientHeight;

        for (let i = 0; i < 3; i++) { 
            const rx = Math.random() * w;
            const ry = Math.random() * (h - 200) + 50;
            const bird = new AnimatedElement(this.gameContainer, rx, ry, 60, 45, birdSpriteUrl, 4, 0.4);
            this.animatedElements.push(bird);
        }
    }
}