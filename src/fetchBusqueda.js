import { apiKey, urlBase } from './apiConfig.js';
import fetchGeneros from './fetchGeneros';
import obtenerGenero from './obtenerGenero';

const fetchBusqueda = async (pagina = 1) => {
    const tipo = document.querySelector('.main__filtros .btn--active').id;//no pongo directamente el hashtag id dentro porque son 2 diferentes (pelicula-serie), y el .id por como lo muestra en el cosole del navegador de la pagina de peliculas, y el id es el tipo de busqueda, ya sea movie o tv, entonces con eso se hace la busqueda de peliculas o series dependiendo del tipo seleccionado
    const idGenero = document.querySelector('#filtro-generos .btn--active')?.dataset.id;//segun vi en el navegador de la pagina de peliculas esta el data para acceder a estos ids, aqui como son varios ids de generos, uso el dataset para obtener el id del genero seleccionado, y el ? es para evitar errores y preguntar si el seleccionado corresponde a ese genero y si no se selecciona ningun genero, se evita ese error y simplemente devuelve undefined si no se selecciona ningun genero
    const generoParam = idGenero ? `&with_genres=${idGenero}` : '';//esta condicinoal para agregar el parametro de genero a la url solo si se selecciona un genero, si no se selecciona ningun genero, entonces el parametro de genero no se agrega a la url y se hace la busqueda sin filtrar por genero
    const añoInicial = document.getElementById('años-min').value || 1950;//cuando es input se usa el value
    const añoFinal = document.getElementById('años-max').value || 2025;//cuando es input se usa el value
    let url;

    if (tipo === 'movie') {
        url = `${urlBase}/discover/movie?api_key=${apiKey}&include_adult=true&include_video=false&language=en-US&page=${pagina}&release_date.gte=${añoInicial}-01-01&release_date.lte=${añoFinal}-12-31&sort_by=popularity.desc&${generoParam}&with_watch_monetization_types=flatrate`;
    }else if(tipo === 'tv'){
        url = `${urlBase}/discover/tv?api_key=${apiKey}&include_adult=true&include_video=false&language=en-US&page=${pagina}&first_air_date.gte=${añoInicial}-01-01&first_air_date.lte=${añoFinal}-12-31&sort_by=popularity.desc&${generoParam}&with_watch_monetization_types=flatrate`;
    }
    
    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        const resultados = datos.results;
        
        const generos = await fetchGeneros(tipo);
        resultados.forEach((resultado) => {
			resultado.genero = obtenerGenero(resultado.genre_ids[0], generos);
		});
        return resultados;
    } catch (e) {
        console.log(e);
    }
}

export default fetchBusqueda;