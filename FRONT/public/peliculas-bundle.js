'use strict';

const apiKey = "f7d9053e72bae73157a14fd0ad07e437";
const urlBase = "https://api.themoviedb.org/3";
const urlBack =window.location.hostname.includes('localhost')
  ? 'http://localhost:4000'
  : 'https://cinetrack-api-skea.onrender.com';

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

const fetchBusqueda = async ({ tipo = 'movie', pagina = 1, generoId = null, añoInicial = 1950, añoFinal = 2025 }) => {
    const generoParam = generoId ? `&with_genres=${generoId}` : '';
    let url;

    if (tipo === 'movie') {
        url = `${urlBase}/discover/movie?api_key=${apiKey}&include_adult=true&include_video=false&language=en-US&page=${pagina}&release_date.gte=${añoInicial}-01-01&release_date.lte=${añoFinal}-12-31&sort_by=popularity.desc${generoParam}&with_watch_monetization_types=flatrate`;
    } else {
        url = `${urlBase}/discover/tv?api_key=${apiKey}&include_adult=true&include_video=false&language=en-US&page=${pagina}&first_air_date.gte=${añoInicial}-01-01&first_air_date.lte=${añoFinal}-12-31&sort_by=popularity.desc${generoParam}&with_watch_monetization_types=flatrate`;
    }

    try {
        const res = await fetch(url);
        const datos = await res.json();
        const resultados = datos.results;
        const generos = await fetchGeneros(tipo);
        resultados.forEach((r) => {
            r.genero = obtenerGenero(r.genre_ids[0], generos);
        });
        return resultados;
    } catch (e) {
        console.log(e);
    }
};

const KEY = 'usuario';

const getUsuario = () => {
    const stored = localStorage.getItem(KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed._expira && Date.now() > parsed._expira) {
        localStorage.removeItem(KEY);
        return null;
    }
    const { _expira, ...usuario } = parsed;
    return usuario;
};

const estaLogueado = () => getUsuario() !== null;

const cerrarSesion = () => localStorage.removeItem(KEY);

// Llama esto desde cualquier servicio cuando la respuesta es 401/403 por token.
// Limpia la sesión local y redirige al login.
const manejarSesionExpirada = () => {
    localStorage.removeItem(KEY);
    window.location.href = './login.html';
};

const URL$2 = `${urlBack}/api/favoritos`;

const fetchAuth$2 = async (url, options = {}) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (res.status === 401) throw new Error('Sesión expirada');
    return res;
};

const getFavoritos = async () => {
    const res = await fetchAuth$2(URL$2);
    if (!res.ok) throw new Error('Error al obtener favoritos');
    return res.json();
};

const URL$1 = `${urlBack}/api/historial`;

const fetchAuth$1 = async (url, options = {}) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (res.status === 401) throw new Error('Sesión expirada');
    return res;
};

const getHistorial = async () => {
    const res = await fetchAuth$1(URL$1);
    if (!res.ok) throw new Error('Error al obtener historial');
    return res.json();
};

const URL = `${urlBack}/api/resenas`;

const getMisResenas = async () => {
    const res = await fetch(`${URL}/mis-resenas`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener mis reseñas');
    return res.json();
};

let estado = {
    tipo: 'movie',
    pagina: 1,
    generoId: null,
};

const getTipo = () => estado.tipo;
const setTipo = (tipo) => {
    estado.tipo = tipo;
    estado.pagina = 1;
    estado.generoId = null;
};

const getPagina = () => estado.pagina;
const setPagina = (pagina) => { estado.pagina = pagina; };

const getGeneroId = () => estado.generoId;
const setGeneroId = (id) => { estado.generoId = id; };

let indicadoresActivos = false;
let setFavs = new Set();
let setHist = new Set();
let setResenas = new Set();

const setIndicadores = (favs, hist, resenas) => {
    indicadoresActivos = true;
    setFavs = new Set(favs);
    setHist = new Set(hist);
    setResenas = new Set(resenas);
};

const cargarPeliculas = (resultados = []) => {
    const contenedor = document.querySelector('#populares .main__grid');
    contenedor.innerHTML = '';
    const tipo = getTipo();

    resultados.forEach((resultado) => {
        const id = resultado.id;
        const poster = resultado.poster_path
            ? `<img class="main__media-img" src="https://image.tmdb.org/t/p/w500/${resultado.poster_path}" alt="${resultado.title || resultado.name}" loading="lazy" />`
            : `<div class="main__media-img main__media-placeholder"></div>`;

        const indicadores = indicadoresActivos ? `
            <div class="card__indicadores">
                <span class="card__ind card__ind--visto${setHist.has(id) ? ' card__ind--activo' : ''}">👁️</span>
                <span class="card__ind card__ind--resena${setResenas.has(id) ? ' card__ind--activo' : ''}">⭐</span>
                <span class="card__ind card__ind--fav${setFavs.has(id) ? ' card__ind--activo' : ''}">❤️</span>
            </div>` : '';

        contenedor.insertAdjacentHTML('beforeend', `
            <a class="main__media" href="./pelicula.html?id=${id}&tipo=${tipo}">
                <div class="main__media-thumb">${poster}</div>
                <p class="main__media-titulo">${resultado.title || resultado.name}</p>
                <p class="main__media-genero">${resultado.genero || ''}</p>
                ${indicadores}
            </a>
        `);
    });
};

const contenedorGeneros$1 = document.getElementById('filtro-generos');

const cargarBotonesGeneros = async (tipo) => {
    contenedorGeneros$1.innerHTML = '';
    const generos = await fetchGeneros(tipo);
    generos.forEach((genero) => {
        const btn = document.createElement('button');
        btn.classList.add('btn');
        btn.innerText = genero.name;
        btn.setAttribute('data-id', genero.id);
        contenedorGeneros$1.appendChild(btn);
    });
};

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

const btnHamburguesa = document.getElementById('btn-hamburguesa');
const sidebar = document.getElementById('sidebar');

const overlay = document.createElement('div');
overlay.classList.add('sidebar-overlay');
document.body.appendChild(overlay);

btnHamburguesa.addEventListener('click', () => {
    btnHamburguesa.classList.toggle('hamburguesa--active');
    sidebar.classList.toggle('sidebar--active');
    overlay.classList.toggle('sidebar-overlay--active');
});

overlay.addEventListener('click', () => {
    btnHamburguesa.classList.remove('hamburguesa--active');
    sidebar.classList.remove('sidebar--active');
    overlay.classList.remove('sidebar-overlay--active');
});

document.getElementById('btn-buscar').addEventListener('click', () => {
    btnHamburguesa.classList.remove('hamburguesa--active');
    sidebar.classList.remove('sidebar--active');
    overlay.classList.remove('sidebar-overlay--active');
});

const URL_BACK = `${urlBack}/api/auth`;

const fetchAuth = async (url, options = {}, redirigirEnExpiry = true) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (res.status === 401 || res.status === 403) {
        const data = await res.json();
        const esTokenError = data.message?.toLowerCase().includes('token') ||
            data.message?.toLowerCase().includes('sesión') ||
            data.message?.toLowerCase().includes('acceso denegado');
        if (esTokenError && redirigirEnExpiry) manejarSesionExpirada();
        throw new Error(data.message || 'Sin autorización');
    }
    return res;
};

