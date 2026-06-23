import { estaLogueado, getUsuario } from '../context/userContext.js';
import { iniciarNav } from '../components/navApp.js';
import {
    getUsuariosAdmin, desactivarUsuario, activarUsuario,
    eliminarUsuarioAdmin, getEstadisticasAdmin,
} from '../services/adminServices.js';

if (!estaLogueado() || !getUsuario().isAdmin) {
    window.location.href = './index.html';
}

iniciarNav();

const yo = getUsuario();

// ─── Estadísticas ─────────────────────────────────────────────
const cargarEstadisticas = async () => {
    try {
        const stats = await getEstadisticasAdmin();
        document.getElementById('stat-usuarios').textContent = stats.usuarios;
        document.getElementById('stat-favoritos').textContent = stats.favoritos;
        document.getElementById('stat-resenas').textContent = stats.resenas;
        document.getElementById('stat-historial').textContent = stats.historial;
    } catch {
        // Si falla, los stats quedan en —
    }
};

// ─── Tabla de usuarios ────────────────────────────────────────
const formatFecha = (iso) =>
    new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

const renderFila = (u) => {
    const tr = document.createElement('tr');
    tr.dataset.id = u.id;
    tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.nombre}</td>
        <td style="color:#777">${u.email}</td>
        <td>
            ${u.isAdmin ? '<span class="admin__badge admin__badge--admin">Admin</span>' : ''}
        </td>
        <td>
            <span class="admin__badge ${u.isActive ? 'admin__badge--activo' : 'admin__badge--inactivo'}">
                ${u.isActive ? 'Activo' : 'Inactivo'}
            </span>
        </td>
        <td style="color:#555">${formatFecha(u.createdAt)}</td>
        <td>
            <div class="admin__fila-acciones">
                ${u.id !== yo.id && !u.isAdmin
                    ? u.isActive
                        ? `<button class="admin__btn-fila admin__btn-fila--desactivar" data-accion="desactivar">Desactivar</button>`
                        : `<button class="admin__btn-fila admin__btn-fila--activar" data-accion="activar">Activar</button>`
                    : ''}
                ${u.id !== yo.id && !u.isAdmin
                    ? `<button class="admin__btn-fila admin__btn-fila--eliminar" data-accion="eliminar">Eliminar</button>`
                    : '<span style="color:#333;font-size:12px">—</span>'}
            </div>
        </td>
    `;
    return tr;
};

const tbody = document.getElementById('usuarios-tbody');

const cargarUsuarios = async () => {
    tbody.innerHTML = '<tr><td colspan="7" class="admin__vacio">Cargando...</td></tr>';
    try {
        const { usuarios } = await getUsuariosAdmin();
        tbody.innerHTML = '';
        if (!usuarios.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="admin__vacio">No hay usuarios.</td></tr>';
            return;
        }
        usuarios.forEach((u) => tbody.appendChild(renderFila(u)));
    } catch {
        tbody.innerHTML = '<tr><td colspan="7" class="admin__vacio">Error al cargar usuarios.</td></tr>';
    }
};

// ─── Acciones sobre filas ─────────────────────────────────────
tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-accion]');
    if (!btn) return;

    const tr = btn.closest('tr');
    const id = Number(tr.dataset.id);
    const accion = btn.dataset.accion;

    if (accion === 'eliminar') {
        if (!confirm('¿Eliminar este usuario y todos sus datos? Esta acción no se puede deshacer.')) return;
    }

    btn.disabled = true;
    btn.textContent = '...';

    try {
        if (accion === 'desactivar') await desactivarUsuario(id);
        else if (accion === 'activar') await activarUsuario(id);
        else if (accion === 'eliminar') await eliminarUsuarioAdmin(id);

        await cargarUsuarios();
    } catch (err) {
        alert(err.message || 'Error al ejecutar la acción.');
        btn.disabled = false;
    }
});

// ─── Inicializar ──────────────────────────────────────────────
cargarEstadisticas();
cargarUsuarios();
