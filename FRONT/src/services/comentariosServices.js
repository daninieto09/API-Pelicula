import { urlBack } from '../utils/apiConfig.js';
const BASE = `${urlBack}/api/comentarios`;

export const getMisComentariosEnResenas = async () => {
    const res = await fetch(`${BASE}/mis-comentarios`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener comentarios');
    const json = await res.json();
    return json.comentarios;
};
