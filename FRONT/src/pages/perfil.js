import { estaLogueado, getUsuario } from '../context/userContext.js';
import { getProfile } from '../services/authServices.js';
import { iniciarNav } from '../components/navApp.js';
import { getFavoritos, eliminarFavorito } from '../services/favoritosServices.js';
import { getMisResenas, eliminarResena, actualizarResena } from '../services/resenasServices.js';
import { getListas, crearLista, eliminarLista } from '../services/listasServices.js';
import { getHistorial, eliminarHistorial } from '../services/historialServices.js';
import { getMisComentariosEnResenas } from '../services/comentariosServices.js';
import { getPerfilPublico, getFavoritosUsuario, getResenasUsuario, getListasUsuario } from '../services/publicServices.js';
import { seguirUsuario, dejarDeSeguir, getMisSeguidos } from '../services/socialServices.js';

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
