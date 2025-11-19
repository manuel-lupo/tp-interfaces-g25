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
        const containerHeight = 600;
        const gap = 170; 
        const minHeight = 80;
        
        const topHeight = Math.floor(Math.random() * (containerHeight - gap - minHeight * 2)) + minHeight;
        const bottomHeight = containerHeight - gap - topHeight;

        // Edificio Arriba
        this.addEntity('obstacle top', topHeight, null, containerHeight - topHeight);
        
        // Edificio Abajo
        this.addEntity('obstacle bottom', bottomHeight, 0, null);

        // 50% probabilidad de Bonus (Pizza)
        if (Math.random() > 0.5) {
            const bonusY = topHeight + (gap / 2) - 20; 
            this.addEntity('bonus', 40, null, null, bonusY);
        }
    }

    addEntity(className, height, bottom, topOffset, specificTop = null) {
        const el = document.createElement('div');
        el.className = className;
        el.style.left = '800px';
        
        if (specificTop !== null) {
            el.style.top = `${specificTop}px`;
        } else {
            el.style.height = `${height}px`;
            if (bottom !== null) el.style.bottom = `${bottom}px`;
            if (topOffset !== null) el.style.bottom = `${topOffset}px`;
        }

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