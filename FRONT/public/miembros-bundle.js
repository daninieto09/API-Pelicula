'use strict';

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

const urlBack = `http://${window.location.hostname}:4000`;

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

const BASE$1 = `${urlBack}/api`;

const getMiembros = async (page = 1) => {
    const res = await fetch(`${BASE$1}/usuarios/miembros?page=${page}`);
    if (!res.ok) throw new Error('Error al obtener miembros');
    return res.json(); // { miembros: [...], total: n }
};

const BASE = `${urlBack}/api/social`;

const seguirUsuario = async (usuarioId) => {
    const res = await fetch(`${BASE}/seguir/${usuarioId}`, {
        method: 'POST',
        credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al seguir usuario');
    return json;
};

const dejarDeSeguir = async (usuarioId) => {
    const res = await fetch(`${BASE}/seguir/${usuarioId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al dejar de seguir');
    return json;
};

const getMisSeguidos = async () => {
    const res = await fetch(`${BASE}/mis-seguidos`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener seguidos');
    return res.json();
};

iniciarNav();

const grid = document.getElementById('miembros-grid');
const logueado = estaLogueado();
const usuario = logueado ? getUsuario() : null;
const seguidosIds = new Set();

const renderCard = (m) => {
    const esPropio = usuario?.id === m.id;
    const sigueAEste = !!(logueado && !esPropio && seguidosIds.has(m.id));
    return `
        <div class="miembro-card" data-uid="${m.id}">
            <div class="miembro-card__avatar">${m.nombre[0].toUpperCase()}</div>
            <p class="miembro-card__nombre">${m.nombre}</p>
            <div class="miembro-card__stats">
                <p class="miembro-card__stat"><span>${m.total_favoritos}</span> favoritos</p>
                <p class="miembro-card__stat"><span>${m.total_resenas}</span> reseñas</p>
                <p class="miembro-card__stat"><span>${m.total_listas}</span> listas</p>
                <p class="miembro-card__stat"><span>${m.total_seguidores}</span> seguidores</p>
            </div>
            ${logueado && !esPropio ? `
                <button class="miembro-card__btn-seguir${sigueAEste ? ' miembro-card__btn-seguir--siguiendo' : ''}"
                        data-uid="${m.id}" data-siguiendo="${sigueAEste}" type="button">
                    ${sigueAEste ? 'Siguiendo' : 'Seguir'}
                </button>
            ` : ''}
        </div>
    `;
};

const cargar = async () => {
    try {
        const [{ miembros }, seguidos] = await Promise.all([
            getMiembros(),
            logueado ? getMisSeguidos().catch(() => []) : Promise.resolve([]),
        ]);

        seguidos.forEach((s) => seguidosIds.add(s.siguiendoId));

        if (!miembros.length) {
            grid.innerHTML = '<p class="miembros__vacio">Aún no hay miembros.</p>';
            return;
        }

        grid.innerHTML = miembros.map(renderCard).join('');

        grid.querySelectorAll('.miembro-card').forEach((card) => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                if (e.target.closest('.miembro-card__btn-seguir')) return;
                window.location.href = `./perfil.html?id=${card.dataset.uid}`;
            });
        });

        if (logueado) {
            grid.querySelectorAll('.miembro-card__btn-seguir').forEach((btn) => {
                btn.addEventListener('click', async () => {
                    const uid = Number(btn.dataset.uid);
                    const siguiendo = btn.dataset.siguiendo === 'true';
                    btn.disabled = true;
                    try {
                        const card = btn.closest('.miembro-card');
                        const segSpan = card.querySelectorAll('.miembro-card__stat span')[3];
                        if (siguiendo) {
                            await dejarDeSeguir(uid);
                            seguidosIds.delete(uid);
                            btn.textContent = 'Seguir';
                            btn.dataset.siguiendo = 'false';
                            btn.classList.remove('miembro-card__btn-seguir--siguiendo');
                            segSpan.textContent = String(Math.max(0, (parseInt(segSpan.textContent) || 0) - 1));
                        } else {
                            await seguirUsuario(uid);
                            seguidosIds.add(uid);
                            btn.textContent = 'Siguiendo';
                            btn.dataset.siguiendo = 'true';
                            btn.classList.add('miembro-card__btn-seguir--siguiendo');
                            segSpan.textContent = String((parseInt(segSpan.textContent) || 0) + 1);
                        }
                    } catch (err) {
                        if (err.message?.includes('Ya sigues')) {
                            seguidosIds.add(uid);
                            btn.textContent = 'Siguiendo';
                            btn.dataset.siguiendo = 'true';
                            btn.classList.add('miembro-card__btn-seguir--siguiendo');
                        }
                    } finally {
                        btn.disabled = false;
                    }
                });
            });
        }
    } catch {
        grid.innerHTML = '<p class="miembros__vacio">Error al cargar miembros.</p>';
    }
};

cargar();
