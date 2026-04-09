import { apiKey, urlBase } from './apiConfig.js';
//aqui lo que hace la funcion es retornar todos los generos en general dependiendo si son de peliculas o series mediante el filtro, similar a la funcion de fetchPopulares, pero esta funcion lo que hace es retornar los generos en general, y luego en la funcion de fetchPopulares lo que hago es que obtengo el genero de cada pelicula o serie y lo agrego al objeto de resultados, para luego mostrarlo en el DOM
const fetchGeneros = async (filtro = 'movie') => {
	
	const tipo = filtro === 'movie' ? 'movie' : 'tv';
	const url = `${urlBase}/genre/${tipo}/list?api_key=${apiKey}&language=es`;

	try {
		const resultados = await fetch(url);
		const datos = await resultados.json();		
		return datos.genres;//aqui(genres) obtengo los generos de la peticion, que es un array con los generos de peliculas o series dependiendo del filtro
	} catch (e) {
		console.log(e);
	}
};

export default fetchGeneros;