const logout = async () => {
    const res = await fetch(`${URL_BACK}/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    return res.json();
};

const getProfile = async () => {
    try {
        const res = await fetchAuth(`${URL_BACK}/profile`, {}, false);
        return res.json();
    } catch { return null; }
};

const renderNav = (authEl) => {
    if (estaLogueado()) {
        const u = getUsuario();
        authEl.innerHTML = `
            <div class="nav-app__dropdown" id="nav-dropdown">
                <button class="nav-app__user-btn" id="nav-user-btn">
                    <span class="nav-app__user-avatar">${u.nombre[0].toUpperCase()}</span>
                    <span class="nav-app__user-nombre">${u.nombre}</span>
                    <svg class="nav-app__caret" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                </button>
                <div class="nav-app__dropdown-menu" id="nav-dropdown-menu">
                    <a href="./index.html" class="nav-app__dropdown-item">Inicio</a>
                    <a href="./perfil.html" class="nav-app__dropdown-item">Mi Perfil</a>
                    <a href="./peliculas.html" class="nav-app__dropdown-item">Películas</a>
                    <div class="nav-app__dropdown-divider"></div>
                    <a href="./perfil.html#historial" class="nav-app__dropdown-item">Mi Historial</a>
                    <a href="./perfil.html#resenas" class="nav-app__dropdown-item">Mis Reseñas</a>
                    <a href="./perfil.html#listas" class="nav-app__dropdown-item">Mis Listas</a>
                    <div class="nav-app__dropdown-divider"></div>
                    <a href="./configuracion.html" class="nav-app__dropdown-item">Configuración</a>
                    ${u.isAdmin ? '<a href="./admin.html" class="nav-app__dropdown-item">Panel Admin</a>' : ''}
                    <div class="nav-app__dropdown-divider"></div>
                    <button class="nav-app__dropdown-item nav-app__dropdown-item--danger" id="nav-logout">Cerrar Sesión</button>
                </div>
            </div>
        `;

        document.getElementById('nav-user-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('nav-dropdown-menu').classList.toggle('nav-app__dropdown-menu--open');
        });

        document.getElementById('nav-logout').addEventListener('click', async () => {
            await logout();
            cerrarSesion();
            window.location.href = './landing.html';
        });

        document.addEventListener('click', () => {
            document.getElementById('nav-dropdown-menu')?.classList.remove('nav-app__dropdown-menu--open');
        });
    } else {
        authEl.innerHTML = `
            <a href="./login.html" class="btn">Iniciar Sesión</a>
            <a href="./register.html" class="btn btn--rojo">Crear Cuenta</a>
        `;
    }

    const pagina = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-app__link').forEach((link) => {
        const href = link.getAttribute('href').split('/').pop();
        if (href === pagina) link.classList.add('nav-app__link--activo');
    });
};

const iniciarNav = () => {
    const authEl = document.getElementById('nav-auth');
    if (!authEl) return;

    renderNav(authEl);

    if (estaLogueado()) {
        getProfile().then((perfil) => {
            if (!perfil) {
                cerrarSesion();
                renderNav(authEl);
            }
        });
    }
};

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
//# sourceMappingURL=peliculas-bundle.js.map
