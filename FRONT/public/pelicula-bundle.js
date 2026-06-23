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

const apiKey = "f7d9053e72bae73157a14fd0ad07e437";
const urlBase = "https://api.themoviedb.org/3";
const urlBack = `http://${window.location.hostname}:4000`;

const fetchItem = async (tipo, id) => {
    try {
        const url = `${urlBase}/${tipo}/${id}?api_key=${apiKey}&language=es-ES`;
        const res = await fetch(url);
        return await res.json();
    } catch (e) {
        console.log(e);
    }
};

const BASE$2 = `${urlBack}/api`;

const getContenidoStats = async (contenidoId) => {
    const res = await fetch(`${BASE$2}/peliculas/stats/${contenidoId}`);
    if (!res.ok) throw new Error('Error al obtener estadísticas');
    const json = await res.json();
    return json.stats; // { contenidoId, favoritos_count, resenas_count, vistos_count, calificacion_promedio }
};

const URL$3 = `${urlBack}/api/resenas`;

const getResenasContenido = async (contenidoId, tipo) => {
    const res = await fetch(`${URL$3}?contenidoId=${contenidoId}&tipo=${tipo}`);
    if (!res.ok) throw new Error('Error al obtener reseñas');
    return res.json();
};

const crearResena = async (data) => {
    const res = await fetch(URL$3, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al crear reseña');
    return json;
};

const actualizarResena = async (id, data) => {
    const res = await fetch(`${URL$3}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al actualizar reseña');
    return json;
};

const eliminarResena = async (id) => {
    const res = await fetch(`${URL$3}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Error al eliminar reseña');
    return res.json();
};

const getComentarios = async (resenaId) => {
    const res = await fetch(`${URL$3}/${resenaId}/comentarios`);
    if (!res.ok) throw new Error('Error al obtener comentarios');
    const json = await res.json();
    return json.comentarios;
};

const crearComentario = async (resenaId, comentario) => {
    const res = await fetch(`${URL$3}/${resenaId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comentario }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al crear comentario');
    return json;
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

const agregarFavorito = async (data) => {
    const res = await fetchAuth$2(URL$2, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al agregar favorito');
    return json;
};

const eliminarFavorito = async (id) => {
    const res = await fetchAuth$2(`${URL$2}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar favorito');
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

const registrarVista = async (data) => {
    const res = await fetchAuth$1(URL$1, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al registrar vista');
    return json;
};

const eliminarHistorial = async (id) => {
    const res = await fetchAuth$1(`${URL$1}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar del historial');
    return res.json();
};

const URL = `${urlBack}/api/listas`;

const getListas = async () => {
    const res = await fetch(URL, { credentials: 'include' });
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(`${res.status}: ${json.message || 'Error al obtener listas'}`);
    }
    return res.json();
};

const agregarALista = async (listaId, data) => {
    const res = await fetch(`${URL}/${listaId}/contenidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al agregar a lista');
    return json;
};

const BASE$1 = `${urlBack}/api/social`;

const seguirUsuario = async (usuarioId) => {
    const res = await fetch(`${BASE$1}/seguir/${usuarioId}`, {
        method: 'POST',
        credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al seguir usuario');
    return json;
};

const dejarDeSeguir = async (usuarioId) => {
    const res = await fetch(`${BASE$1}/seguir/${usuarioId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al dejar de seguir');
    return json;
};

const getMisSeguidos = async () => {
    const res = await fetch(`${BASE$1}/mis-seguidos`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener seguidos');
    return res.json();
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

const params = new URLSearchParams(window.location.search);
const contenidoId = Number(params.get('id'));
const tipo = params.get('tipo') || 'movie';

if (!contenidoId) window.location.href = './peliculas.html';

iniciarNav();

const IMG = 'https://image.tmdb.org/t/p/';
const usuario = estaLogueado() ? getUsuario() : null;
const seguidosIds = new Set();

let itemData = null;
let miResena = null;
let calificacion = 0;
let favId = null;
let histId = null;

// ─── Utilidades ───────────────────────────────────────────────────

const $ = (id) => document.getElementById(id);

const mostrarMsg = (texto, tipo) => {
    const el = $('pel-form-msg');
    el.textContent = texto;
    el.className = `pelicula__form-msg pelicula__form-msg--${tipo}`;
    setTimeout(() => { el.textContent = ''; el.className = 'pelicula__form-msg'; }, 4000);
};

const fmtFecha = (iso) =>
    new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });

// ─── Estrellas (solo lectura) ─────────────────────────────────────

const estrellasSVG = (cal) => {
    const llenas = Math.floor(cal / 2);
    const media = cal % 2 !== 0;
    const vacias = 5 - llenas - (media ? 1 : 0);
    return '★'.repeat(llenas) + (media ? '½' : '') + '☆'.repeat(vacias);
};

// ─── Calificación interactiva ─────────────────────────────────────

const renderRating = () => {
    const wrap = $('pel-rating');
    wrap.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.val = i;
        btn.className = `pelicula__dot${i <= calificacion ? ' pelicula__dot--activo' : ''}`;
        btn.title = `${i}/10`;

        btn.addEventListener('mouseenter', () => {
            wrap.querySelectorAll('.pelicula__dot').forEach((b, idx) => {
                b.classList.toggle('pelicula__dot--hover', idx < i);
            });
        });
        btn.addEventListener('mouseleave', () => {
            wrap.querySelectorAll('.pelicula__dot').forEach((b) => b.classList.remove('pelicula__dot--hover'));
        });
        btn.addEventListener('click', () => {
            calificacion = i;
            renderRating();
        });
        wrap.appendChild(btn);
    }
    $('pel-rating-label').textContent = calificacion ? `${calificacion}/10` : 'Sin calificación';
};

// ─── Comentarios de una reseña (actualización parcial) ───────────

const renderComentarios = (comentarios, resenaId) => {
    const el = document.getElementById(`comentarios-lista-${resenaId}`);
    if (!el) return;
    el.innerHTML = comentarios.map((c) => `
        <div class="pelicula__comentario">
            <div class="pelicula__comentario-avatar">${(c.usuario?.nombre || '?')[0].toUpperCase()}</div>
            <div class="pelicula__comentario-cuerpo">
                <span class="pelicula__comentario-autor">${c.usuario?.nombre || 'Usuario'}</span>
                <p class="pelicula__comentario-texto">${c.comentario}</p>
            </div>
        </div>
    `).join('');
};

// ─── Reseñas de la comunidad ──────────────────────────────────────

const renderResenas = async (resenas) => {
    const el = $('pel-resenas');
    if (!resenas.length) {
        el.innerHTML = '<p class="pelicula__vacio">Sé el primero en reseñar este título.</p>';
        return;
    }

    const [comentariosPorResena, likesPorResena, misLikes] = await Promise.all([
        Promise.all(resenas.map((r) => getComentarios(r.id).catch(() => []))),
        Promise.all(resenas.map((r) => getLikeCount('resena', r.id).catch(() => ({ count: 0 })))),
        usuario
            ? Promise.all(resenas.map((r) => checkLike('resena', r.id).catch(() => ({ liked: false }))))
            : Promise.resolve(resenas.map(() => ({ liked: false }))),
    ]);

    el.innerHTML = resenas.map((r, idx) => {
        const esPropia = r.usuario?.id === usuario?.id;
        const sigueAAutor = !!(usuario && !esPropia && r.usuario?.id && seguidosIds.has(r.usuario.id));
        const comentarios = comentariosPorResena[idx];
        const likeCount = likesPorResena[idx]?.count || 0;
        const liked = misLikes[idx]?.liked || false;

        return `
        <article class="pelicula__resena-card${esPropia ? ' pelicula__resena-card--mia' : ''}">
            <div class="pelicula__resena-top">
                <div class="pelicula__resena-avatar">${(r.usuario?.nombre || '?')[0].toUpperCase()}</div>
                <div class="pelicula__resena-meta">
                    <div class="pelicula__resena-autor-row">
                        <span class="pelicula__resena-autor">${r.usuario?.nombre || 'Usuario'}</span>
                        ${usuario && !esPropia && r.usuario?.id ? `
                            <button class="pelicula__btn-seguir${sigueAAutor ? ' pelicula__btn-seguir--siguiendo' : ''}"
                                    data-uid="${r.usuario.id}"
                                    data-siguiendo="${sigueAAutor}"
                                    type="button">
                                ${sigueAAutor ? 'Siguiendo' : 'Seguir'}
                            </button>
                        ` : ''}
                    </div>
                    <span class="pelicula__resena-fecha">${fmtFecha(r.createdAt)}</span>
                </div>
                <div class="pelicula__resena-actions-right">
                    <div class="pelicula__resena-stars" title="${r.calificacion}/10">
                        ${estrellasSVG(r.calificacion)}
                        <span class="pelicula__resena-num">${r.calificacion}/10</span>
                    </div>
                    <button class="pelicula__resena-btn-like${liked ? ' pelicula__resena-btn-like--activo' : ''}"
                            data-resena-id="${r.id}" data-liked="${liked}"
                            type="button"${!usuario ? ' disabled title="Inicia sesión para dar me gusta"' : ''}>
                        <span class="pelicula__resena-like-emoji">${liked ? '❤️' : '🤍'}</span><span class="pelicula__resena-like-count">${likeCount || ''}</span>
                    </button>
                </div>
            </div>
            ${r.comentario ? `<p class="pelicula__resena-texto">${r.comentario}</p>` : ''}

            <div class="pelicula__comentarios">
                <div class="pelicula__comentarios-lista" id="comentarios-lista-${r.id}">
                    ${comentarios.map((c) => `
                        <div class="pelicula__comentario">
                            <div class="pelicula__comentario-avatar">${(c.usuario?.nombre || '?')[0].toUpperCase()}</div>
                            <div class="pelicula__comentario-cuerpo">
                                <span class="pelicula__comentario-autor">${c.usuario?.nombre || 'Usuario'}</span>
                                <p class="pelicula__comentario-texto">${c.comentario}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${usuario ? `
                    <form class="pelicula__comentario-form" data-resena-id="${r.id}">
                        <input class="pelicula__comentario-input" type="text"
                               placeholder="Escribe un comentario..." maxlength="500" />
                        <button class="pelicula__comentario-btn" type="submit">Enviar</button>
                    </form>
                    <p class="pelicula__comentario-msg" id="comentario-msg-${r.id}"></p>
                ` : ''}
            </div>
        </article>`;
    }).join('');

    // ── Botones like en reseñas ──────────────────────────────────
    el.querySelectorAll('.pelicula__resena-btn-like').forEach((btn) => {
        btn.addEventListener('click', async () => {
            if (!usuario) return;
            const resenaId = Number(btn.dataset.resenaId);
            const liked = btn.dataset.liked === 'true';
            const emojiEl = btn.querySelector('.pelicula__resena-like-emoji');
            const countEl = btn.querySelector('.pelicula__resena-like-count');
            const n = parseInt(countEl.textContent) || 0;

            // Actualización optimista inmediata
            if (liked) {
                btn.dataset.liked = 'false';
                btn.classList.remove('pelicula__resena-btn-like--activo');
                emojiEl.textContent = '🤍';
                countEl.textContent = n > 1 ? String(n - 1) : '';
            } else {
                btn.dataset.liked = 'true';
                btn.classList.add('pelicula__resena-btn-like--activo');
                emojiEl.textContent = '❤️';
                countEl.textContent = String(n + 1);
            }

            btn.disabled = true;
            try {
                if (liked) {
                    await quitarLike('resena', resenaId);
                } else {
                    await darLike('resena', resenaId);
                }
            } catch {
                // Revertir si falla
                if (liked) {
                    btn.dataset.liked = 'true';
                    btn.classList.add('pelicula__resena-btn-like--activo');
                    emojiEl.textContent = '❤️';
                    countEl.textContent = String(n);
                } else {
                    btn.dataset.liked = 'false';
                    btn.classList.remove('pelicula__resena-btn-like--activo');
                    emojiEl.textContent = '🤍';
                    countEl.textContent = n > 0 ? String(n) : '';
                }
            } finally {
                btn.disabled = false;
            }
        });
    });

    // ── Botones seguir / dejar de seguir ─────────────────────────
    el.querySelectorAll('.pelicula__btn-seguir').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const uid = Number(btn.dataset.uid);
            const siguiendo = btn.dataset.siguiendo === 'true';
            btn.disabled = true;
            try {
                if (siguiendo) {
                    await dejarDeSeguir(uid);
                    seguidosIds.delete(uid);
                    btn.textContent = 'Seguir';
                    btn.dataset.siguiendo = 'false';
                    btn.classList.remove('pelicula__btn-seguir--siguiendo');
                } else {
                    await seguirUsuario(uid);
                    seguidosIds.add(uid);
                    btn.textContent = 'Siguiendo';
                    btn.dataset.siguiendo = 'true';
                    btn.classList.add('pelicula__btn-seguir--siguiendo');
                }
            } catch (err) {
                if (err.message?.includes('Ya sigues')) {
                    seguidosIds.add(uid);
                    btn.textContent = 'Siguiendo';
                    btn.dataset.siguiendo = 'true';
                    btn.classList.add('pelicula__btn-seguir--siguiendo');
                }
            } finally {
                btn.disabled = false;
            }
        });
    });

    // ── Formularios de comentario ─────────────────────────────────
    el.querySelectorAll('.pelicula__comentario-form').forEach((form) => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const resenaId = Number(form.dataset.resenaId);
            const input = form.querySelector('.pelicula__comentario-input');
            const msgEl = document.getElementById(`comentario-msg-${resenaId}`);
            const texto = input.value.trim();

            if (!texto) {
                msgEl.textContent = 'El comentario no puede estar vacío.';
                msgEl.className = 'pelicula__comentario-msg pelicula__comentario-msg--error';
                return;
            }

            const submitBtn = form.querySelector('.pelicula__comentario-btn');
            submitBtn.disabled = true;
            try {
                await crearComentario(resenaId, texto);
                input.value = '';
                msgEl.textContent = 'Comentario publicado.';
                msgEl.className = 'pelicula__comentario-msg pelicula__comentario-msg--ok';
                setTimeout(() => { msgEl.textContent = ''; msgEl.className = 'pelicula__comentario-msg'; }, 3000);
                const comentarios = await getComentarios(resenaId).catch(() => []);
                renderComentarios(comentarios, resenaId);
            } catch (err) {
                msgEl.textContent = err.message || 'Error al publicar el comentario.';
                msgEl.className = 'pelicula__comentario-msg pelicula__comentario-msg--error';
            } finally {
                submitBtn.disabled = false;
            }
        });
    });
};

// ─── Acciones del usuario (Favorito / Visto) ──────────────────────

const renderAcciones = () => {
    const el = $('pel-acciones');
    el.innerHTML = `
        <button class="pelicula__accion${favId ? ' pelicula__accion--activo' : ''}" id="btn-fav" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
            </svg>
            ${favId ? 'En favoritos' : 'Favorito'}
        </button>
        <button class="pelicula__accion${histId ? ' pelicula__accion--activo' : ''}" id="btn-visto" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
            </svg>
            ${histId ? 'Visto' : 'Marcar visto'}
        </button>
    `;

    $('btn-fav').addEventListener('click', async () => {
        const btn = $('btn-fav');
        btn.disabled = true;
        try {
            if (favId) {
                await eliminarFavorito(favId);
                favId = null;
            } else {
                const n = await agregarFavorito({
                    contenidoId,
                    titulo: itemData.title || itemData.name,
                    poster: itemData.poster_path,
                    tipo,
                    genero: itemData.genres?.[0]?.name || '',
                });
                favId = n.id;
            }
            renderAcciones();
        } catch { btn.disabled = false; }
    });

    $('btn-visto').addEventListener('click', async () => {
        const btn = $('btn-visto');
        btn.disabled = true;
        try {
            if (histId) {
                await eliminarHistorial(histId);
                histId = null;
            } else {
                const n = await registrarVista({
                    contenidoId,
                    titulo: itemData.title || itemData.name,
                    poster: itemData.poster_path,
                    tipo,
                    genero: itemData.genres?.[0]?.name || '',
                });
                histId = n.id;
            }
            renderAcciones();
        } catch { btn.disabled = false; }
    });
};

// ─── Formulario de reseña ─────────────────────────────────────────

const initFormResena = () => {
    $('pel-form-wrap').style.display = 'block';

    calificacion = miResena?.calificacion || 0;
    renderRating();

    if (miResena) {
        $('pel-comentario').value = miResena.comentario || '';
        $('btn-publicar').textContent = 'Actualizar reseña';
        $('btn-eliminar').style.display = 'inline-flex';
    }

    $('btn-eliminar').addEventListener('click', async () => {
        if (!confirm('¿Eliminar tu reseña? Esta acción no se puede deshacer.')) return;
        $('btn-eliminar').disabled = true;
        try {
            await eliminarResena(miResena.id);
            miResena = null;
            calificacion = 0;
            $('pel-comentario').value = '';
            $('btn-publicar').textContent = 'Publicar reseña';
            $('btn-eliminar').style.display = 'none';
            renderRating();
            mostrarMsg('Reseña eliminada.', 'ok');
            const resenas = await getResenasContenido(contenidoId, tipo).catch(() => []);
            await renderResenas(resenas);
        } catch {
            mostrarMsg('Error al eliminar la reseña.', 'error');
            $('btn-eliminar').disabled = false;
        }
    });

    $('btn-publicar').addEventListener('click', async () => {
        if (!calificacion) { mostrarMsg('Selecciona una calificación del 1 al 10.', 'error'); return; }
        const comentario = $('pel-comentario').value.trim();
        const btn = $('btn-publicar');
        btn.disabled = true;
        btn.textContent = 'Publicando...';
        try {
            if (miResena) {
                await actualizarResena(miResena.id, { calificacion, comentario });
                miResena = { ...miResena, calificacion, comentario };
                mostrarMsg('Reseña actualizada correctamente.', 'ok');
                btn.textContent = 'Actualizar reseña';
            } else {
                const nueva = await crearResena({
                    contenidoId,
                    titulo: itemData.title || itemData.name,
                    tipo,
                    genero: itemData.genres?.[0]?.name || '',
                    calificacion,
                    comentario,
                    poster: itemData.poster_path || '',
                });
                miResena = { ...nueva, usuario: { id: usuario.id, nombre: usuario.nombre } };
                mostrarMsg('Reseña publicada correctamente.', 'ok');
                btn.textContent = 'Actualizar reseña';
                $('btn-eliminar').style.display = 'inline-flex';
            }
            const resenas = await getResenasContenido(contenidoId, tipo).catch(() => []);
            await renderResenas(resenas);
        } catch (err) {
            mostrarMsg(err.message || 'Error al publicar la reseña.', 'error');
            btn.textContent = miResena ? 'Actualizar reseña' : 'Publicar reseña';
        } finally {
            btn.disabled = false;
        }
    });
};

// ─── Carga de datos de autenticación ─────────────────────────────

const cargarDatosAuth = async (resenas) => {
    try {
        const [favs, hist] = await Promise.all([getFavoritos(), getHistorial()]);
        const fav = favs.find((f) => f.contenidoId === contenidoId);
        const h = hist.find((h) => h.contenidoId === contenidoId);
        favId = fav?.id || null;
        histId = h?.id || null;
    } catch { /* continuar sin estado */ }

    renderAcciones();

    try {
        const listas = await getListas();
        if (listas.length) {
            const wrap = $('pel-listas-wrap');
            const sel = $('pel-select-lista');
            sel.innerHTML = listas.map((l) => `<option value="${l.id}">${l.nombre}</option>`).join('');
            wrap.style.display = 'flex';
            $('btn-agregar-lista').addEventListener('click', async () => {
                const btn = $('btn-agregar-lista');
                btn.disabled = true;
                try {
                    await agregarALista(Number(sel.value), {
                        contenidoId,
                        titulo: itemData.title || itemData.name,
                        poster: itemData.poster_path,
                        tipo,
                    });
                    btn.textContent = '✓ Agregado';
                } catch (err) {
                    btn.textContent = err.message?.includes('ya está en la lista') ? '✓ Ya en lista' : 'Error';
                    btn.disabled = false;
                }
            });
        }
    } catch { /* sin listas */ }

    miResena = resenas.find((r) => r.usuario?.id === usuario.id) || null;
    initFormResena();
};

// ─── Init principal ───────────────────────────────────────────────

const init = async () => {
    const estaLog = estaLogueado();

    const [detalles, stats, resenas, seguidos] = await Promise.all([
        fetchItem(tipo, contenidoId),
        getContenidoStats(contenidoId).catch(() => null),
        getResenasContenido(contenidoId, tipo).catch(() => []),
        estaLog ? getMisSeguidos().catch(() => []) : Promise.resolve([]),
    ]);

    if (!detalles || detalles.success === false) {
        $('pel-main').innerHTML = '<p class="pelicula__vacio">Contenido no encontrado. <a href="./peliculas.html">Volver →</a></p>';
        return;
    }

    seguidos.forEach((s) => seguidosIds.add(s.siguiendoId));

    itemData = { ...detalles, tipo };
    const titulo = detalles.title || detalles.name;
    const anio = (detalles.release_date || detalles.first_air_date || '').slice(0, 4);

    if (detalles.backdrop_path) {
        $('pel-backdrop').style.backgroundImage = `url(${IMG}w1280/${detalles.backdrop_path})`;
        $('pel-backdrop').style.display = 'block';
    }

    if (detalles.poster_path) {
        const img = $('pel-poster');
        img.src = `${IMG}w500/${detalles.poster_path}`;
        img.alt = titulo;
    }

    document.title = `${titulo} (${anio}) — CineTrack`;
    $('pel-titulo').textContent = titulo;
    $('pel-anio').textContent = anio;

    const generos = (detalles.genres || []).map((g) => g.name).join(', ');
    const duracion = detalles.runtime
        ? `${Math.floor(detalles.runtime / 60)}h ${detalles.runtime % 60}min`
        : detalles.episode_run_time?.[0]
            ? `${detalles.episode_run_time[0]} min/ep.`
            : '';
    $('pel-generos').textContent = generos;
    $('pel-duracion').textContent = duracion;
    $('pel-overview').textContent = detalles.overview || 'Sin descripción disponible.';

    if (stats) {
        $('pel-stat-vistos').textContent = stats.vistos_count;
        $('pel-stat-favoritos').textContent = stats.favoritos_count;
        $('pel-stat-resenas').textContent = stats.resenas_count;
    }

    if (resenas.length) {
        const prom = (resenas.reduce((s, r) => s + r.calificacion, 0) / resenas.length).toFixed(1);
        $('pel-prom').textContent = `${prom}/10`;
        $('pel-prom-stars').textContent = estrellasSVG(Math.round(Number(prom)));
        $('pel-prom-wrap').style.display = 'flex';
    }

    await renderResenas(resenas);

    if (estaLog) {
        await cargarDatosAuth(resenas);
    } else {
        $('pel-acciones').innerHTML = `
            <p class="pelicula__login-hint">
                <a href="./login.html">Inicia sesión</a> para guardar favoritos, marcar como visto y escribir reseñas.
            </p>
        `;
    }
};

init();
