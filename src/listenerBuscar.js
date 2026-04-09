import fetchBusqueda from "./fetchBusqueda";
import cargarPeliculas from "./cargarPeliculas";

const btnBuscar = document.getElementById('btn-buscar');
btnBuscar.addEventListener('click', async(e) => {

    const resultados = await fetchBusqueda();
    cargarPeliculas(resultados);
    
});