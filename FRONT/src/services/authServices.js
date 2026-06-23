import { manejarSesionExpirada } from '../context/userContext.js';
import { urlBack } from '../utils/apiConfig.js';

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

export const login = async (email, password) => {
    try {
        const res = await fetch(`${URL_BACK}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Credenciales incorrectas');
        return data;
    } catch (err) {
        if (err.message === 'Failed to fetch') {
            throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
        }
        throw new Error(err.message || 'Credenciales incorrectas');
    }
};

export const register = async (nombre, email, password) => {
    const res = await fetch(`${URL_BACK}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al registrarse');
    return data;
};

export const logout = async () => {
    const res = await fetch(`${URL_BACK}/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    return res.json();
};

export const getProfile = async () => {
    try {
        const res = await fetchAuth(`${URL_BACK}/profile`, {}, false);
        return res.json();
    } catch { return null; }
};

export const actualizarPerfil = async (nombre, email) => {
    const res = await fetchAuth(`${URL_BACK}/perfil`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email }),
    }, false);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar perfil');
    return data;
};

export const actualizarPassword = async (passwordActual, passwordNueva) => {
    const res = await fetchAuth(`${URL_BACK}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordActual, passwordNueva }),
    }, false);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al cambiar contraseña');
    return data;
};

export const eliminarCuenta = async () => {
    const res = await fetchAuth(`${URL_BACK}/cuenta`, { method: 'DELETE' }, false);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar cuenta');
    return data;
};

export const exportarDatos = async () => {
    const res = await fetchAuth(`${URL_BACK}/exportar`, {}, false);
    if (!res.ok) throw new Error('Error al exportar datos');
    return res.json();
};

export const getDashboard = async () => {
    const res = await fetchAuth(`${URL_BACK}/dashboard`);
    if (!res.ok) throw new Error('Error al obtener el dashboard');
    return res.json();
};
