import { addLike, removeLike, getLikeCount as countLikes, checkLike as findLike } from '../models/likesModel.js'
import { likeSchema } from '../schemas/likesSchema.js'

export const darLike = async (req, res) => {
    try {
        const parsed = likeSchema.safeParse(req.body)
        if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message })
        const { tipo, referenciaId } = parsed.data
        const existe = await findLike(req.user.id, tipo, referenciaId)
        if (existe) return res.status(409).json({ message: 'Ya le diste me gusta' })
        await addLike(req.user.id, tipo, referenciaId)
        res.status(201).json({ message: 'Le diste me gusta', liked: true })
    } catch {
        res.status(500).json({ message: 'Error al dar me gusta' })
    }
}

export const quitarLike = async (req, res) => {
    try {
        const parsed = likeSchema.safeParse(req.body)
        if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message })
        const { tipo, referenciaId } = parsed.data
        await removeLike(req.user.id, tipo, referenciaId)
        res.json({ message: 'Quitaste el me gusta', liked: false })
    } catch {
        res.status(500).json({ message: 'Error al quitar me gusta' })
    }
}

export const getLikeCountCtrl = async (req, res) => {
    try {
        const tipo = req.query.tipo
        const referenciaId = Number(req.query.referenciaId)
        if (!tipo || !referenciaId) return res.status(400).json({ message: 'Faltan parámetros' })
        const count = await countLikes(tipo, referenciaId)
        res.json({ count })
    } catch {
        res.status(500).json({ message: 'Error al obtener conteo' })
    }
}

export const checkLikeCtrl = async (req, res) => {
    try {
        const tipo = req.query.tipo
        const referenciaId = Number(req.query.referenciaId)
        if (!tipo || !referenciaId) return res.status(400).json({ message: 'Faltan parámetros' })
        const like = await findLike(req.user.id, tipo, referenciaId)
        res.json({ liked: !!like })
    } catch {
        res.status(500).json({ message: 'Error al verificar like' })
    }
}
