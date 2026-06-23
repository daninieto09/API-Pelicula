import prisma from '../config/prismaClientConfig.js'

export const createComentario = (usuarioId, listaId, comentario) =>
    prisma.comentarioLista.create({
        data: { usuarioId, listaId, comentario },
        select: {
            id: true,
            comentario: true,
            createdAt: true,
            usuario: { select: { id: true, nombre: true } },
        },
    })

export const getComentarios = (listaId) =>
    prisma.comentarioLista.findMany({
        where: { listaId },
        select: {
            id: true,
            comentario: true,
            createdAt: true,
            usuario: { select: { id: true, nombre: true } },
        },
        orderBy: { createdAt: 'asc' },
        take: 100,
    })

export const deleteComentario = (id, usuarioId) =>
    prisma.comentarioLista.deleteMany({ where: { id, usuarioId } })
