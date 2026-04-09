import { apiKey, urlBase } from './apiConfig.js';

const fetchItems = async(id) => {

    const tipo = document.querySelector('.main__filtros .btn--active').id;

    try {

        const url = `${urlBase}/${tipo}/${id}?api_key=${apiKey}&language=es-ES`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        return datos;

    } catch (e) {
        console.log(e);
    }
}
export default fetchItems;