import { getHistorialByUser, addHistorial, deleteHistorialById } from '../models/historialModel.js'

export const getMiHistorial = async (req, res) => {
    try {
        const historial = await getHistorialByUser(req.user.id)
        res.json(historial)
    } catch {
        res.status(500).json({ message: 'Error al obtener historial' })
    }
}

export const registrarVista = async (req, res) => {
    try {
        const { contenidoId, titulo, poster, tipo, genero } = req.body
        const vista = await addHistorial(req.user.id, { contenidoId, titulo, poster, tipo, genero })
        res.status(201).json(vista)
    } catch {
        res.status(500).json({ message: 'Error al registrar vista' })
    }
}

export const eliminarVista = async (req, res) => {
    try {
        await deleteHistorialById(Number(req.params.id), req.user.id)
        res.json({ message: 'Eliminado del historial' })
    } catch {
        res.status(500).json({ message: 'Error al eliminar vista' })
    }
}
