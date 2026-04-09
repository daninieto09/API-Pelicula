import fetchPopulares from './fetchPopulares';
import cargarPeliculas from './cargarPeliculas';
import cargarBotonesGeneros from './cargarBotonesGeneros';

const filtroPelicula = document.getElementById('movie');
const filtroShow = document.getElementById('tv');

filtroPelicula.addEventListener('click', async (e) => {
	e.preventDefault();
	// Cargamos los generos en la barra lateral.
	cargarBotonesGeneros('movie');

	// Obtenemos los resultados.
	const resultados = await fetchPopulares('movie');//aqui mediante el fitro cargo en la parte lateral derecha los generos de las peliculas populares que se muestran en el DOM, y luego cuando se haga click en el filtro de series, se cargaran los generos de las series populares que se muestran en el DOM

	// Los cargamos en el DOM.
	cargarPeliculas(resultados);

	filtroShow.classList.remove('btn--active');
	filtroPelicula.classList.add('btn--active');
	document.querySelector('#populares .main__titulo').innerText = 'Peliculas Populares';
});

filtroShow.addEventListener('click', async (e) => {
	e.preventDefault();
	// Cargamos los generos de la barra lateral.
	cargarBotonesGeneros('tv');

	// Obtenemos los resultados.
	const respuestaSeries = await fetchPopulares('tv');//aqui mediante el fitro cargo en la parte lateral derecha los generos de las series populares que se muestran en el DOM, y luego cuando se haga click en el filtro de peliculas, se cargaran los generos de las peliculas populares que se muestran en el DOM

	// Los cargamos en el DOM.
	cargarPeliculas(respuestaSeries);

	filtroPelicula.classList.remove('btn--active');
	filtroShow.classList.add('btn--active');
	document.querySelector('#populares .main__titulo').innerText = 'Series Populares';
});