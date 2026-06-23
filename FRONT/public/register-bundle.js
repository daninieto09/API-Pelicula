'use strict';

const URL_BACK = 'http://localhost:4000/api/auth';

const register = async (nombre, email, password) => {
    const res = await fetch(`${URL_BACK}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al registrarse');
    return data;
};

const apiKey = "f7d9053e72bae73157a14fd0ad07e437";
const urlBase = "https://api.themoviedb.org/3";

const obtenerGenero = (id, generos) => {
    let genero;
    generos.forEach((elemento) => {
        if (id === elemento.id) {
            genero = elemento.name;
        }
    });
    return genero;
};

const fetchGeneros = async (tipo = 'movie') => {
    const url = `${urlBase}/genre/${tipo}/list?api_key=${apiKey}&language=es`;
    try {
        const res = await fetch(url);
        const datos = await res.json();
        return datos.genres;
    } catch (e) {
        console.log(e);
    }
};

const fetchPopulares = async (tipo = 'movie', pagina = 1) => {
    const url = `${urlBase}/${tipo}/popular?api_key=${apiKey}&language=es&page=${pagina}`;
    const generos = await fetchGeneros(tipo);
    try {
        const res = await fetch(url);
        const datos = await res.json();
        const resultados = datos.results;
        resultados.forEach((r) => {
            r.genero = obtenerGenero(r.genre_ids[0], generos);
        });
        return resultados;
    } catch (e) {
        console.log(e);
    }
};

const setUsuario = (data) => { };

const cargarFondo = async () => {
    const [peliculas, series] = await Promise.all([
        fetchPopulares('movie'),
        fetchPopulares('tv'),
    ]);

    const todos = [...peliculas, ...series].filter((p) => p.poster_path);
    const chunk = Math.ceil(todos.length / 3);

    [todos.slice(0, chunk), todos.slice(chunk, chunk * 2), todos.slice(chunk * 2)].forEach((items, i) => {
        const el = document.getElementById(`fila-${i + 1}`);
        const html = items.map((item) =>
            `<img src="https://image.tmdb.org/t/p/w300/${item.poster_path}" alt="" class="bg-poster" />`
        ).join('');
        el.innerHTML = html + html;
    });
};

cargarFondo();

const form = document.getElementById('form-register');
const errorEl = document.getElementById('auth-error');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmar = document.getElementById('confirmar-password').value;

    errorEl.textContent = '';

    if (password !== confirmar) {
        errorEl.textContent = 'Las contraseñas no coinciden';
        return;
    }

    try {
        const data = await register(nombre, email, password);
        setUsuario(data.usuario);
        window.location.href = './index.html';
    } catch (error) {
        errorEl.textContent = error.message;
    }
});
//# sourceMappingURL=register-bundle.js.map
