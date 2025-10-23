// /js/blocka/main.js
import { splitImageWithFilters, calculateGrid, getCssFilterForPiece } from './level.js';
import { ui as TEMPLATE } from './ui.js';

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  const msRem = String(ms % 1000).padStart(3, '0');
  return `${mm}:${ss}.${msRem}`;
}

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

export class Blocka {
  constructor({ targetId, images = [], defaultPieces = 4, allowHelp = true }) {
    this.targetId = targetId;
    this.images = images.slice();
    this.piecesCount = defaultPieces;
    this.allowHelp = allowHelp;

    // estado runtime
    this.container = null;
    this.board = null;
    this.timerEl = null;
    this.recordEl = null;
    this.thumbsEl = null;

    this.currentLevel = null;
    this.timerInterval = null;
    this.startedAt = null;
    this.penaltyMs = 0;
    this.elapsedMs = 0;
    this.usedHelp = false;
    this.piecesState = [];

    // control de niveles 1..4
    this.nextLevelNumber = 1;
  }

  async init() {
    const target = document.getElementById(this.targetId);
    if (!target) throw new Error('Target no encontrado: ' + this.targetId);

    target.innerHTML = TEMPLATE();
    this.container = target.querySelector('.blocka-app');
    this.board = target.querySelector('#blocka-board');
    this.timerEl = target.querySelector('#blocka-timer');
    this.recordEl = target.querySelector('#blocka-record');
    this.thumbsEl = target.querySelector('#blocka-thumbs');

    this.levelSelect = this.container.querySelector('#blocka-select-level');
    const controlsRow = this.container.querySelector('.blocka-controls') || this.container;
    if (!this.levelSelect) {
      this.levelSelect = document.createElement('select');
      this.levelSelect.id = 'blocka-select-level';
      this.levelSelect.title = 'Seleccionar nivel';
      const opts = [
        { v: 1, t: 'Nivel 1' },
        { v: 2, t: 'Nivel 2' },
        { v: 3, t: 'Nivel 3' },
        { v: 4, t: 'Nivel 4' }
      ];
      opts.forEach(o => {
        const el = document.createElement('option');
        el.value = String(o.v);
        el.textContent = o.t;
        this.levelSelect.appendChild(el);
      });
      const piecesSel = this.container.querySelector('#blocka-select-pieces');
      if (piecesSel && piecesSel.parentNode) {
        piecesSel.parentNode.insertBefore(this.levelSelect, piecesSel.nextSibling);
      } else {
        controlsRow.appendChild(this.levelSelect);
      }
    }

    // bind botones
    const startBtn = target.querySelector('#blocka-start');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const sel = Number(this.levelSelect.value) || this.nextLevelNumber;
        this.startLevel({ level: sel });
      }); 
    }

    const helpBtn = target.querySelector('#blocka-help-btn');
    if (helpBtn) helpBtn.addEventListener('click', () => this.requestHelp());

    const pauseBtn = target.querySelector('#blocka-pause-btn');
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());

    const piecesSelect = target.querySelector('#blocka-select-pieces');
    if (piecesSelect) {
      piecesSelect.value = String(this.piecesCount);
      piecesSelect.addEventListener('change', (e) => {
        this.piecesCount = Number(e.target.value);
      });
    }

    const instrBtn = target.querySelector('#blocka-instr');
    let instrModal = document.getElementById('blocka-instr-modal');

    // 1. Crear el HTML del modal (solo si no existe)
    if (!instrModal) {
    instrModal = document.createElement('div');
    instrModal.id = 'blocka-instr-modal';
    instrModal.className = 'modal-overlay hidden'; // Oculto por defecto
    instrModal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <h2>Cómo Jugar</h2>
      <ul class="instructions-list">
        <li>Elige un nivel y presiona "Comenzar".</li>
        <li>La imagen se dividirá en piezas y se rotará.</li>
        <li><strong>Clic Izquierdo:</strong> Gira la pieza 90° a la izquierda.</li>
        <li><strong>Clic Derecho:</strong> Gira la pieza 90° a la derecha.</li>
        <li>¡Arma la imagen completa en el menor tiempo posible!</li>
      </ul>
    </div>
      `;
      document.body.appendChild(instrModal); 
    }

    const instrCloseBtn = instrModal.querySelector('.modal-close');

    // 2. Listener para ABRIR el modal
    if (instrBtn) {
      instrBtn.addEventListener('click', () => {
        instrModal.classList.remove('hidden'); // Muestra el modal
      });
    }

    // 3. Listener para CERRAR con el botón 'X'
    if (instrCloseBtn) {
      instrCloseBtn.addEventListener('click', () => {
        instrModal.classList.add('hidden'); // Oculta el modal
      });
    }

    this.renderThumbnails();
    this.preloadSomeImages().catch(console.warn);
  }


  async preloadSomeImages() {
    const promises = this.images.slice(0, 6).map(u => {
      return new Promise((res) => {
        const i = new Image();
        i.src = u;
        i.onload = () => res();
        i.onerror = () => res();
      });
    });
    await Promise.all(promises);
  }

  renderThumbnails() {
    if (!this.thumbsEl) return;
    this.thumbsEl.innerHTML = '';
    this.images.forEach((src, idx) => {
      const thumb = document.createElement('img');
      thumb.className = 'blocka-thumb';
      thumb.alt = 'miniatura ' + (idx + 1);
      thumb.src = src;
      thumb.style.width = '4em';
      thumb.style.height = '4em';
      thumb.style.objectFit = 'cover';
      thumb.addEventListener('click', () => this.startLevel({ imageId: idx }));
      this.thumbsEl.appendChild(thumb);
    });
  }

  /**
   * startLevel options:
   *  - pieces: # piezas
   *  - maxTime: límite opcional
   *  - imageId: id de imagen
   *  - level: fuerza un nivel (1..4). Si no, se usa el selector en UI o nextLevelNumber.
   */
  async startLevel({ pieces = this.piecesCount, maxTime = null, imageId = null, level = null } = {}) {
    // reset estado
    this.stopTimer();
    this.penaltyMs = 0;
    this.elapsedMs = 0;
    this.usedHelp = false;
    this.piecesState = [];
    if (this.board) {
      this.board.innerHTML = '';
      // remove any explicit height left from previous runs
      this.board.style.height = '';
      this.board.style.gridAutoRows = '';
      this.board.style.gridTemplateColumns = '';
    }

    // elegir imagen
    const idx = (typeof imageId === 'number') ? imageId : (Math.floor(Math.random() * this.images.length));
    const imageUrl = this.images[idx];

    // nivel a ejecutar
    let levelToRun = level;
    if (!levelToRun) {
      levelToRun = this.nextLevelNumber;
    }
    this.nextLevelNumber = (levelToRun % 4) + 1;

    if (this.levelSelect) {
      this.levelSelect.value = levelToRun;
    }

    const lastLevel = 4;
    const timeLimit = 10000;
    let finalMaxTime = maxTime;

    if(levelToRun == lastLevel){
      finalMaxTime = timeLimit;
    }

    this.currentLevel = { imageId: idx, imageUrl, pieces, level: levelToRun };

    await this.simpleThumbsAnimation(idx);

    // calcular grid
    const { cols, rows } = calculateGrid(pieces);
    if (this.board) {
      this.board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    }

    // --- NUEVO: calcular proporción y fijar altura del board en píxeles ---
    // Esto evita problemas con % en gridAutoRows y produce casillas exactas.
    try {
      const imgForRatio = new Image();
      imgForRatio.src = imageUrl;
      await new Promise((res) => {
        imgForRatio.onload = res;
        imgForRatio.onerror = res; // continuar aunque falle
      });
      const imgW = imgForRatio.naturalWidth || 1;
      const imgH = imgForRatio.naturalHeight || 1;
      const imgAspect = imgH / imgW; // height / width

      if (this.board) {
        // Anchura real del board (incluye padding; se asume box-sizing normal)
        // Si tu CSS aplica padding/border, considera usar getBoundingClientRect().width y restar gap.
        const boardRect = this.board.getBoundingClientRect();
        const boardWidth = Math.max(1, boardRect.width);
        const boardHeight = boardWidth * imgAspect;

        // fijar altura total del board en px para que las filas puedan dividirse exactamente
        this.board.style.height = `${Math.round(boardHeight)}px`;

        // calcular altura por fila en px
        const rowPx = Math.round(boardHeight / rows);
        this.board.style.gridAutoRows = `${rowPx}px`;
      }
    } catch (err) {
      console.warn('No se pudo calcular aspect ratio de la imagen:', err);
      // fallback: no fijamos altura, dejar que el layout normal lo maneje
    }
    // --- FIN ajuste proporciones ---

    // decidir filtros según nivel
    const modeNames = ['grayscale', 'brightness', 'invert'];
    let filtersByPiece;
    if (levelToRun >= 1 && levelToRun <= 3) {
      const modeName = modeNames[levelToRun - 1];
      const cssFilter = getCssFilterForPiece(modeName);
      filtersByPiece = new Array(cols * rows).fill(cssFilter);
    } else {
      const availableModes = ['grayscale', 'brightness', 'invert'];
      filtersByPiece = new Array(cols * rows).fill(null).map(() => {
        const mode = availableModes[Math.floor(Math.random() * availableModes.length)];
        return getCssFilterForPiece(mode);
      });
    }

    // pedir split
    const piecesCanvas = await splitImageWithFilters(imageUrl, cols, rows, filtersByPiece);

    // construir piezas
    let last_rotation = null;
    piecesCanvas.forEach((p, i) => {
      const pieceWrapper = document.createElement('div');
      pieceWrapper.className = 'blocka-piece';
      pieceWrapper.dataset.originalIndex = p.originalIndex;

      const canvas = p.canvas;
      // Asegurarse de que canvas use sus atributos de píxeles y se escale exactamente
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvas.style.transformOrigin = 'center center';
      canvas.draggable = false;

      // fallback css filter
      if (canvas.dataset.cssFilter && canvas.dataset.cssFilter !== 'none') {
        canvas.style.filter = canvas.dataset.cssFilter;
      } else if (filtersByPiece && filtersByPiece[i]) {
        canvas.style.filter = filtersByPiece[i];
      }

      pieceWrapper.appendChild(canvas);
      if (this.board) this.board.appendChild(pieceWrapper);

      const getRandomRotation = () => Math.floor(Math.random() * 4) * 90;
      let randomRotation = getRandomRotation();
      while (last_rotation && randomRotation === last_rotation) randomRotation = getRandomRotation();

      const state = {
        element: pieceWrapper,
        canvasEl: canvas,
        rotation: 0, // start at 0, apply delta below
        originalIndex: p.originalIndex,
        isFixed: false
      };

      this.rotatePiece(state, randomRotation, true);

      this.piecesState.push(state);
      last_rotation = state.rotation;

      // events
      pieceWrapper.addEventListener('click', (ev) => {
        ev.preventDefault();
        if (state.isFixed) return;
        this.rotatePiece(state, -90);
      });
      pieceWrapper.addEventListener('contextmenu', (ev) => {
        ev.preventDefault();
        if (state.isFixed) return;
        this.rotatePiece(state, +90);
      });
      pieceWrapper.addEventListener('touchend', (ev) => {
        ev.preventDefault();
        if (state.isFixed) return;
        this.rotatePiece(state, +90);
      }, { passive: false });
    });

    // iniciar timer
    this.startedAt = performance.now();
    this.startTimer();

    // update record display
    this.updateRecordDisplay();

    // si existe maxTime, guardarlo en nivel (para check de derrota)
    this.currentLevel.maxTime = finalMaxTime;
  }

  rotatePiece(state, deltaDeg, isBuilding = false) {
    state.rotation = ((state.rotation + deltaDeg) % 360 + 360) % 360;
    state.canvasEl.style.transform = `rotate(${state.rotation}deg)`;
    if (!isBuilding) this.checkVictory();
  }

  checkVictory() {
    const allOk = this.piecesState.every(s => (((s.rotation % 360) + 360) % 360) === 0);
    if (allOk) this.onWin();
  }

  async onWin() {
    this.stopTimer();
    const totalMs = Math.round(this.elapsedMs + this.penaltyMs);

    // Guardar record si corresponde (opcional)
    try {
      this.saveRecord(this.currentLevel.imageId, this.currentLevel.pieces, totalMs, this.usedHelp);
    } catch (e) { /* ignore */ }

    let recordText = '—'; // Valor por defecto
    try {
      // Usamos la misma "llave" que usa saveRecord
      const key = `blocka:record:${this.currentLevel.imageId}:${this.currentLevel.pieces}`;
      const prevRaw = localStorage.getItem(key);
      if (prevRaw) {
          const prev = JSON.parse(prevRaw);
          // Le damos formato al tiempo récord
          recordText = formatTime(prev.bestMs) + (prev.usedHelp ? ' (con ayuda)' : '');
      }
    } catch (e) { /* ignorar si falla localStorage */ }
    // ----- FIN DEL BLOQUE NUEVO -----

    // Transición: fade-out de piezas
    const wrappers = this.piecesState.map(s => s.element).filter(Boolean);
    // Añadir clase fade-out para animar
    wrappers.forEach(w => w.classList.add('fade-out'));

    // Esperar la duración de la transición (coincide con CSS .38s)
    await sleep(420);

    // Vaciar tablero y mostrar imagen real sin filtros con fade-in
    if (this.board) this.board.innerHTML = '';
    const realImg = new Image();
    realImg.src = this.currentLevel.imageUrl;
    realImg.alt = 'completado';
    realImg.className = 'blocka-real-img';
    realImg.onload = () => {
      // append hidden, then trigger visible
      if (this.board) this.board.appendChild(realImg);
      // small delay to allow browser to register appended element before toggling class
      requestAnimationFrame(() => {
        realImg.classList.add('visible'); // css hará fade-in
      });
    };
    realImg.onerror = () => {
      // fallback: si no carga, mostrar texto
      if (this.board) this.board.innerHTML = '<div style="padding:20px;color:#333">Imagen completada</div>';
    };

    // Modal: mostrar por encima (usar active class)
    let modal = this.container.querySelector('#blocka-modal');
    let createdModal = false;
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'blocka-modal';
      document.body.appendChild(modal);
      createdModal = true;
    }
    modal.classList.add('active');
    modal.innerHTML = `
      <div class="end-screen">
        <h2>¡Completado!</h2>
        <p>Tu tiempo: ${formatTime(totalMs)}</p>
        <p>Récord: ${recordText}</p>
        <div style="margin-top:12px">
          <button id="blocka-next">Continuar</button>
          <button id="blocka-back" style="margin-left:8px">Menú</button>
        </div>
      </div>
    `;

    const nextBtn = modal.querySelector('#blocka-next');
    const backBtn = modal.querySelector('#blocka-back');

    nextBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      if (createdModal) modal.remove();
      // iniciar nuevo nivel (usa nextLevelNumber ya determinado en startLevel)
      this.startLevel();
    });
    backBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      if (createdModal) modal.remove();
      // volver a menú: limpiar tablero y mostrar thumbs
      if (this.board) this.board.innerHTML = '';
      this.renderThumbnails();
    });

    // reproducir sonido (si existe)
    try {
      const winAudio = new Audio(new URL('../assets/sounds/win_sound.mp3', import.meta.url).href);
      winAudio.currentTime = 2;
      winAudio.play().catch(() => { });
    } catch (e) { }
  }

  startTimer() {
    const tick = () => {
      if (!this.startedAt) return;
      this.elapsedMs = Math.max(0, Math.round(performance.now() - this.startedAt));
      if (this.timerEl) this.timerEl.textContent = formatTime(this.elapsedMs + this.penaltyMs);
      if (this.currentLevel && this.currentLevel.maxTime && (this.elapsedMs + this.penaltyMs) >= this.currentLevel.maxTime) {
        this.onLose();
        return;
      }
      this.timerInterval = requestAnimationFrame(tick);
    };
    this.timerInterval = requestAnimationFrame(tick);
  }

  stopTimer() {
    if (this.timerInterval) {
      cancelAnimationFrame(this.timerInterval);
      this.timerInterval = null;
    }
    this.startedAt = null;
  }

  togglePause() {
    if (this.timerInterval) {
      this.stopTimer();
    } else {
      this.startedAt = performance.now() - this.elapsedMs;
      this.startTimer();
    }
  }

  async requestHelp() {
    if (!this.allowHelp || this.usedHelp) return;
    const incorrects = this.piecesState.filter(s => (((s.rotation % 360) + 360) % 360) !== 0 && !s.isFixed);
    if (incorrects.length === 0) return;
    const pick = incorrects[Math.floor(Math.random() * incorrects.length)];
    pick.isFixed = true;
    pick.rotation = 0;
    pick.canvasEl.style.transform = 'rotate(0deg)';
    pick.element.style.outline = '3px solid rgba(0,255,0,0.3)';
    this.usedHelp = true;
    this.penaltyMs += 5000;
    if (this.timerEl) this.timerEl.textContent = formatTime(this.elapsedMs + this.penaltyMs);
  }

  onLose() {
    this.stopTimer();
    const levelToRetry = this.currentLevel;
    let modal = this.container.querySelector('#blocka-modal');
    let createdModal = false;
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'blocka-modal';
      document.body.appendChild(modal);
      createdModal = true;
    }
    modal.classList.add('active');
    modal.innerHTML = `
      <div class="end-screen">
        <h2>¡Se acabó el tiempo!</h2>
        <div style="margin-top:8px;">
          <button id="blocka-retry">Reintentar</button>
          <button id="blocka-exit" style="margin-left:8px">Salir</button>
        </div>
      </div>
    `;
    modal.querySelector('#blocka-retry').addEventListener('click', () => {
      modal.classList.remove('active');
      if (createdModal) modal.remove();
      this.startLevel({level: levelToRetry.level});
    });
    modal.querySelector('#blocka-exit').addEventListener('click', () => {
      modal.classList.remove('active');
      if (createdModal) modal.remove();
    });
  }

  updateRecordDisplay() {
    const key = `blocka:record:${this.currentLevel?.imageId || 'none'}:${this.currentLevel?.pieces || 'none'}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (this.recordEl) this.recordEl.textContent = 'Récord: —';
    } else {
      const obj = JSON.parse(raw);
      if (this.recordEl) this.recordEl.textContent = `Récord: ${formatTime(obj.bestMs)}${obj.usedHelp ? ' (con ayuda)' : ''}`;
    }
  }

  saveRecord(imageId, piecesCount, timeMs, usedHelp = false) {
    if (timeMs <= 0) return false;
    const key = `blocka:record:${imageId}:${piecesCount}`;
    const prevRaw = localStorage.getItem(key);
    const prev = prevRaw ? JSON.parse(prevRaw) : null;
    if (!prev || timeMs < prev.bestMs || prev.bestMs === 0) {
      localStorage.setItem(key, JSON.stringify({ bestMs: timeMs, date: new Date().toISOString(), usedHelp }));
      this.updateRecordDisplay();
      return true;
    }
    return false;
  }

  async simpleThumbsAnimation(chosenIndex) {
    const thumbs = Array.from(this.thumbsEl.querySelectorAll('.blocka-thumb'));
    if (!thumbs.length) return;
    const rounds = 3;
    const total = rounds * thumbs.length + chosenIndex;
    for (let step = 0; step <= total; step++) {
      const idx = step % thumbs.length;
      thumbs.forEach((t, j) => t.style.opacity = j === idx ? '1' : '0.6');
      await new Promise(res => setTimeout(res, 90 + Math.max(0, total - step)));
    }
    thumbs.forEach(t => t.style.opacity = '1');
    await new Promise(res => setTimeout(res, 180));
  }

  destroy() {
    this.stopTimer();
    const target = document.getElementById(this.targetId);
    if (target) target.innerHTML = '';
  }
}
/** const helpButton = document.getElementById('help-button');

helpButton.addEventListener('click', ()=>{
})**/
