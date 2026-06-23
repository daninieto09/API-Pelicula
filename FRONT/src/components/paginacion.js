import { fetchBusqueda } from '../services/movieServices.js';
import { getTipo, setTipo, getPagina, setPagina, getGeneroId, setGeneroId } from '../context/movieContext.js';
import cargarPeliculas from './cargarPeliculas.js';

const anterior = document.getElementById('pagina-anterior');
const siguiente = document.getElementById('pagina-siguiente');

const getAnios = () => ({
    añoInicial: document.getElementById('años-min')?.value || 1950,
    añoFinal: document.getElementById('años-max')?.value || 2025,
});

const pushEstado = (pagina) => {
    history.pushState(
        { pagina, tipo: getTipo(), generoId: getGeneroId() },
        '',
        `?pagina=${pagina}`
    );
};

siguiente.addEventListener('click', async () => {
    const nuevaPagina = getPagina() + 1;
    const { añoInicial, añoFinal } = getAnios();
    const resultados = await fetchBusqueda({ tipo: getTipo(), pagina: nuevaPagina, generoId: getGeneroId(), añoInicial, añoFinal });
    setPagina(nuevaPagina);
    cargarPeliculas(resultados);
    pushEstado(nuevaPagina);
    window.scrollTo(0, 0);
});

anterior.addEventListener('click', async () => {
    const paginaActual = getPagina();
    if (paginaActual > 1) {
        const nuevaPagina = paginaActual - 1;
        const { añoInicial, añoFinal } = getAnios();
        const resultados = await fetchBusqueda({ tipo: getTipo(), pagina: nuevaPagina, generoId: getGeneroId(), añoInicial, añoFinal });
        setPagina(nuevaPagina);
        cargarPeliculas(resultados);
        pushEstado(nuevaPagina);
        window.scrollTo(0, 0);
    }
});

window.addEventListener('popstate', async (e) => {
    if (!e.state) return;
    const { pagina, tipo, generoId } = e.state;
    setTipo(tipo);
    setGeneroId(generoId);
    setPagina(pagina);
    const { añoInicial, añoFinal } = getAnios();
    const resultados = await fetchBusqueda({ tipo, pagina, generoId, añoInicial, añoFinal }).catch(() => []);
    cargarPeliculas(resultados);
    window.scrollTo(0, 0);
});
