/**
 * CLASE 1: Crocodile (El Jugador)
 * Se encarga de la física, posición y visualización del héroe.
 */
export class Crocodile {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.y = 250;
        this.velocity = 0;
        this.gravity = 0.5;
        this.jumpImpulse = -8;
        this.width = this.element.clientWidth;
        this.height = this.element.clientHeight;
    }

    jump() {
        this.velocity = this.jumpImpulse;
        this.element.classList.add('flapping');
        setTimeout(() => this.element.classList.remove('flapping'), 300);
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Evitar techo
        if (this.y < 0) this.y = 0;
        
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






// class Bombardiro {
//     /**
//      * 
//      * @param {HTMLElement} element Elemento del DOM que representa a bombardiro
//      */
//     constructor(element) {
//         this.DOMElement = element
//     }
// }