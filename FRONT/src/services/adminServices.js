import { manejarSesionExpirada } from '../context/userContext.js';
import { urlBack } from '../utils/apiConfig.js';

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

export const getUsuariosAdmin = async (page = 1) => {
    const res = await fetchAdmin(`${URL_ADMIN}/usuarios?page=${page}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener usuarios');
    return data;
};

export const desactivarUsuario = async (id) => {
    const res = await fetchAdmin(`${URL_ADMIN}/usuarios/${id}/desactivar`, { method: 'PATCH' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al desactivar usuario');
    return data;
};

export const activarUsuario = async (id) => {
    const res = await fetchAdmin(`${URL_ADMIN}/usuarios/${id}/activar`, { method: 'PATCH' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al activar usuario');
    return data;
};

export const eliminarUsuarioAdmin = async (id) => {
    const res = await fetchAdmin(`${URL_ADMIN}/usuarios/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar usuario');
    return data;
};

export const getEstadisticasAdmin = async () => {
    const res = await fetchAdmin(`${URL_ADMIN}/estadisticas`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener estadísticas');
    return data;
};
