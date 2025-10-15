import { getGames } from "../js/games_api.js";

//Determinamos que juegos entran en recomendados segun que rating tienen
const MIN_RATING_FOR_RECCOMENDED = 4;

//animación y despliegue del menú hamburguesa
const menuhamburguesa = document.querySelector('.menu-hamburguesa');
const navMenu = document.querySelector('.nav');

menuhamburguesa.addEventListener('click', () => {
  menuhamburguesa.classList.toggle('active');
  navMenu.classList.toggle('active');

  //así puede cerrar con la misma animación
  const expanded = menuhamburguesa.getAttribute("aria-expanded") === true || false;
  menuhamburguesa.setAttribute("aria-expanded", !expanded);
});

async function buildCarrousel(trackId, minRating = 0){
  /* Ejemplo de codigo html a generar:
  <figure class="carousel-slide" data-index="0">
      <div class="game-card">
          <img src="./images/gameCards/gameCard -GTAsanAndreas.png" alt="GTA San Andreas">
          <figcaption>GTA San Andreas</figcaption>
      </div>
  </figure> */
  const getGameHtml = (index, game)=>{
    return `
    <figure class="carousel-slide" data-index="${index}">
      <div class="game-card">
          <img src="${game.background_image_low_res}" alt="${game.name}">
          <figcaption>${game.name}</figcaption>
      </div>
    </figure>
    `
  }
  const track = document.getElementById(trackId)
  const games = await getGames()
  for (const [index, game] of games.entries()){
    console.log(`Juego ${index + 1}: ${game.name}`)
    if (game.rating >= minRating){
      track.innerHTML += getGameHtml(index, game)
    }

    if (index > 19) break;
  }
}

async function iniciarCarrusel({ carouselId, trackId, prevId, nextId, indicatorsId }) {
  if (trackId == "track-1"){
    //El primer track se construye con el rating minimo
    await buildCarrousel(trackId, MIN_RATING_FOR_RECCOMENDED)
  } else {
    await buildCarrousel(trackId)
  }
  
  const carousel = document.getElementById(carouselId);
  const track = document.getElementById(trackId);
  if (!carousel || !track) return;

  // obtener solo slides reales (ignorar nodos extra)
  const originalSlides = Array.from(track.children).filter(n => n.classList && n.classList.contains('carousel-slide'));
  if (originalSlides.length === 0) return;

  // clonar extremos
  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
  track.insertBefore(lastClone, track.firstElementChild);
  track.appendChild(firstClone);

  // lista actual de slides dentro del track
  const slides = Array.from(track.children).filter(n => n.classList && n.classList.contains('carousel-slide'));
  const realSlideCount = originalSlides.length;

  // calcular slidePercent dinámico según el ancho real
  const viewport = carousel.querySelector('.carousel-viewport');
  const computeVisibleAndPercent = () => {
    const viewportWidth = viewport.clientWidth;
    const sampleSlide = slides[0];
    const slideWidth = sampleSlide.getBoundingClientRect().width;
    const visibleCount = Math.max(1, Math.round(viewportWidth / slideWidth));
    const slidePercent = 100 / visibleCount;
    return { visibleCount, slidePercent };
  };

  let { slidePercent } = computeVisibleAndPercent();
  const transitionMs = 500;
  const transitionCSS = `transform ${transitionMs}ms ease`;

  // UI elements
  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);
  const indicatorsWrap = document.getElementById(indicatorsId);

  // estado
  let current = 0; 
  let autoplay = true;
  const interval = 5000;
  let timer = null;

  // crear indicadores
  if (indicatorsWrap) {
    indicatorsWrap.innerHTML = '';
    for (let i = 0; i < realSlideCount; i++) {
      const b = document.createElement('button');
      b.className = 'carousel-indicator';
      b.setAttribute('aria-label', `Ir al slide ${i + 1}`);
      b.addEventListener('click', () => { goTo(i); resetTimer(); });
      indicatorsWrap.appendChild(b);
    }
  }

  function updateIndicators() {
    if (!indicatorsWrap) return;
    const buttons = Array.from(indicatorsWrap.children);
    buttons.forEach((b, i) => {
      if (i === current) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
  }

  // mover al índice real (0..realSlideCount-1)
  function goTo(index) {
    current = index;
    const x = -((index + 1) * slidePercent);
    track.style.transition = transitionCSS;
    track.style.transform = `translateX(${x}%)`;
    updateIndicators();
  }

  function jumpToFirstInstant() {
    track.style.transition = 'none';
    track.style.transform = `translateX(-${slidePercent}%)`;
    current = 0;
    updateIndicators();
    requestAnimationFrame(() => requestAnimationFrame(() => { track.style.transition = transitionCSS; }));
  }

  function jumpToLastInstant() {
    track.style.transition = 'none';
    const x = -(realSlideCount * slidePercent);
    track.style.transform = `translateX(${x}%)`;
    current = realSlideCount - 1;
    updateIndicators();
    requestAnimationFrame(() => requestAnimationFrame(() => { track.style.transition = transitionCSS; }));
  }

  function next() {
    current++;
    goTo(current);
    if (current === realSlideCount) {
      setTimeout(jumpToFirstInstant, transitionMs);
    }
  }

  function prev() {
    current--;
    goTo(current);
    if (current < 0) {
      setTimeout(jumpToLastInstant, transitionMs);
    }
  }

  // listeners
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetTimer(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetTimer(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); resetTimer(); }
    if (e.key === 'ArrowLeft') { prev(); resetTimer(); }
  });

  // autoplay
  function startTimer() { if (!autoplay) return; stopTimer(); timer = setInterval(next, interval); }
  function stopTimer() { if (timer) clearInterval(timer); timer = null; }
  function resetTimer() { stopTimer(); startTimer(); }

  carousel.addEventListener('mouseenter', stopTimer);
  carousel.addEventListener('mouseleave', startTimer);
  carousel.addEventListener('focusin', stopTimer);
  carousel.addEventListener('focusout', startTimer);

  // swipe
  let startX = 0, dx = 0;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stopTimer(); }, { passive: true });
  track.addEventListener('touchmove', (e) => { dx = e.touches[0].clientX - startX; }, { passive: true });
  track.addEventListener('touchend', () => {
    if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
    dx = 0; startX = 0; resetTimer();
  });

  // inicial: posicionar al primer slide real
  track.style.transition = 'none';
  track.style.transform = `translateX(-${slidePercent}%)`;
  requestAnimationFrame(() => requestAnimationFrame(() => { track.style.transition = transitionCSS; }));

  updateIndicators();
  startTimer();

  // recalculo en resize (responsive)
  window.addEventListener('resize', () => {
    const res = computeVisibleAndPercent();
    slidePercent = res.slidePercent;
    // reajustar posición acorde al nuevo slidePercent
    track.style.transition = 'none';
    track.style.transform = `translateX(-${(current + 1) * slidePercent}%)`;
    requestAnimationFrame(() => requestAnimationFrame(() => { track.style.transition = transitionCSS; }));
  });
}

