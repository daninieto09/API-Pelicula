import obtenerGenero from './obtenerGenero';
import fetchGeneros from './fetchGeneros';
import { apiKey, urlBase } from './apiConfig.js';
/**
 * Funcion que se encarga de hacer fetch para obtener las peliculas o series populares.
 * @param {String} filtro Si queremos cargar 'peliculas' o 'series'.
 */
const fetchPopulares = async (filtro = 'movie', pagina = 1) => {
	
	const tipo = filtro === 'movie' ? 'movie' : 'tv';
	const url = `${urlBase}/${tipo}/popular?api_key=${apiKey}&language=es&page=${pagina}`;
	const generos = await fetchGeneros(tipo);

	try {
		const respuesta = await fetch(url);
		const datos = await respuesta.json();
		const resultados = datos.results;//aqui(results) obtengo los resultados de la peticion, que es un array con las peliculas o series populares

		// Obtenemos el genero de cada resultado (peliculas o series) y lo agregamos al objeto de resultados.
		resultados.forEach((resultado) => {
			resultado.genero = obtenerGenero(resultado.genre_ids[0], generos);
		});

		return resultados;
	} catch (e) {
		console.log(e);
	}
};

export default fetchPopulares;