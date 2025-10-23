export function ui() {
  return `
<!-- fragmento inyectado -->
<div class="blocka-app" aria-label="Juego Blocka">
<div class="game-buttons">
</div>
  <header class="blocka-header">
    <h1>BLOCKA: Agarrini la palini</h1>
    <a href="../pages/blocka-page.html" class="small">Atrás</a>
  </header>

  <section class="blocka-config" id="blocka-config">
    <!-- opciones: piezas, dificultad, ayudita -->
    <label>Subimagenes:
      <select id="blocka-select-pieces">
        <option value="4">4</option>
        <option value="6">6</option>
        <option value="8">8</option>
      </select>
    </label>
    <label>Ayudita: <input id="blocka-help" type="checkbox"></label>
    <button id="blocka-start">Comenzar</button>
  </section>

  <main class="blocka-main">
    <aside class="blocka-thumbs" id="blocka-thumbs"></aside>

    <div class="blocka-play-area" id="blocka-play-area" aria-live="polite">
      <!-- aquí se montan los canvases / piezas -->
      <div id="blocka-board" class="blocka-board"></div>
    </div>

    <aside class="blocka-side">
      <div id="blocka-timer" class="timer">00:00.000</div>
      <button id="blocka-help-btn">Ayudita</button>
      <button id="blocka-pause-btn">Pausar</button>
    </aside>
  </main>

  <footer class="blocka-footer">
    <button id="blocka-instr">Instrucciones</button>
    <div id="blocka-record">Récord: —</div>
  </footer>

  <!-- modal / end screen placeholders -->
  <div id="blocka-modal" class="game-modal hidden"></div>
  </div>
`}
