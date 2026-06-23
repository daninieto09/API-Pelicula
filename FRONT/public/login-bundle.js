'use strict';

const KEY = 'usuario';
const DURACION_MS = 24 * 60 * 60 * 1000; // 24 horas

const setUsuario = (data) => {
    if (data) {
        localStorage.setItem(KEY, JSON.stringify({
            ...data,
            _expira: Date.now() + DURACION_MS,
        }));
    } else {
        localStorage.removeItem(KEY);
    }
};

const apiKey = "f7d9053e72bae73157a14fd0ad07e437";
const urlBase = "https://api.themoviedb.org/3";
const urlBack = `http://${window.location.hostname}:4000`;

const URL_BACK = `${urlBack}/api/auth`;

const login = async (email, password) => {
    try {
        const res = await fetch(`${URL_BACK}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Credenciales incorrectas');
        return data;
    } catch (err) {
        if (err.message === 'Failed to fetch') {
            throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
        }
        throw new Error(err.message || 'Credenciales incorrectas');
    }
};

const register = async (nombre, email, password) => {
    const res = await fetch(`${URL_BACK}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al registrarse');
    return data;
};

const obtenerGenero = (id, generos) => {
    let genero;
    generos.forEach((elemento) => {
        if (id === elemento.id) {
            genero = elemento.name;
        }
    });
    return genero;
};

const fetchGeneros = async (tipo = 'movie') => {
    const url = `${urlBase}/genre/${tipo}/list?api_key=${apiKey}&language=es`;
    try {
        const res = await fetch(url);
        const datos = await res.json();
        return datos.genres;
    } catch (e) {
        console.log(e);
    }
};

const fetchPopulares = async (tipo = 'movie', pagina = 1) => {
    const url = `${urlBase}/${tipo}/popular?api_key=${apiKey}&language=es&page=${pagina}`;
    const generos = await fetchGeneros(tipo);
    try {
        const res = await fetch(url);
        const datos = await res.json();
        const resultados = datos.results;
        resultados.forEach((r) => {
            r.genero = obtenerGenero(r.genre_ids[0], generos);
        });
        return resultados;
    } catch (e) {
        console.log(e);
    }
};

// Fondo animado
const cargarFondo = async () => {
    const [peliculas, series] = await Promise.all([
        fetchPopulares('movie'),
        fetchPopulares('tv'),
    ]);
    const todos = [...peliculas, ...series].filter((p) => p.poster_path);
    const chunk = Math.ceil(todos.length / 3);
    [todos.slice(0, chunk), todos.slice(chunk, chunk * 2), todos.slice(chunk * 2)].forEach((items, i) => {
        const el = document.getElementById(`fila-${i + 1}`);
        const html = items.map((item) =>
            `<img src="https://image.tmdb.org/t/p/w300/${item.poster_path}" alt="" class="bg-poster" />`
        ).join('');
        el.innerHTML = html + html;
    });
};

cargarFondo();

// Toggle entre cards
const cardLogin = document.getElementById('card-login');
const cardRegister = document.getElementById('card-register');

const mostrar = (cardVisible, cardOculta) => {
    cardOculta.classList.add('auth__card--oculto');
    cardOculta.classList.remove('auth__card--entrando');
    cardVisible.classList.remove('auth__card--oculto');
    cardVisible.classList.add('auth__card--entrando');
    setTimeout(() => cardVisible.classList.remove('auth__card--entrando'), 350);
};

//para que el nombre de los links cambie
const irA = (vista) => {
    try {
        const url = vista === 'register' ? './register.html' : './login.html';
        history.pushState(null, '', url);
    } catch (e) {
        // protocolo file:// no soporta pushState
    }
    vista === 'register' ? mostrar(cardRegister, cardLogin) : mostrar(cardLogin, cardRegister);
};

document.getElementById('ir-register').addEventListener('click', (e) => {
    e.preventDefault();
    irA('register');
});

document.getElementById('ir-login').addEventListener('click', (e) => {
    e.preventDefault();
    irA('login');
});

// Botón atrás/adelante del navegador
window.addEventListener('popstate', () => {
    const enRegister = location.pathname.includes('register');
    enRegister ? mostrar(cardRegister, cardLogin) : mostrar(cardLogin, cardRegister);
});

// Carga inicial: si entran directo a /register.html mostrar ese card
if (location.pathname.includes('register')) {
    mostrar(cardRegister, cardLogin);
}

/////////////////////////////////////////////////////////////////////////////////////
// LOGIN
document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('error-login');
    errorEl.textContent = '';
    try {
        const data = await login(
            document.getElementById('login-email').value,
            document.getElementById('login-password').value
        );
        setUsuario(data.usuario);
        window.location.href = './index.html';
    } catch (error) {
        errorEl.textContent = error.message;
    }
});

// Register
document.getElementById('form-register').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('error-register');
    errorEl.textContent = '';

    const password = document.getElementById('register-password').value;
    const confirmar = document.getElementById('register-confirmar').value;

    if (password !== confirmar) {
        errorEl.textContent = 'Las contraseñas no coinciden';
        return;
    }

    try {
        const data = await register(
            document.getElementById('register-nombre').value,
            document.getElementById('register-email').value,
            password
        );
        setUsuario(data.usuario);
        window.location.href = './index.html';
    } catch (error) {
        errorEl.textContent = error.message;
    }
});
