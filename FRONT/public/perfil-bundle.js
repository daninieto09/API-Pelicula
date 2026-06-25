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

const urlBack =window.location.hostname.includes('localhost')
  ? 'http://localhost:4000'
  : 'https://cinetrack-api-skea.onrender.com';

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

const URL$3 = `${urlBack}/api/favoritos`;

const fetchAuth$1 = async (url, options = {}) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (res.status === 401) throw new Error('Sesión expirada');
    return res;
};

const getFavoritos = async () => {
    const res = await fetchAuth$1(URL$3);
    if (!res.ok) throw new Error('Error al obtener favoritos');
    return res.json();
};

const eliminarFavorito = async (id) => {
    const res = await fetchAuth$1(`${URL$3}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar favorito');
    return res.json();
};

const URL$2 = `${urlBack}/api/resenas`;

const getMisResenas = async () => {
    const res = await fetch(`${URL$2}/mis-resenas`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener mis reseñas');
    return res.json();
};

const actualizarResena = async (id, data) => {
    const res = await fetch(`${URL$2}/${id}`, {
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
    const res = await fetch(`${URL$2}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Error al eliminar reseña');
    return res.json();
};

const URL$1 = `${urlBack}/api/listas`;

const getListas = async () => {
    const res = await fetch(URL$1, { credentials: 'include' });
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(`${res.status}: ${json.message || 'Error al obtener listas'}`);
    }
    return res.json();
};

const crearLista = async (nombre, descripcion = '', isPrivada = false) => {
    const res = await fetch(URL$1, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, descripcion, isPrivada }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al crear lista');
    return json;
};

