import prisma from '../config/prismaClientConfig.js'

export const addLike = (usuarioId, tipo, referenciaId) =>
    prisma.like.create({ data: { usuarioId, tipo, referenciaId } })

export const removeLike = (usuarioId, tipo, referenciaId) =>
    prisma.like.deleteMany({ where: { usuarioId, tipo, referenciaId } })

export const getLikeCount = (tipo, referenciaId) =>
    prisma.like.count({ where: { tipo, referenciaId } })

export const checkLike = (usuarioId, tipo, referenciaId) =>
    prisma.like.findFirst({ where: { usuarioId, tipo, referenciaId } })
