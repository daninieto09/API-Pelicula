import { fetchItem } from '../services/movieServices.js';
import { getTipo } from '../context/movieContext.js';
import { estaLogueado } from '../context/userContext.js';
import { getFavoritos, agregarFavorito, eliminarFavorito } from '../services/favoritosServices.js';
import { getHistorial, registrarVista, eliminarHistorial } from '../services/historialServices.js';
import { getListas, agregarALista } from '../services/listasServices.js';
import { getContenidoStats } from '../services/publicServices.js';

const contenedor = document.getElementById('populares');
const popup = document.getElementById('media');
let itemActual = null;

// Cache de IDs para saber qué ya está en favoritos/historial sin re-fetchear cada vez
let favoritosMap = null; // Map<contenidoId (number), dbId (number)>
let historialMap = null; // Map<contenidoId (number), dbId (number)>

const cargarEstado = async () => {
    if (favoritosMap !== null) return;
    try {
        const [favs, hist] = await Promise.all([getFavoritos(), getHistorial()]);
        favoritosMap = new Map(favs.map((f) => [f.contenidoId, f.id]));
        historialMap = new Map(hist.map((h) => [h.contenidoId, h.id]));
    } catch {
        favoritosMap = new Map();
        historialMap = new Map();
    }
};

contenedor.addEventListener('click', async (e) => {
    if (!e.target.closest('.main__media')) return;
    popup.classList.add('media--active');

    const id = Number(e.target.closest('.main__media').dataset.id);
    const resultado = await fetchItem(getTipo(), id);
    itemActual = { ...resultado, tipo: getTipo() };

    if (estaLogueado()) await cargarEstado();

    const esFav = estaLogueado() && favoritosMap?.has(itemActual.id);
    const esVisto = estaLogueado() && historialMap?.has(itemActual.id);

    // Stats de la comunidad (carga en segundo plano)
    let statsHtml = '';
    try {
        const stats = await getContenidoStats(itemActual.id);
        if (stats.favoritos > 0 || stats.resenas > 0 || stats.vistos > 0) {
            statsHtml = `
                <div class="media__stats">
                    <span>${stats.favoritos} favorito${stats.favoritos !== 1 ? 's' : ''}</span>
                    <span class="media__stats-sep">·</span>
                    <span>${stats.resenas} reseña${stats.resenas !== 1 ? 's' : ''}</span>
                    <span class="media__stats-sep">·</span>
                    <span>${stats.vistos} visto${stats.vistos !== 1 ? 's' : ''}</span>
                </div>
            `;
        }
    } catch { /* sin stats */ }

    const botonesAuth = estaLogueado() ? `
        <div class="media__acciones">
            <button class="btn btn--rojo" id="btn-favorito">
                ${esFav ? '✓ Ya en favoritos' : '+ Favorito'}
            </button>
            <button class="btn" id="btn-visto">
                ${esVisto ? '✓ Visto' : 'Marcar Visto'}
            </button>
        </div>
        <div class="media__acciones" id="acciones-lista" style="display:none">
            <select class="media__select" id="select-lista"></select>
            <button class="btn" id="btn-agregar-lista">Agregar a Lista</button>
        </div>
    ` : '';

    document.querySelector('#media .media__contenedor').innerHTML = `
        <div class="media__imagen">
            <img src="https://image.tmdb.org/t/p/w500/${resultado.poster_path}" class="media__poster" alt="${resultado.title || resultado.name}" />
        </div>
        <div class="media__info">
            <h1 class="media__titulo">${resultado.title || resultado.name}</h1>
            <p class="media__fecha">${resultado.release_date || resultado.first_air_date || ''}</p>
            <p class="media__overview">${resultado.overview || ''}</p>
            ${statsHtml}
            ${botonesAuth}
        </div>
    `;

    if (!estaLogueado()) return;

    const btnFav = document.getElementById('btn-favorito');
    btnFav.addEventListener('click', async () => {
        try {
            if (favoritosMap.has(itemActual.id)) {
                await eliminarFavorito(favoritosMap.get(itemActual.id));
                favoritosMap.delete(itemActual.id);
                btnFav.textContent = '+ Favorito';
                btnFav.classList.remove('btn--rojo');
            } else {
                const nuevo = await agregarFavorito({
                    contenidoId: itemActual.id,
                    titulo: itemActual.title || itemActual.name,
                    poster: itemActual.poster_path,
                    tipo: itemActual.tipo,
                    genero: itemActual.genres?.[0]?.name || '',
                });
                favoritosMap.set(itemActual.id, nuevo.id);
                btnFav.textContent = '✓ Ya en favoritos';
                btnFav.classList.add('btn--rojo');
            }
        } catch {
            btnFav.textContent = 'Error';
        }
    });

    const btnVisto = document.getElementById('btn-visto');
    btnVisto.addEventListener('click', async () => {
        try {
            if (historialMap.has(itemActual.id)) {
                await eliminarHistorial(historialMap.get(itemActual.id));
                historialMap.delete(itemActual.id);
                btnVisto.textContent = 'Marcar Visto';
            } else {
                const nueva = await registrarVista({
                    contenidoId: itemActual.id,
                    titulo: itemActual.title || itemActual.name,
                    poster: itemActual.poster_path,
                    tipo: itemActual.tipo,
                    genero: itemActual.genres?.[0]?.name || '',
                });
                historialMap.set(itemActual.id, nueva.id);
                btnVisto.textContent = '✓ Visto';
            }
        } catch {
            btnVisto.textContent = 'Error';
        }
    });

    try {
        const listas = await getListas();
        if (listas.length > 0) {
            const selectEl = document.getElementById('select-lista');
            selectEl.innerHTML = listas.map((l) => `<option value="${l.id}">${l.nombre}</option>`).join('');
            document.getElementById('acciones-lista').style.display = 'flex';

            document.getElementById('btn-agregar-lista').addEventListener('click', async () => {
                const listaId = Number(selectEl.value);
                const btn = document.getElementById('btn-agregar-lista');
                try {
                    await agregarALista(listaId, {
                        contenidoId: itemActual.id,
                        titulo: itemActual.title || itemActual.name,
                        poster: itemActual.poster_path,
                        tipo: itemActual.tipo,
                    });
                    btn.textContent = '✓ Agregado';
                    btn.disabled = true;
                } catch {
                    btn.textContent = 'Error';
                }
            });
        }
    } catch {
        // sin listas, no mostrar selector
    }
});

document.getElementById('media-close').addEventListener('click', () => {
    popup.classList.remove('media--active');
});

popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.classList.remove('media--active');
});