const eliminarLista = async (id) => {
    const res = await fetch(`${URL$1}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Error al eliminar lista');
    return res.json();
};

const URL = `${urlBack}/api/historial`;

const fetchAuth = async (url, options = {}) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (res.status === 401) throw new Error('Sesión expirada');
    return res;
};

const getHistorial = async () => {
    const res = await fetchAuth(URL);
    if (!res.ok) throw new Error('Error al obtener historial');
    return res.json();
};

const eliminarHistorial = async (id) => {
    const res = await fetchAuth(`${URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar del historial');
    return res.json();
};

const BASE$2 = `${urlBack}/api/comentarios`;

const getMisComentariosEnResenas = async () => {
    const res = await fetch(`${BASE$2}/mis-comentarios`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener comentarios');
    const json = await res.json();
    return json.comentarios;
};

const BASE$1 = `${urlBack}/api`;

const getPerfilPublico = async (id) => {
    const res = await fetch(`${BASE$1}/usuarios/${id}/perfil`);
    if (!res.ok) throw new Error('Usuario no encontrado');
    return res.json(); // { id, nombre, stats: { favoritos, resenas, listas, seguidores } }
};

const getFavoritosUsuario = async (id) => {
    const res = await fetch(`${BASE$1}/favoritos/usuario/${id}`);
    if (!res.ok) throw new Error('Error al obtener favoritos');
    return res.json();
};

const getResenasUsuario = async (id) => {
    const res = await fetch(`${BASE$1}/resenas/usuario/${id}`);
    if (!res.ok) throw new Error('Error al obtener reseñas');
    return res.json();
};

const getListasUsuario = async (id) => {
    const res = await fetch(`${BASE$1}/listas/usuario/${id}`);
    if (!res.ok) throw new Error('Error al obtener listas');
    return res.json();
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

const params = new URLSearchParams(window.location.search);
const idParam = params.get('id');
const logueado = estaLogueado();
const usuario = logueado ? getUsuario() : null;
const idPublico = idParam ? Number(idParam) : null;
const esPerfilPropio = !idPublico || (logueado && idPublico === usuario?.id);

const IMG = 'https://image.tmdb.org/t/p/w300/';

// ─── Tab navigation ───────────────────────────────────────────────
const activarTab = (nombre) => {
    document.querySelectorAll('.perfil__tab').forEach((t) => t.classList.remove('perfil__tab--activo'));
    document.querySelectorAll('.perfil__seccion').forEach((s) => s.classList.remove('perfil__seccion--activo'));
    const tab = document.querySelector(`.perfil__tab[data-tab="${nombre}"]`);
    const sec = document.getElementById(`sec-${nombre}`);
    if (tab) tab.classList.add('perfil__tab--activo');
    if (sec) sec.classList.add('perfil__seccion--activo');
    if (esPerfilPropio) history.replaceState(null, '', `#${nombre}`);
};

document.querySelectorAll('.perfil__tab').forEach((tab) => {
    tab.addEventListener('click', () => activarTab(tab.dataset.tab));
});

// ════════════════════════════════════════════════════════
// PERFIL PROPIO
// ════════════════════════════════════════════════════════
if (esPerfilPropio) {
    if (!logueado) { window.location.href = './landing.html'; }

    document.getElementById('perfil-nombre').textContent = usuario.nombre;
    document.getElementById('perfil-email').textContent = usuario.email;
    document.getElementById('perfil-avatar').textContent = usuario.nombre[0].toUpperCase();

    if (usuario.isAdmin) {
        document.getElementById('badge-admin').style.display = 'inline-flex';
        document.getElementById('admin-link').style.display = 'inline-flex';
    }

    const tabDesdeHash = window.location.hash.replace('#', '');
    const tabsValidos = ['favoritos', 'resenas', 'listas', 'historial'];
    if (tabsValidos.includes(tabDesdeHash)) activarTab(tabDesdeHash);

    // ─── Stats ────────────────────────────────────────────────────────
    const cargarStats = async () => {
        const data = await getProfile();
        if (!data) return;
        document.getElementById('stat-favoritos').textContent = data.stats.favoritos;
        document.getElementById('stat-resenas').textContent = data.stats.resenas;
        document.getElementById('stat-listas').textContent = data.stats.listas;
        document.getElementById('stat-historial').textContent = data.stats.historial;
    };

    // ─── Favoritos ────────────────────────────────────────────────────
    const cargarFavoritos = async () => {
        const el = document.getElementById('sec-favoritos');
        try {
            const items = await getFavoritos();
            if (!items.length) {
                el.innerHTML = '<p class="perfil__vacio">No tienes favoritos aún.</p>';
                return;
            }
            el.innerHTML = `<div class="perfil__grid">${items.map((f) => `
                <div class="perfil__card">
                    <a href="./pelicula.html?id=${f.contenidoId}&tipo=${f.tipo}" class="perfil__card-link">
                        <img src="${IMG}${f.poster}" alt="${f.titulo}" class="perfil__card-poster" loading="lazy" />
                        <div class="perfil__card-info">
                            <p class="perfil__card-titulo">${f.titulo}</p>
                        </div>
                    </a>
                    <button class="perfil__card-btn-eliminar" data-id="${f.id}" title="Quitar de favoritos">✕</button>
                </div>
            `).join('')}</div>`;
            el.querySelectorAll('.perfil__card-btn-eliminar').forEach((btn) => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    btn.disabled = true;
                    await eliminarFavorito(Number(btn.dataset.id)).catch(() => null);
                    cargarFavoritos();
                    cargarStats();
                });
            });
        } catch {
            el.innerHTML = '<p class="perfil__vacio">Error al cargar favoritos.</p>';
        }
    };

    // ─── Reseñas ──────────────────────────────────────────────────────
    const selectCalificacion = (id, calActual) =>
        `<select class="perfil__select-cal" id="cal-${id}">
            ${Array.from({ length: 10 }, (_, i) => i + 1)
                .map((n) => `<option value="${n}"${calActual === n ? ' selected' : ''}>${n}/10</option>`)
                .join('')}
        </select>`;

    const renderMisComentarios = (comentarios) => {
        if (!comentarios.length) return '';
        return `
            <div class="perfil__comentarios-seccion">
                <p class="perfil__seccion-label">Comentarios en reseñas ajenas</p>
                ${comentarios.map((c) => `
                    <div class="perfil__comentario-en-resena">
                        ${c.resena?.poster ? `
                            <a href="./pelicula.html?id=${c.resena.contenidoId}&tipo=${c.resena.tipo}" class="perfil__resena-poster-wrap">
                                <img src="${IMG}${c.resena.poster}" alt="${c.resena.titulo}" class="perfil__resena-poster" loading="lazy" />
                            </a>
                        ` : ''}
                        <div class="perfil__comentario-en-resena-body">
                            <a href="./pelicula.html?id=${c.resena?.contenidoId}&tipo=${c.resena?.tipo}" class="perfil__resena-titulo-link">
                                <p class="perfil__resena-titulo">${c.resena?.titulo || 'Título desconocido'}</p>
                            </a>
                            <p class="perfil__comentario-en-resena-autor">Reseña de ${c.resena?.usuario?.nombre || 'otro usuario'} · ${c.resena?.calificacion}/10</p>
                            <p class="perfil__comentario-en-resena-texto">${c.comentario}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    };

    const cargarResenas = async () => {
        const el = document.getElementById('sec-resenas');
        try {
            const [items, misComentarios] = await Promise.all([
                getMisResenas(),
                getMisComentariosEnResenas().catch(() => []),
            ]);

            const htmlResenas = items.length
                ? items.map((r) => `
                    <div class="perfil__resena-item" data-id="${r.id}">
                        <div class="perfil__resena-view" id="view-${r.id}">
                            <div class="perfil__resena-body">
                                ${r.poster ? `
                                    <a href="./pelicula.html?id=${r.contenidoId}&tipo=${r.tipo}" class="perfil__resena-poster-wrap">
                                        <img src="${IMG}${r.poster}" alt="${r.titulo}" class="perfil__resena-poster" loading="lazy" />
                                    </a>
                                ` : ''}
                                <div class="perfil__resena-content">
                                    <div class="perfil__resena-header">
                                        <div>
                                            <a href="./pelicula.html?id=${r.contenidoId}&tipo=${r.tipo}" class="perfil__resena-titulo-link">
                                                <p class="perfil__resena-titulo">${r.titulo}</p>
                                            </a>
                                            <p class="perfil__resena-tipo">${r.tipo}</p>
                                        </div>
                                        <span class="perfil__resena-calificacion">${r.calificacion}/10</span>
                                    </div>
                                    ${r.comentario ? `<p class="perfil__resena-comentario">${r.comentario}</p>` : ''}
                                    <div class="perfil__resena-acciones">
                                        <button class="btn perfil__btn-edit-resena" data-id="${r.id}">Editar</button>
                                        <button class="btn perfil__btn-del-resena" data-id="${r.id}">Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="perfil__resena-edit-form" id="edit-${r.id}" style="display:none">
                            <div class="perfil__edit-row">
                                <label class="perfil__edit-label">Calificación</label>
                                ${selectCalificacion(r.id, r.calificacion)}
                            </div>
                            <textarea class="perfil__textarea" id="com-${r.id}" rows="3" placeholder="Tu opinión... (opcional)"></textarea>
                            <div class="perfil__resena-acciones">
                                <button class="btn btn--rojo perfil__btn-save-resena" data-id="${r.id}">Guardar</button>
                                <button class="btn perfil__btn-cancel-edit" data-id="${r.id}">Cancelar</button>
                            </div>
                            <p class="perfil__edit-msg" id="msg-${r.id}"></p>
                        </div>
                    </div>
                `).join('')
                : '<p class="perfil__vacio">No tienes reseñas aún.</p>';

            el.innerHTML = htmlResenas + renderMisComentarios(misComentarios);

            items.forEach((r) => {
                const ta = document.getElementById(`com-${r.id}`);
                if (ta) ta.value = r.comentario || '';
            });

            el.querySelectorAll('.perfil__btn-edit-resena').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    document.getElementById(`view-${id}`).style.display = 'none';
                    document.getElementById(`edit-${id}`).style.display = 'block';
                });
            });

            el.querySelectorAll('.perfil__btn-cancel-edit').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    document.getElementById(`view-${id}`).style.display = 'block';
                    document.getElementById(`edit-${id}`).style.display = 'none';
                    document.getElementById(`msg-${id}`).textContent = '';
                });
            });

            el.querySelectorAll('.perfil__btn-save-resena').forEach((btn) => {
                btn.addEventListener('click', async () => {
                    const id = Number(btn.dataset.id);
                    const calificacion = Number(document.getElementById(`cal-${id}`).value);
                    const comentario = document.getElementById(`com-${id}`).value.trim();
                    const msgEl = document.getElementById(`msg-${id}`);
                    btn.disabled = true;
                    btn.textContent = 'Guardando...';
                    try {
                        await actualizarResena(id, { calificacion, comentario });
                        msgEl.textContent = 'Guardado.';
                        msgEl.className = 'perfil__edit-msg perfil__edit-msg--ok';
                        setTimeout(() => cargarResenas(), 700);
                    } catch {
                        msgEl.textContent = 'Error al guardar.';
                        msgEl.className = 'perfil__edit-msg perfil__edit-msg--error';
                        btn.disabled = false;
                        btn.textContent = 'Guardar';
                    }
                });
            });

            el.querySelectorAll('.perfil__btn-del-resena').forEach((btn) => {
                btn.addEventListener('click', async () => {
                    if (!confirm('¿Eliminar esta reseña? No se puede deshacer.')) return;
                    btn.disabled = true;
                    await eliminarResena(Number(btn.dataset.id)).catch(() => null);
                    cargarResenas();
                    cargarStats();
                });
            });
        } catch {
            el.innerHTML = '<p class="perfil__vacio">Error al cargar reseñas.</p>';
        }
    };

    // ─── Listas ───────────────────────────────────────────────────────
    const cargarListas = async () => {
        const el = document.getElementById('sec-listas');
        try {
            const items = await getListas();
            const form = `
                <div class="perfil__nueva-lista">
                    <input class="perfil__input" id="input-nueva-lista" placeholder="Nombre de la nueva lista" />
                    <label class="perfil__lista-privada-label">
                        <input type="checkbox" id="check-privada" />
                        <span>Lista privada 🔒</span>
                    </label>
                    <button class="btn btn--rojo" id="btn-crear-lista">Crear</button>
                </div>
            `;
            el.innerHTML = form + (items.length
                ? items.map((l) => `
                    <div class="perfil__lista-item">
                        <a href="./lista.html?id=${l.id}&nombre=${encodeURIComponent(l.nombre)}" class="perfil__lista-link">
                            <div>
                                <p class="perfil__lista-nombre">${l.nombre}${l.isPrivada ? ' 🔒' : ''}</p>
                                <p class="perfil__lista-count">${l._count.contenidos} contenidos</p>
                            </div>
                        </a>
                        <button class="btn perfil__btn-del-lista" data-id="${l.id}">Eliminar</button>
                    </div>
                `).join('')
                : '<p class="perfil__vacio">No tienes listas aún.</p>'
            );
            document.getElementById('btn-crear-lista').addEventListener('click', async () => {
                const nombre = document.getElementById('input-nueva-lista').value.trim();
                if (!nombre) return;
                const isPrivada = document.getElementById('check-privada').checked;
                await crearLista(nombre, '', isPrivada).catch(() => null);
                cargarListas();
                cargarStats();
            });
            el.querySelectorAll('.perfil__btn-del-lista').forEach((btn) => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (!confirm('¿Eliminar esta lista y todos sus contenidos?')) return;
                    btn.disabled = true;
                    await eliminarLista(Number(btn.dataset.id)).catch(() => null);
                    cargarListas();
                    cargarStats();
                });
            });
        } catch (err) {
            console.error('[cargarListas]', err);
            el.innerHTML = '<p class="perfil__vacio">Error al cargar listas.</p>';
        }
    };

    // ─── Historial ────────────────────────────────────────────────────
    const cargarHistorial = async () => {
        const el = document.getElementById('sec-historial');
        try {
            const items = await getHistorial();
            if (!items.length) {
                el.innerHTML = '<p class="perfil__vacio">Tu historial está vacío.</p>';
                return;
            }
            el.innerHTML = `<div class="perfil__grid">${items.map((h) => `
                <div class="perfil__card">
                    <a href="./pelicula.html?id=${h.contenidoId}&tipo=${h.tipo}" class="perfil__card-link">
                        <img src="${IMG}${h.poster}" alt="${h.titulo}" class="perfil__card-poster" loading="lazy" />
                        <div class="perfil__card-info">
                            <p class="perfil__card-titulo">${h.titulo}</p>
                        </div>
                    </a>
                    <button class="perfil__card-btn-eliminar" data-id="${h.id}" title="Quitar del historial">✕</button>
                </div>
            `).join('')}</div>`;
            el.querySelectorAll('.perfil__card-btn-eliminar').forEach((btn) => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    btn.disabled = true;
                    await eliminarHistorial(Number(btn.dataset.id)).catch(() => null);
                    cargarHistorial();
                    cargarStats();
                });
            });
        } catch {
            el.innerHTML = '<p class="perfil__vacio">Error al cargar historial.</p>';
        }
    };

    cargarStats();
    cargarFavoritos();
    cargarResenas();
    cargarListas();
    cargarHistorial();

