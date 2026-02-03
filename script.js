/************************************************
 * Movie Recommender - script.js
 * Random hero + recommendations + image timeout
 ************************************************/

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const FALLBACK_IMG =
    "https://via.placeholder.com/300x450?text=Image+Not+Found";
const IMAGE_TIMEOUT_MS = 1000;

let movies = [];
let recommendations = {};

// ---------------------------------------------
// Load JSONs
// ---------------------------------------------
Promise.all([
    fetch("data/movies.json").then(res => res.json()),
    fetch("data/recommendations.json").then(res => res.json())
])
    .then(([moviesData, recData]) => {
        movies = moviesData;
        recommendations = recData;

        populateDropdown();

        // 🎲 Random movie on load
        const randomMovie = getRandomMovie();
        document.getElementById("movieSelect").value = randomMovie.title;
        renderMainMovie(randomMovie);
    })
    .catch(err => console.error("Error loading JSON:", err));

// ---------------------------------------------
// Dropdown
// ---------------------------------------------
function populateDropdown() {
    const select = document.getElementById("movieSelect");
    select.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a movie";
    select.appendChild(placeholder);

    movies.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.title;
        opt.textContent = m.title;
        select.appendChild(opt);
    });
}

// ---------------------------------------------
// Random helper
// ---------------------------------------------
function getRandomMovie() {
    return movies[Math.floor(Math.random() * movies.length)];
}

// ---------------------------------------------
// Image loader with timeout
// ---------------------------------------------
function loadImage(img, src) {
    let timeoutHit = false;

    const timeout = setTimeout(() => {
        timeoutHit = true;
        img.src = FALLBACK_IMG;
    }, IMAGE_TIMEOUT_MS);

    img.onload = () => {
        if (!timeoutHit) clearTimeout(timeout);
    };

    img.onerror = () => {
        clearTimeout(timeout);
        img.src = FALLBACK_IMG;
    };

    img.src = src || FALLBACK_IMG;
}

// ---------------------------------------------
// Render main movie + recommendations
// ---------------------------------------------
function renderMainMovie(movie) {
    const hero = document.getElementById("hero");
    hero.innerHTML = "";

    const img = document.createElement("img");
    loadImage(
        img,
        movie.poster_path ? IMAGE_BASE + movie.poster_path : null
    );

    const content = document.createElement("div");
    content.className = "hero-content";

    const title = document.createElement("h3");
    title.textContent = movie.title;

    const overview = document.createElement("p");
    overview.textContent = movie.overview;

    content.appendChild(title);
    content.appendChild(overview);

    hero.appendChild(img);
    hero.appendChild(content);

    // Update section title
    const recTitle = document.getElementById("recTitle");
    if (recTitle) {
        recTitle.textContent = `If you liked ${movie.title}, you may also like`;
    }

    renderRecommendations(movie.title);
}

// ---------------------------------------------
// Render recommendation cards
// ---------------------------------------------
function renderRecommendations(movieTitle) {
    const container = document.getElementById("cards");
    container.innerHTML = "";

    if (!recommendations[movieTitle]) return;

    recommendations[movieTitle].forEach(rec => {
        const card = document.createElement("a");
        card.className = "card";
        card.href = "javascript:void(0)";
        card.onclick = (e) => {
            e.preventDefault();
            onCardClick(rec.title);
        };

        const img = document.createElement("img");
        loadImage(
            img,
            rec.poster_path ? IMAGE_BASE + rec.poster_path : null
        );

        card.appendChild(img);
        container.appendChild(card);
    });
}

// ---------------------------------------------
// Surprise Me handler
// ---------------------------------------------
function surpriseMe() {
    const randomMovie = getRandomMovie();
    // Update dropdown
    const select = document.getElementById("movieSelect");
    select.value = randomMovie.title;

    // Render
    renderMainMovie(randomMovie);
}

// ---------------------------------------------
// Card click handler
// ---------------------------------------------
function onCardClick(movieTitle) {
    // 1. Update dropdown
    const select = document.getElementById("movieSelect");
    select.value = movieTitle;

    // 2. Trigger update (same as if user selected it)
    showRecommendations();
}

// ---------------------------------------------
// Button/Select handler
// ---------------------------------------------
function showRecommendations() {
    const selected = document.getElementById("movieSelect").value;
    const movie = movies.find(m => m.title === selected);
    if (movie) renderMainMovie(movie);
}