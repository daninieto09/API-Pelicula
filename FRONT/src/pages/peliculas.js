import { fetchPopulares } from '../services/movieServices.js';
import { estaLogueado } from '../context/userContext.js';
import { getFavoritos } from '../services/favoritosServices.js';
import { getHistorial } from '../services/historialServices.js';
import { getMisResenas } from '../services/resenasServices.js';
import cargarPeliculas, { setIndicadores } from '../components/cargarPeliculas.js';
import cargarBotonesGeneros from '../components/cargarBotonesGeneros.js';
import '../components/filtros.js';
import '../components/paginacion.js';
import '../components/hamburguesa.js';
import { iniciarNav } from '../components/navApp.js';

iniciarNav();

const init = async () => {
    const tareas = [fetchPopulares('movie')];

    if (estaLogueado()) {
        tareas.push(
            Promise.all([getFavoritos(), getHistorial(), getMisResenas()])
                .then(([favs, hist, res]) => setIndicadores(
                    favs.map((f) => f.contenidoId),
                    hist.map((h) => h.contenidoId),
                    res.map((r) => r.contenidoId),
                ))
                .catch(() => {})
        );
    }

    const [peliculas] = await Promise.all(tareas);
    if (peliculas) cargarPeliculas(peliculas);
};

init();
cargarBotonesGeneros('movie');
