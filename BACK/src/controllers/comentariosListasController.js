import { createComentario, getComentarios, deleteComentario } from '../models/comentariosListasModel.js'
import { comentarioListaSchema } from '../schemas/comentariosListasSchema.js'
import { getListaById } from '../models/listasModel.js'

export const crearComentario = async (req, res) => {
    try {
        const listaId = Number(req.params.listaId)

        const result = comentarioListaSchema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({ message: result.error.errors[0].message })
        }

        const lista = await getListaById(listaId)
        if (!lista) return res.status(404).json({ message: 'Lista no encontrada' })

        const comentario = await createComentario(req.user.id, listaId, result.data.comentario)
        res.status(201).json({ message: 'Comentario agregado', comentario })
    } catch {
        res.status(500).json({ message: 'Error al crear comentario' })
    }
}

export const obtenerComentarios = async (req, res) => {
    try {
        const listaId = Number(req.params.listaId)
        const comentarios = await getComentarios(listaId)
        res.json({ comentarios, total: comentarios.length })
    } catch {
        res.status(500).json({ message: 'Error al obtener comentarios' })
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
