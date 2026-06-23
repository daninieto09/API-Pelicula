import prisma from '../config/prismaClientConfig.js'

const TTL_MS = 24 * 60 * 60 * 1000 // 24 horas

// ─── Cache de items individuales (peliculas/series) ───────────────────────────

export const getCachedItem = (contenidoId) =>
    prisma.moviesCache.findFirst({
        where: { contenidoId, expiresAt: { gt: new Date() } },
    })

export const setCachedItem = (data) => {
    const expiresAt = new Date(Date.now() + TTL_MS)
    return prisma.moviesCache.upsert({
        where: { contenidoId: data.contenidoId },
        update: { ...data, expiresAt },
        create: { ...data, expiresAt },
    })
}

export const clearExpiredCache = () =>
    prisma.moviesCache.deleteMany({ where: { expiresAt: { lt: new Date() } } })

export const getCacheStats = () =>
    Promise.all([
        prisma.moviesCache.count(),
        prisma.moviesCache.count({ where: { expiresAt: { lt: new Date() } } }),
    ]).then(([total, expirados]) => ({ total, expirados, activos: total - expirados }))

// ─── Cache de listas públicas (popular, trending) ─────────────────────────────
// Usa IDs negativos reservados para no colisionar con contenidoId reales de TMDB

export const POPULAR_CACHE_ID = -1
export const TRENDING_CACHE_ID = -2

export const getCachedList = (cacheId) =>
    prisma.moviesCache.findFirst({
        where: { contenidoId: cacheId, expiresAt: { gt: new Date() } },
    })

export const setCachedList = (cacheId, tipo, datos, ttlMs) => {
    const expiresAt = new Date(Date.now() + ttlMs)
    return prisma.moviesCache.upsert({
        where: { contenidoId: cacheId },
        update: { datos, expiresAt },
        create: {
            contenidoId: cacheId,
            tipo,
            titulo: tipo,
            generos: '',
            datos,
            expiresAt,
        },
    })
}
