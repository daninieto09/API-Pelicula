import { getResenasByContenido, getResenasByUser, createResena, updateResena, deleteResena, findResenaById, getComentariosByResenaId, createComentarioConUsuario } from '../models/resenasModel.js'

export const getResenasDeUsuario = async (req, res) => {
    try {
        const resenas = await getResenasByUser(Number(req.params.id))
        res.json(resenas)
    } catch {
        res.status(500).json({ message: 'Error al obtener reseñas del usuario' })
    }
}
import { comentarioSchema } from '../schemas/resenasSchema.js'

export const getResenasContenido = async (req, res) => {
    try {
        const { contenidoId, tipo } = req.query
        const resenas = await getResenasByContenido(Number(contenidoId), tipo)
        res.json(resenas)
    } catch {
        res.status(500).json({ message: 'Error al obtener reseñas' })
    }
}

export const getMisResenas = async (req, res) => {
    try {
        const resenas = await getResenasByUser(req.user.id)
        res.json(resenas)
    } catch {
        res.status(500).json({ message: 'Error al obtener reseñas' })
    }
}

export const crearResena = async (req, res) => {
    try {
        const { contenidoId, titulo, tipo, genero, calificacion, comentario, poster } = req.body
        if (!contenidoId || !titulo || !tipo || !calificacion) {
            return res.status(400).json({ message: 'Faltan datos requeridos para crear la reseña' })
        }
        const resena = await createResena(req.user.id, {
            contenidoId: Number(contenidoId),
            titulo: String(titulo).slice(0, 255),
            tipo: String(tipo),
            genero: genero || null,
            calificacion: Number(calificacion),
            comentario: comentario || null,
            poster: poster || null,
        })
        res.status(201).json(resena)
    } catch (error) {
        console.error('crearResena error:', error?.message, error?.code)
        if (error?.code === 'P2002') {
            return res.status(409).json({ message: 'Ya tienes una reseña para este título' })
        }
        res.status(500).json({ message: 'Error al crear reseña' })
    }
}

export const actualizarResena = async (req, res) => {
    try {
        const resena = await findResenaById(Number(req.params.id))
        if (!resena) return res.status(404).json({ message: 'Reseña no encontrada' })
        if (resena.usuarioId !== req.user.id) return res.status(403).json({ message: 'No tienes permiso para modificar esta reseña' })
        const { calificacion, comentario } = req.body
        await updateResena(Number(req.params.id), req.user.id, { calificacion, comentario })
        res.json({ message: 'Reseña actualizada' })
    } catch {
        res.status(500).json({ message: 'Error al actualizar reseña' })
    }
}

export const eliminarResena = async (req, res) => {
    try {
        const resena = await findResenaById(Number(req.params.id))
        if (!resena) return res.status(404).json({ message: 'Reseña no encontrada' })
        if (resena.usuarioId !== req.user.id) return res.status(403).json({ message: 'No tienes permiso para modificar esta reseña' })
        await deleteResena(Number(req.params.id), req.user.id)
        res.json({ message: 'Reseña eliminada' })
    } catch {
        res.status(500).json({ message: 'Error al eliminar reseña' })
    }
}

export const getComentariosResena = async (req, res) => {
    try {
        const resenaId = Number(req.params.resenaId)
        const comentarios = await getComentariosByResenaId(resenaId)
        res.json({ comentarios, total: comentarios.length })
    } catch {
        res.status(500).json({ message: 'Error al obtener comentarios' })
    }
}

export const crearComentarioResena = async (req, res) => {
    try {
        const resenaId = Number(req.params.resenaId)

        const result = comentarioSchema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({ message: result.error.errors[0].message })
        }

        const resena = await findResenaById(resenaId)
        if (!resena) return res.status(404).json({ message: 'Reseña no encontrada' })

        const nuevo = await createComentarioConUsuario(req.user.id, resenaId, result.data.comentario)
        res.status(201).json({ message: 'Comentario agregado', comentario: nuevo })
    } catch {
        res.status(500).json({ message: 'Error al crear comentario' })
    }
}
