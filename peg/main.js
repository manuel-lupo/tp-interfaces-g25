// --- 1. VARIABLES GLOBALES DEL JUEGO ---

let chosenPegImage = null; // La imagen que el jugador eligió
let images = {};           // Objeto para guardar todas las imágenes
let canvas = null;         // El canvas (se asignará después)
let ctx = null;            // El "pincel" (se asignará después)
let timerElement = null;
let restartButton = null;

// Constantes y estado del tablero
const ROWS = 7;
const COLS = 7;
let CELL_WIDTH = 0;
let CELL_HEIGHT = 0;
let boardLogic = [];
let originalBoardLogic = []; // Copia para el reinicio

// Estado del juego
let isDragging = false;
let draggedPeg = null;
let validMoves = [];
let remainingTime = 200;
let gameTimerInterval = null;
let isGameOver = false;

// --- 2. INICIO (CARGA DE PÁGINA) ---
document.addEventListener('DOMContentLoaded', () => {
    // Se ejecuta una vez que todo el DOM de la página ha cargado.
    const startBtn = document.getElementById("playButton");
    const gameContainer = document.querySelector(".game-container");

    // Deshabilita el botón "Play" mientras cargan las imágenes
    startBtn.disabled = true;
    startBtn.textContent = "Cargando imágenes...";

    // --- CARGA DE IMÁGENES ---
    let imagesLoaded = 0;
    const TOTAL_IMAGES = 4;

    images.board = new Image();
    images.board.src = '../peg/images/board.png';
    images.board.onload = onImageLoad;

    images.fichaX = new Image(); // Ficha X
    images.fichaX.src = '../peg/images/fichaX.png';
    images.fichaX.onload = onImageLoad;

    images.fichaT = new Image(); // Ficha T
    images.fichaT.src = '../peg/images/fichaT.png'; 
    images.fichaT.onload = onImageLoad;

    images.hint = new Image();
    images.hint.src = '../peg/images/pista.png';
    images.hint.onload = onImageLoad;

    // Se llama cuando carga CADA imagen. Incrementa el contador y, al llegar al total, habilita el botón de "Jugar" // 
    function onImageLoad() {
        imagesLoaded++;
        if (imagesLoaded === TOTAL_IMAGES) {
            startBtn.disabled = false; 
            startBtn.textContent = "Jugar"; 
        }
    }
    // --- FIN CARGA DE IMÁGENES ---

    // Listener del botón "Play" principal
    startBtn.addEventListener('click', () => {
        // Al hacer clic en "Jugar", elimina el contenido actual y muestra la pantalla de selección de ficha.
        gameContainer.innerHTML = " ";
        gameContainer.innerHTML = `
            <div id="selection-screen">
                <h2>Elige tu ficha:</h2>
                <button id="play-T">Jugar con Trump</button>
                <button id="play-X">Jugar con Xi</button>
            </div>
        `;
        gameContainer.scrollIntoView({ behavior: 'auto', block: 'center' });

        // Asigna los listeners para iniciar el juego con la ficha seleccionada.
        document.getElementById('play-T').onclick = () => {
            loadGameAndStart(images.fichaT);
        };
        document.getElementById('play-X').onclick = () => {
            loadGameAndStart(images.fichaX);
        };
    });
});

// --- 3. CREACIÓN DEL CANVAS ---
// La función loadGameAndStart reemplaza el contenido del contenedor principal para mostrar el canvas del juego
// y los controles. Llama a initializeGame() para configurar la lógica del juego.
function loadGameAndStart (chosenPeg) {
    const gameContainer = document.querySelector(".game-container");
    gameContainer.innerHTML = " ";
    gameContainer.innerHTML = `
        <div class="game-controls-top">
            <button id="back-btn">
                <span>Volver</span>
            </button>
            <button id="help-btn">
                <span>Ayuda</span>
            </button>
        </div>

        <canvas id="gameCanvas" width="512" height="512"></canvas>
        
        <div class="game-controls-bottom">
            <span id="timer">Tiempo: 200</span>
            <button id="restart-btn">Reiniciar Juego</button>
        </div>
    `;
    initializeGame(chosenPeg); // Inicia la lógica del juego con la ficha elegida.

    // Listener del botón para volver a la pantalla de inicio (recarga la página).
    document.getElementById('back-btn').addEventListener('click', () => {
        window.location.reload(); 
    });
    // Listener para mostrar el modal de ayuda.
    document.getElementById('help-btn').addEventListener('click', () => {
        document.getElementById('helpModal').classList.add('show');
    });
}

