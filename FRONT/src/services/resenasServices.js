import { urlBack } from '../utils/apiConfig.js';
const URL = `${urlBack}/api/resenas`;

export const getResenasContenido = async (contenidoId, tipo) => {
    const res = await fetch(`${URL}?contenidoId=${contenidoId}&tipo=${tipo}`);
    if (!res.ok) throw new Error('Error al obtener reseñas');
    return res.json();
};

export const getMisResenas = async () => {
    const res = await fetch(`${URL}/mis-resenas`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener mis reseñas');
    return res.json();
};

export const crearResena = async (data) => {
    const res = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al crear reseña');
    return json;
};

export const actualizarResena = async (id, data) => {
    const res = await fetch(`${URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al actualizar reseña');
    return json;
};

export const eliminarResena = async (id) => {
    const res = await fetch(`${URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Error al eliminar reseña');
    return res.json();
};

export const getComentarios = async (resenaId) => {
    const res = await fetch(`${URL}/${resenaId}/comentarios`);
    if (!res.ok) throw new Error('Error al obtener comentarios');
    const json = await res.json();
    return json.comentarios;
};

export const crearComentario = async (resenaId, comentario) => {
    const res = await fetch(`${URL}/${resenaId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comentario }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al crear comentario');
    return json;
};
