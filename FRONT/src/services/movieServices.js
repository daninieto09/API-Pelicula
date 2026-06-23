import { apiKey, urlBase } from '../utils/apiConfig.js';
import obtenerGenero from '../utils/obtenerGenero.js';

export const fetchGeneros = async (tipo = 'movie') => {
    const url = `${urlBase}/genre/${tipo}/list?api_key=${apiKey}&language=es`;
    try {
        const res = await fetch(url);
        const datos = await res.json();
        return datos.genres;
    } catch (e) {
        console.log(e);
    }
};

export const fetchPopulares = async (tipo = 'movie', pagina = 1) => {
    const url = `${urlBase}/${tipo}/popular?api_key=${apiKey}&language=es&page=${pagina}`;
    const generos = await fetchGeneros(tipo);
    try {
        const res = await fetch(url);
        const datos = await res.json();
        const resultados = datos.results;
        resultados.forEach((r) => {
            r.genero = obtenerGenero(r.genre_ids[0], generos);
        });
        return resultados;
    } catch (e) {
        console.log(e);
    }
};

export const fetchBusqueda = async ({ tipo = 'movie', pagina = 1, generoId = null, añoInicial = 1950, añoFinal = 2025 }) => {
    const generoParam = generoId ? `&with_genres=${generoId}` : '';
    let url;

    if (tipo === 'movie') {
        url = `${urlBase}/discover/movie?api_key=${apiKey}&include_adult=true&include_video=false&language=en-US&page=${pagina}&release_date.gte=${añoInicial}-01-01&release_date.lte=${añoFinal}-12-31&sort_by=popularity.desc${generoParam}&with_watch_monetization_types=flatrate`;
    } else {
        url = `${urlBase}/discover/tv?api_key=${apiKey}&include_adult=true&include_video=false&language=en-US&page=${pagina}&first_air_date.gte=${añoInicial}-01-01&first_air_date.lte=${añoFinal}-12-31&sort_by=popularity.desc${generoParam}&with_watch_monetization_types=flatrate`;
    }

    try {
        const res = await fetch(url);
        const datos = await res.json();
        const resultados = datos.results;
        const generos = await fetchGeneros(tipo);
        resultados.forEach((r) => {
            r.genero = obtenerGenero(r.genre_ids[0], generos);
        });
        return resultados;
    } catch (e) {
        console.log(e);
    }
};

export const fetchItem = async (tipo, id) => {
    try {
        const url = `${urlBase}/${tipo}/${id}?api_key=${apiKey}&language=es-ES`;
        const res = await fetch(url);
        return await res.json();
    } catch (e) {
        console.log(e);
    }
};
