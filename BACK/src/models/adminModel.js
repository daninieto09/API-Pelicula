import prisma from '../config/prismaClientConfig.js'

export const getAllUsers = (page = 1, limit = 20) =>
    prisma.usuario.findMany({
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, nombre: true, email: true, isAdmin: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
    })

export const getTotalUsers = () => prisma.usuario.count()

export const deactivateUser = (id) =>
    prisma.usuario.update({ where: { id }, data: { isActive: false } })

export const activateUser = (id) =>
    prisma.usuario.update({ where: { id }, data: { isActive: true } })

export const deleteUserAdmin = (id) =>
    prisma.usuario.delete({ where: { id } })

export const deleteResenaAdmin = (id) =>
    prisma.resena.deleteMany({ where: { id } })

export const deleteComentarioAdmin = (id) =>
    prisma.comentarioResena.deleteMany({ where: { id } })

export const getEstadisticasGlobales = async () => {
    const [usuarios, favoritos, resenas, historial, contenidosMasVistos, generosMasPopulares] =
        await Promise.all([
            prisma.usuario.count(),
            prisma.favorito.count(),
            prisma.resena.count(),
            prisma.historialVista.count(),
            prisma.favorito.groupBy({
                by: ['contenidoId', 'titulo', 'tipo'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            }),
            prisma.favorito.groupBy({
                by: ['genero'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 8,
                where: { genero: { not: null } },
            }),
        ])

    const registrosPorMes = await prisma.$queryRaw`
        SELECT TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS mes,
               COUNT(*)::int AS total
        FROM usuarios
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY mes
        ORDER BY mes ASC
    `

    return { usuarios, favoritos, resenas, historial, contenidosMasVistos, generosMasPopulares, registrosPorMes }
}
