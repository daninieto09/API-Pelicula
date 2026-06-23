import prisma from '../config/prismaClientConfig.js'

export const seguirUsuario = (seguidorId, siguiendoId) =>
    prisma.seguidor.create({ data: { seguidorId, siguiendoId } })

export const dejarDeSeguir = (seguidorId, siguiendoId) =>
    prisma.seguidor.deleteMany({ where: { seguidorId, siguiendoId } })

export const getMisSeguidos = (seguidorId) =>
    prisma.seguidor.findMany({
        where: { seguidorId },
        include: { siguiendo: { select: { id: true, nombre: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
    })

export const getMisSeguidores = (siguiendoId) =>
    prisma.seguidor.findMany({
        where: { siguiendoId },
        include: { seguidor: { select: { id: true, nombre: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
    })

export const esSeguidor = (seguidorId, siguiendoId) =>
    prisma.seguidor.findFirst({ where: { seguidorId, siguiendoId } })

export const getConteoSeguidores = (usuarioId) =>
    Promise.all([
        prisma.seguidor.count({ where: { seguidorId: usuarioId } }),
        prisma.seguidor.count({ where: { siguiendoId: usuarioId } }),
    ]).then(([seguidos, seguidores]) => ({ seguidos, seguidores }))
