import { estaLogueado, getUsuario, setUsuario, cerrarSesion } from '../context/userContext.js';
import { actualizarPerfil, actualizarPassword, eliminarCuenta, exportarDatos } from '../services/authServices.js';
import { iniciarNav } from '../components/navApp.js';

if (!estaLogueado()) {
    window.location.href = './landing.html';
}

iniciarNav();

const usuario = getUsuario();

// Rellenar campos con datos actuales
document.getElementById('input-nombre').value = usuario.nombre;
document.getElementById('input-email').value = usuario.email;

// ─── Helpers de feedback ──────────────────────────────────────
const mostrarMsg = (id, texto, tipo) => {
    const el = document.getElementById(id);
    el.textContent = texto;
    el.className = `config__msg config__msg--${tipo}`;
};

const limpiarMsg = (id) => {
    const el = document.getElementById(id);
    el.textContent = '';
    el.className = 'config__msg';
};

// ─── Sección: Cuenta ─────────────────────────────────────────
document.getElementById('form-cuenta').addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarMsg('msg-cuenta');
    const nombre = document.getElementById('input-nombre').value.trim();
    const email = document.getElementById('input-email').value.trim();
    const btn = document.getElementById('btn-guardar-cuenta');
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    try {
        const { usuario: actualizado } = await actualizarPerfil(nombre, email);
        setUsuario({ ...usuario, ...actualizado });
        mostrarMsg('msg-cuenta', 'Cambios guardados correctamente.', 'ok');
        // Actualizar nombre en el nav
        const navNombre = document.querySelector('.nav-app__user-nombre');
        if (navNombre) navNombre.textContent = actualizado.nombre;
    } catch (err) {
        mostrarMsg('msg-cuenta', err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar cambios';
    }
});

// ─── Sección: Contraseña ─────────────────────────────────────
document.getElementById('form-password').addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarMsg('msg-password');
    const actual = document.getElementById('input-pwd-actual').value;
    const nueva = document.getElementById('input-pwd-nueva').value;
    const confirmar = document.getElementById('input-pwd-confirmar').value;

    if (nueva !== confirmar) {
        mostrarMsg('msg-password', 'Las contraseñas nuevas no coinciden.', 'error');
        return;
    }
    const btn = document.getElementById('btn-cambiar-pwd');
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    try {
        await actualizarPassword(actual, nueva);
        mostrarMsg('msg-password', 'Contraseña actualizada correctamente.', 'ok');
        document.getElementById('form-password').reset();
    } catch (err) {
        mostrarMsg('msg-password', err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Cambiar contraseña';
    }
});

// ─── Sección: Exportar datos ──────────────────────────────────
document.getElementById('btn-exportar').addEventListener('click', async () => {
    const btn = document.getElementById('btn-exportar');
    btn.disabled = true;
    btn.textContent = 'Exportando...';
    try {
        const datos = await exportarDatos();
        const json = JSON.stringify(datos, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cinetrack-datos-${usuario.nombre.toLowerCase().replace(/\s+/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch {
        alert('Error al exportar los datos. Intenta de nuevo.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Exportar mis datos';
    }
});

// ─── Sección: Eliminar cuenta (modal de confirmación) ─────────
const modal = document.getElementById('modal-eliminar');
const modalMsg = document.getElementById('modal-msg');

document.getElementById('btn-abrir-modal').addEventListener('click', () => {
    modal.classList.add('modal-confirm--visible');
    document.getElementById('input-confirm-email').value = '';
    modalMsg.classList.remove('modal-confirm__msg--visible');
});

document.getElementById('btn-cancelar-modal').addEventListener('click', () => {
    modal.classList.remove('modal-confirm--visible');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('modal-confirm--visible');
});

document.getElementById('btn-confirmar-eliminar').addEventListener('click', async () => {
    const emailIngresado = document.getElementById('input-confirm-email').value.trim();
    if (emailIngresado !== usuario.email) {
        modalMsg.textContent = 'El email no coincide con el de tu cuenta.';
        modalMsg.classList.add('modal-confirm__msg--visible');
        return;
    }
    const btn = document.getElementById('btn-confirmar-eliminar');
    btn.disabled = true;
    btn.textContent = 'Eliminando...';
    try {
        await eliminarCuenta();
        cerrarSesion();
        window.location.href = './landing.html';
    } catch (err) {
        modalMsg.textContent = err.message || 'Error al eliminar la cuenta.';
        modalMsg.classList.add('modal-confirm__msg--visible');
        btn.disabled = false;
        btn.textContent = 'Eliminar mi cuenta';
    }
});
