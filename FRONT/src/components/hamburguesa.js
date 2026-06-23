const btnHamburguesa = document.getElementById('btn-hamburguesa');
const sidebar = document.getElementById('sidebar');

const overlay = document.createElement('div');
overlay.classList.add('sidebar-overlay');
document.body.appendChild(overlay);

btnHamburguesa.addEventListener('click', () => {
    btnHamburguesa.classList.toggle('hamburguesa--active');
    sidebar.classList.toggle('sidebar--active');
    overlay.classList.toggle('sidebar-overlay--active');
});

overlay.addEventListener('click', () => {
    btnHamburguesa.classList.remove('hamburguesa--active');
    sidebar.classList.remove('sidebar--active');
    overlay.classList.remove('sidebar-overlay--active');
});

document.getElementById('btn-buscar').addEventListener('click', () => {
    btnHamburguesa.classList.remove('hamburguesa--active');
    sidebar.classList.remove('sidebar--active');
    overlay.classList.remove('sidebar-overlay--active');
});
