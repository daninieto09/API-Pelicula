const isProd = process.env.NODE_ENV === 'production'

const errorHandler = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500
    const message = err.message || 'Error interno del servidor'

    if (!isProd) {
        console.error(`[${req.method}] ${req.path} →`, err.stack)
    }

    // Errores de validación Zod: ya llegan formateados desde los controllers
    if (err.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            error: { message: err.errors },
        })
    }

    res.status(status).json({
        success: false,
        error: {
            message,
            ...(!isProd && { stack: err.stack }),
        },
    })
}

export default errorHandler
