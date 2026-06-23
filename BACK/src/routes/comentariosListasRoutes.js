import express from 'express'
import { crearComentario, obtenerComentarios, eliminarComentario } from '../controllers/comentariosListasController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/:listaId/comentarios', verifyToken, crearComentario)
router.get('/:listaId/comentarios', obtenerComentarios)
router.delete('/comentarios/:id', verifyToken, eliminarComentario)

export default router
