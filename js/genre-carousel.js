const BASE_URL = window.location.origin

document.addEventListener("DOMContentLoaded", () => {
    const genres = {
        accion: [
            { title: "Cyber Strike", img: `tp-interfaces-g25/images/cyberstrike.jpg` },
            { title: "Battle Pulse", img: "tp-interfaces-g25/images/battlepulse.jpg" },
            { title: "Rogue Core", img: "tp-interfaces-g25/images/roguecore.jpg" },
        ],
        aventura: [
            { title: "Mystic Valley", img: "tp-interfaces-g25/images/misticvalley.jpg" },
            { title: "Lost Tales", img: "tp-interfaces-g25/images/losttales.jpg" },
            { title: "Cave Whisper", img: "tp-interfaces-g25/images/cavewhisper.jpg" },
        ],
        deportes: [
            { title: "Goal Rush", img: "tp-interfaces-g25/images/goalrush.jpg" },
            { title: "Skate Arena", img: "tp-interfaces-g25/images/skatearena.jpg" },
            { title: "Top Spin", img: "tp-interfaces-g25/images/topspin.jpg" },
        ],
        puzzle: [
            { title: "Brainstorm", img: "tp-interfaces-g25/images/brainstorm.jpg" },
            { title: "Cube Logic", img: "tp-interfaces-g25/images/cubelogi.jpg" },
            { title: "Mind Grid", img: "tp-interfaces-g25/images/mindgrid.jpg" },
        ]
    };

    const track = document.getElementById("genre-track");
    const genreButtons = document.querySelectorAll(".genre-item");
    let currentGenre = "accion";
    let currentIndex = 0;

    function renderGenre(genre) {
        track.innerHTML = "";
        genres[genre].forEach(game => {
            const figure = document.createElement("figure");
            figure.classList.add("game-card");
            figure.innerHTML = `
                <img src="${game.img}" alt="${game.title}">
                <figcaption>${game.title}</figcaption>
            `;
            track.appendChild(figure);
        });
        currentIndex = 0;
        track.style.transform = "translateX(0)";
    }

    renderGenre(currentGenre);

    genreButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            genreButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentGenre = btn.dataset.genre;
            renderGenre(currentGenre);
        });
    });

});
