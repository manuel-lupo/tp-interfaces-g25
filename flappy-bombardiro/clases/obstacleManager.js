/**
 * CLASE 2: ObstacleManager (Gestor de Edificios)
 * Se encarga de crear, mover y limpiar los rascacielos y pizzas.
 */
export class ObstacleManager {
    constructor(containerId, speed) {
        this.container = document.getElementById(containerId);
        this.speed = speed;
        this.obstacles = [];
        this.timer = 0;
        this.spawnRate = 120; // Frames entre obstáculos
    }

    update(scoreCallback) {
        this.timer++;
        if (this.timer >= this.spawnRate) {
            this.createObstacle();
            this.timer = 0;
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const item = this.obstacles[i];
            
            let currentLeft = parseFloat(item.element.style.left);
            currentLeft -= this.speed;
            item.element.style.left = `${currentLeft}px`;

            // Lógica de puntuación
            if (!item.passed && item.type === 'obstacle' && currentLeft < 50) {
                item.passed = true;
                if (item.element.classList.contains('bottom')) {
                    scoreCallback(1); 
                }
            }

            // Eliminar si sale de pantalla
            if (currentLeft < -100) {
                item.element.remove();
                this.obstacles.splice(i, 1);
            }
        }
    }

    createObstacle() {
        const containerHeight = this.container ? this.container.clientHeight || 600 : 600;
        const obstacleGap = 170; 
        const minBuildingHeight = 100;
        const ZEPPELIN_FIXED_HEIGHT = 70;
        const ZEPPELIN_OFFSET = 20; // Espacio en blanco que quieres quitar debajo

        // Rango de dónde puede empezar el hueco desde la parte inferior
        const maxGapStartFromBottom = Math.max(0, containerHeight - ZEPPELIN_FIXED_HEIGHT - obstacleGap - minBuildingHeight);
        
        // Posición aleatoria para el INICIO DEL HUECO (desde el borde inferior)
        const randomGapStartFromBottom = Math.floor(Math.random() * Math.max(1, maxGapStartFromBottom)) + minBuildingHeight;

        // --- Edificio Inferior ---
        const bottomBuildingHeight = randomGapStartFromBottom;
        // Creamos un DIV para el edificio inferior
        this.addEntity('obstacle bottom', bottomBuildingHeight, 0); 

        // --- Zepelín Superior ---
        // La posición del zepelín (su base) es la altura del edificio + el hueco
        const zeppelinBasePosition = bottomBuildingHeight + obstacleGap;
        const zeppelinHitboxPosition = zeppelinBasePosition + ZEPPELIN_OFFSET;
        // Creamos un DIV para el zepelín superior, con su altura FIJA
        this.addEntity('obstacle top', ZEPPELIN_FIXED_HEIGHT, zeppelinHitboxPosition);

        const BONUS_HEIGHT = 50; // Usar el tamaño de 50px que tienes en el CSS
    
        if (Math.random() > 0.5) { // 50% de probabilidad de que aparezca
        // 1. Calculamos el centro vertical del hueco:
        //    (Altura del edificio) + (Mitad del tamaño del hueco)
            const gapCenterY = bottomBuildingHeight + (obstacleGap / 2);
        
        // 2. Calculamos la posición 'bottom' para centrar el misil de 50px
            const bonusBottomPosition = Math.max(0, Math.min(containerHeight - BONUS_HEIGHT, gapCenterY - (BONUS_HEIGHT / 2)));
        
        // Creamos la entidad Bonus
            this.addEntity('bonus', BONUS_HEIGHT, bonusBottomPosition);
        }
    }

    addEntity(className, height, bottomPosition) {
        if (!this.container) {
            console.warn('ObstacleManager: contenedor no existe');
            return;
        }

        // Asegurar posicionamiento relativo para que bottom funcione
        const computed = window.getComputedStyle(this.container);
        if (computed.position === 'static') {
            this.container.style.position = 'relative';
        }

        const el = document.createElement('div');
        el.className = className;
        el.style.left = '800px';
        el.style.height = `${height}px`;
        el.style.bottom = `${bottomPosition}px`;

        this.container.appendChild(el);
        
        this.obstacles.push({
            element: el,
            type: className.includes('bonus') ? 'bonus' : 'obstacle',
            passed: false
        });
    }

    checkCollisions(heroRect, gameOverCallback, scoreCallback) {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const item = this.obstacles[i];
            const itemRect = item.element.getBoundingClientRect();

            if (this.isColliding(heroRect, itemRect)) {
                if (item.type === 'obstacle') {
                    gameOverCallback();
                    return; 
                } else if (item.type === 'bonus') {
                    scoreCallback(5);
                    item.element.remove();
                    this.obstacles.splice(i, 1);
                }
            }
        }
    }

    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                 rect1.left > rect2.right || 
                 rect1.bottom < rect2.top || 
                 rect1.top > rect2.bottom);
    }

    reset() {
        this.obstacles.forEach(obj => obj.element.remove());
        this.obstacles = [];
        this.timer = 0;
    }
}