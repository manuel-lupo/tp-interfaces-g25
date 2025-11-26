export class AnimatedElement {
    constructor(container, x, y, width, height, spriteSheetUrl, frameCount, animationDuration) {
        this.container = (typeof container === 'string') ? document.getElementById(container) : container;
        this.element = document.createElement('div');
        this.element.className = 'animated-element';
        this.element.style.position = 'absolute';
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height}px`;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`; // Asumiendo bottom para posición vertical
        this.element.style.backgroundImage = `url(${spriteSheetUrl})`;
        this.element.style.backgroundSize = `${width * frameCount}px 100%`; // Ancho total del spritesheet
        this.element.style.zIndex = '3'; // Por encima del fondo, por debajo del jugador/obstáculos

        // Añade la animación del spritesheet
        this.element.style.animation = `
        animated-sprite ${animationDuration}s steps(${frameCount}) infinite
        `;
        
        this.container.appendChild(this.element);

        this.x = x;
        this.width = width;
        this.speed = 2; 
    }

    update() {
        this.x += this.speed;
        this.element.style.left = `${this.x}px`;

       // Si sale por la derecha, vuelve a entrar por la izquierda
        if (this.x > this.container.clientWidth) {
            this.x = -this.width;
            this.element.style.left = `${this.x}px`;
        }
    }

    remove() {
        this.element.remove();
    }
}