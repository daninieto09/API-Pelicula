import { z } from 'zod'

export const likeSchema = z.object({
    tipo: z.enum(['resena', 'lista']),
    referenciaId: z.number().int().positive(),
})