// ════════════════════════════════════════════════════════
// PERFIL PÚBLICO (otro usuario)
// ════════════════════════════════════════════════════════
} else {
    // Ocultar elementos solo del perfil propio
    document.getElementById('perfil-email').style.display = 'none';
    document.getElementById('badge-admin').style.display = 'none';
    document.getElementById('admin-link').style.display = 'none';
    document.querySelector('.perfil__tab[data-tab="historial"]').style.display = 'none';
    document.getElementById('sec-historial').style.display = 'none';

    // Renombrar stat "Vistos" → "Seguidores"
    const statHistEl = document.getElementById('stat-historial');
    if (statHistEl) {
        const labelEl = statHistEl.closest('.perfil__stat')?.querySelector('.perfil__stat-label');
        if (labelEl) labelEl.textContent = 'Seguidores';
    }

    activarTab('favoritos');

    // ─── Botón Seguir ─────────────────────────────────────────────────
    let siguiendoId = null;

    const renderBtnSeguir = () => {
        const btn = document.getElementById('btn-seguir-perfil');
        if (!btn) return;
        if (siguiendoId !== null) {
            btn.textContent = 'Dejar de seguir';
            btn.classList.add('perfil__btn-seguir--siguiendo');
        } else {
            btn.textContent = 'Seguir';
            btn.classList.remove('perfil__btn-seguir--siguiendo');
        }
    };

    const initBtnSeguir = async () => {
        if (!logueado) return;
        try {
            const seguidos = await getMisSeguidos().catch(() => []);
            const encontrado = seguidos.find((s) => s.siguiendoId === idPublico);
            siguiendoId = encontrado ? idPublico : null;
        } catch { siguiendoId = null; }

        const header = document.querySelector('.perfil__header-info');
        const btn = document.createElement('button');
        btn.id = 'btn-seguir-perfil';
        btn.type = 'button';
        btn.className = 'perfil__btn-seguir';
        header.appendChild(btn);
        renderBtnSeguir();

        btn.addEventListener('click', async () => {
            btn.disabled = true;
            try {
                if (siguiendoId !== null) {
                    await dejarDeSeguir(idPublico);
                    siguiendoId = null;
                } else {
                    await seguirUsuario(idPublico);
                    siguiendoId = idPublico;
                }
                renderBtnSeguir();
            } catch { } finally { btn.disabled = false; }
        });
    };

    // ─── Cargar datos públicos ────────────────────────────────────────
    const cargarPerfilPublico = async () => {
        try {
            const data = await getPerfilPublico(idPublico);
            document.getElementById('perfil-nombre').textContent = data.nombre;
            document.getElementById('perfil-avatar').textContent = data.nombre[0].toUpperCase();
            document.title = `${data.nombre} — CineTrack`;
            document.getElementById('stat-favoritos').textContent = data.stats.favoritos;
            document.getElementById('stat-resenas').textContent = data.stats.resenas;
            document.getElementById('stat-listas').textContent = data.stats.listas;
            document.getElementById('stat-historial').textContent = data.stats.seguidores;
        } catch {
            document.getElementById('perfil-nombre').textContent = 'Usuario';
        }
    };

    const cargarFavoritosPublicos = async () => {
        const el = document.getElementById('sec-favoritos');
        try {
            const items = await getFavoritosUsuario(idPublico);
            if (!items.length) {
                el.innerHTML = '<p class="perfil__vacio">Sin favoritos aún.</p>';
                return;
            }
            el.innerHTML = `<div class="perfil__grid">${items.map((f) => `
                <div class="perfil__card">
                    <a href="./pelicula.html?id=${f.contenidoId}&tipo=${f.tipo}" class="perfil__card-link">
                        <img src="${IMG}${f.poster}" alt="${f.titulo}" class="perfil__card-poster" loading="lazy" />
                        <div class="perfil__card-info">
                            <p class="perfil__card-titulo">${f.titulo}</p>
                        </div>
                    </a>
                </div>
            `).join('')}</div>`;
        } catch {
            el.innerHTML = '<p class="perfil__vacio">Error al cargar favoritos.</p>';
        }
    };

    const cargarResenasPublicas = async () => {
        const el = document.getElementById('sec-resenas');
        try {
            const items = await getResenasUsuario(idPublico);
            if (!items.length) {
                el.innerHTML = '<p class="perfil__vacio">Sin reseñas aún.</p>';
                return;
            }
            el.innerHTML = items.map((r) => `
                <div class="perfil__resena-item">
                    <div class="perfil__resena-body">
                        ${r.poster ? `
                            <a href="./pelicula.html?id=${r.contenidoId}&tipo=${r.tipo}" class="perfil__resena-poster-wrap">
                                <img src="${IMG}${r.poster}" alt="${r.titulo}" class="perfil__resena-poster" loading="lazy" />
                            </a>
                        ` : ''}
                        <div class="perfil__resena-content">
                            <div class="perfil__resena-header">
                                <div>
                                    <a href="./pelicula.html?id=${r.contenidoId}&tipo=${r.tipo}" class="perfil__resena-titulo-link">
                                        <p class="perfil__resena-titulo">${r.titulo}</p>
                                    </a>
                                    <p class="perfil__resena-tipo">${r.tipo}</p>
                                </div>
                                <span class="perfil__resena-calificacion">${r.calificacion}/10</span>
                            </div>
                            ${r.comentario ? `<p class="perfil__resena-comentario">${r.comentario}</p>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        } catch {
            el.innerHTML = '<p class="perfil__vacio">Error al cargar reseñas.</p>';
        }
    };

    const cargarListasPublicas = async () => {
        const el = document.getElementById('sec-listas');
        try {
            const items = await getListasUsuario(idPublico);
            if (!items.length) {
                el.innerHTML = '<p class="perfil__vacio">Sin listas públicas aún.</p>';
                return;
            }
            el.innerHTML = items.map((l) => `
                <div class="perfil__lista-item">
                    <a href="./lista.html?id=${l.id}&nombre=${encodeURIComponent(l.nombre)}" class="perfil__lista-link">
                        <div>
                            <p class="perfil__lista-nombre">${l.nombre}</p>
                            <p class="perfil__lista-count">${l._count.contenidos} contenidos</p>
                        </div>
                    </a>
                </div>
            `).join('');
        } catch {
            el.innerHTML = '<p class="perfil__vacio">Error al cargar listas.</p>';
        }
    };

    cargarPerfilPublico();
    initBtnSeguir();
    cargarFavoritosPublicos();
    cargarResenasPublicas();
    cargarListasPublicas();
}
//# sourceMappingURL=perfil-bundle.js.map
