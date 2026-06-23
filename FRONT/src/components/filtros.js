import { fetchPopulares, fetchBusqueda } from '../services/movieServices.js';
import { getTipo, setTipo, getGeneroId, setGeneroId, setPagina } from '../context/movieContext.js';
import cargarPeliculas from './cargarPeliculas.js';
import cargarBotonesGeneros from './cargarBotonesGeneros.js';

const filtroPelicula = document.getElementById('movie');
const filtroSerie = document.getElementById('tv');
const contenedorGeneros = document.getElementById('filtro-generos');
const btnBuscar = document.getElementById('btn-buscar');

filtroPelicula.addEventListener('click', async () => {
    setTipo('movie');
    setPagina(1);
    setGeneroId(null);
    cargarBotonesGeneros('movie');
    const resultados = await fetchPopulares('movie');
    cargarPeliculas(resultados);
    filtroSerie.classList.remove('btn--active');
    filtroPelicula.classList.add('btn--active');
    document.querySelector('#populares .main__titulo').innerText = 'Peliculas Populares';
    history.pushState({ pagina: 1, tipo: 'movie', generoId: null }, '', '?pagina=1');
});

filtroSerie.addEventListener('click', async () => {
    setTipo('tv');
    setPagina(1);
    setGeneroId(null);
    cargarBotonesGeneros('tv');
    const resultados = await fetchPopulares('tv');
    cargarPeliculas(resultados);
    filtroPelicula.classList.remove('btn--active');
    filtroSerie.classList.add('btn--active');
    document.querySelector('#populares .main__titulo').innerText = 'Series Populares';
    history.pushState({ pagina: 1, tipo: 'tv', generoId: null }, '', '?pagina=1');
});

contenedorGeneros.addEventListener('click', (e) => {
    if (e.target.closest('button')) {
        const botonActivo = contenedorGeneros.querySelector('.btn--active');
        if (botonActivo === e.target) {
            botonActivo.classList.remove('btn--active');
            setGeneroId(null);
        } else {
            botonActivo?.classList.remove('btn--active');
            e.target.classList.add('btn--active');
            setGeneroId(e.target.dataset.id);
        }
    }
});

btnBuscar.addEventListener('click', async () => {
    setPagina(1);
    const añoInicial = document.getElementById('años-min').value || 1950;
    const añoFinal = document.getElementById('años-max').value || 2025;
    const tipo = getTipo();
    const generoId = getGeneroId();
    const resultados = await fetchBusqueda({ tipo, pagina: 1, generoId, añoInicial, añoFinal });
    cargarPeliculas(resultados);
    history.pushState({ pagina: 1, tipo, generoId }, '', '?pagina=1');
});