//tantos llamados como carrouseles tengamos:
iniciarCarrusel({
  carouselId: 'carousel-1',
  trackId: 'track-1',
  prevId: 'prev-1',
  nextId: 'next-1',
  indicatorsId: 'indicators-1'
});

iniciarCarrusel({
  carouselId: 'carousel-2',
  trackId: 'track-2',
  prevId: 'prev-2',
  nextId: 'next-2',
  indicatorsId: 'indicators-2'
});

iniciarCarrusel({
  carouselId: 'carousel-3',
  trackId: 'track-3',
  prevId: 'prev-3',
  nextId: 'next-3',
  indicatorsId: 'indicators-3'
});


//script del popUp del footer:
const modal = document.getElementById('popUp-modal');
const closeEls = modal ? modal.querySelectorAll('[data-close]') : [];
let lastFocused = null;

function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

function openModal() {
  if (!modal) return;
  lastFocused = document.activeElement;
  const sb = getScrollbarWidth();
  if (sb) document.body.style.paddingRight = `${sb}px`;
  modal.removeAttribute('hidden');
  requestAnimationFrame(() => {
    modal.classList.add('modal-open');
    document.body.classList.add('modal-open');
    setTimeout(() => {
      const panel = modal.querySelector('.modal-panel');
      if (panel) panel.focus();
    }, 50);
    trapFocus(modal);
  });
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('modal-open');
  document.body.classList.remove('modal-open');
  releaseFocusTrap();
  setTimeout(() => {
    modal.setAttribute('hidden', '');
    document.body.style.paddingRight = '';
    if (lastFocused) lastFocused.focus();
  }, 240);
}

// listeners (delegación para triggers)
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('.popUp-item, .cookies-trigger');
  if (trigger) { openModal(); return; }
  if (e.target.closest('[data-close]')) closeModal();
});

// teclado: abrir con Enter/Space en triggers y cerrar con Escape
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.matches('.popUp-item, .cookies-trigger')) {
    e.preventDefault();
    openModal();
  }
  if (e.key === 'Escape' && modal && !modal.hasAttribute('hidden')) closeModal();
});

// backdrop click close
const backdrop = modal ? modal.querySelector('.modal-backdrop') : null;
if (backdrop) backdrop.addEventListener('click', closeModal);

/* focus trap simple (ya mostrado anteriormente) */
let focusableEls = [];
let focusTrapHandler = null;

function trapFocus(container) {
  focusableEls = Array.from(container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'));
  if (focusableEls.length === 0) return;
  focusableEls[0].focus();
  focusTrapHandler = function (e) {
    if (e.key !== 'Tab') return;
    const first = focusableEls[0];
    const last = focusableEls[focusableEls.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener('keydown', focusTrapHandler);
}

function releaseFocusTrap() {
  if (focusTrapHandler) document.removeEventListener('keydown', focusTrapHandler);
  focusTrapHandler = null;
}