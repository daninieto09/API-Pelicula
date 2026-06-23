import express from 'express'
import { getComentarios, crearComentario, eliminarComentario, getMisComentarios } from '../controllers/comentariosController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/mis-comentarios', verifyToken, getMisComentarios)
router.get('/resena/:resenaId', getComentarios)
router.post('/resena/:resenaId', verifyToken, crearComentario)
router.delete('/:id', verifyToken, eliminarComentario)

export default router
