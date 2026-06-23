import prisma from '../config/prismaClientConfig.js'

export const getResenasByContenido = (contenidoId, tipo) =>
    prisma.resena.findMany({
        where: { contenidoId, tipo },
        include: { usuario: { select: { id: true, nombre: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
    })

export const getResenasByUser = (usuarioId) =>
    prisma.resena.findMany({ where: { usuarioId }, orderBy: { createdAt: 'desc' }, take: 100 })

export const createResena = (usuarioId, data) =>
    prisma.resena.create({ data: { usuarioId, ...data } })

export const updateResena = (id, usuarioId, data) =>
    prisma.resena.updateMany({ where: { id, usuarioId }, data })

export const deleteResena = (id, usuarioId) =>
    prisma.resena.deleteMany({ where: { id, usuarioId } })

export const findResenaById = (id) =>
    prisma.resena.findUnique({ where: { id } })

export const getComentariosByResenaId = (resenaId) =>
    prisma.comentarioResena.findMany({
        where: { resenaId },
        select: {
            id: true,
            comentario: true,
            createdAt: true,
            usuario: { select: { id: true, nombre: true } },
        },
        orderBy: { createdAt: 'asc' },
    })

export const createComentarioConUsuario = (usuarioId, resenaId, comentario) =>
    prisma.comentarioResena.create({
        data: { usuarioId, resenaId, comentario },
        select: {
            id: true,
            comentario: true,
            createdAt: true,
            usuario: { select: { id: true, nombre: true } },
        },
    })
