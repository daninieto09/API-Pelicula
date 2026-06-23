import { estaLogueado, getUsuario } from '../context/userContext.js';
import { getProfile } from '../services/authServices.js';
import { getHistorial } from '../services/historialServices.js';
import { getFavoritos } from '../services/favoritosServices.js';
import { fetchPopulares } from '../services/movieServices.js';
import { iniciarNav } from '../components/navApp.js';

if (!estaLogueado()) {
    window.location.href = './landing.html';
}

iniciarNav();

const usuario = getUsuario();
const IMG = 'https://image.tmdb.org/t/p/w300/';

document.getElementById('inicio-nombre').textContent = usuario.nombre;

const cargarStats = async () => {
    const data = await getProfile();
    if (!data) return;
    document.getElementById('inicio-stat-historial').textContent = data.stats.historial;
    document.getElementById('inicio-stat-favoritos').textContent = data.stats.favoritos;
    document.getElementById('inicio-stat-resenas').textContent = data.stats.resenas;
    document.getElementById('inicio-stat-listas').textContent = data.stats.listas;
};

const posterCard = (poster, titulo, contenidoId, tipo) => {
    const href = contenidoId
        ? `./pelicula.html?id=${contenidoId}&tipo=${tipo || 'movie'}`
        : './peliculas.html';
    return `
        <div class="inicio__poster-card">
            <a href="${href}">
                <img src="${IMG}${poster}" alt="${titulo}" class="inicio__poster-img" loading="lazy" />
            </a>
            <p class="inicio__poster-titulo">${titulo}</p>
        </div>
    `;
};

const cargarHistorial = async () => {
    const el = document.getElementById('inicio-historial');
    try {
        const items = await getHistorial();
        if (!items.length) {
            el.innerHTML = '<p class="inicio__vacio">Aún no has visto nada. <a href="./peliculas.html">Explorar películas →</a></p>';
            return;
        }
        el.innerHTML = items.slice(0, 8).map((h) => posterCard(h.poster, h.titulo, h.contenidoId, h.tipo)).join('');
    } catch {
        el.innerHTML = '<p class="inicio__vacio">No se pudo cargar el historial.</p>';
    }
};

const cargarFavoritos = async () => {
    const el = document.getElementById('inicio-favoritos');
    try {
        const items = await getFavoritos();
        if (!items.length) {
            el.innerHTML = '<p class="inicio__vacio">No tienes favoritos aún. <a href="./peliculas.html">Agregar favoritos →</a></p>';
            return;
        }
        el.innerHTML = items.slice(0, 8).map((f) => posterCard(f.poster, f.titulo, f.contenidoId, f.tipo)).join('');
    } catch {
        el.innerHTML = '<p class="inicio__vacio">No se pudo cargar los favoritos.</p>';
    }
};

const cargarTendencias = async () => {
    const el = document.getElementById('inicio-tendencias');
    try {
        const items = await fetchPopulares('movie');
        if (!items) return;
        el.innerHTML = items.slice(0, 8).map((m) => posterCard(m.poster_path, m.title, m.id, 'movie')).join('');
    } catch {
        el.innerHTML = '';
    }
};

cargarStats();
cargarHistorial();
cargarFavoritos();
cargarTendencias();
