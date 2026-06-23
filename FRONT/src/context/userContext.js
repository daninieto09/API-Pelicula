const KEY = 'usuario';
const DURACION_MS = 24 * 60 * 60 * 1000; // 24 horas

export const setUsuario = (data) => {
    if (data) {
        localStorage.setItem(KEY, JSON.stringify({
            ...data,
            _expira: Date.now() + DURACION_MS,
        }));
    } else {
        localStorage.removeItem(KEY);
    }
};

export const getUsuario = () => {
    const stored = localStorage.getItem(KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed._expira && Date.now() > parsed._expira) {
        localStorage.removeItem(KEY);
        return null;
    }
    const { _expira, ...usuario } = parsed;
    return usuario;
};

export const estaLogueado = () => getUsuario() !== null;

export const cerrarSesion = () => localStorage.removeItem(KEY);

// Llama esto desde cualquier servicio cuando la respuesta es 401/403 por token.
// Limpia la sesión local y redirige al login.
export const manejarSesionExpirada = () => {
    localStorage.removeItem(KEY);
    window.location.href = './login.html';
};
