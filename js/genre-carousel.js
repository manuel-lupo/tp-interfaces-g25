const BASE_URL = window.location.origin

document.addEventListener("DOMContentLoaded", () => {
    const genres = {
        accion: [
            { title: "Cyber Strike", img: `https://manuel-lupo.github.io/tp-interfaces-g25/images/cyberstrike.jpg` },
            { title: "Battle Pulse", img: "https://manuel-lupo.github.io/tp-interfaces-g25/images/battlepulse.jpg" },
            { title: "Rogue Core", img: "https://manuel-lupo.github.io/tp-interfaces-g25/images/roguecore.jpg" },
        ],
        aventura: [
            { title: "Mystic Valley", img: "https://manuel-lupo.github.io/tp-interfaces-g25/images/misticvalley.jpg" },
            { title: "Lost Tales", img: "https://manuel-lupo.github.io/tp-interfaces-g25/images/losttales.jpg" },
            { title: "Cave Whisper", img: "https://manuel-lupo.github.io/tp-interfaces-g25/images/cavewhisper.jpg" },
        ],
        deportes: [
            { title: "Goal Rush", img: "https://manuel-lupo.github.io/tp-interfaces-g25/images/goalrush.jpg" },
            { title: "Skate Arena", img: "https://manuel-lupo.github.io/tp-interfaces-g25/images/skatearena.jpg" },
            { title: "Top Spin", img: "https://manuel-lupo.github.io/tp-interfaces-g25/images/topspin.jpg" },
        ],
        puzzle: [
            { title: "Brainstorm", img: "https://manuel-lupo.github.io/tp-interfaces-g25/images/brainstorm.jpg" },
            { title: "Cube Logic", img: "https://manuel-lupo.github.io/tp-interfaces-g25/images/cubelogi.jpg" },
            { title: "Mind Grid", img: "https://manuel-lupo.github.io/tp-interfaces-g25/images/mindgrid.jpg" },
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
