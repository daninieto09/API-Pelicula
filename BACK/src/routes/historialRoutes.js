import express from 'express'
import { getMiHistorial, registrarVista, eliminarVista } from '../controllers/historialController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', verifyToken, getMiHistorial)
router.post('/', verifyToken, registrarVista)
router.delete('/:id', verifyToken, eliminarVista)

export default router
