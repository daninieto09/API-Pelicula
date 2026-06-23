import { z } from 'zod'

export const comentarioListaSchema = z.object({
    comentario: z
        .string()
        .min(1, 'El comentario no puede estar vacío')
        .max(500, 'El comentario no puede superar los 500 caracteres')
        .trim(),
})
