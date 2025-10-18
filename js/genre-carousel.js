document.addEventListener("DOMContentLoaded", () => {
    const genres = {
        accion: [
            { title: "Cyber Strike", img: "./images/cyberstrike.jpg" },
            { title: "Battle Pulse", img: "./images/battlepulse.jpg" },
            { title: "Rogue Core", img: "./images/roguecore.jpg" },
        ],
        aventura: [
            { title: "Mystic Valley", img: "./images/misticvalley.jpg" },
            { title: "Lost Tales", img: "./images/losttales.jpg" },
            { title: "Cave Whisper", img: "./images/cavewhisper.jpg" },
        ],
        deportes: [
            { title: "Goal Rush", img: "./images/goalrush.jpg" },
            { title: "Skate Arena", img: "./images/skatearena.jpg" },
            { title: "Top Spin", img: "./images/topspin.jpg" },
        ],
        puzzle: [
            { title: "Brainstorm", img: "./images/brainstorm.jpg" },
            { title: "Cube Logic", img: "./images/cubelogi.jpg" },
            { title: "Mind Grid", img: "./images/mindgrid.jpg" },
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
