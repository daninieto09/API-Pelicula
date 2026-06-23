import { urlBack } from '../utils/apiConfig.js';
const URL = `${urlBack}/api/listas`;

export const getListaDetalle = async (id) => {
    const res = await fetch(`${URL}/${id}`, { credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al obtener lista');
    return json;
};

export const getListas = async () => {
    const res = await fetch(URL, { credentials: 'include' });
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(`${res.status}: ${json.message || 'Error al obtener listas'}`);
    }
    return res.json();
};

export const crearLista = async (nombre, descripcion = '', isPrivada = false) => {
    const res = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, descripcion, isPrivada }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al crear lista');
    return json;
};

export const eliminarLista = async (id) => {
    const res = await fetch(`${URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Error al eliminar lista');
    return res.json();
};

export const getContenidosLista = async (id) => {
    const res = await fetch(`${URL}/${id}/contenidos`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener contenidos');
    return res.json();
};

export const agregarALista = async (listaId, data) => {
    const res = await fetch(`${URL}/${listaId}/contenidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al agregar a lista');
    return json;
};

export const quitarDeLista = async (listaId, contenidoId) => {
    const res = await fetch(`${URL}/${listaId}/contenidos/${contenidoId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Error al quitar de lista');
    return res.json();
};

export const getComentariosLista = async (listaId) => {
    const res = await fetch(`${URL}/${listaId}/comentarios`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al obtener comentarios');
    return json; // { comentarios: [...], total: n }
};

export const crearComentarioLista = async (listaId, comentario) => {
    const res = await fetch(`${URL}/${listaId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comentario }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al crear comentario');
    return json;
};

export const eliminarComentarioLista = async (id) => {
    const res = await fetch(`${URL}/comentarios/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al eliminar comentario');
    return json;
};
