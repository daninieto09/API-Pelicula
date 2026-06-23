import prisma from '../config/prismaClientConfig.js'

export const getListasPublicas = (page = 1, limit = 20) =>
    prisma.lista.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { usuario: { isActive: true }, isPrivada: false },
        include: {
            usuario: { select: { id: true, nombre: true } },
            _count: { select: { contenidos: true } },
            contenidos: { take: 4, orderBy: { createdAt: 'asc' }, select: { poster: true, titulo: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

export const countListasPublicas = () =>
    prisma.lista.count({ where: { usuario: { isActive: true }, isPrivada: false } })

export const getListaById = (id) =>
    prisma.lista.findUnique({
        where: { id },
        include: {
            usuario: { select: { id: true, nombre: true } },
            _count: { select: { contenidos: true } },
        },
    })

export const getListasByUser = (usuarioId) =>
    prisma.lista.findMany({
        where: { usuarioId },
        include: { _count: { select: { contenidos: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
    })

export const createLista = (usuarioId, nombre, descripcion, isPrivada = false) =>
    prisma.lista.create({ data: { usuarioId, nombre, descripcion, isPrivada } })

export const deleteLista = (id, usuarioId) =>
    prisma.lista.deleteMany({ where: { id, usuarioId } })

export const getListaContenidos = (listaId) =>
    prisma.listaContenido.findMany({ where: { listaId }, orderBy: { createdAt: 'desc' }, take: 100 })

export const findContenidoEnLista = (listaId, contenidoId) =>
    prisma.listaContenido.findFirst({ where: { listaId, contenidoId } })

export const addToLista = (listaId, data) =>
    prisma.listaContenido.create({ data: { listaId, ...data } })

export const removeFromLista = (listaId, contenidoId) =>
    prisma.listaContenido.deleteMany({ where: { listaId, contenidoId } })

export const getListasPublicasDeUsuario = (usuarioId) =>
    prisma.lista.findMany({
        where: { usuarioId, isPrivada: false },
        include: { _count: { select: { contenidos: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
    })
