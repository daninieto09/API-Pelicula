import { fetchGeneros } from '../services/movieServices.js';

const contenedorGeneros = document.getElementById('filtro-generos');

const cargarBotonesGeneros = async (tipo) => {
    contenedorGeneros.innerHTML = '';
    const generos = await fetchGeneros(tipo);
    generos.forEach((genero) => {
        const btn = document.createElement('button');
        btn.classList.add('btn');
        btn.innerText = genero.name;
        btn.setAttribute('data-id', genero.id);
        contenedorGeneros.appendChild(btn);
    });
};

export default cargarBotonesGeneros;
