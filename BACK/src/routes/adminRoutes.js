import express from 'express'
import {
    listarUsuarios, desactivarUsuario, activarUsuario,
    eliminarUsuarioAdmin, eliminarResenaAdmin, eliminarComentarioAdmin, estadisticasGlobales,
} from '../controllers/adminController.js'
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(verifyToken, verifyAdmin)

router.get('/usuarios', listarUsuarios)
router.patch('/usuarios/:id/desactivar', desactivarUsuario)
router.patch('/usuarios/:id/activar', activarUsuario)
router.delete('/usuarios/:id', eliminarUsuarioAdmin)
router.delete('/resenas/:id', eliminarResenaAdmin)
router.delete('/comentarios/:id', eliminarComentarioAdmin)
router.get('/estadisticas', estadisticasGlobales)

export default router
