import { getTipo } from '../context/movieContext.js';

let indicadoresActivos = false;
let setFavs = new Set();
let setHist = new Set();
let setResenas = new Set();

export const setIndicadores = (favs, hist, resenas) => {
    indicadoresActivos = true;
    setFavs = new Set(favs);
    setHist = new Set(hist);
    setResenas = new Set(resenas);
};

const cargarPeliculas = (resultados = []) => {
    const contenedor = document.querySelector('#populares .main__grid');
    contenedor.innerHTML = '';
    const tipo = getTipo();

    resultados.forEach((resultado) => {
        const id = resultado.id;
        const poster = resultado.poster_path
            ? `<img class="main__media-img" src="https://image.tmdb.org/t/p/w500/${resultado.poster_path}" alt="${resultado.title || resultado.name}" loading="lazy" />`
            : `<div class="main__media-img main__media-placeholder"></div>`;

        const indicadores = indicadoresActivos ? `
            <div class="card__indicadores">
                <span class="card__ind card__ind--visto${setHist.has(id) ? ' card__ind--activo' : ''}">👁️</span>
                <span class="card__ind card__ind--resena${setResenas.has(id) ? ' card__ind--activo' : ''}">⭐</span>
                <span class="card__ind card__ind--fav${setFavs.has(id) ? ' card__ind--activo' : ''}">❤️</span>
            </div>` : '';

        contenedor.insertAdjacentHTML('beforeend', `
            <a class="main__media" href="./pelicula.html?id=${id}&tipo=${tipo}">
                <div class="main__media-thumb">${poster}</div>
                <p class="main__media-titulo">${resultado.title || resultado.name}</p>
                <p class="main__media-genero">${resultado.genero || ''}</p>
                ${indicadores}
            </a>
        `);
    });
};

export default cargarPeliculas;
