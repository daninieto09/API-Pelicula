import { estaLogueado, getUsuario } from '../context/userContext.js';
import { fetchItem } from '../services/movieServices.js';
import { getContenidoStats } from '../services/publicServices.js';
import { getResenasContenido, crearResena, actualizarResena, eliminarResena, getComentarios, crearComentario } from '../services/resenasServices.js';
import { getFavoritos, agregarFavorito, eliminarFavorito } from '../services/favoritosServices.js';
import { getHistorial, registrarVista, eliminarHistorial } from '../services/historialServices.js';
import { getListas, agregarALista } from '../services/listasServices.js';
import { seguirUsuario, dejarDeSeguir, getMisSeguidos } from '../services/socialServices.js';
import { darLike, quitarLike, checkLike, getLikeCount } from '../services/likesServices.js';
import { iniciarNav } from '../components/navApp.js';

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
