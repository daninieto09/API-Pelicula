import {
    getCachedItem, setCachedItem, clearExpiredCache, getCacheStats,
    getCachedList, setCachedList, POPULAR_CACHE_ID, TRENDING_CACHE_ID,
} from '../models/cacheModel.js'
import prisma from '../config/prismaClientConfig.js'

const TMDB_KEY = process.env.TMDB_API_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'

const tmdbFetch = async (path) => {
    const res = await fetch(`${TMDB_BASE}${path}`)
    if (!res.ok) throw new Error(`TMDB error ${res.status}`)
    return res.json()
}

// ─── Endpoints existentes (app autenticada) ───────────────────────────────────

export const getItem = async (req, res) => {
    try {
        const { tipo, id } = req.params
        const contenidoId = Number(id)

        const cached = await getCachedItem(contenidoId)
        if (cached) return res.json(cached.datos)

        const datos = await tmdbFetch(`/${tipo}/${id}?api_key=${TMDB_KEY}&language=es-ES`)

        await setCachedItem({
            contenidoId,
            tipo,
            titulo: datos.title || datos.name || '',
            poster: datos.poster_path || null,
            generos: (datos.genres || []).map((g) => g.name).join(', '),
            sinopsis: datos.overview || null,
            fechaLanzamiento: datos.release_date || datos.first_air_date || null,
            calificacionTmdb: datos.vote_average || null,
            datos,
        })

        res.json(datos)
    } catch {
        res.status(500).json({ message: 'Error al obtener contenido' })
    }
}

export const getPopulares = async (req, res) => {
    try {
        const { tipo = 'movie', pagina = 1 } = req.query
        const datos = await tmdbFetch(`/${tipo}/popular?api_key=${TMDB_KEY}&language=es&page=${pagina}`)
        res.json(datos)
    } catch {
        res.status(500).json({ message: 'Error al obtener populares' })
    }
}

export const buscar = async (req, res) => {
    try {
        const { tipo = 'movie', pagina = 1, generoId, añoInicial = 1950, añoFinal = 2025 } = req.query
        const generoParam = generoId ? `&with_genres=${generoId}` : ''
        const fechaKey = tipo === 'movie' ? 'release_date' : 'first_air_date'
        const path = `/discover/${tipo}?api_key=${TMDB_KEY}&language=es&page=${pagina}&${fechaKey}.gte=${añoInicial}-01-01&${fechaKey}.lte=${añoFinal}-12-31&sort_by=popularity.desc${generoParam}`
        const datos = await tmdbFetch(path)
        res.json(datos)
    } catch {
        res.status(500).json({ message: 'Error en la búsqueda' })
    }
}

export const getGeneros = async (req, res) => {
    try {
        const { tipo = 'movie' } = req.query
        const datos = await tmdbFetch(`/genre/${tipo}/list?api_key=${TMDB_KEY}&language=es`)
        res.json(datos)
    } catch {
        res.status(500).json({ message: 'Error al obtener géneros' })
    }
}

export const limpiarCacheExpirado = async (req, res) => {
    try {
        const result = await clearExpiredCache()
        res.json({ message: `${result.count} registros eliminados del caché` })
    } catch {
        res.status(500).json({ message: 'Error al limpiar caché' })
    }
}

export const estadosCache = async (req, res) => {
    try {
        const stats = await getCacheStats()
        res.json(stats)
    } catch {
        res.status(500).json({ message: 'Error al obtener estadísticas del caché' })
    }
}

export const getItemStats = async (req, res) => {
    try {
        const contenidoId = Number(req.params.contenidoId)
        const [favoritos_count, resenas_count, vistos_count, promedio] = await Promise.all([
            prisma.favorito.count({ where: { contenidoId } }),
            prisma.resena.count({ where: { contenidoId } }),
            prisma.historialVista.count({ where: { contenidoId } }),
            prisma.resena.aggregate({ where: { contenidoId }, _avg: { calificacion: true } }),
        ])
        const calificacion_promedio = promedio._avg.calificacion
            ? Number(promedio._avg.calificacion.toFixed(2))
            : null
        res.json({ stats: { contenidoId, favoritos_count, resenas_count, vistos_count, calificacion_promedio } })
    } catch {
        res.status(500).json({ message: 'Error al obtener estadísticas' })
    }
}

// ─── Endpoints públicos (home sin login) ──────────────────────────────────────

const TTL_24H = 24 * 60 * 60 * 1000
const TTL_6H  =  6 * 60 * 60 * 1000

export const getPopularPublic = async (req, res) => {
    try {
        const cached = await getCachedList(POPULAR_CACHE_ID)
        if (cached) {
            return res.json({ success: true, data: cached.datos, source: 'cache' })
        }

        const result = await tmdbFetch(`/movie/popular?api_key=${TMDB_KEY}&language=es-ES`)
        const data = (result.results || []).slice(0, 12).map(({
            id, title, poster_path, release_date, vote_average,
        }) => ({ id, title, poster_path, release_date, vote_average }))

        await setCachedList(POPULAR_CACHE_ID, 'popular-public', data, TTL_24H)

        res.json({ success: true, data, source: 'tmdb' })
    } catch (err) {
        console.warn('[getPopularPublic] TMDB no disponible:', err.message)
        res.json({ success: true, data: [], source: 'tmdb' })
    }
}

export const getTrendingPublic = async (req, res) => {
    try {
        const cached = await getCachedList(TRENDING_CACHE_ID)
        if (cached) {
            return res.json({ success: true, data: cached.datos, source: 'cache' })
        }

        const result = await tmdbFetch(`/trending/movie/week?api_key=${TMDB_KEY}&language=es-ES`)
        const data = (result.results || []).slice(0, 5).map(({
            id, title, overview, backdrop_path, release_date, vote_average,
        }) => ({ id, title, overview, backdrop_path, release_date, vote_average }))

        await setCachedList(TRENDING_CACHE_ID, 'trending-public', data, TTL_6H)

        res.json({ success: true, data, source: 'tmdb' })
    } catch (err) {
        console.warn('[getTrendingPublic] TMDB no disponible:', err.message)
        res.json({ success: true, data: [], source: 'tmdb' })
    }
}
