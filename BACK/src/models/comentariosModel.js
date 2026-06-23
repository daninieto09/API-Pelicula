import prisma from '../config/prismaClientConfig.js'

export const getComentariosByResena = (resenaId) =>
    prisma.comentarioResena.findMany({
        where: { resenaId },
        include: { usuario: { select: { id: true, nombre: true } } },
        orderBy: { createdAt: 'asc' },
        take: 50,
    })

export const createComentario = (usuarioId, resenaId, comentario) =>
    prisma.comentarioResena.create({ data: { usuarioId, resenaId, comentario } })

export const deleteComentario = (id, usuarioId) =>
    prisma.comentarioResena.deleteMany({ where: { id, usuarioId } })

export const getMisComentariosConResena = (usuarioId) =>
    prisma.comentarioResena.findMany({
        where: { usuarioId },
        select: {
            id: true,
            comentario: true,
            createdAt: true,
            resena: {
                select: {
                    id: true,
                    titulo: true,
                    contenidoId: true,
                    tipo: true,
                    poster: true,
                    calificacion: true,
                    usuario: { select: { id: true, nombre: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
    })
