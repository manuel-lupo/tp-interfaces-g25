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

//ANIMACION SEGUNDO CARROUSEL:
/**
function iniciarCarrusel({ carouselId, trackId, prevId, nextId, indicatorsId }) {
  const track = document.getElementById(trackId);
  const slides = Array.from(track.children);

  const firstSlide = slides[0].cloneNode(true);
  const lastSlide = slides[slides.length - 1].cloneNode(true);
  track.insertBefore(lastSlide, slides[0]);
  track.appendChild(firstSlide);
  const allSlides = Array.from(track.children);
  const realSlideCount = slides.length;

  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);
  const indicatorsWrap = document.getElementById(indicatorsId);
  const carousel = document.getElementById(carouselId);
  const interval = 5000;
  let current = 0;
  let autoplay = true;
  let timer = null;

  /**function goTo(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    current = index;
    const x = -index * 20;
    track.style.transform = `translateX(${x}%)`;
    updateIndicators();
  }**/

/**   
function goTo(index) {
  current = index;
  const x = -(index + 1) * 20; // +1 por el clon al inicio
  track.style.transition = 'transform 0.5s ease';
  track.style.transform = `translateX(${x}%)`;
  updateIndicators();
}
/**
function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }
**/
/** 
function next() {
  current++;
  goTo(current);

  if (current === realSlideCount) {
    setTimeout(() => {
      track.style.transition = 'none';
      track.style.transform = `translateX(-20%)`;
      current = 0;
      updateIndicators();
      setTimeout(() => {
        track.style.transition = 'transform 0.5s ease';
      }, 20);
    }, 500);
  }
}

function prev() {
  current--;
  goTo(current);

  if (current < 0) {
    setTimeout(() => {
      track.style.transition = 'none';
      track.style.transform = `translateX(-${realSlideCount * 20}%)`;
      current = realSlideCount - 1;
      updateIndicators();
      setTimeout(() => {
        track.style.transition = 'transform 0.5s ease';
      }, 20);
    }, 500);
  }
}

slides.forEach((s, i) => {
  const btn = document.createElement('button');
  btn.className = 'carousel-indicator';
  btn.setAttribute('aria-label', `Ir al slide ${i + 1}`);
  btn.addEventListener('click', () => { goTo(i); resetTimer(); });
  indicatorsWrap.appendChild(btn);
});

/**
function updateIndicators() {
  const buttons = Array.from(indicatorsWrap.children);
  buttons.forEach((b, i) => {
    if (i === current) b.setAttribute('aria-current', 'true');
    else b.removeAttribute('aria-current');
  });
}
**/
/**
function updateIndicators() {
  const buttons = Array.from(indicatorsWrap.children);
  buttons.forEach((b, i) => {
    if (i === (current % realSlideCount)) {
      b.setAttribute('aria-current', 'true');
    } else {
      b.removeAttribute('aria-current');
    }
  });
}

nextBtn.addEventListener('click', () => { next(); resetTimer(); });
prevBtn.addEventListener('click', () => { prev(); resetTimer(); });

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { next(); resetTimer(); }
  if (e.key === 'ArrowLeft') { prev(); resetTimer(); }
});

function startTimer() { if (!autoplay) return; timer = setInterval(next, interval); }
function stopTimer() { if (timer) clearInterval(timer); timer = null; }
function resetTimer() { stopTimer(); startTimer(); }

carousel.addEventListener('mouseenter', () => { stopTimer(); });
carousel.addEventListener('mouseleave', () => { startTimer(); });
carousel.addEventListener('focusin', () => { stopTimer(); });
carousel.addEventListener('focusout', () => { startTimer(); });

let startX = 0;
let dx = 0;
track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stopTimer(); }, { passive: true });
track.addEventListener('touchmove', (e) => { dx = e.touches[0].clientX - startX; }, { passive: true });
track.addEventListener('touchend', () => {
  if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
  dx = 0; startX = 0; resetTimer();
});

//goTo(0);
track.style.transition = 'none';
track.style.transform = `translateX(-20%)`; // posición inicial real
setTimeout(() => {
  track.style.transition = 'transform 0.5s ease';
}, 20);

startTimer();
}
**/