// --- 4. INICIALIZACIÓN DEL JUEGO ---
// La función initializeGame configura todas las variables de estado, obtiene referencias del DOM, 
// establece las dimensiones de las celdas, inicializa la lógica del tablero, configura los listeners de eventos 
// y comienza el ciclo del juego y el temporizador. 

function initializeGame(selectedPeg) {
    // Guarda la elección del jugador
    chosenPegImage = selectedPeg;

    // Busca los elementos del DOM que ACABAN DE CREARSE
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    timerElement = document.getElementById('timer');
    restartButton = document.getElementById('restart-btn');

    // Busca el botón del modal y hace que llame a restartGame
    const modalRestartButton = document.getElementById('modalRestartBtn');
    modalRestartButton.addEventListener('click', restartGame);

    // Listener para cerrar el modal de ayuda
    document.getElementById('closeHelpBtn').addEventListener('click', () => {
        document.getElementById('helpModal').classList.remove('show');
    });

    // Configura las variables del tablero
    CELL_WIDTH = canvas.width / COLS;
    CELL_HEIGHT = canvas.height / ROWS;
    boardLogic = [
        [-1, -1, 1, 1, 1, -1, -1],
        [-1, -1, 1, 1, 1, -1, -1],
        [ 1,  1, 1, 1, 1,  1,  1],
        [ 1,  1, 1, 0, 1,  1,  1],
        [ 1,  1, 1, 1, 1,  1,  1],
        [-1, -1, 1, 1, 1, -1, -1],
        [-1, -1, 1, 1, 1, -1, -1]
    ];
    // Crea una copia profunda de la lógica inicial para poder reiniciar el juego en cualquier momento.
    originalBoardLogic = JSON.parse(JSON.stringify(boardLogic));

    // Resetea el estado del juego
    isDragging = false;
    draggedPeg = null;
    validMoves = [];
    isGameOver = false;

    // Configura los listeners del mouse en el canvas para la interacción arrastrar/soltar.
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    // Listener del botón de reinicio.
    restartButton.addEventListener('click', restartGame);

    // Inicia el juego
    startTimer(); // Comienza el temporizador
    gameLoop(); // Inicia el bucle de renderizado del canvas
}


// --- 5. FUNCIONES PRINCIPALES (TIMER Y GAME LOOP) ---
// La función gameLoop limpia el canvas, dibuja el tablero, dibuja las fichas y dibuja las fichas/pistas. 
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia todo el canvas.
    ctx.drawImage(images.board, 0, 0, canvas.width, canvas.height); // Dibuja la imagen de fondo del tablero
    drawPegs(); // Dibuja todas las fichas en sus posiciones lógicas
    if (!isGameOver) {
        drawHints(); // Dibuja los indicadores de movimiento válido 
        drawDraggedPeg(); // Dibuja la ficha que se está arrastrando
    }
    // Se llama a sí misma en el siguiente frame de animación para crear el bucle continuo.
    requestAnimationFrame(gameLoop);
}

// Esta función inicia o reinicia el contador de tiempo del juego. Limpia cualquier intervalo anterior, 
// establece el tiempo inicial y comienza un nuevo 'setInterval'. 
function startTimer() {
    clearInterval(gameTimerInterval); // Detiene el temporizador anterior.
    remainingTime = 200; // Reinicia el tiempo.
    isGameOver = false;
    timerElement.textContent = `Tiempo: ${remainingTime}`;
    // Crea un nuevo intervalo que llama a `updateTimer` cada 1000ms (1 segundo).
    gameTimerInterval = setInterval(updateTimer, 1000);
}

// Se llama cada segundo. Decrementa el tiempo restante, actualiza el DOM, y
// comprueba si el tiempo ha llegado a cero, terminando el juego si es así.
function updateTimer() {
    remainingTime--; // Decrementa el tiempo.
    timerElement.textContent = `Tiempo: ${remainingTime}`; // Actualiza la visualización.
    if (remainingTime <= 0) {
        clearInterval(gameTimerInterval); // Detiene el temporizador.
        isGameOver = true; // Establece el estado de fin de juego.
    }
}


