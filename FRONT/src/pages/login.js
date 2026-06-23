import { login, register } from '../services/authServices.js';
import { fetchPopulares } from '../services/movieServices.js';
import { setUsuario } from '../context/userContext.js';

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
