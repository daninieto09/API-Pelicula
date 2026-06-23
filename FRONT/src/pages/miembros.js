import { iniciarNav } from '../components/navApp.js';
import { getMiembros } from '../services/publicServices.js';
import { estaLogueado, getUsuario } from '../context/userContext.js';
import { seguirUsuario, dejarDeSeguir, getMisSeguidos } from '../services/socialServices.js';

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
