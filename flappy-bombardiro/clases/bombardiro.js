/**
 * CLASE 1: Crocodile (El Jugador)
 * Se encarga de la física, posición y visualización del héroe.
 */
export class Crocodile {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        if (!this.element) {
            console.warn(`Crocodile: elemento con id "${elementId}" no encontrado. Espera al DOM.`);
            // Crear un elemento placeholder para evitar errores (fallback mínimo)
            this.element = document.createElement('div');
            this.element.id = elementId;
            this.element.style.position = 'absolute';
            this.element.style.left = '100px';
            this.element.style.width = '90px';
            this.element.style.height = '65px';
            document.body.appendChild(this.element);
        }

        this.y = 250;
        this.velocity = 0;
        this.gravity = 0.5;
        this.jumpImpulse = -8;

        // Intentar leer dimensiones; si están a 0, usar dimensiones por defecto y recalcular más tarde
        this.width = this.element.clientWidth || 90;
        this.height = this.element.clientHeight || 65;

        // Recalcular dimensiones cuando la imagen cargue (por si usas <img> o background)
        window.requestAnimationFrame(() => {
            this.width = this.element.clientWidth || this.width;
            this.height = this.element.clientHeight || this.height;
        });
    }

    jump() {
        this.velocity = this.jumpImpulse;
        this.element.classList.add('flapping');
        setTimeout(() => this.element.classList.remove('flapping'), 300);
    }

    update() {
        this.velocity += this.gravity;

        if (this.y <= 0 && this.velocity < 0) {
            this.velocity = 0; 
        }

        this.y += this.velocity;

        // Evitar techo (Clamping final: asegura que y nunca sea negativo)
        if (this.y < 0) {
            this.y = 0;
        }
    
        this.render();
    }

    render() {
        this.element.style.top = `${this.y}px`;
    }

    getRect() {
        return this.element.getBoundingClientRect();
    }

    crashAnimation() {
        this.element.classList.add('crashed');
    }

    reset() {
        this.y = 250;
        this.velocity = 0;
        this.element.classList.remove('crashed');
        this.render();
    }
}