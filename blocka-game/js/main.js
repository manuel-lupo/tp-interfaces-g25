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

export class Blocka {
  constructor({ targetId, images = [], defaultPieces = 4, allowHelp = true }) {
    this.targetId = targetId;
    this.images = images.slice(); // array of URLs
    this.piecesCount = defaultPieces;
    this.allowHelp = allowHelp;

    // estado runtime
    this.container = null;
    this.board = null;
    this.timerEl = null;
    this.recordEl = null;
    this.thumbsEl = null;

    this.currentLevel = null; // objeto con metadata del nivel
    this.timerInterval = null;
    this.startedAt = null;
    this.penaltyMs = 0;
    this.elapsedMs = 0;
    this.usedHelp = false;
    this.piecesState = []; // array de piezas con {element, rotation, originalIndex, isFixed}
  }

  async init() {
    const target = document.getElementById(this.targetId);
    if (!target) throw new Error('Target no encontrado: ' + this.targetId);

    // inyectar template
    console.log(TEMPLATE)
    target.innerHTML = TEMPLATE();
    this.container = target.querySelector('.blocka-app');
    this.board = target.querySelector('#blocka-board');
    this.timerEl = target.querySelector('#blocka-timer');
    this.recordEl = target.querySelector('#blocka-record');
    this.thumbsEl = target.querySelector('#blocka-thumbs');

    // bind botones
    target.querySelector('#blocka-start').addEventListener('click', () => this.startLevel());
    target.querySelector('#blocka-help-btn').addEventListener('click', () => this.requestHelp());
    target.querySelector('#blocka-pause-btn').addEventListener('click', () => this.togglePause());
    target.querySelector('#blocka-select-pieces').value = String(this.piecesCount);
    target.querySelector('#blocka-select-pieces').addEventListener('change', (e) => {
      this.piecesCount = Number(e.target.value);
    });

    // mostrar thumbnails
    this.renderThumbnails();

    // prev load small set to improve UX (no await heavy)
    this.preloadSomeImages().catch(console.warn);
  }

  async preloadSomeImages() {
    // precarga thumbnails (si existen) o las imágenes originales
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
    this.thumbsEl.innerHTML = '';
    this.images.forEach((src, idx) => {
      const thumb = document.createElement('img');
      thumb.className = 'blocka-thumb';
      thumb.alt = 'miniatura ' + (idx + 1);
      thumb.src = src;
      thumb.style.width = '4em';
      thumb.style.height = '4em';
      thumb.style.objectFit = 'cover';
      // click para jugar con esa imagen en particular
      thumb.addEventListener('click', () => this.startLevel({ imageId: idx }));
      this.thumbsEl.appendChild(thumb);
    });
  }

