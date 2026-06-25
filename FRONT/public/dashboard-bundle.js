'use strict';

const KEY = 'usuario';

const getUsuario = () => {
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

const estaLogueado = () => getUsuario() !== null;

const cerrarSesion = () => localStorage.removeItem(KEY);

// Llama esto desde cualquier servicio cuando la respuesta es 401/403 por token.
// Limpia la sesión local y redirige al login.
const manejarSesionExpirada = () => {
    localStorage.removeItem(KEY);
    window.location.href = './login.html';
};

const urlBack =window.location.hostname.includes('localhost')
  ? 'http://localhost:4000'
  : 'https://cinetrack-api-skea.onrender.com';

const URL_BACK = `${urlBack}/api/auth`;

const fetchAuth = async (url, options = {}, redirigirEnExpiry = true) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (res.status === 401 || res.status === 403) {
        const data = await res.json();
        const esTokenError = data.message?.toLowerCase().includes('token') ||
            data.message?.toLowerCase().includes('sesión') ||
            data.message?.toLowerCase().includes('acceso denegado');
        if (esTokenError && redirigirEnExpiry) manejarSesionExpirada();
        throw new Error(data.message || 'Sin autorización');
    }
    return res;
};

const logout = async () => {
    const res = await fetch(`${URL_BACK}/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    return res.json();
};

const getProfile = async () => {
    try {
        const res = await fetchAuth(`${URL_BACK}/profile`, {}, false);
        return res.json();
    } catch { return null; }
};

const getDashboard = async () => {
    const res = await fetchAuth(`${URL_BACK}/dashboard`);
    if (!res.ok) throw new Error('Error al obtener el dashboard');
    return res.json();
};

const renderNav = (authEl) => {
    if (estaLogueado()) {
        const u = getUsuario();
        authEl.innerHTML = `
            <div class="nav-app__dropdown" id="nav-dropdown">
                <button class="nav-app__user-btn" id="nav-user-btn">
                    <span class="nav-app__user-avatar">${u.nombre[0].toUpperCase()}</span>
                    <span class="nav-app__user-nombre">${u.nombre}</span>
                    <svg class="nav-app__caret" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                    </svg>
                </button>
                <div class="nav-app__dropdown-menu" id="nav-dropdown-menu">
                    <a href="./index.html" class="nav-app__dropdown-item">Inicio</a>
                    <a href="./perfil.html" class="nav-app__dropdown-item">Mi Perfil</a>
                    <a href="./peliculas.html" class="nav-app__dropdown-item">Películas</a>
                    <div class="nav-app__dropdown-divider"></div>
                    <a href="./perfil.html#historial" class="nav-app__dropdown-item">Mi Historial</a>
                    <a href="./perfil.html#resenas" class="nav-app__dropdown-item">Mis Reseñas</a>
                    <a href="./perfil.html#listas" class="nav-app__dropdown-item">Mis Listas</a>
                    <div class="nav-app__dropdown-divider"></div>
                    <a href="./configuracion.html" class="nav-app__dropdown-item">Configuración</a>
                    ${u.isAdmin ? '<a href="./admin.html" class="nav-app__dropdown-item">Panel Admin</a>' : ''}
                    <div class="nav-app__dropdown-divider"></div>
                    <button class="nav-app__dropdown-item nav-app__dropdown-item--danger" id="nav-logout">Cerrar Sesión</button>
                </div>
            </div>
        `;

        document.getElementById('nav-user-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('nav-dropdown-menu').classList.toggle('nav-app__dropdown-menu--open');
        });

        document.getElementById('nav-logout').addEventListener('click', async () => {
            await logout();
            cerrarSesion();
            window.location.href = './landing.html';
        });

        document.addEventListener('click', () => {
            document.getElementById('nav-dropdown-menu')?.classList.remove('nav-app__dropdown-menu--open');
        });
    } else {
        authEl.innerHTML = `
            <a href="./login.html" class="btn">Iniciar Sesión</a>
            <a href="./register.html" class="btn btn--rojo">Crear Cuenta</a>
        `;
    }

    const pagina = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-app__link').forEach((link) => {
        const href = link.getAttribute('href').split('/').pop();
        if (href === pagina) link.classList.add('nav-app__link--activo');
    });
};

const iniciarNav = () => {
    const authEl = document.getElementById('nav-auth');
    if (!authEl) return;

    renderNav(authEl);

    if (estaLogueado()) {
        getProfile().then((perfil) => {
            if (!perfil) {
                cerrarSesion();
                renderNav(authEl);
            }
        });
    }
};

if (!estaLogueado()) window.location.href = './landing.html';

iniciarNav();

const usuario = getUsuario();
document.getElementById('dash-subtitulo').textContent = `Hola, ${usuario.nombre}`;

const COLORES = [
    '#c71717', '#e05252', '#2196f3', '#4caf50', '#ff9800',
    '#9c27b0', '#00bcd4', '#ff5722', '#8bc34a', '#607d8b',
];

const FUENTE = "'Montserrat', sans-serif";

const opcionesBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#aaa',
                font: { family: FUENTE, size: 12 },
                boxWidth: 12,
            },
        },
        tooltip: {
            backgroundColor: 'rgba(20,20,24,0.95)',
            titleColor: '#fff',
            bodyColor: '#bbb',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
        },
    },
};

const escalaBase = {
    ticks: { color: '#666', font: { family: FUENTE, size: 11 } },
    grid: { color: 'rgba(255,255,255,0.04)' },
};

const fmtMes = (iso) => {
    const [y, m] = iso.split('-');
    const nombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${nombres[Number(m) - 1]} ${y}`;
};

const ocultarCanvas = (canvasId, vaciId) => {
    document.getElementById(canvasId).style.display = 'none';
    document.getElementById(vaciId).style.display = 'block';
};

const renderResumen = (r) => {
    document.getElementById('dash-peliculas').textContent = r.total_peliculas_vistas;
    document.getElementById('dash-series').textContent = r.total_series_vistas;
    document.getElementById('dash-resenas').textContent = r.total_resenas;
    document.getElementById('dash-favoritos').textContent = r.total_favoritos;
    document.getElementById('dash-promedio').textContent = r.calificacion_promedio_dada
        ? `${r.calificacion_promedio_dada}/10`
        : '—';
};

const renderGeneros = (generos) => {
    if (!generos.length) { ocultarCanvas('chart-generos', 'vacio-generos'); return; }

    new Chart(document.getElementById('chart-generos'), {
        type: 'doughnut',
        data: {
            labels: generos.map((g) => g.genero),
            datasets: [{
                data: generos.map((g) => g.count),
                backgroundColor: COLORES.slice(0, generos.length),
                borderColor: '#17171b',
                borderWidth: 3,
                hoverOffset: 6,
            }],
        },
        options: {
            ...opcionesBase,
            cutout: '65%',
            plugins: {
                ...opcionesBase.plugins,
                legend: { ...opcionesBase.plugins.legend, position: 'right' },
            },
        },
    });
};

const renderActividad = (actividad) => {
    if (!actividad.length) { ocultarCanvas('chart-actividad', 'vacio-actividad'); return; }

    const canvas = document.getElementById('chart-actividad');
    const ctx = canvas.getContext('2d');

    const gradRojo = ctx.createLinearGradient(0, 0, 0, 280);
    gradRojo.addColorStop(0, 'rgba(199,23,23,0.3)');
    gradRojo.addColorStop(1, 'rgba(199,23,23,0)');

    const gradAzul = ctx.createLinearGradient(0, 0, 0, 280);
    gradAzul.addColorStop(0, 'rgba(33,150,243,0.2)');
    gradAzul.addColorStop(1, 'rgba(33,150,243,0)');

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: actividad.map((a) => fmtMes(a.mes)),
            datasets: [
                {
                    label: 'Vistas',
                    data: actividad.map((a) => a.vistas),
                    borderColor: '#c71717',
                    backgroundColor: gradRojo,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#c71717',
                    borderWidth: 2,
                },
                {
                    label: 'Reseñas',
                    data: actividad.map((a) => a.resenas),
                    borderColor: '#2196f3',
                    backgroundColor: gradAzul,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#2196f3',
                    borderWidth: 2,
                },
            ],
        },
        options: {
            ...opcionesBase,
            scales: {
                x: escalaBase,
                y: { ...escalaBase, beginAtZero: true, ticks: { ...escalaBase.ticks, stepSize: 1 } },
            },
        },
    });
};

