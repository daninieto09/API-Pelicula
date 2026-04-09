//lo que hago en esta funcion simple de flecha es que recibo el id del genero y el array de generos, y lo que hago es que recorro el array de generos y si el id del genero coincide con el id del genero que estoy buscando, entonces retorno el nombre del genero
const obtenerGenero = (id, generos) => {
	let genero;//aqui genero es una variable que va a almacenar el nombre del genero que estoy buscando

	generos.forEach((elemento) => {
		if (id === elemento.id) {
			genero = elemento.name;//"name" porque en la peticion de generos, el nombre del genero se encuentra en la propiedad name del API TMTB
		}
	});

	return genero;
};

export default obtenerGenero;