  async startLevel({ pieces = this.piecesCount, maxTime = null, imageId = null } = {}) {
    // reset estado
    this.stopTimer();
    this.penaltyMs = 0;
    this.elapsedMs = 0;
    this.usedHelp = false;
    this.piecesState = [];
    this.board.innerHTML = '';

    // elegir imagen aleatoria si no se indicó
    const idx = (typeof imageId === 'number') ? imageId : (Math.floor(Math.random() * this.images.length));
    const imageUrl = this.images[idx];
    this.currentLevel = { imageId: idx, imageUrl, pieces };

    // animación simple de thumbnails previa (extra)
    await this.simpleThumbsAnimation(idx);

    // calcular grid
    const { cols, rows } = calculateGrid(pieces);
    // --- ADD THIS: force grid columns so pieces align compactly ---
    this.board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    // generar filtros por pieza (puedes variar por nivel; aquí ejemplo simple: rotar filtros)
    const availableModes = ['grayscale', 'brightness', 'invert'];
    const filtersByPiece = new Array(cols * rows).fill(null).map((_, i) => {
      const mode = availableModes[i % availableModes.length];
      return getCssFilterForPiece(mode);
    });

    // pedir split
    const piecesCanvas = await splitImageWithFilters(imageUrl, cols, rows, filtersByPiece);

    // mezclar rotaciones iniciales y armar tablero
    // No mezclamos posiciones (según tu enunciado solo están rotadas). Si quieres mezclar posiciones, reordenar aquí.
    let last_rotation = null
    piecesCanvas.forEach((p, i) => {
      // ----------------- REPLACEMENT BLOCK FOR CREATING EACH PIECE -----------------
      const pieceWrapper = document.createElement('div');
      pieceWrapper.className = 'blocka-piece';
      pieceWrapper.dataset.originalIndex = p.originalIndex;

      // Ensure canvas fills the wrapper and uses center transform origin
      const canvas = p.canvas;
      // canvas width/height attributes were set when created by splitImageWithFilters
      // we force the CSS fill so it covers the grid cell (square thanks to aspect-ratio)
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvas.style.transformOrigin = 'center center';
      canvas.draggable = false;

      // If ctx.filter wasn't supported, apply the CSS fallback stored in dataset
      if (canvas.dataset.cssFilter && canvas.dataset.cssFilter !== 'none') {
        canvas.style.filter = canvas.dataset.cssFilter;
      }

      pieceWrapper.appendChild(canvas);
      this.board.appendChild(pieceWrapper);
      const getRandomRotation = ()=>{ return Math.floor(Math.random() * 4) * 90 };
      let randomRotation = getRandomRotation()
      while (last_rotation && randomRotation == last_rotation)
          randomRotation =  getRandomRotation()

      // store piece state (unchanged)
      const state = {
        element: pieceWrapper,
        canvasEl: canvas,
        rotation: randomRotation,
        originalIndex: p.originalIndex,
        isFixed: false
      };

      this.rotatePiece(state, state.rotation, true)
      this.piecesState.push(state);
      last_rotation = state.rotation;

      // events (keep same as before)
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
    this.currentLevel.maxTime = maxTime || null;
  }

  rotatePiece(state, deltaDeg, isBuilding = false) {
    console.log(`Rotacion anterior = ${state.rotation}`)
    state.rotation = ((state.rotation + deltaDeg) % 360 + 360) % 360;
    console.log(`Nueva rotacion: ${state.rotation}`)
    state.canvasEl.style.transform = `rotate(${state.rotation}deg)`;
    // comprobar victoria
    if (!isBuilding)
      this.checkVictory();
  }

  checkVictory() {
    // condición: todas las piezas con rotation %360 === 0
    console.log("Checkeando victoria")
    let sum = 0

    this.piecesState.forEach((state)=> sum+=state.rotation)
    
    console.log(`Suma total de las rotaciones = ${sum}`)

    const allOk = (sum == 0)
    console.log(`Imagenes correctas?: ${allOk}`)
    if (allOk) {
      this.onWin();
    }
  }

  onWin() {
    this.stopTimer();
    const totalMs = Math.round(this.elapsedMs + this.penaltyMs);
    // quitar filtros (animar)
    this.piecesState.forEach(s => {
      s.canvasEl.style.filter = 'none';
    });

    let winAudio = new Audio(new URL('../assets/sounds/win_sound.mp3', import.meta.url).href)
    winAudio.currentTime = 2;
    
    // guardar record
    //const saved = this.saveRecord(this.currentLevel.imageId, this.currentLevel.pieces, totalMs, this.usedHelp);
    // mostrar modal simple
    const modal = this.container.querySelector('#blocka-modal');
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="end-screen">
        <h2>¡Completado!</h2>
        <button id="blocka-next">Continuar</button>
        <button id="blocka-back">Menú</button>
      </div>
    `;

    winAudio.play()

    modal.querySelector('#blocka-next').addEventListener('click', () => {
      modal.classList.add('hidden');
      // iniciar nuevo nivel (aleatorio)
      this.startLevel();
    });
    modal.querySelector('#blocka-back').addEventListener('click', () => {
      modal.classList.add('hidden');
      // volver a mostrar configuración / thumbs
    });
  }

  startTimer() {
    this.stopTimer();
    const tick = () => {
      if (!this.startedAt) return;
      this.elapsedMs = Math.max(0, Math.round(performance.now() - this.startedAt));
      this.timerEl.textContent = formatTime(this.elapsedMs + this.penaltyMs);
      // si existe maxTime: comprobar derrota
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
      // pausar
      this.stopTimer();
    } else {
      // reanudar: ajustar startedAt para mantener elapsed
      this.startedAt = performance.now() - this.elapsedMs;
      this.startTimer();
    }
  }

  async requestHelp() {
    if (!this.allowHelp || this.usedHelp) return;
    // elegir una pieza incorrecta aleatoria
    const incorrects = this.piecesState.filter(s => (s.rotation % 360) !== 0 && !s.isFixed);
    if (incorrects.length === 0) return;
    const pick = incorrects[Math.floor(Math.random() * incorrects.length)];
    // fijarla en rot 0 y marcar
    pick.isFixed = true;
    pick.rotation = 0;
    pick.canvasEl.style.transform = 'rotate(0deg)';
    // visual: añadir marca
    pick.element.style.outline = '3px solid rgba(0,255,0,0.3)';
    this.usedHelp = true;
    this.penaltyMs += 5000; // +5s
    // actualizar timer display inmediatamente
    this.timerEl.textContent = formatTime(this.elapsedMs + this.penaltyMs);
    // si quieres permitir solo 1 ayuda por nivel, dejamos usedHelp=true
  }

  onLose() {
    this.stopTimer();
    const modal = this.container.querySelector('#blocka-modal');
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="end-screen">
        <h2>¡Se acabó el tiempo!</h2>
        <button id="blocka-retry">Reintentar</button>
        <button id="blocka-exit">Salir</button>
      </div>
    `;
    modal.querySelector('#blocka-retry').addEventListener('click', () => {
      modal.classList.add('hidden');
      this.startLevel();
    });
    modal.querySelector('#blocka-exit').addEventListener('click', () => {
      modal.classList.add('hidden');
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
    const key = `blocka:record:${imageId}:${piecesCount}`;
    const prevRaw = localStorage.getItem(key);
    const prev = prevRaw ? JSON.parse(prevRaw) : null;
    if (!prev || timeMs < prev.bestMs) {
      localStorage.setItem(key, JSON.stringify({ bestMs: timeMs, date: new Date().toISOString(), usedHelp }));
      this.updateRecordDisplay();
      return true;
    }
    return false;
  }

  async simpleThumbsAnimation(chosenIndex) {
    // animación rápida que recorre thumbs y se detiene en chosenIndex
    const thumbs = Array.from(this.thumbsEl.querySelectorAll('.blocka-thumb'));
    if (!thumbs.length) return;
    let i = 0;
    const rounds = 3; // vueltas rápidas
    const total = rounds * thumbs.length + chosenIndex;
    for (let step = 0; step <= total; step++) {
      const idx = step % thumbs.length;
      // efecto visual rápido
      thumbs.forEach((t, j) => t.style.opacity = j === idx ? '1' : '0.6');
      await new Promise(res => setTimeout(res, 90 + Math.max(0, total - step))); // desacelera un poco al final
    }
    // reset opacities
    thumbs.forEach(t => t.style.opacity = '1');
    // pequeño delay antes de mostrar tablero
    await new Promise(res => setTimeout(res, 180));
  }

  destroy() {
    // limpia DOM insertado y stop timers
    this.stopTimer();
    const target = document.getElementById(this.targetId);
    if (target) target.innerHTML = '';
  }
}