const renderCorrelacion = (correlacion) => {
    if (!correlacion.length) { ocultarCanvas('chart-correlacion', 'vacio-correlacion'); return; }

    const sorted = [...correlacion].sort((a, b) => b.promedio_calificacion - a.promedio_calificacion);

    new Chart(document.getElementById('chart-correlacion'), {
        type: 'bar',
        data: {
            labels: sorted.map((r) => r.genero),
            datasets: [{
                label: 'Calificación promedio',
                data: sorted.map((r) => r.promedio_calificacion),
                backgroundColor: COLORES.slice(0, sorted.length),
                borderRadius: 4,
                borderSkipped: false,
            }],
        },
        options: {
            ...opcionesBase,
            indexAxis: 'y',
            scales: {
                x: { ...escalaBase, beginAtZero: true, max: 10 },
                y: { ...escalaBase, ticks: { ...escalaBase.ticks, color: '#bbb', size: 12 } },
            },
            plugins: { ...opcionesBase.plugins, legend: { display: false } },
        },
    });
};

const init = async () => {
    try {
        const { resumen, generos_mas_consumidos, correlacion_genero_calificacion, actividad_por_mes } =
            await getDashboard();
        renderResumen(resumen);
        renderGeneros(generos_mas_consumidos);
        renderActividad(actividad_por_mes);
        renderCorrelacion(correlacion_genero_calificacion);
    } catch {
        document.getElementById('dash-graficos').innerHTML =
            '<p class="dashboard__error">Error al cargar el dashboard. Intenta de nuevo más tarde.</p>';
    }
};

init();
//# sourceMappingURL=dashboard-bundle.js.map
