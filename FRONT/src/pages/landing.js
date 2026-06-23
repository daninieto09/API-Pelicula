import { fetchPopulares } from '../services/movieServices.js';
import { estaLogueado } from '../context/userContext.js';
import { iniciarNav } from '../components/navApp.js';

if (estaLogueado()) {
    window.location.href = './index.html';
}

iniciarNav();

const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original/';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w300/';

const cargarContenido = async () => {
    const [peliculas, series] = await Promise.all([
        fetchPopulares('movie'),
        fetchPopulares('tv'),
    ]);

    const todos = [...(peliculas || []), ...(series || [])];
    const conBackdrop = todos.filter((p) => p.backdrop_path);

    // Poblar slider con backdrop reales de TMDB
    const slides = document.querySelectorAll('.landing__hero-slide');
    conBackdrop.slice(0, slides.length).forEach((item, i) => {
        slides[i].style.backgroundImage = `url('${BACKDROP_BASE}${item.backdrop_path}')`;
    });

    // Poblar grid de posters
    const gridEl = document.getElementById('preview-grid');
    if (!gridEl) return;

    todos.filter((p) => p.poster_path).slice(0, 18).forEach((item) => {
        const titulo = (item.title || item.name || '').replace(/"/g, '&quot;');
        gridEl.insertAdjacentHTML('beforeend', `
            <div class="landing__poster-card">
                <img src="${POSTER_BASE}${item.poster_path}" alt="${titulo}" loading="lazy" />
                <div class="landing__poster-card__overlay"><span>${titulo}</span></div>
            </div>
        `);
    });
};

cargarContenido();
