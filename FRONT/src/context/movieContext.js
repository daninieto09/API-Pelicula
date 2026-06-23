let estado = {
    tipo: 'movie',
    pagina: 1,
    generoId: null,
};

export const getTipo = () => estado.tipo;
export const setTipo = (tipo) => {
    estado.tipo = tipo;
    estado.pagina = 1;
    estado.generoId = null;
};

export const getPagina = () => estado.pagina;
export const setPagina = (pagina) => { estado.pagina = pagina; };

export const getGeneroId = () => estado.generoId;
export const setGeneroId = (id) => { estado.generoId = id; };
