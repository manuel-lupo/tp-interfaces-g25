
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById("playButton");
    const gameContainer = document.querySelector(".game-container");

    startBtn.addEventListener('click', () => {

        gameContainer.innerHTML = " ";

        gameContainer.innerHTML = `
        <canvas id="gameCanvas" width="512" height="512"></canvas>
        <div>
            <span id="timer">Tiempo: 300</span>
            <button id="restart-btn" class= "restarBtn">Reiniciar Juego</button>
        </div>
    `;

        gameInit();
    });
});


function gameInit() {
    // Busca el canvas y el contexto (el "pincel")
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Busca los otros elementos del HTML
    const timerElement = document.getElementById('timer');
    const restartButton = document.getElementById('restart-btn');

    // Objeto para guardar las imágenes cargadas
    let images = {};
    let imagesLoaded = 0;
    const TOTAL_IMAGES = 4; // Cambia esto al número de imágenes que tengas

    // Carga la imagen del tablero
    images.board = new Image();
    images.board.src = '../peg/images/board.png';
    images.board.onload = onImageLoad;

    // Carga la imagen de la ficha
    images.peg = new Image();
    images.peg.src = '../peg/images/ficha1.png';
    images.peg.onload = onImageLoad;

    // Carga la ficha tipo 2
    images.pegType2 = new Image();
    images.pegType2.src = '../peg/images/ficha2.png';
    images.pegType2.onload = onImageLoad;

    // Carga la imagen de la pista
    images.hint = new Image();
    images.hint.src = '../peg/images/pista.png';
    images.hint.onload = onImageLoad;

    function onImageLoad() {
        imagesLoaded++;
        if (imagesLoaded === TOTAL_IMAGES) {
            // ¡Todas las imágenes están listas!
            console.log("Imágenes cargadas. Iniciando juego...");
            startGame();
        }
    }

    // --- 3. Lógica del Juego (Estado) ---

    // Define el tamaño del tablero (ej. 7x7)
    const ROWS = 7;
    const COLS = 7;
    const CELL_WIDTH = canvas.width / COLS;     // Ancho de cada celda
    const CELL_HEIGHT = canvas.height / ROWS;   // Alto de cada celda

    // Matriz lógica del tablero
    // -1: Fuera del tablero, 0: Vacío, 1: Ficha
    let boardLogic = [
        [-1, -1, 1, 1, 1, -1, -1],
        [-1, -1, 1, 1, 1, -1, -1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 1, 1, 1], // El '0' es el centro vacío
        [1, 1, 1, 1, 1, 1, 1],
        [-1, -1, 1, 1, 1, -1, -1],
        [-1, -1, 1, 1, 1, -1, -1]
    ];

    // Variables para el drag and drop
    let isDragging = false;
    let draggedPeg = null;     // { row, col, x, y }
    let validMoves = [];       // Array de {row, col}


    // --- Variables para el Timer ---
    let remainingTime = 200;
    let gameTimerInterval = null; // Para guardar el ID del setInterval
    let isGameOver = false; // Para bloquear el juego si se acaba el tiempo

    const originalBoardLogic = JSON.parse(JSON.stringify(boardLogic));

    // --- 4. Funciones Principales ---

    /**
     * Se llama una vez que las imágenes están cargadas.
     * Configura los eventos y comienza el game loop.
     */
    function startGame() {
        // Configura los listeners del mouse
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);

        // Configura el botón de reinicio
        restartButton.addEventListener('click', restartGame);
        startTimer();
        // Inicia el Game Loop
        gameLoop();
    }

    /**
        Se llama 60 veces por segundo.
        Borra y redibuja todo en el canvas.
     */
    function gameLoop() {
        // 1. Limpiar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2. Dibujar el fondo (la imagen del tablero)
        ctx.drawImage(images.board, 0, 0, canvas.width, canvas.height);

        // 3. Dibujar las fichas (basado en la matriz)
        drawPegs();

        // 4. Dibujar las pistas animadas (si estamos arrastrando)
        drawHints();

        // 5. Dibujar la ficha que está siendo arrastrada
        drawDraggedPeg();

        // 6. Volver a llamar al loop
        requestAnimationFrame(gameLoop);
    }

    function startTimer() {
        // 1. Limpia cualquier timer anterior (importante para reiniciar)
        clearInterval(gameTimerInterval);

        // 2. Resetea los valores
        remainingTime = 200;
        isGameOver = false;
        timerElement.textContent = `Tiempo: ${remainingTime}`;

        // 3. Inicia el intervalo de 1 segundo
        gameTimerInterval = setInterval(updateTimer, 1000);
    }

    /**
     * Función que se llama cada segundo para actualizar el reloj.
     */
    function updateTimer() {
        remainingTime--; // Resta un segundo
        timerElement.textContent = `Tiempo: ${remainingTime}`;

        // Comprueba si se acabó el tiempo
        if (remainingTime <= 0) {
            clearInterval(gameTimerInterval); // Detiene el timer
            isGameOver = true;
            alert("¡Se acabó el tiempo! Juego terminado.");
            // Aquí puedes añadir lógica de "Juego Terminado"
        }
    }

    // --- 5. Funciones de Dibujado ---

    function drawPegs() {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {

                if (boardLogic[row][col] === 1) {
                    const pegScale = 0.8;
                    const pegSize = CELL_WIDTH * pegScale;

                    const x = col * CELL_WIDTH + (CELL_WIDTH - pegSize) / 2;
                    const y = row * CELL_HEIGHT + (CELL_HEIGHT - pegSize) / 2;

                    ctx.drawImage(images.peg, x, y, pegSize, pegSize);
                }
            }
        }
    }

    /**
 * Revisa todos los movimientos válidos para una ficha en una celda específica.
 * Un movimiento es válido si salta por encima de OTRA ficha hacia un ESPACIO VACÍO.
 */
    function findValidMoves(row, col) {
        let moves = [];

        // Lista de las 4 direcciones (Arriba, Abajo, Izquierda, Derecha)
        // [deltaRow, deltaCol]
        const directions = [
            [-2, 0], // Arriba
            [2, 0], // Abajo
            [0, -2], // Izquierda
            [0, 2]  // Derecha
        ];

        for (const dir of directions) {
            const targetRow = row + dir[0];
            const targetCol = col + dir[1];

            // 1. Revisa si la CELDA OBJETIVO está dentro del tablero
            if (targetRow >= 0 && targetRow < ROWS && targetCol >= 0 && targetCol < COLS) {

                // 2. Revisa si la CELDA OBJETIVO está VACÍA (es 0)
                if (boardLogic[targetRow][targetCol] === 0) {

                    // 3. Revisa si la celda de EN MEDIO (la que saltamos) tiene una FICHA (es 1)
                    const jumpedRow = row + dir[0] / 2;
                    const jumpedCol = col + dir[1] / 2;

                    if (boardLogic[jumpedRow][jumpedCol] === 1) {
                        // ¡Es un movimiento válido!
                        moves.push({ row: targetRow, col: targetCol });
                    }
                }
            }
        }
        return moves; // Devuelve la lista de movimientos
    }

    function drawHints() {
        // Solo se ejecuta si estamos arrastrando y hay movimientos válidos
        if (!isDragging || validMoves.length === 0) return;

        // --- Lógica de Animación ---
        // Math.sin() nos da un valor que oscila entre -1 y 1
        // Lo convertimos para que oscile entre 0.3 (casi invisible) y 1 (visible)
        const pulse = Math.sin(Date.now() / 200); // / 200 controla la velocidad
        const opacity = (pulse + 1) / 2 * 0.7 + 0.3; // Rango: 0.3 a 1.0

        ctx.globalAlpha = opacity; // ¡Aplica la opacidad!

        for (const move of validMoves) {
            // Usa la misma lógica de centrado que en drawPegs
            const pegSize = CELL_WIDTH * 0.8; // Usa el mismo valor
            const offsetX = (CELL_WIDTH - pegSize) / 2;
            const offsetY = (CELL_HEIGHT - pegSize) / 2;

            const x = move.col * CELL_WIDTH + offsetX;
            const y = move.row * CELL_HEIGHT + offsetY;

            // Dibuja la imagen de la pista
            ctx.drawImage(images.hint, x, y, pegSize, pegSize);
        }

        ctx.globalAlpha = 1.0; // Restaura la opacidad al 100%
    }

    function drawDraggedPeg() {
        // Si no estamos arrastrando (draggedPeg es null), no dibuja nada
        if (!isDragging) return;

        // 1. Calcula el tamaño de la ficha (igual que en drawPegs)
        const pegSize = CELL_WIDTH * 0.8; // Usa el mismo valor (ej. 0.8)

        // 2. Dibuja la ficha centrada en el cursor del mouse
        const x = draggedPeg.x - pegSize / 2; // Centrado en X
        const y = draggedPeg.y - pegSize / 2; // Centrado en Y

        // 3. Dibuja la imagen (usa la que quieras)
        ctx.drawImage(images.peg, x, y, pegSize, pegSize);
    }

    // --- 6. Funciones de Lógica y Eventos ---

    function getMousePos(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    function onMouseDown(event) {
        if (isGameOver) return;
        // 1. Obtiene las coordenadas del clic
        const pos = getMousePos(event);
        // 2. Convierte píxeles a celda (fila, columna)
        const col = Math.floor(pos.x / CELL_WIDTH);
        const row = Math.floor(pos.y / CELL_HEIGHT);

        // 3. Revisa si hay una ficha en esa celda
        if (boardLogic[row][col] === 1) {
            isDragging = true;
            draggedPeg = { row: row, col: col, x: pos.x, y: pos.y }
            boardLogic[row][col] = 0;

            // Guarda la ficha que estamos arrastrando
            draggedPeg = {
                row: row,
                col: col,
                x: pos.x, // Posición inicial del mouse
                y: pos.y  // Posición inicial del mouse
            };

            validMoves = findValidMoves(row, col);
        }
    }

    function onMouseMove(event) {
        // Si no estamos arrastrando, no hace nada
        if (!isDragging) return;

        // 1. Obtiene las coordenadas del mouse
        const pos = getMousePos(event);

        // 2. Actualiza la posición de la ficha que arrastramos
        draggedPeg.x = pos.x;
        draggedPeg.y = pos.y;
    }

    function onMouseUp(event) {
        // Si no estábamos arrastrando, no hace nada
        if (!isDragging) return;
        isDragging = false;

        // 1. Obtiene la celda donde se soltó el mouse
        const pos = getMousePos(event);
        const dropCol = Math.floor(pos.x / CELL_WIDTH);
        const dropRow = Math.floor(pos.y / CELL_HEIGHT);

        // 2. Revisa si la celda donde soltamos (dropRow, dropCol) está en nuestra lista de 'validMoves'.
        // Usamos .find() para buscar en el array
        const isValid = validMoves.find(move => move.row === dropRow && move.col === dropCol);

        if (isValid) {
            // 1. Coloca la ficha en el nuevo lugar
            boardLogic[dropRow][dropCol] = 1;

            // 2. "Come" la ficha del medio
            const jumpedRow = (draggedPeg.row + dropRow) / 2;
            const jumpedCol = (draggedPeg.col + dropCol) / 2;
            boardLogic[jumpedRow][jumpedCol] = 0;

            console.log("¡Movimiento válido!");

            // 3. Revisa si el juego terminó (Req 5)
            checkGameOver();

        } else {
            // Devuelve la ficha a su celda original
            boardLogic[draggedPeg.row][draggedPeg.col] = 1;
        }
        // 4. Limpia las variables de estado
        draggedPeg = null;
        validMoves = [];
    }

    function checkGameOver() {
        let totalPossibleMoves = 0;

        // Recorre todo el tablero
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                // Si hay una ficha en esta celda...
                if (boardLogic[r][c] === 1) {
                    // ...busca sus movimientos
                    const moves = findValidMoves(r, c);
                    totalPossibleMoves += moves.length;
                }
            }
        }
        console.log("Movimientos totales restantes:", totalPossibleMoves);


        if (totalPossibleMoves === 0) {
            // ¡No hay más movimientos!
            alert("¡Juego terminado! No quedan más movimientos.");
            clearInterval(gameTimerInterval);
            isGameOver = true;
        }
    }

    function restartGame() {

        console.log("Reiniciando juego...");

        // 1. Restaura el tablero al original (usando la copia)
        boardLogic = JSON.parse(JSON.stringify(originalBoardLogic));

        // 2. Limpia cualquier estado de "arrastre"
        isDragging = false;
        draggedPeg = null;
        validMoves = [];

        // 3. Reinicia el timer
        startTimer();
    }

}


