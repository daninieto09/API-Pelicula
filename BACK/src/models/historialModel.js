import prisma from '../config/prismaClientConfig.js'

export const getHistorialByUser = (usuarioId) =>
    prisma.historialVista.findMany({
        where: { usuarioId },
        orderBy: { createdAt: 'desc' },
        take: 60,
    })

export const addHistorial = (usuarioId, data) =>
    prisma.$transaction([
        prisma.historialVista.deleteMany({ where: { usuarioId, contenidoId: data.contenidoId } }),
        prisma.historialVista.create({ data: { usuarioId, ...data } }),
    ]).then(([, created]) => created)

export const deleteHistorialById = (id, usuarioId) =>
    prisma.historialVista.deleteMany({ where: { id, usuarioId } })
