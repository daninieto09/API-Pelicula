const btnHamburguesa = document.getElementById('btn-hamburguesa');
const sidebar = document.getElementById('sidebar');

// creo el overlay dinámicamente
const overlay = document.createElement('div');
overlay.classList.add('sidebar-overlay');
document.body.appendChild(overlay);

btnHamburguesa.addEventListener('click', () => {
    btnHamburguesa.classList.toggle('hamburguesa--active');
    sidebar.classList.toggle('sidebar--active');
    overlay.classList.toggle('sidebar-overlay--active');
});

// cierra al hacer click en el overlay
overlay.addEventListener('click', () => {
    btnHamburguesa.classList.remove('hamburguesa--active');
    sidebar.classList.remove('sidebar--active');
    overlay.classList.remove('sidebar-overlay--active');
});
// cerrar sidebar al presionar Buscar
const btnBuscar = document.getElementById('btn-buscar');
btnBuscar.addEventListener('click', () => {
    btnHamburguesa.classList.remove('hamburguesa--active');
    sidebar.classList.remove('sidebar--active');
    overlay.classList.remove('sidebar-overlay--active');
});