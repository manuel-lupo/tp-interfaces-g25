/**
 * CLASE 2: ObstacleManager (Gestor de Obstáculos)
 * Colisiones precisas con hitboxes ajustables
 */
export class ObstacleManager {
    constructor(containerId, speed) {
        this.container = document.getElementById(containerId);
        this.speed = speed || 3;
        this.obstacles = [];
        this.timer = 0;
        this.spawnRate = 120;

        if (!this.container) {
            throw new Error('ObstacleManager: contenedor no encontrado');
        }

        const computed = window.getComputedStyle(this.container);
        if (computed.position === 'static') {
            this.container.style.position = 'relative';
        }

        // Ajuste fino de colisiones (px)
        this.HITBOX_PADDING = 8;   // achica los hitbox visuales
    }

    update(scoreCallback) {
        this.timer++;
        if (this.timer >= this.spawnRate) {
            this.createObstacle();
            this.timer = 0;
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const item = this.obstacles[i];
            const fallbackLeft = this.container.clientWidth || 800;

            let currentLeft = parseFloat(item.element.style.left || fallbackLeft);
            currentLeft -= this.speed;
            item.element.style.left = `${currentLeft}px`;

            if (!item.passed && item.type === 'obstacle' && currentLeft + item.element.offsetWidth < 0) {
                item.passed = true;
                scoreCallback && scoreCallback(1);
            }

            if (currentLeft < -(item.element.offsetWidth + 100)) {
                item.element.remove();
                this.obstacles.splice(i, 1);
            }
        }
    }

    createObstacle() {
        const containerHeight = this.container.clientHeight;
        const obstacleGap = 170;
        const minBuildingHeight = 100;
        const ZEPPELIN_FIXED_HEIGHT = 70;
        const BONUS_HEIGHT = 50;
        const MIN_ZEPPELIN_CLEARANCE = 80;

        const maxGapTop = Math.max(
            0,
            containerHeight - obstacleGap - ZEPPELIN_FIXED_HEIGHT - minBuildingHeight
        );

        const gapTop = Math.floor(Math.random() * (maxGapTop + 1)) + minBuildingHeight;

        let zeppelinTop = gapTop - ZEPPELIN_FIXED_HEIGHT - MIN_ZEPPELIN_CLEARANCE;
        zeppelinTop = Math.max(0, zeppelinTop);

        this.addEntityTopBased('obstacle top', ZEPPELIN_FIXED_HEIGHT, zeppelinTop);

        const bottomHeight = containerHeight - (gapTop + obstacleGap);
        const bottomTop = gapTop + obstacleGap;

        this.addEntityTopBased('obstacle bottom', bottomHeight, bottomTop);

        if (Math.random() > 0.5) {
            const gapCenterY = gapTop + obstacleGap / 2;
            const bonusTop = Math.max(
                0,
                Math.min(containerHeight - BONUS_HEIGHT, gapCenterY - BONUS_HEIGHT / 2)
            );

            this.addEntityTopBased('bonus', BONUS_HEIGHT, bonusTop);
        }
    }

    addEntityTopBased(className, heightPx, topPx) {
        const el = document.createElement('div');
        el.className = className;
        el.style.position = 'absolute';
        el.style.height = `${heightPx}px`;
        el.style.left = `${this.container.clientWidth || 800}px`;
        el.style.top = `${topPx}px`;

        this.container.appendChild(el);

        this.obstacles.push({
            element: el,
            type: className.includes('bonus') ? 'bonus' : 'obstacle',
            passed: false
        });
    }

    /**
     * ✅ COLISIONES PRECISAS RELATIVAS AL CONTENEDOR
     */
    checkCollisions(heroRect, gameOverCallback, scoreCallback) {
        if (!heroRect) return;

        const containerRect = this.container.getBoundingClientRect();
        const heroHitbox = this.normalizeRect(heroRect, containerRect);

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const item = this.obstacles[i];
            const rawRect = item.element.getBoundingClientRect();
            const obstacleHitbox = this.normalizeRect(rawRect, containerRect);

            if (this.isColliding(heroHitbox, obstacleHitbox)) {
                if (item.type === 'obstacle') {
                    gameOverCallback && gameOverCallback();
                    return;
                } else if (item.type === 'bonus') {
                    scoreCallback && scoreCallback(5);
                    item.element.remove();
                    this.obstacles.splice(i, 1);
                }
            }
        }
    }

    /**
     * ✅ Convierte viewport → coordenadas del contenedor
     * ✅ Aplica padding de precisión
     */
    normalizeRect(rect, containerRect) {
        return {
            left:   rect.left   - containerRect.left + this.HITBOX_PADDING,
            right:  rect.right  - containerRect.left - this.HITBOX_PADDING,
            top:    rect.top    - containerRect.top  + this.HITBOX_PADDING,
            bottom: rect.bottom - containerRect.top  - this.HITBOX_PADDING
        };
    }

    isColliding(a, b) {
        return !(
            a.right  < b.left  ||
            a.left   > b.right ||
            a.bottom < b.top   ||
            a.top    > b.bottom
        );
    }

    reset() {
        this.obstacles.forEach(obj => obj.element.remove());
        this.obstacles = [];
        this.timer = 0;
    }
}