function iniciarCarrusel({ carouselId, trackId, prevId, nextId, indicatorsId }) {
  const carousel = document.getElementById(carouselId);
  const track = document.getElementById(trackId);

  // EXCLUYE nodos que no sean slides (por ejemplo .carousel-fade-right si está dentro del track)
  const originalSlides = Array.from(track.children).filter(n => n.classList && n.classList.contains('carousel-slide'));
  if (originalSlides.length === 0) return;

  // Clonar primera y última slide (clon limpio)
  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);

  // Insertar clones (antes y después)
  track.insertBefore(lastClone, track.firstElementChild);
  track.appendChild(firstClone);

  // Ahora obtengo la lista actual de slides dentro del track (solo slides)
  const slides = Array.from(track.children).filter(n => n.classList && n.classList.contains('carousel-slide'));
  const realSlideCount = originalSlides.length;

  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);
  const indicatorsWrap = document.getElementById(indicatorsId);

  // Número de slides visibles en el viewport (si siempre mostras 5 -> visibleCount = 5)
  // Si cambias el CSS, ajustá este valor o calculalo dinámicamente.
  const visibleCount = 5;
  const slidePercent = 100 / visibleCount; // desplazamiento por slide en %

  let current = 0; // índice relativo a las slides reales [0 .. realSlideCount-1]
  let autoplay = true;
  const interval = 5000;
  let timer = null;
  const transition = 'transform 0.5s ease';

  // Crear indicadores (uno por slide real)
  indicatorsWrap.innerHTML = '';
  for (let i = 0; i < realSlideCount; i++) {
    const btn = document.createElement('button');
    btn.className = 'carousel-indicator';
    btn.setAttribute('aria-label', `Ir al slide ${i + 1}`);
    btn.addEventListener('click', () => { goTo(i); resetTimer(); });
    indicatorsWrap.appendChild(btn);
  }

  function updateIndicators() {
    const buttons = Array.from(indicatorsWrap.children);
    buttons.forEach((b, i) => {
      if (i === current) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
  }

  // goTo recibe índice en el rango real [0 .. realSlideCount-1]
  function goTo(index) {
    current = index;
    const x = -((index + 1) * slidePercent); // +1 por el clon al inicio
    track.style.transition = transition;
    track.style.transform = `translateX(${x}%)`;
    updateIndicators();
  }

  // next/prev con lógica de salto al clon
  function next() {
    current++;
    goTo(current);

    // si llegamos al clon que está después del último real
    if (current === realSlideCount) {
      // esperar a que termine la transición visual antes del "salto"
      setTimeout(() => {
        track.style.transition = 'none';
        // posicionar al primer slide real (índice 0): clon inicial ocupa -slidePercent, así el primer real queda -slidePercent
        const resetX = -slidePercent;
        track.style.transform = `translateX(${resetX}%)`;
        current = 0;
        updateIndicators();
        // reactivar transición para siguientes movimientos
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            track.style.transition = transition;
          });
        });
      }, 500); // debe coincidir con la duración de la transición (0.5s)
    }
  }

  function prev() {
    current--;
    goTo(current);

    // si pasamos antes del primer real (índice -1 -> clon al inicio)
    if (current < 0) {
      setTimeout(() => {
        track.style.transition = 'none';
        // posicionar al último slide real
        const resetX = -((realSlideCount) * slidePercent); // porque hay un clon al inicio
        track.style.transform = `translateX(${resetX}%)`;
        current = realSlideCount - 1;
        updateIndicators();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            track.style.transition = transition;
          });
        });
      }, 500);
    }
  }

  // controles y teclado
  nextBtn.addEventListener('click', () => { next(); resetTimer(); });
  prevBtn.addEventListener('click', () => { prev(); resetTimer(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); resetTimer(); }
    if (e.key === 'ArrowLeft') { prev(); resetTimer(); }
  });

  // autoplay
  function startTimer() { if (!autoplay) return; timer = setInterval(next, interval); }
  function stopTimer() { if (timer) clearInterval(timer); timer = null; }
  function resetTimer() { stopTimer(); startTimer(); }

  carousel.addEventListener('mouseenter', () => { stopTimer(); });
  carousel.addEventListener('mouseleave', () => { startTimer(); });
  carousel.addEventListener('focusin', () => { stopTimer(); });
  carousel.addEventListener('focusout', () => { startTimer(); });

  // touch
  let startX = 0;
  let dx = 0;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stopTimer(); }, { passive: true });
  track.addEventListener('touchmove', (e) => { dx = e.touches[0].clientX - startX; }, { passive: true });
  track.addEventListener('touchend', () => {
    if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
    dx = 0; startX = 0; resetTimer();
  });

  // Posición inicial: mostrar la primera slide real (hay un clon al inicio)
  track.style.transition = 'none';
  track.style.transform = `translateX(-${slidePercent}%)`;
  // forzar reflow y luego reactivar transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      track.style.transition = transition;
    });
  });

  updateIndicators();
  startTimer();
}




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

/** 
Notas importantes y comprobaciones:

Asegurate de que dentro de track solo estén los elementos .carousel-slide y nada más. Si dejás .carousel-fade-right dentro del track, muevelo fuera y colócalo como hermano dentro de .carousel-viewport. Si no podés moverlo, la función filtra correctamente pero es más robusto mantener el track solo con slides.

El código asume que en el viewport se muestran 5 slides (por eso visibleCount = 5). Si cambiás CSS (por ejemplo min-width de slide), ajustá visibleCount o calculalo dinámicamente midiendo el ancho del viewport y del slide.

La duración de la comprobación 500 ms debe coincidir con la duración de la transición (0.5s). Si cambias la transición en CSS, sincronizalo aquí.

Si tenés varios carruseles, esta función puede llamarse para cada uno como ya hacés.

Si querés, te preparo una pequeña lista de verificación para probar el comportamiento y te doy una versión que calcule visibleCount automáticamente midiendo elementos (si preferís no hardcodear 5).


**/


//FIN DE LA ANIMACION DEL SEGUNDO CARROUSEL