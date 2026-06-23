import express from 'express'
import { getPopularPublic, getTrendingPublic } from '../controllers/movieTvController.js'

const router = express.Router()

// GET /api/movies/popular  — películas populares para el home público (caché 24h)
router.get('/popular', getPopularPublic)

// GET /api/movies/trending — tendencias semanales para el slider (caché 6h)
router.get('/trending', getTrendingPublic)

export default router
