document.addEventListener("DOMContentLoaded", () => {
  const genreCards = document.querySelectorAll(".genre-card");
  const gameTrack = document.querySelector(".genre-carousel-track");
  const genres = {
    accion: [
      { title: "Cyber Strike", img: "./imagenes/cyberstrike.jpg" },
      { title: "Battle Pulse", img: "./imagenes/battlepulse.jpg" },
      { title: "Rogue Core", img: "./imagenes/roguecore.jpg" },
    ],
    aventura: [
      { title: "Spirit Trails", img: "./imagenes/spirittrails.jpg" },
      { title: "Lost Echo", img: "./imagenes/lostecho.jpg" },
      { title: "Skyline Quest", img: "./imagenes/skylinequest.jpg" },
    ],
    deportes: [
      { title: "Goal Rush", img: "./imagenes/goalrush.jpg" },
      { title: "Fast Court", img: "./imagenes/fastcourt.jpg" },
      { title: "Freestyle Arena", img: "./imagenes/freestylearena.jpg" },
    ],
    puzzle: [
      { title: "Logic Drop", img: "./imagenes/logicdrop.jpg" },
      { title: "Neon Grid", img: "./imagenes/neongrid.jpg" },
      { title: "Mirror Code", img: "./imagenes/mirrorcode.jpg" },
    ],
  };

  function renderGames(genre) {
    gameTrack.innerHTML = "";
    genres[genre].forEach((g) => {
      const card = document.createElement("div");
      card.classList.add("game-card");
      card.innerHTML = `
        <img src="${g.img}" alt="${g.title}">
        <figcaption>${g.title}</figcaption>
      `;
      gameTrack.appendChild(card);
    });
  }

  genreCards.forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelector(".genre-card.active")?.classList.remove("active");
      card.classList.add("active");
      renderGames(card.dataset.genre);
    });
  });

  renderGames("accion");

  // Scroll vertical de géneros
  const track = document.querySelector(".genre-track");
  document.querySelector(".genre-scroll-btn.up").addEventListener("click", () => {
    track.scrollBy({ top: -100, behavior: "smooth" });
  });
  document.querySelector(".genre-scroll-btn.down").addEventListener("click", () => {
    track.scrollBy({ top: 100, behavior: "smooth" });
  });

  // Scroll horizontal de juegos
  const carousel = document.querySelector(".genre-carousel-viewport");
  document.querySelector(".game-scroll-btn.prev").addEventListener("click", () => {
    carousel.scrollBy({ left: -300, behavior: "smooth" });
  });
  document.querySelector(".game-scroll-btn.next").addEventListener("click", () => {
    carousel.scrollBy({ left: 300, behavior: "smooth" });
  });
});
