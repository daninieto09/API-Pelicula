import { getMiembros, countMiembrosActivos, getPerfilPublico } from '../models/userModel.js'

export const getPerfilPublicoCtrl = async (req, res) => {
    try {
        const user = await getPerfilPublico(Number(req.params.id))
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
        res.json({
            id: user.id,
            nombre: user.nombre,
            stats: {
                favoritos: user._count.favoritos,
                resenas: user._count.resenas,
                listas: user._count.listas,
                seguidores: user._count.seguidores,
            },
        })
    } catch {
        res.status(500).json({ message: 'Error al obtener perfil' })
    }
}

export const listarMiembros = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1
        const [raw, total] = await Promise.all([getMiembros(page), countMiembrosActivos()])
        const miembros = raw.map((u) => ({
            id: u.id,
            nombre: u.nombre,
            createdAt: u.createdAt,
            total_favoritos: u._count.favoritos,
            total_resenas: u._count.resenas,
            total_listas: u._count.listas,
            total_seguidores: u._count.seguidores,
        }))
        res.json({ miembros, total })
    } catch {
        res.status(500).json({ message: 'Error al obtener miembros' })
    }
}
