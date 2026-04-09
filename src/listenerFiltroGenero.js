const contenedor = document.getElementById('filtro-generos');
contenedor.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.closest('button')) {
        const botonActivo = contenedor.querySelector('.btn--active');
        
        // Si el botón clickeado ya estaba activo, lo deselecciona
        if (botonActivo === e.target) {
            botonActivo.classList.remove('btn--active');
        } else {
            // Si era otro, quita el activo anterior y activa el nuevo
            botonActivo?.classList.remove('btn--active');//cuando se haga click en un genero, se quite la clase de activo del genero que estaba activo antes, y luego se le agregue la clase de activo al genero que se hizo click, para que se muestre en el DOM que ese genero esta activo
            e.target.classList.add('btn--active');
        }

    }
});