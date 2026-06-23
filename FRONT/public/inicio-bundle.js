'use strict';

const KEY = 'usuario';

const getUsuario = () => {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : null;
};

const estaLogueado = () => getUsuario() !== null;

const cerrarSesion = () => localStorage.removeItem(KEY);

// Llama esto desde cualquier servicio cuando la respuesta es 401/403 por token.
// Limpia la sesión local y redirige al login.
const manejarSesionExpirada = () => {
    localStorage.removeItem(KEY);
    window.location.href = './login.html';
};

const apiKey = "f7d9053e72bae73157a14fd0ad07e437";
const urlBase = "https://api.themoviedb.org/3";
const urlBack = `http://${window.location.hostname}:4000`;

const URL_BACK = `${urlBack}/api/auth`;

const fetchAuth$2 = async (url, options = {}, redirigirEnExpiry = true) => {
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
        const res = await fetchAuth$2(`${URL_BACK}/profile`, {}, false);
        return res.json();
    } catch { return null; }
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

const URL = `${urlBack}/api/favoritos`;

const fetchAuth = async (url, options = {}) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (res.status === 401) throw new Error('Sesión expirada');
    return res;
};

const getFavoritos = async () => {
    const res = await fetchAuth(URL);
    if (!res.ok) throw new Error('Error al obtener favoritos');
    return res.json();
};

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

const iniciarNav = () => {
    const authEl = document.getElementById('nav-auth');
    if (!authEl) return;

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

if (!estaLogueado()) {
    window.location.href = './landing.html';
}

iniciarNav();

const usuario = getUsuario();
const IMG = 'https://image.tmdb.org/t/p/w300/';

document.getElementById('inicio-nombre').textContent = usuario.nombre;

const cargarStats = async () => {
    const data = await getProfile();
    if (!data) return;
    document.getElementById('inicio-stat-historial').textContent = data.stats.historial;
    document.getElementById('inicio-stat-favoritos').textContent = data.stats.favoritos;
    document.getElementById('inicio-stat-resenas').textContent = data.stats.resenas;
    document.getElementById('inicio-stat-listas').textContent = data.stats.listas;
};

const posterCard = (poster, titulo, contenidoId, tipo) => {
    const href = contenidoId
        ? `./pelicula.html?id=${contenidoId}&tipo=${tipo || 'movie'}`
        : './peliculas.html';
    return `
        <div class="inicio__poster-card">
            <a href="${href}">
                <img src="${IMG}${poster}" alt="${titulo}" class="inicio__poster-img" loading="lazy" />
            </a>
            <p class="inicio__poster-titulo">${titulo}</p>
        </div>
    `;
};

const cargarHistorial = async () => {
    const el = document.getElementById('inicio-historial');
    try {
        const items = await getHistorial();
        if (!items.length) {
            el.innerHTML = '<p class="inicio__vacio">Aún no has visto nada. <a href="./peliculas.html">Explorar películas →</a></p>';
            return;
        }
        el.innerHTML = items.slice(0, 8).map((h) => posterCard(h.poster, h.titulo, h.contenidoId, h.tipo)).join('');
    } catch {
        el.innerHTML = '<p class="inicio__vacio">No se pudo cargar el historial.</p>';
    }
};

const cargarFavoritos = async () => {
    const el = document.getElementById('inicio-favoritos');
    try {
        const items = await getFavoritos();
        if (!items.length) {
            el.innerHTML = '<p class="inicio__vacio">No tienes favoritos aún. <a href="./peliculas.html">Agregar favoritos →</a></p>';
            return;
        }
        el.innerHTML = items.slice(0, 8).map((f) => posterCard(f.poster, f.titulo, f.contenidoId, f.tipo)).join('');
    } catch {
        el.innerHTML = '<p class="inicio__vacio">No se pudo cargar los favoritos.</p>';
    }
};

const cargarTendencias = async () => {
    const el = document.getElementById('inicio-tendencias');
    try {
        const items = await fetchPopulares('movie');
        if (!items) return;
        el.innerHTML = items.slice(0, 8).map((m) => posterCard(m.poster_path, m.title, m.id, 'movie')).join('');
    } catch {
        el.innerHTML = '';
    }
};

cargarStats();
cargarHistorial();
cargarFavoritos();
cargarTendencias();
//# sourceMappingURL=inicio-bundle.js.map
