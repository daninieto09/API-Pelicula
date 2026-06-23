import prisma from '../config/prismaClientConfig.js'

export const findUserByEmail = async (email) => {
    return prisma.usuario.findUnique({ where: { email } })
}

export const findUserById = async (id) => {
    return prisma.usuario.findUnique({
        where: { id },
        select: { id: true, nombre: true, email: true, isAdmin: true, isActive: true, createdAt: true }
    })
}

export const deleteOwnAccount = async (id) =>
    prisma.usuario.delete({ where: { id } })

export const exportUserData = async (id) => {
    const [usuario, favoritos, resenas, listas, historial] = await Promise.all([
        prisma.usuario.findUnique({
            where: { id },
            select: { id: true, nombre: true, email: true, createdAt: true },
        }),
        prisma.favorito.findMany({ where: { usuarioId: id } }),
        prisma.resena.findMany({ where: { usuarioId: id } }),
        prisma.lista.findMany({ where: { usuarioId: id }, include: { contenidos: true } }),
        prisma.historialVista.findMany({ where: { usuarioId: id }, orderBy: { createdAt: 'desc' } }),
    ])
    return { usuario, favoritos, resenas, listas, historial, exportadoEn: new Date() }
}

export const createUser = async (nombre, email, password) => {
    const count = await prisma.usuario.count()
    return prisma.usuario.create({
        data: { nombre, email, password, isAdmin: count === 0 },
        select: { id: true, nombre: true, email: true, isAdmin: true }
    })
}

export const isFirstUser = async () => {
    const count = await prisma.usuario.count()
    return count === 0
}

export const updateUserProfile = (id, nombre, email) =>
    prisma.usuario.update({
        where: { id },
        data: { nombre, email },
        select: { id: true, nombre: true, email: true, isAdmin: true },
    })

export const updateUserPassword = (id, hashedPassword) =>
    prisma.usuario.update({ where: { id }, data: { password: hashedPassword } })

export const getDashboard = async (usuarioId) => {
    const [resumenHist, resumenRes, resumenFav, generos, correlacion, actHist, actRes] = await Promise.all([
        prisma.$queryRaw`
            SELECT
                COUNT(*)::int FILTER (WHERE tipo = 'movie') AS total_peliculas_vistas,
                COUNT(*)::int FILTER (WHERE tipo = 'tv')    AS total_series_vistas
            FROM historial_vistas WHERE usuario_id = ${usuarioId}
        `,
        prisma.$queryRaw`
            SELECT COUNT(*)::int AS total_resenas,
                   ROUND(AVG(calificacion)::numeric, 2) AS calificacion_promedio_dada
            FROM resenas WHERE usuario_id = ${usuarioId}
        `,
        prisma.$queryRaw`
            SELECT COUNT(*)::int AS total_favoritos FROM favoritos WHERE usuario_id = ${usuarioId}
        `,
        prisma.$queryRaw`
            SELECT genero, COUNT(*)::int AS count
            FROM historial_vistas
            WHERE usuario_id = ${usuarioId} AND genero IS NOT NULL AND genero <> ''
            GROUP BY genero ORDER BY count DESC LIMIT 10
        `,
        prisma.$queryRaw`
            SELECT genero,
                   ROUND(AVG(calificacion)::numeric, 2) AS promedio_calificacion,
                   COUNT(*)::int AS total_resenas
            FROM resenas
            WHERE usuario_id = ${usuarioId} AND genero IS NOT NULL AND genero <> ''
            GROUP BY genero ORDER BY total_resenas DESC
        `,
        prisma.$queryRaw`
            SELECT DATE_TRUNC('month', created_at) AS mes, COUNT(*)::int AS vistas
            FROM historial_vistas
            WHERE usuario_id = ${usuarioId}
              AND created_at >= NOW() - INTERVAL '12 months'
            GROUP BY mes ORDER BY mes
        `,
        prisma.$queryRaw`
            SELECT DATE_TRUNC('month', created_at) AS mes, COUNT(*)::int AS resenas
            FROM resenas
            WHERE usuario_id = ${usuarioId}
              AND created_at >= NOW() - INTERVAL '12 months'
            GROUP BY mes ORDER BY mes
        `,
    ])

    const mesesMap = {}
    actHist.forEach(({ mes, vistas }) => {
        const key = new Date(mes).toISOString().slice(0, 7)
        mesesMap[key] = { mes: key, vistas, resenas: 0 }
    })
    actRes.forEach(({ mes, resenas }) => {
        const key = new Date(mes).toISOString().slice(0, 7)
        if (mesesMap[key]) mesesMap[key].resenas = resenas
        else mesesMap[key] = { mes: key, vistas: 0, resenas }
    })
    const actividad_por_mes = Object.values(mesesMap).sort((a, b) => a.mes.localeCompare(b.mes))

    return {
        resumen: {
            total_peliculas_vistas: resumenHist[0]?.total_peliculas_vistas ?? 0,
            total_series_vistas:    resumenHist[0]?.total_series_vistas    ?? 0,
            total_resenas:          resumenRes[0]?.total_resenas           ?? 0,
            total_favoritos:        resumenFav[0]?.total_favoritos         ?? 0,
            calificacion_promedio_dada: resumenRes[0]?.calificacion_promedio_dada
                ? Number(resumenRes[0].calificacion_promedio_dada)
                : null,
        },
        generos_mas_consumidos: generos,
        correlacion_genero_calificacion: correlacion.map((r) => ({
            ...r,
            promedio_calificacion: Number(r.promedio_calificacion),
        })),
        actividad_por_mes,
    }
}

export const getPerfilPublico = (id) =>
    prisma.usuario.findUnique({
        where: { id, isActive: true },
        select: {
            id: true,
            nombre: true,
            _count: { select: { favoritos: true, resenas: true, listas: { where: { isPrivada: false } }, seguidores: true } },
        },
    })

export const getMiembros = async (page = 1, limit = 30) => {
    const offset = (page - 1) * limit
    return prisma.usuario.findMany({
        where: { isActive: true },
        select: {
            id: true,
            nombre: true,
            createdAt: true,
            _count: {
                select: {
                    favoritos: true,
                    resenas: true,
                    listas: { where: { isPrivada: false } },
                    seguidores: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
    })
}

export const countMiembrosActivos = () =>
    prisma.usuario.count({ where: { isActive: true } })