// --- 6. FUNCIONES DE DIBUJADO (¡CORREGIDAS!) ---
// Esta funcion itera sobre la matriz 'boardLogic' y dibuja la ficha elegida por el jugador
// en cada celda que contenga un 1
function drawPegs() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (boardLogic[row][col] === 1) {
                const pegScale = 0.9;
                const pegSize = CELL_WIDTH * pegScale;
                // Calcula la posición x e y para centrar la ficha en la celda.
                const x = col * CELL_WIDTH + (CELL_WIDTH - pegSize) / 2;
                const y = row * CELL_HEIGHT + (CELL_HEIGHT - pegSize) / 2;

                // Dibuja la imagen de la ficha elegida en esa posición.
                ctx.drawImage(chosenPegImage, x, y, pegSize, pegSize);
            }
        }
    }
}

// Dibuja la ficha que está siendo arrastrada, siguiendo la posición del mouse
function drawDraggedPeg() {
    if (!isDragging) return;
    const pegSize = CELL_WIDTH * 0.8;
    // Calcula la posición para centrar la ficha en las coordenadas del mouse
    const x = draggedPeg.x - pegSize / 2;
    const y = draggedPeg.y - pegSize / 2;

    // Dibuja la ficha elegida.
    ctx.drawImage(chosenPegImage, x, y, pegSize, pegSize);
}

// Dibuja los indicadores visuales (la pista) en todas las celdas que son movimientos válidos
// para la ficha que se está arrastrando. 
function drawHints() {
    if (!isDragging || validMoves.length === 0) return; // Solo si se arrastra y hay movimientos válidos.
    // Calcula un pulso para la opacidad para que las pistas brillen.
    const pulse = Math.sin(Date.now() / 200);
    const opacity = (pulse + 1) / 2 * 0.7 + 0.3;
    ctx.globalAlpha = opacity;

    for (const move of validMoves) { // Itera sobre la lista de movimientos válidos.
        const pegSize = CELL_WIDTH * 0.8;
        const offsetX = (CELL_WIDTH - pegSize) / 2;
        const offsetY = (CELL_HEIGHT - pegSize) / 2;
        // Calcula la posición y dibuja la imagen de pista.
        const x = move.col * CELL_WIDTH + offsetX;
        const y = move.row * CELL_HEIGHT + offsetY;
        ctx.drawImage(images.hint, x, y, pegSize, pegSize);
    }
    ctx.globalAlpha = 1.0; // Restaura la opacidad global.
}


// --- 7. LÓGICA Y EVENTOS (SIN CAMBIOS, SÓLO MOVIDOS) ---
// La función findValidMoves calcula y devuelve un array de posiciones {row, col} a las que una ficha
// en la posición dada puede moverse, siguiendo las reglas del juego.
// @param {number} row - Fila de la ficha a comprobar.
// @param {number} col - Columna de la ficha a comprobar.
// @returns {Array<Object>} Lista de movimientos válidos.

function findValidMoves(row, col) {
    let moves = [];
    // Define los 4 posibles saltos (2 celdas en cada dirección).
    const directions = [[-2, 0], [2, 0], [0, -2], [0, 2]];
    for (const dir of directions) {
        const targetRow = row + dir[0];
        const targetCol = col + dir[1];
        // Comprueba si la celda de destino está dentro del tablero.
        if (targetRow >= 0 && targetRow < ROWS && targetCol >= 0 && targetCol < COLS) {
            // Comprueba si la celda de destino está VACÍA (0).
            if (boardLogic[targetRow][targetCol] === 0) {
                const jumpedRow = row + dir[0] / 2; // Calcula la celda intermedia.
                const jumpedCol = col + dir[1] / 2;
                // Comprueba si la celda intermedia tiene una FICHA (1).
                if (boardLogic[jumpedRow][jumpedCol] === 1) {
                    moves.push({ row: targetRow, col: targetCol }); // Movimiento válido encontrado.
                }
            }
        }
    }
    return moves;
}

/**
 * La función getMousePos calcula la posición del mouse relativa a la esquina superior izquierda del canvas.
 * @param {Event} event - El evento del ratón.
 * @returns {{x: number, y: number}} Coordenadas x/y relativas al canvas.
 */
