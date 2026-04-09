import fetchPopulares from './fetchPopulares'; //hago la peticion de la API de todas las peliculas y series de ahora del momento
import cargarPeliculas from './cargarPeliculas';//Aqui recibo las peliculas y series con sus caracteristicas
import cargarBotonesGeneros from './cargarBotonesGeneros';
import fetchItems from './fetchItems';
import './listenerFiltroTipo';
import './listenerFiltroGenero';
import './listenerBuscar';	
import './paginacion';
import './listenerItems';
import './listenerCerrarPopup';
import './hamburguesa';

const cargar = async () => {
	// Obtenemos los resultados.
	const fetchGeneralPeliculas = await fetchPopulares('movie');

	if (fetchGeneralPeliculas) {
		// Lo cargo en el DOM.
		cargarPeliculas(fetchGeneralPeliculas);
	}
};

cargar();//al ser una funcion llamo las peliculas
cargarBotonesGeneros('movie');//aqui llamo los generos de peliculas para que se muestren en la barra lateral izquierda, y luego cuando se haga click en el filtro de series, se llamaran los generos de series para que se muestren en la barra lateral izquierda