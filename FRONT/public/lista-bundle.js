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

const URL = `${urlBack}/api/listas`;

const getListaDetalle = async (id) => {
    const res = await fetch(`${URL}/${id}`, { credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al obtener lista');
    return json;
};

const getContenidosLista = async (id) => {
    const res = await fetch(`${URL}/${id}/contenidos`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener contenidos');
    return res.json();
};

const quitarDeLista = async (listaId, contenidoId) => {
    const res = await fetch(`${URL}/${listaId}/contenidos/${contenidoId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Error al quitar de lista');
    return res.json();
};

const getComentariosLista = async (listaId) => {
    const res = await fetch(`${URL}/${listaId}/comentarios`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al obtener comentarios');
    return json; // { comentarios: [...], total: n }
};

const crearComentarioLista = async (listaId, comentario) => {
    const res = await fetch(`${URL}/${listaId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comentario }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al crear comentario');
    return json;
};

const eliminarComentarioLista = async (id) => {
    const res = await fetch(`${URL}/comentarios/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al eliminar comentario');
    return json;
};

const BASE = `${urlBack}/api`;

const darLike = async (tipo, referenciaId) => {
    const res = await fetch(`${BASE}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tipo, referenciaId }),
    });
    const data = await res.json();
    if (res.status === 409) return { liked: true }; // Ya existía, se considera OK
    if (!res.ok) throw new Error(data.message || 'Error al dar like');
    return data;
};

const quitarLike = async (tipo, referenciaId) => {
    const res = await fetch(`${BASE}/likes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tipo, referenciaId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al quitar like');
    return data;
};

const checkLike = async (tipo, referenciaId) => {
    const res = await fetch(`${BASE}/likes/check?tipo=${tipo}&referenciaId=${referenciaId}`, {
        credentials: 'include',
    });
    if (!res.ok) return { liked: false };
    return res.json();
};

const getLikeCount = async (tipo, referenciaId) => {
    const res = await fetch(`${BASE}/likes/count?tipo=${tipo}&referenciaId=${referenciaId}`);
    if (!res.ok) return { count: 0 };
    return res.json();
};

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

const params = new URLSearchParams(window.location.search);
const listaId = Number(params.get('id'));
const nombre = params.get('nombre') || 'Lista';

if (!listaId) window.location.href = './perfil.html#listas';

const logueado = estaLogueado();
const usuario = logueado ? getUsuario() : null;
const IMG = 'https://image.tmdb.org/t/p/w300/';

const fmtFecha = (iso) =>
    new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

document.getElementById('lista-nombre').textContent = nombre;
document.title = `${nombre} — CineTrack`;

let listaLiked = false;
let listaLikeCount = 0;

// ─── Botón ❤️ like de la lista ────────────────────────────────────
const renderBtnLikeLista = () => {
    const btn = document.getElementById('btn-like-lista');
    if (!btn) return;
    btn.className = `lista__btn-like${listaLiked ? ' lista__btn-like--activo' : ''}`;
    btn.innerHTML = `${listaLiked ? '❤️' : '🤍'} Me gusta${listaLikeCount > 0 ? ` <span class="lista__btn-like-count">${listaLikeCount}</span>` : ''}`;
};

const initBtnLikeLista = async (listaDetalle) => {
    if (!listaDetalle) return;

    try {
        const { count } = await getLikeCount('lista', listaId);
        listaLikeCount = count;
    } catch { listaLikeCount = 0; }

    if (logueado && listaDetalle.usuarioId !== usuario.id) {
        try {
            const { liked } = await checkLike('lista', listaId);
            listaLiked = liked;
        } catch { listaLiked = false; }
    }

    const header = document.querySelector('.lista__header');
    const btn = document.createElement('button');
    btn.id = 'btn-like-lista';
    btn.type = 'button';
    header.appendChild(btn);
    renderBtnLikeLista();

    if (!logueado || listaDetalle.usuarioId === usuario.id) {
        btn.disabled = true;
        return;
    }

    btn.addEventListener('click', async () => {
        const wasLiked = listaLiked;

        // Actualización optimista inmediata
        listaLiked = !wasLiked;
        listaLikeCount = wasLiked ? Math.max(0, listaLikeCount - 1) : listaLikeCount + 1;
        renderBtnLikeLista();

        btn.disabled = true;
        try {
            if (wasLiked) {
                await quitarLike('lista', listaId);
            } else {
                await darLike('lista', listaId);
            }
        } catch {
            // Revertir si falla
            listaLiked = wasLiked;
            listaLikeCount = wasLiked ? listaLikeCount + 1 : Math.max(0, listaLikeCount - 1);
            renderBtnLikeLista();
        } finally {
            btn.disabled = false;
        }
    });
};

// ─── Comentarios ──────────────────────────────────────────────────
const renderComentariosLista = (comentarios) => {
    const listEl = document.getElementById('comentarios-lista-items');
    if (!listEl) return;
    if (!comentarios.length) {
        listEl.innerHTML = '<p class="lista__comentarios-vacio">Sin comentarios aún.</p>';
        return;
    }
    listEl.innerHTML = comentarios.map((c) => `
        <div class="lista__comentario" data-id="${c.id}">
            <div class="lista__comentario-avatar">${(c.usuario?.nombre || '?')[0].toUpperCase()}</div>
            <div class="lista__comentario-cuerpo">
                <div class="lista__comentario-meta">
                    <span class="lista__comentario-autor">${c.usuario?.nombre || 'Usuario'}</span>
                    <span class="lista__comentario-fecha">${fmtFecha(c.createdAt)}</span>
                    ${usuario && c.usuario?.id === usuario.id
                        ? `<button class="lista__comentario-btn-del" data-id="${c.id}" type="button">Eliminar</button>`
                        : ''}
                </div>
                <p class="lista__comentario-texto">${c.comentario}</p>
            </div>
        </div>
    `).join('');

    listEl.querySelectorAll('.lista__comentario-btn-del').forEach((btn) => {
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            try {
                await eliminarComentarioLista(Number(btn.dataset.id));
                const { comentarios: fresh } = await getComentariosLista(listaId);
                renderComentariosLista(fresh);
            } catch { btn.disabled = false; }
        });
    });
};

const initComentarios = async () => {
    const main = document.querySelector('.lista');

    const formHtml = logueado ? `
        <form class="lista__comentario-form" id="form-comentario-lista">
            <textarea class="lista__comentario-textarea" id="input-comentario-lista"
                      placeholder="Escribe un comentario..." maxlength="500" rows="3"></textarea>
            <div class="lista__comentario-form-footer">
                <span class="lista__comentario-chars" id="chars-comentario-lista">0/500</span>
                <button class="btn btn--rojo" type="submit">Enviar</button>
            </div>
            <p class="lista__comentario-msg" id="msg-comentario-lista"></p>
        </form>
    ` : '<p class="lista__comentarios-hint"><a href="./login.html">Inicia sesión</a> para comentar.</p>';

    main.insertAdjacentHTML('beforeend', `
        <section class="lista__comentarios-seccion">
            <p class="lista__comentarios-titulo">Comentarios</p>
            <div id="comentarios-lista-items"></div>
            ${formHtml}
        </section>
    `);

    const { comentarios } = await getComentariosLista(listaId).catch(() => ({ comentarios: [] }));
    renderComentariosLista(comentarios);

    if (!logueado) return;

    const textarea = document.getElementById('input-comentario-lista');
    const charsEl = document.getElementById('chars-comentario-lista');

    textarea.addEventListener('input', () => {
        charsEl.textContent = `${textarea.value.length}/500`;
    });

    document.getElementById('form-comentario-lista').addEventListener('submit', async (e) => {
        e.preventDefault();
        const texto = textarea.value.trim();
        const msgEl = document.getElementById('msg-comentario-lista');
        if (!texto) return;
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        try {
            await crearComentarioLista(listaId, texto);
            textarea.value = '';
            charsEl.textContent = '0/500';
            msgEl.textContent = '';
            const { comentarios: fresh } = await getComentariosLista(listaId);
            renderComentariosLista(fresh);
        } catch (err) {
            msgEl.textContent = err.message || 'Error al publicar.';
            msgEl.className = 'lista__comentario-msg lista__comentario-msg--error';
        } finally {
            btn.disabled = false;
        }
    });
};

// ─── Contenidos ───────────────────────────────────────────────────
const cargarContenidos = async (esPropietario = false, autor = null) => {
    const el = document.getElementById('lista-contenidos');
    try {
        const items = await getContenidosLista(listaId);
        const countEl = document.getElementById('lista-count');
        const countText = `${items.length} título${items.length !== 1 ? 's' : ''}`;
        if (autor) {
            countEl.innerHTML = `${countText} · <a class="lista__autor-link" href="./perfil.html?id=${autor.id}">${autor.nombre}</a>`;
        } else {
            countEl.textContent = countText;
        }

        if (!items.length) {
            el.innerHTML = `
                <p class="lista__vacio">Esta lista está vacía.</p>
                ${esPropietario ? `<a href="./peliculas.html" class="btn btn--rojo lista__btn-anadir">＋ Añadir películas y series</a>` : ''}
            `;
            return;
        }

        el.innerHTML = `<div class="lista__grid">${items.map((item) => `
            <div class="lista__card">
                <a href="./pelicula.html?id=${item.contenidoId}&tipo=${item.tipo}" class="lista__card-link">
                    ${item.poster
                        ? `<img src="${IMG}${item.poster}" alt="${item.titulo}" class="lista__card-poster" loading="lazy" />`
                        : `<div class="lista__card-poster lista__card-poster--empty"></div>`
                    }
                    <div class="lista__card-info">
                        <p class="lista__card-titulo">${item.titulo}</p>
                        <p class="lista__card-tipo">${item.tipo === 'movie' ? 'Película' : 'Serie'}</p>
                    </div>
                </a>
                ${esPropietario ? `<button class="lista__card-btn-quitar" data-id="${item.contenidoId}" title="Quitar de la lista">✕</button>` : ''}
            </div>
        `).join('')}</div>`;

        if (esPropietario) {
            el.querySelectorAll('.lista__card-btn-quitar').forEach((btn) => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    btn.disabled = true;
                    try {
                        await quitarDeLista(listaId, Number(btn.dataset.id));
                        cargarContenidos(esPropietario, autor);
                    } catch { btn.disabled = false; }
                });
            });
        }
    } catch {
        el.innerHTML = '<p class="lista__vacio">Error al cargar la lista.</p>';
    }
};

// ─── Init ─────────────────────────────────────────────────────────
const init = async () => {
    let listaDetalle = null;
    try { listaDetalle = await getListaDetalle(listaId); } catch { }

    const esPropietario = !!(logueado && usuario && listaDetalle?.usuarioId === usuario.id);
    const autor = (!esPropietario && listaDetalle?.usuario) ? listaDetalle.usuario : null;

    await cargarContenidos(esPropietario, autor);
    await initBtnLikeLista(listaDetalle);
    await initComentarios();
};

init();