function getMousePos(event) {
    const rect = canvas.getBoundingClientRect(); // Obtiene la posición y tamaño del canvas en la pantalla.
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

/**
 * Se llama cuando el botón del mouse es presionado sobre el canvas.
 * Determina qué ficha se ha pulsado y comienza el arrastre si es válida.
 */
function onMouseDown(event) {
    if (isGameOver) return;
    const pos = getMousePos(event);
    const col = Math.floor(pos.x / CELL_WIDTH); // Convierte la coordenada X a columna.
    const row = Math.floor(pos.y / CELL_HEIGHT); // Convierte la coordenada Y a fila.

    if (boardLogic[row][col] === 1) {
        isDragging = true;
        // Almacena la info de la ficha arrastrada y la posición actual del mouse
        draggedPeg = { row: row, col: col, x: pos.x, y: pos.y };
        boardLogic[row][col] = 0; // Quita la ficha del tablero lógico para simular el arrastre
        validMoves = findValidMoves(row, col); // Calcula y almacena los movimientos posibles para esta ficha
    }
}

/**
 * Se llama cuando el ratón se mueve mientras el botón está presionado.
 * Actualiza la posición de la ficha arrastrada para que siga al ratón.
 */
function onMouseMove(event) {
    if (!isDragging) return;
    const pos = getMousePos(event);
    draggedPeg.x = pos.x; // Actualiza la posición X del arrastre.
    draggedPeg.y = pos.y; // Actualiza la posición Y del arrastre.
}

/**
 * Se llama cuando el botón del mouse es liberado.
 * Intenta realizar el movimiento; si es válido, lo ejecuta. Si no, devuelve la ficha a su posición original.
 */
function onMouseUp(event) {
    if (!isDragging) return;
    isDragging = false; // Detiene el arrastre.

    const pos = getMousePos(event);
    const dropCol = Math.floor(pos.x / CELL_WIDTH); // Columna donde se soltó la ficha.
    const dropRow = Math.floor(pos.y / CELL_HEIGHT); // Fila donde se soltó la ficha.

    // Comprueba si la posición de soltar es uno de los movimientos válidos calculados.
    const isValid = validMoves.find(move => move.row === dropRow && move.col === dropCol);

    if (isValid) {
        boardLogic[dropRow][dropCol] = 1; // Mueve la ficha a la posición de destino.
        const jumpedRow = (draggedPeg.row + dropRow) / 2;
        const jumpedCol = (draggedPeg.col + dropCol) / 2;
        boardLogic[jumpedRow][jumpedCol] = 0; // Elimina la ficha "saltada".
        checkGameOver(); // Comprueba si este movimiento ha terminado el juego
    } else {
        // Si el movimiento no es válido, devuelve la ficha a su posición inicial.
        boardLogic[draggedPeg.row][draggedPeg.col] = 1;
    }
    draggedPeg = null; // Limpia la ficha arrastrada.
    validMoves = []; // Limpia la lista de movimientos válidos.
}

/**
 * Itera sobre todo el tablero y comprueba si queda algún movimiento válido.
 * Si no queda ninguno, el juego termina y se muestra el modal de fin de juego.
 */
function checkGameOver() {
    let totalPossibleMoves = 0;
    // Itera sobre todas las fichas.
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (boardLogic[r][c] === 1) {
                // Suma el número de movimientos válidos para cada ficha.
                totalPossibleMoves += findValidMoves(r, c).length;
            }
        }
    }
    if (totalPossibleMoves === 0) { // Si el total es cero, el juego termina.
        document.getElementById('gameOverModal').classList.add('show');
        clearInterval(gameTimerInterval);
        isGameOver = true;
    }
}

/**
 * Restablece el tablero a su estado original, limpia variables de estado de arrastre,
 * y reinicia el contador de tiempo.
 */
function restartGame() {
    document.getElementById('gameOverModal').classList.remove('show'); // Oculta el modal de fin de juego.
    // Restaura la lógica del tablero a la copia original.
    boardLogic = JSON.parse(JSON.stringify(originalBoardLogic));
    isDragging = false;
    draggedPeg = null;
    validMoves = [];
    startTimer(); // Inicia el temporizador de nuevo.
}