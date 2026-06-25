'use strict';

const KEY = 'usuario';
const DURACION_MS = 24 * 60 * 60 * 1000; // 24 horas

const setUsuario = (data) => {
    if (data) {
        localStorage.setItem(KEY, JSON.stringify({
            ...data,
            _expira: Date.now() + DURACION_MS,
        }));
    } else {
        localStorage.removeItem(KEY);
    }
};

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

const actualizarPerfil = async (nombre, email) => {
    const res = await fetchAuth(`${URL_BACK}/perfil`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email }),
    }, false);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar perfil');
    return data;
};

const actualizarPassword = async (passwordActual, passwordNueva) => {
    const res = await fetchAuth(`${URL_BACK}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordActual, passwordNueva }),
    }, false);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al cambiar contraseña');
    return data;
};

const eliminarCuenta = async () => {
    const res = await fetchAuth(`${URL_BACK}/cuenta`, { method: 'DELETE' }, false);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar cuenta');
    return data;
};

const exportarDatos = async () => {
    const res = await fetchAuth(`${URL_BACK}/exportar`, {}, false);
    if (!res.ok) throw new Error('Error al exportar datos');
    return res.json();
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

if (!estaLogueado()) {
    window.location.href = './landing.html';
}

iniciarNav();

const usuario = getUsuario();

// Rellenar campos con datos actuales
document.getElementById('input-nombre').value = usuario.nombre;
document.getElementById('input-email').value = usuario.email;

// ─── Helpers de feedback ──────────────────────────────────────
const mostrarMsg = (id, texto, tipo) => {
    const el = document.getElementById(id);
    el.textContent = texto;
    el.className = `config__msg config__msg--${tipo}`;
};

const limpiarMsg = (id) => {
    const el = document.getElementById(id);
    el.textContent = '';
    el.className = 'config__msg';
};

// ─── Sección: Cuenta ─────────────────────────────────────────
document.getElementById('form-cuenta').addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarMsg('msg-cuenta');
    const nombre = document.getElementById('input-nombre').value.trim();
    const email = document.getElementById('input-email').value.trim();
    const btn = document.getElementById('btn-guardar-cuenta');
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    try {
        const { usuario: actualizado } = await actualizarPerfil(nombre, email);
        setUsuario({ ...usuario, ...actualizado });
        mostrarMsg('msg-cuenta', 'Cambios guardados correctamente.', 'ok');
        // Actualizar nombre en el nav
        const navNombre = document.querySelector('.nav-app__user-nombre');
        if (navNombre) navNombre.textContent = actualizado.nombre;
    } catch (err) {
        mostrarMsg('msg-cuenta', err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar cambios';
    }
});

// ─── Sección: Contraseña ─────────────────────────────────────
document.getElementById('form-password').addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarMsg('msg-password');
    const actual = document.getElementById('input-pwd-actual').value;
    const nueva = document.getElementById('input-pwd-nueva').value;
    const confirmar = document.getElementById('input-pwd-confirmar').value;

    if (nueva !== confirmar) {
        mostrarMsg('msg-password', 'Las contraseñas nuevas no coinciden.', 'error');
        return;
    }
    const btn = document.getElementById('btn-cambiar-pwd');
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    try {
        await actualizarPassword(actual, nueva);
        mostrarMsg('msg-password', 'Contraseña actualizada correctamente.', 'ok');
        document.getElementById('form-password').reset();
    } catch (err) {
        mostrarMsg('msg-password', err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Cambiar contraseña';
    }
});

// ─── Sección: Exportar datos ──────────────────────────────────
document.getElementById('btn-exportar').addEventListener('click', async () => {
    const btn = document.getElementById('btn-exportar');
    btn.disabled = true;
    btn.textContent = 'Exportando...';
    try {
        const datos = await exportarDatos();
        const json = JSON.stringify(datos, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cinetrack-datos-${usuario.nombre.toLowerCase().replace(/\s+/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch {
        alert('Error al exportar los datos. Intenta de nuevo.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Exportar mis datos';
    }
});

// ─── Sección: Eliminar cuenta (modal de confirmación) ─────────
const modal = document.getElementById('modal-eliminar');
const modalMsg = document.getElementById('modal-msg');

document.getElementById('btn-abrir-modal').addEventListener('click', () => {
    modal.classList.add('modal-confirm--visible');
    document.getElementById('input-confirm-email').value = '';
    modalMsg.classList.remove('modal-confirm__msg--visible');
});

document.getElementById('btn-cancelar-modal').addEventListener('click', () => {
    modal.classList.remove('modal-confirm--visible');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('modal-confirm--visible');
});

document.getElementById('btn-confirmar-eliminar').addEventListener('click', async () => {
    const emailIngresado = document.getElementById('input-confirm-email').value.trim();
    if (emailIngresado !== usuario.email) {
        modalMsg.textContent = 'El email no coincide con el de tu cuenta.';
        modalMsg.classList.add('modal-confirm__msg--visible');
        return;
    }
    const btn = document.getElementById('btn-confirmar-eliminar');
    btn.disabled = true;
    btn.textContent = 'Eliminando...';
    try {
        await eliminarCuenta();
        cerrarSesion();
        window.location.href = './landing.html';
    } catch (err) {
        modalMsg.textContent = err.message || 'Error al eliminar la cuenta.';
        modalMsg.classList.add('modal-confirm__msg--visible');
        btn.disabled = false;
        btn.textContent = 'Eliminar mi cuenta';
    }
});
//# sourceMappingURL=config-bundle.js.map
