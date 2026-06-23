import { urlBack } from '../utils/apiConfig.js';
const BASE = `${urlBack}/api/social`;

export const seguirUsuario = async (usuarioId) => {
    const res = await fetch(`${BASE}/seguir/${usuarioId}`, {
        method: 'POST',
        credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al seguir usuario');
    return json;
};

export const dejarDeSeguir = async (usuarioId) => {
    const res = await fetch(`${BASE}/seguir/${usuarioId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al dejar de seguir');
    return json;
};

export const getMisSeguidos = async () => {
    const res = await fetch(`${BASE}/mis-seguidos`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener seguidos');
    return res.json();
};
