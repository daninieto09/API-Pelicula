import { urlBack } from '../utils/apiConfig.js';
const BASE = `${urlBack}/api`;

export const getListasPublicas = async (page = 1) => {
    const res = await fetch(`${BASE}/listas/publicas?page=${page}`);
    if (!res.ok) throw new Error('Error al obtener listas');
    return res.json(); //
};

export const getMiembros = async (page = 1) => {
    const res = await fetch(`${BASE}/usuarios/miembros?page=${page}`);
    if (!res.ok) throw new Error('Error al obtener miembros');
    return res.json(); // { miembros: [...], total: n }
};

export const getPerfilPublico = async (id) => {
    const res = await fetch(`${BASE}/usuarios/${id}/perfil`);
    if (!res.ok) throw new Error('Usuario no encontrado');
    return res.json(); // { id, nombre, stats: { favoritos, resenas, listas, seguidores } }
};

export const getFavoritosUsuario = async (id) => {
    const res = await fetch(`${BASE}/favoritos/usuario/${id}`);
    if (!res.ok) throw new Error('Error al obtener favoritos');
    return res.json();
};

export const getResenasUsuario = async (id) => {
    const res = await fetch(`${BASE}/resenas/usuario/${id}`);
    if (!res.ok) throw new Error('Error al obtener reseñas');
    return res.json();
};

export const getListasUsuario = async (id) => {
    const res = await fetch(`${BASE}/listas/usuario/${id}`);
    if (!res.ok) throw new Error('Error al obtener listas');
    return res.json();
};

export const getContenidoStats = async (contenidoId) => {
    const res = await fetch(`${BASE}/peliculas/stats/${contenidoId}`);
    if (!res.ok) throw new Error('Error al obtener estadísticas');
    const json = await res.json();
    return json.stats; // { contenidoId, favoritos_count, resenas_count, vistos_count, calificacion_promedio }
};
