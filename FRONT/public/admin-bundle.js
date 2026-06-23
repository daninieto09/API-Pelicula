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

const URL_ADMIN = `${urlBack}/api/admin`;

const fetchAdmin = async (url, options = {}) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (res.status === 401 || res.status === 403) {
        const data = await res.json();
        manejarSesionExpirada();
        throw new Error(data.message || 'Sin autorización');
    }
    return res;
};

const getUsuariosAdmin = async (page = 1) => {
    const res = await fetchAdmin(`${URL_ADMIN}/usuarios?page=${page}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener usuarios');
    return data;
};

const desactivarUsuario = async (id) => {
    const res = await fetchAdmin(`${URL_ADMIN}/usuarios/${id}/desactivar`, { method: 'PATCH' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al desactivar usuario');
    return data;
};

const activarUsuario = async (id) => {
    const res = await fetchAdmin(`${URL_ADMIN}/usuarios/${id}/activar`, { method: 'PATCH' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al activar usuario');
    return data;
};

const eliminarUsuarioAdmin = async (id) => {
    const res = await fetchAdmin(`${URL_ADMIN}/usuarios/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar usuario');
    return data;
};

const getEstadisticasAdmin = async () => {
    const res = await fetchAdmin(`${URL_ADMIN}/estadisticas`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener estadísticas');
    return data;
};

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
