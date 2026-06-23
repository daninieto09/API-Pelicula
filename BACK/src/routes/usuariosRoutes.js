import express from 'express'
import { listarMiembros, getPerfilPublicoCtrl } from '../controllers/usuariosController.js'

const router = express.Router()

router.get('/miembros', listarMiembros)
router.get('/:id/perfil', getPerfilPublicoCtrl)

export default router
