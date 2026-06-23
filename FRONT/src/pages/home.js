import { fetchPopulares } from '../services/movieServices.js';
import cargarPeliculas from '../components/cargarPeliculas.js';
import cargarBotonesGeneros from '../components/cargarBotonesGeneros.js';
import '../components/filtros.js';
import '../components/paginacion.js';
import '../components/popup.js';
import '../components/hamburguesa.js';
import { iniciarNav } from '../components/navApp.js';

iniciarNav();

const cargar = async () => {
    const peliculas = await fetchPopulares('movie');
    if (peliculas) cargarPeliculas(peliculas);
};

cargar();
cargarBotonesGeneros('movie');
