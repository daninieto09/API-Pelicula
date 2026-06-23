import {
    getAllUsers, getTotalUsers, deactivateUser, activateUser,
    deleteUserAdmin, deleteResenaAdmin, deleteComentarioAdmin, getEstadisticasGlobales,
} from '../models/adminModel.js'

export const listarUsuarios = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1
        const [usuarios, total] = await Promise.all([getAllUsers(page), getTotalUsers()])
        res.json({ usuarios, total, page })
    } catch {
        res.status(500).json({ message: 'Error al obtener usuarios' })
    }
}

export const desactivarUsuario = async (req, res) => {
    try {
        await deactivateUser(Number(req.params.id))
        res.json({ message: 'Usuario desactivado' })
    } catch {
        res.status(500).json({ message: 'Error al desactivar usuario' })
    }
}

export const activarUsuario = async (req, res) => {
    try {
        await activateUser(Number(req.params.id))
        res.json({ message: 'Usuario activado' })
    } catch {
        res.status(500).json({ message: 'Error al activar usuario' })
    }
}

export const eliminarUsuarioAdmin = async (req, res) => {
    try {
        await deleteUserAdmin(Number(req.params.id))
        res.json({ message: 'Usuario eliminado' })
    } catch {
        res.status(500).json({ message: 'Error al eliminar usuario' })
    }
}

export const eliminarResenaAdmin = async (req, res) => {
    try {
        await deleteResenaAdmin(Number(req.params.id))
        res.json({ message: 'Reseña eliminada' })
    } catch {
        res.status(500).json({ message: 'Error al eliminar reseña' })
    }
}

export const eliminarComentarioAdmin = async (req, res) => {
    try {
        await deleteComentarioAdmin(Number(req.params.id))
        res.json({ message: 'Comentario eliminado' })
    } catch {
        res.status(500).json({ message: 'Error al eliminar comentario' })
    }
}

export const estadisticasGlobales = async (req, res) => {
    try {
        const stats = await getEstadisticasGlobales()
        res.json(stats)
    } catch {
        res.status(500).json({ message: 'Error al obtener estadísticas' })
    }
}
