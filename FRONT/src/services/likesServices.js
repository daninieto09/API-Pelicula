import { urlBack } from '../utils/apiConfig.js';
const BASE = `${urlBack}/api`;

export const darLike = async (tipo, referenciaId) => {
    const res = await fetch(`${BASE}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tipo, referenciaId }),
    });
    const data = await res.json();
    if (res.status === 409) return { liked: true }; // Ya existía, se considera OK
    if (!res.ok) throw new Error(data.message || 'Error al dar like');
    return data;
};

export const quitarLike = async (tipo, referenciaId) => {
    const res = await fetch(`${BASE}/likes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tipo, referenciaId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al quitar like');
    return data;
};

export const checkLike = async (tipo, referenciaId) => {
    const res = await fetch(`${BASE}/likes/check?tipo=${tipo}&referenciaId=${referenciaId}`, {
        credentials: 'include',
    });
    if (!res.ok) return { liked: false };
    return res.json();
};

export const getLikeCount = async (tipo, referenciaId) => {
    const res = await fetch(`${BASE}/likes/count?tipo=${tipo}&referenciaId=${referenciaId}`);
    if (!res.ok) return { count: 0 };
    return res.json();
};
