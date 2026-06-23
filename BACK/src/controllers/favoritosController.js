import { getFavoritosByUser, isFavorito, addFavorito, removeFavorito, getFavoritoByContenido, findFavoritoById } from '../models/favoritosModel.js'

export const getFavoritosDeUsuario = async (req, res) => {
    try {
        const favoritos = await getFavoritosByUser(Number(req.params.id))
        res.json(favoritos)
    } catch {
        res.status(500).json({ message: 'Error al obtener favoritos del usuario' })
    }
}

export const getMisFavoritos = async (req, res) => {
    try {
        const favoritos = await getFavoritosByUser(req.user.id)
        res.json(favoritos)
    } catch {
        res.status(500).json({ message: 'Error al obtener favoritos' })
    }
}

export const agregarFavorito = async (req, res) => {
    try {
        const { contenidoId, titulo, poster, tipo, genero } = req.body
        const existe = await isFavorito(req.user.id, contenidoId)
        if (existe) return res.status(409).json({ message: 'Este título ya está en tus favoritos' })
        const favorito = await addFavorito(req.user.id, { contenidoId, titulo, poster, tipo, genero })
        res.status(201).json(favorito)
    } catch {
        res.status(500).json({ message: 'Error al agregar favorito' })
    }
}

export const eliminarFavorito = async (req, res) => {
    try {
        const favorito = await findFavoritoById(Number(req.params.id))
        if (!favorito) return res.status(404).json({ message: 'Favorito no encontrado' })
        if (favorito.usuarioId !== req.user.id) return res.status(403).json({ message: 'No tienes permiso para eliminar este favorito' })
        await removeFavorito(Number(req.params.id), req.user.id)
        res.json({ message: 'Eliminado de favoritos' })
    } catch {
        res.status(500).json({ message: 'Error al eliminar favorito' })
    }
}

export const checkFavorito = async (req, res) => {
    try {
        const contenidoId = Number(req.params.contenidoId)
        const favorito = await getFavoritoByContenido(req.user.id, contenidoId)
        res.json({ esFavorito: !!favorito, favoritoId: favorito?.id ?? null })
    } catch {
        res.status(500).json({ message: 'Error al verificar favorito' })
    }
}
