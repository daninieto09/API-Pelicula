import { urlBack } from '../utils/apiConfig.js';
const URL = `${urlBack}/api/favoritos`;

const fetchAuth = async (url, options = {}) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (res.status === 401) throw new Error('Sesión expirada');
    return res;
};

export const getFavoritos = async () => {
    const res = await fetchAuth(URL);
    if (!res.ok) throw new Error('Error al obtener favoritos');
    return res.json();
};

export const agregarFavorito = async (data) => {
    const res = await fetchAuth(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al agregar favorito');
    return json;
};

export const eliminarFavorito = async (id) => {
    const res = await fetchAuth(`${URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar favorito');
    return res.json();
};
