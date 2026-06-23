import { getListasByUser, getListaById, createLista, deleteLista, getListaContenidos, addToLista, removeFromLista, getListasPublicas, countListasPublicas, findContenidoEnLista, getListasPublicasDeUsuario } from '../models/listasModel.js'

export const listarPublicas = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1
        const [listas, total] = await Promise.all([
            getListasPublicas(page),
            countListasPublicas(),
        ])
        res.json({ listas, total })
    } catch {
        res.status(500).json({ message: 'Error al obtener listas' })
    }
}

export const getListaByIdCtrl = async (req, res) => {
    try {
        const lista = await getListaById(Number(req.params.id))
        if (!lista) return res.status(404).json({ message: 'Lista no encontrada' })
        if (lista.isPrivada && req.user?.id !== lista.usuarioId) {
            return res.status(403).json({ message: 'Esta lista es privada' })
        }
        res.json(lista)
    } catch {
        res.status(500).json({ message: 'Error al obtener la lista' })
    }
}

export const getMisListas = async (req, res) => {
    try {
        const listas = await getListasByUser(req.user.id)
        res.json(listas)
    } catch {
        res.status(500).json({ message: 'Error al obtener listas' })
    }
}

export const crearLista = async (req, res) => {
    try {
        const { nombre, descripcion, isPrivada } = req.body
        const lista = await createLista(req.user.id, nombre, descripcion, isPrivada)
        res.status(201).json(lista)
    } catch {
        res.status(500).json({ message: 'Error al crear lista' })
    }
}

export const eliminarLista = async (req, res) => {
    try {
        await deleteLista(Number(req.params.id), req.user.id)
        res.json({ message: 'Lista eliminada' })
    } catch {
        res.status(500).json({ message: 'Error al eliminar lista' })
    }
}

export const getContenidosLista = async (req, res) => {
    try {
        const contenidos = await getListaContenidos(Number(req.params.id))
        res.json(contenidos)
    } catch {
        res.status(500).json({ message: 'Error al obtener contenidos de la lista' })
    }
}

export const agregarALista = async (req, res) => {
    try {
        const listaId = Number(req.params.id)
        const { contenidoId, titulo, poster, tipo } = req.body
        const existe = await findContenidoEnLista(listaId, contenidoId)
        if (existe) return res.status(409).json({ message: 'Este título ya está en la lista' })
        const item = await addToLista(listaId, { contenidoId, titulo, poster, tipo })
        res.status(201).json(item)
    } catch {
        res.status(500).json({ message: 'Error al agregar a lista' })
    }
}

export const getListasDeUsuario = async (req, res) => {
    try {
        const listas = await getListasPublicasDeUsuario(Number(req.params.id))
        res.json(listas)
    } catch {
        res.status(500).json({ message: 'Error al obtener listas del usuario' })
    }
}

export const quitarDeLista = async (req, res) => {
    try {
        await removeFromLista(Number(req.params.id), Number(req.params.contenidoId))
        res.json({ message: 'Eliminado de la lista' })
    } catch {
        res.status(500).json({ message: 'Error al quitar de lista' })
    }
}
