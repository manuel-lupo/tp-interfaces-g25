document.addEventListener("DOMContentLoaded", () => {
    const genres = {
        accion: [
            { title: "Cyber Strike", img: "../images/cyberstrike.jpg" },
            { title: "Battle Pulse", img: "../images/battlepulse.jpg" },
            { title: "Rogue Core", img: "../images/roguecore.jpg" },
        ],
        aventura: [
            { title: "Mystic Valley", img: "../images/misticvalley.jpg" },
            { title: "Lost Tales", img: "../images/losttales.jpg" },
            { title: "Cave Whisper", img: "../images/cavewhisper.jpg" },
        ],
        deportes: [
            { title: "Goal Rush", img: "../images/goalrush.jpg" },
            { title: "Skate Arena", img: "../images/skatearena.jpg" },
            { title: "Top Spin", img: "../images/topspin.jpg" },
        ],
        puzzle: [
            { title: "Brainstorm", img: "../images/brainstorm.jpg" },
            { title: "Cube Logic", img: "../images/cubelogi.jpg" },
            { title: "Mind Grid", img: "../images/mindgrid.jpg" },
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

    // Controles de scroll horizontal (juegos)
    document.querySelector(".game-nav.next").addEventListener("click", () => {
        const total = genres[currentGenre].length;
        if (currentIndex < total - 3) {
            currentIndex++;
            track.style.transform = `translateX(-${currentIndex * (100 / 3)}%)`;
        }
    });

    document.querySelector(".game-nav.prev").addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            track.style.transform = `translateX(-${currentIndex * (100 / 3)}%)`;
        }
    });

    // Navegación vertical de géneros
    const genreList = document.querySelector(".genre-list");
    const upBtn = document.querySelector(".genre-nav.up");
    const downBtn = document.querySelector(".genre-nav.down");

    let scrollPos = 0;
    const step = 60;

    upBtn.addEventListener("click", () => {
        scrollPos = Math.max(scrollPos - step, 0);
        genreList.scrollTo({ top: scrollPos, behavior: "smooth" });
    });

    downBtn.addEventListener("click", () => {
        scrollPos = Math.min(scrollPos + step, genreList.scrollHeight);
        genreList.scrollTo({ top: scrollPos, behavior: "smooth" });
    });
});
