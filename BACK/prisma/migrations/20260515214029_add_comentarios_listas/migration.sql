-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoritos" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "contenidoId" INTEGER NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "poster" VARCHAR(500),
    "tipo" VARCHAR(10) NOT NULL,
    "genero" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resenas" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "contenidoId" INTEGER NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "genero" VARCHAR(100),
    "poster" VARCHAR(500),
    "calificacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resenas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listas" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lista_contenido" (
    "id" SERIAL NOT NULL,
    "listaId" INTEGER NOT NULL,
    "contenidoId" INTEGER NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "poster" VARCHAR(500),
    "tipo" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lista_contenido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_vistas" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "contenidoId" INTEGER NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "poster" VARCHAR(500),
    "tipo" VARCHAR(10) NOT NULL,
    "genero" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_vistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seguidores" (
    "id" SERIAL NOT NULL,
    "seguidorId" INTEGER NOT NULL,
    "siguiendoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seguidores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comentarios_resenas" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "resenaId" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentarios_resenas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comentarios_listas" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "listaId" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentarios_listas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movies_cache" (
    "id" SERIAL NOT NULL,
    "contenidoId" INTEGER NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "poster" VARCHAR(500),
    "generos" VARCHAR(255) NOT NULL,
    "sinopsis" TEXT,
    "fechaLanzamiento" VARCHAR(20),
    "calificacionTmdb" DOUBLE PRECISION,
    "datos" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movies_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "seguidores_seguidorId_siguiendoId_key" ON "seguidores"("seguidorId", "siguiendoId");

-- CreateIndex
CREATE UNIQUE INDEX "movies_cache_contenidoId_key" ON "movies_cache"("contenidoId");

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resenas" ADD CONSTRAINT "resenas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listas" ADD CONSTRAINT "listas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lista_contenido" ADD CONSTRAINT "lista_contenido_listaId_fkey" FOREIGN KEY ("listaId") REFERENCES "listas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_vistas" ADD CONSTRAINT "historial_vistas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguidores" ADD CONSTRAINT "seguidores_seguidorId_fkey" FOREIGN KEY ("seguidorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguidores" ADD CONSTRAINT "seguidores_siguiendoId_fkey" FOREIGN KEY ("siguiendoId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_resenas" ADD CONSTRAINT "comentarios_resenas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_resenas" ADD CONSTRAINT "comentarios_resenas_resenaId_fkey" FOREIGN KEY ("resenaId") REFERENCES "resenas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_listas" ADD CONSTRAINT "comentarios_listas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_listas" ADD CONSTRAINT "comentarios_listas_listaId_fkey" FOREIGN KEY ("listaId") REFERENCES "listas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
