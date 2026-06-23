import {
    seguirUsuario as seguirUsuarioModel,
    dejarDeSeguir as dejarDeSeguirModel,
    getMisSeguidos,
    getMisSeguidores,
    esSeguidor,
    getConteoSeguidores,
} from '../models/seguidoresModel.js'
import { findUserById } from '../models/userModel.js'

export const seguirUsuario = async (req, res) => {
    try {
        const usuarioId = Number(req.params.usuarioId)
        const userId = req.user.id

        if (userId === usuarioId) {
            return res.status(400).json({ message: 'No puedes seguirte a ti mismo' })
        }

        const objetivo = await findUserById(usuarioId)
        if (!objetivo || !objetivo.isActive) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        const yaEsSeguidor = await esSeguidor(userId, usuarioId)
        if (yaEsSeguidor) {
            return res.status(409).json({ message: 'Ya sigues a este usuario' })
        }

        await seguirUsuarioModel(userId, usuarioId)
        res.status(201).json({ message: 'Ahora sigues a este usuario' })
    } catch {
        res.status(500).json({ message: 'Error al seguir usuario' })
    }
}

export const dejarDeSeguir = async (req, res) => {
    try {
        const usuarioId = Number(req.params.usuarioId)
        const userId = req.user.id

        const registro = await esSeguidor(userId, usuarioId)
        if (!registro) {
            return res.status(404).json({ message: 'No sigues a este usuario' })
        }

        await dejarDeSeguirModel(userId, usuarioId)
        res.status(200).json({ message: 'Dejaste de seguir a este usuario' })
    } catch {
        res.status(500).json({ message: 'Error al dejar de seguir' })
    }
}

export const seguir = async (req, res) => {
    try {
        const siguiendoId = Number(req.params.id)
        if (siguiendoId === req.user.id) {
            return res.status(400).json({ message: 'No puedes seguirte a ti mismo' })
        }
        const yaEsSeguidor = await esSeguidor(req.user.id, siguiendoId)
        if (yaEsSeguidor) return res.status(400).json({ message: 'Ya sigues a este usuario' })
        await seguirUsuarioModel(req.user.id, siguiendoId)
        res.status(201).json({ message: 'Ahora sigues a este usuario' })
    } catch {
        res.status(500).json({ message: 'Error al seguir usuario' })
    }
}

export const dejarSeguir = async (req, res) => {
    try {
        await dejarDeSeguirModel(req.user.id, Number(req.params.id))
        res.json({ message: 'Dejaste de seguir a este usuario' })
    } catch {
        res.status(500).json({ message: 'Error al dejar de seguir' })
    }
}

export const misSeguidos = async (req, res) => {
    try {
        const seguidos = await getMisSeguidos(req.user.id)
        res.json(seguidos)
    } catch {
        res.status(500).json({ message: 'Error al obtener seguidos' })
    }
}

export const misSeguidores = async (req, res) => {
    try {
        const seguidores = await getMisSeguidores(req.user.id)
        res.json(seguidores)
    } catch {
        res.status(500).json({ message: 'Error al obtener seguidores' })
    }
}

export const conteo = async (req, res) => {
    try {
        const usuarioId = req.params.id ? Number(req.params.id) : req.user.id
        const datos = await getConteoSeguidores(usuarioId)
        res.json(datos)
    } catch {
        res.status(500).json({ message: 'Error al obtener conteo' })
    }
}
