import { getComentariosByResena, createComentario, deleteComentario, getMisComentariosConResena } from '../models/comentariosModel.js'

export const getComentarios = async (req, res) => {
    try {
        const comentarios = await getComentariosByResena(Number(req.params.resenaId))
        res.json(comentarios)
    } catch {
        res.status(500).json({ message: 'Error al obtener comentarios' })
    }
}

export const crearComentario = async (req, res) => {
    try {
        const { comentario } = req.body
        if (!comentario?.trim()) {
            return res.status(400).json({ message: 'El comentario no puede estar vacío' })
        }
        const nuevo = await createComentario(req.user.id, Number(req.params.resenaId), comentario.trim())
        res.status(201).json(nuevo)
    } catch {
        res.status(500).json({ message: 'Error al crear comentario' })
    }
}

export const eliminarComentario = async (req, res) => {
    try {
        await deleteComentario(Number(req.params.id), req.user.id)
        res.json({ message: 'Comentario eliminado' })
    } catch {
        res.status(500).json({ message: 'Error al eliminar comentario' })
    }
}

export const getMisComentarios = async (req, res) => {
    try {
        const comentarios = await getMisComentariosConResena(req.user.id)
        res.json({ comentarios, total: comentarios.length })
    } catch {
        res.status(500).json({ message: 'Error al obtener comentarios' })
    }
}
