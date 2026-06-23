import prisma from '../config/prismaClientConfig.js'

export const getFavoritosByUser = (usuarioId) =>
    prisma.favorito.findMany({ where: { usuarioId }, orderBy: { createdAt: 'desc' }, take: 100 })

export const isFavorito = (usuarioId, contenidoId) =>
    prisma.favorito.findFirst({ where: { usuarioId, contenidoId } })

export const addFavorito = (usuarioId, data) =>
    prisma.favorito.create({ data: { usuarioId, ...data } })

export const removeFavorito = (id, usuarioId) =>
    prisma.favorito.deleteMany({ where: { id, usuarioId } })

export const getFavoritoByContenido = (usuarioId, contenidoId) =>
    prisma.favorito.findFirst({ where: { usuarioId, contenidoId } })

export const findFavoritoById = (id) =>
    prisma.favorito.findUnique({ where: { id } })
