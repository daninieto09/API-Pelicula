import { iniciarNav } from '../components/navApp.js';
import { getListasPublicas } from '../services/publicServices.js';

const IMG = 'https://image.tmdb.org/t/p/w185/';

iniciarNav();

const grid = document.getElementById('listas-grid');

const renderCard = (lista) => {
    const posters = [...lista.contenidos, null, null, null, null].slice(0, 4);
    const postersHtml = posters.map((c) =>
        c?.poster
            ? `<img class="lista-card__poster-img" src="${IMG}${c.poster}" alt="${c.titulo}" loading="lazy" />`
            : `<div class="lista-card__poster-empty"></div>`
    ).join('');

    return `
        <a href="./lista.html?id=${lista.id}&nombre=${encodeURIComponent(lista.nombre)}" class="lista-card__link">
            <div class="lista-card">
                <div class="lista-card__posters">${postersHtml}</div>
                <div class="lista-card__cuerpo">
                    <p class="lista-card__nombre">${lista.nombre}</p>
                    <div class="lista-card__meta">
                        <span class="lista-card__autor">por ${lista.usuario.nombre}</span>
                        <span class="lista-card__sep">·</span>
                        <span>${lista._count.contenidos} título${lista._count.contenidos !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        </a>
    `;
};

const cargar = async () => {
    try {
        const { listas } = await getListasPublicas();
        if (!listas.length) {
            grid.innerHTML = '<p class="listas__vacio">Aún no hay listas creadas.</p>';
            return;
        }
        grid.innerHTML = listas.map(renderCard).join('');
    } catch {
        grid.innerHTML = '<p class="listas__vacio">Error al cargar listas.</p>';
    }
};

cargar();
