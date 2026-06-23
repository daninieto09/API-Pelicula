import { urlBack } from '../utils/apiConfig.js';
const URL = `${urlBack}/api/historial`;

const fetchAuth = async (url, options = {}) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (res.status === 401) throw new Error('Sesión expirada');
    return res;
};

export const getHistorial = async () => {
    const res = await fetchAuth(URL);
    if (!res.ok) throw new Error('Error al obtener historial');
    return res.json();
};

export const registrarVista = async (data) => {
    const res = await fetchAuth(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error al registrar vista');
    return json;
};

export const eliminarHistorial = async (id) => {
    const res = await fetchAuth(`${URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar del historial');
    return res.json();
};
