const cargarPeliculas = async (resultados = []) => {
	const contenedor = document.querySelector('#populares .main__grid');

	try {
		// Reinicio las peliculas
		contenedor.innerHTML = '';

		resultados.forEach((resultado) => {
			const plantilla = `
				<div class="main__media" data-id="${resultado.id}">
					<a href="#" class="main__media-thumb">
						${
							resultado.poster_path 
							? `<img class="main__media-img" src="https://image.tmdb.org/t/p/w500/${resultado.poster_path}" alt="" />`
							: ''
						}			
						
					</a>
					<p class="main__media-titulo">${resultado.title || resultado.name}</p>
					<p class="main__media-genero">${resultado.genero}</p>
				</div>
			`;
			//aqui lo que hago es que la plantilla la inserto en el contenedor, que es basicamente toda la parte grande derecha de "Generos" de la pagina
			contenedor.insertAdjacentHTML('beforeend', plantilla);
		});
	} catch (e) {
		console.log(e);
	}
};

export default cargarPeliculas;