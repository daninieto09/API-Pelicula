# Contexto del Proyecto — API MovieTv
> Documento de referencia para continuar el desarrollo sin perder el hilo de lo aprendido y decidido.

---

## 1. Información General

- **Nombre del proyecto:** API MovieTv
- **Título oficial:** Desarrollo de una plataforma web para la gestión y seguimiento personalizado de películas y series mediante la API TMDB
- **Tipo:** Proyecto de titulación — Instituto Superior Tecnológico Rumiñahui (ISTER)
- **Carrera:** Tecnología Superior en Desarrollo de Software y Gestión de Datos
- **Alumna:** Daniela Nieto

---

## 2. Descripción del Proyecto

La plataforma funciona como un **diario cinematográfico social**: los usuarios pueden buscar cualquier película o serie via TMDB sin importar en qué plataforma de streaming esté disponible, gestionar su actividad audiovisual y conectar con otros usuarios con gustos similares.

**Problema que resuelve:** Los usuarios no tienen un espacio propio, centralizado y gratuito para registrar lo que ven, opinar sobre ello e interactuar con otros. Las plataformas de streaming solo funcionan con su propio catálogo y no ofrecen herramientas sociales ni análisis de datos personales. (Referencia de mercado validada: **Letterboxd**).

---

## 3. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Vanilla JavaScript, SCSS, Rollup |
| Backend | Node.js, Express 5 |
| Base de datos | PostgreSQL 16 con Prisma ORM v7 |
| Autenticación | JWT en cookies httpOnly |
| Validación | Zod |
| API externa | TMDB (The Movie Database) |

---

## 4. Arquitectura del Backend

### Estructura de carpetas
```
BACK/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── prismaClientConfig.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── models/
│   │   └── userModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── movieTvRoutes.js
│   ├── schemas/
│   │   └── authSchema.js
│   └── server.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── prisma.config.ts
```

### Flujo de capas
```
routes → controllers → models → prismaClientConfig → PostgreSQL
```

### Reglas de arquitectura
- Cada capa tiene una sola responsabilidad
- Los controladores no hacen consultas directas a la DB
- Los modelos solo contienen consultas Prisma, sin lógica de negocio
- Los schemas (Zod) validan antes de llegar al controlador

---

## 5. Base de Datos — 9 Tablas

```prisma
model Usuario         @@map("usuarios")
model Favorito        @@map("favoritos")
model Resena          @@map("resenas")
model Lista           @@map("listas")
model ListaContenido  @@map("lista_contenido")
model HistorialVista  @@map("historial_vistas")
model Seguidor        @@map("seguidores")
model ComentarioResena @@map("comentarios_resenas")
model MoviesCache     @@map("movies_cache")
```

### Campos importantes añadidos por recomendación del tutor
- `genero` en `Favorito`, `Resena` e `HistorialVista` → para análisis del dashboard sin llamar a TMDB
- `isActive` en `Usuario` → para borrado lógico (privacidad / LOPDP)
- `MoviesCache` → evita superar el límite de 40 req/10s de TMDB

### Tablas con componente social
- `seguidores` → relación entre usuarios (quién sigue a quién)
- `comentarios_resenas` → comentarios sobre reseñas de otros usuarios

---

## 6. Configuración de Prisma v7 (IMPORTANTE)

Prisma v7 cambió la forma de configurar la conexión. **Ya no acepta `url` en `schema.prisma`.**

### prisma.config.ts
```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.DATABASE_URL! },
});
```

### prismaClientConfig.js (usa driver adapter)
```js
import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export default prisma
```

### schema.prisma (datasource sin url)
```prisma
datasource db {
  provider = "postgresql"
}
```

---

## 7. Autenticación

- JWT almacenado en **cookie httpOnly** (no localStorage — más seguro contra XSS)
- Cookie configurada con `secure: true` en producción, `sameSite: 'none'` en producción y `'lax'` en desarrollo
- El primer usuario registrado se convierte automáticamente en **admin**
- Logout elimina la cookie con `clearCookie`
- El token incluye `{ userId, isAdmin }` en el payload

### Flujo de registro
1. Zod valida los datos
2. Se verifica si el email ya existe
3. Se comprueba si es el primer usuario (para isAdmin)
4. Se encripta la contraseña con bcrypt (salt: 10)
5. Se crea el usuario en DB
6. Se genera el JWT y se envía como cookie

---

## 8. Middleware de Autenticación

```js
// verifyToken → protege rutas que requieren login
// verifyAdmin → protege rutas exclusivas de administrador

router.get('/favoritos', verifyToken, getFavoritos)
router.delete('/usuario/:id', verifyToken, verifyAdmin, deleteUsuario)
```

---

## 9. Variables de Entorno (.env)

```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/api_movieTv"
JWT_SECRET=clave_secreta_larga_y_segura
PORT=4000
```

El `.env.example` debe incluir descripciones de cada variable como guía para quien clone el proyecto.

---

## 10. Arquitectura del Frontend

### Estructura de carpetas
```
FRONT/
├── public/          ← bundles compilados por Rollup
├── src/
│   ├── utils/
│   │   ├── apiConfig.js       ← claves TMDB
│   │   └── obtenerGenero.js   ← helper
│   ├── services/
│   │   ├── movieServices.js   ← fetchGeneros, fetchPopulares, fetchBusqueda, fetchItem
│   │   └── authServices.js    ← login, register, logout, getProfile
│   ├── context/
│   │   ├── userContext.js     ← estado del usuario logueado
│   │   └── movieContext.js    ← tipo, página, géneroId activos
│   ├── components/
│   │   ├── cargarPeliculas.js
│   │   ├── cargarBotonesGeneros.js
│   │   ├── hamburguesa.js
│   │   ├── popup.js
│   │   ├── filtros.js
│   │   └── paginacion.js
│   ├── pages/
│   │   ├── home.js            ← entry point de index.html
│   │   └── login.js           ← entry point de login.html
│   └── index.js
├── sass/
├── img/
├── index.html
└── login.html
```

### Responsabilidad de cada capa
| Capa | Responsabilidad |
|------|----------------|
| `services/` | Único lugar donde se hace `fetch`. Habla con el backend o TMDB |
| `context/` | Guarda estado en memoria. Evita llamadas repetidas al backend |
| `components/` | Funciones que construyen el DOM. No hacen fetch ni guardan estado |
| `pages/` | Orquesta todo: llama services, actualiza context, usa components |

### Principio clave
`services` y `context` están **desacoplados a propósito**. La conexión entre ellos ocurre en `pages/`:
```js
const data = await login(email, password)  // authServices
setUsuario(data.usuario)                   // userContext
```

---

## 11. Login / Register — Una sola página

Se usa **History API** para cambiar la URL sin recargar:
- `history.pushState(null, '', 'register.html')` → cambia URL a /register.html
- `history.pushState(null, '', 'login.html')` → regresa a /login.html
- `window.addEventListener('popstate', ...)` → maneja el botón atrás

El fondo animado de posters (estilo HBO/Netflix) nunca se interrumpe porque no hay recarga de página.

### Diseño de login.html
- Fondo: 3 filas de posters de TMDB animados (filas 1 y 3 izquierda, fila 2 derecha)
- Card: glassmorphism con `backdrop-filter: blur(22px)`
- Dos cards en el DOM (login y register), solo uno visible a la vez con animación fade+slide

---

## 12. Requisitos del Tutor (pendientes de implementar)

### a) Caché de TMDB (`movies_cache`)
- TMDB tiene límite de 40 req/10s
- Antes de llamar a TMDB, verificar si el dato ya existe en `movies_cache` y si no expiró
- Si existe y es válido → usar DB. Si no → llamar a TMDB y guardar resultado

### b) Privacidad y LOPDP
- Ruta `DELETE /usuario` → borrado en cascada de todos los datos del usuario
- Ruta `GET /usuario/exportar` → devuelve JSON/CSV con todas las reseñas del usuario

### c) Dashboard de Gestión de Datos (punto fuerte de la carrera)
No limitarse a contar películas. El tutor pide:
- **Tendencias por mes**: cuánto consumió el usuario cada mes
- **Correlación géneros/calificaciones**: ¿el usuario califica mejor el drama que el terror?
- **Evolución de gustos**: cómo cambiaron las preferencias a lo largo del tiempo
- Visualizado con **Chart.js**

---

## 13. Componente Social (pendiente)

Interacciones aprobadas:
- Ver reseñas de otros usuarios
- Comentar las reseñas de otros
- Seguir a otros usuarios y ver su actividad

---

## 14. Páginas de la Plataforma y su Contenido

Inspirado en Letterboxd pero adaptado a tu proyecto con películas Y series via TMDB.

---

### Navbar (visible en todas las páginas)

**Usuario no logueado:**
```
Logo | Inicio | Explorar | Géneros | Iniciar Sesión | Registrarse
```

**Usuario logueado:**
```
Logo | Inicio | Explorar | Géneros | Mi Actividad ▾ | [Avatar] ▾
                                       └ Favoritos        └ Mi Perfil
                                       └ Historial        └ Mis Listas
                                       └ Reseñas          └ Configuración
                                       └ Seguidos         └ Cerrar Sesión
```

**Admin (además de lo anterior):**
```
... | Panel Admin ▾
       └ Usuarios
       └ Moderación
       └ Estadísticas globales
       └ Caché TMDB
```

---

### 🏠 Página Principal (`index.html`)
- Grid de películas/series populares via TMDB
- Filtro por tipo: Película / Serie
- Filtro por géneros (botones)
- Filtro por año (rango mínimo-máximo)
- Buscador y paginación
- Al hacer clic en un poster → Modal con detalle:
  - Poster, título, sinopsis, fecha, calificación TMDB
  - Botones: ❤️ Favorito | 👁️ Visto | ➕ Agregar a lista | ⭐ Reseñar
  - Calificación promedio de usuarios de la plataforma
  - Últimas reseñas de otros usuarios sobre ese título

### 🎬 Página Explorar (`explorar.html`)
- "Más vistas esta semana" en la plataforma
- "Mejor calificadas por nuestra comunidad"
- "Recientemente reseñadas"
- Filtro por género, tipo, año — ordenar por popularidad / calificación / fecha

### 🎭 Página Géneros (`generos.html`)
- Grid de géneros disponibles (Acción, Drama, Terror, Comedia, etc.)
- Al hacer clic → lista de contenido filtrado por ese género

### 👤 Perfil de Usuario (`perfil.html`)
- Avatar, nombre, bio
- 4 títulos favoritos destacados (estilo Letterboxd)
- Estadísticas: total vistas | reseñas | seguidores | siguiendo
- Tabs: Vistas recientes | Reseñas | Listas | Favoritos
- Botón "Seguir" si es perfil ajeno / "Editar" si es el propio

### ⭐ Reseñas de un Título
- Calificación promedio con distribución (histograma del 1 al 10)
- Lista de reseñas: avatar, nombre, estrellas, comentario, fecha
- Comentarios anidados debajo de cada reseña

### 📋 Mis Listas (`mis-listas.html`)
- Grid de listas con nombre, descripción, cantidad de títulos, posters en miniatura
- Botón crear nueva lista

### 📊 Dashboard Personal (`dashboard.html`)
- Total películas vistas / series vistas
- Géneros más consumidos (gráfico dona — Chart.js)
- Calificación promedio que da el usuario
- Correlación géneros/calificaciones
- Actividad por mes (gráfico de línea)

### ⚙️ Configuración (`configuracion.html`)
- Editar nombre, email, contraseña
- Exportar mis datos en JSON/CSV — requisito LOPDP
- Eliminar cuenta — requisito LOPDP

### Páginas del Admin
- **Gestión de usuarios** → tabla con todos los usuarios, desactivar / eliminar
- **Moderación** → eliminar reseñas y comentarios inapropiados
- **Estadísticas globales** → usuarios por mes, títulos más populares, géneros más consumidos
- **Caché TMDB** → ver estado y limpiar registros expirados

### Visualización de Calificaciones
Escala del 1 al 10 representada con estrellas (½ estrella = 1 punto). En reseñas se muestra estrellas del autor + distribución global del título en histograma.

---

## 15. Panel de Administrador

El admin se distingue por `isAdmin: true` en su token JWT y en la DB. El middleware `verifyAdmin` protege sus rutas.

### Funcionalidades del admin

**Gestión de usuarios**
- Ver lista de todos los usuarios registrados
- Desactivar cuentas (`isActive: false`) sin borrarlas — borrado lógico
- Eliminar cuentas con todo su contenido en cascada

**Moderación de contenido social**
- Ver y eliminar reseñas inapropiadas
- Ver y eliminar comentarios inapropiados
- Necesario porque el proyecto tiene componente social

**Estadísticas globales de la plataforma**
- Usuarios registrados por mes
- Películas/series más agregadas a favoritos globalmente
- Géneros más populares entre todos los usuarios
- Reseñas más comentadas

**Gestión del caché**
- Ver estado del `movies_cache`
- Limpiar registros expirados manualmente

### Lo que el admin NO controla
- Gestión de películas/series → las trae TMDB, no se administran
- Roles múltiples → solo admin y usuario normal, suficiente para titulación

### Rutas de admin (patrón)
```js
router.get('/admin/usuarios', verifyToken, verifyAdmin, getUsuarios)
router.patch('/admin/usuarios/:id/desactivar', verifyToken, verifyAdmin, desactivarUsuario)
router.delete('/admin/resenas/:id', verifyToken, verifyAdmin, eliminarResena)
router.get('/admin/estadisticas', verifyToken, verifyAdmin, getEstadisticas)
```

---

## 15. Buenas Prácticas Aplicadas

- `.gitignore` con `.env` y `node_modules` desde el inicio
- `.env.example` con descripciones de cada variable
- Contraseñas encriptadas con bcrypt, nunca devueltas en respuestas
- SQL Injection prevenido con parámetros posicionales de Prisma
- Error de login siempre dice "Credenciales incorrectas" (no revela qué campo falló)
- `console.log` de datos sensibles eliminados antes de subir a producción
- El servidor solo levanta si la DB conecta exitosamente
- Validación en 3 niveles: frontend + Zod en backend + constraints en DB
- Fetch sin axios — el proyecto no lo justifica y es una dependencia menos

---

## 16. Comandos Útiles

```bash
# Backend
npm run dev                      # levantar servidor con nodemon
npx prisma migrate dev --name X  # crear migración
npx prisma db push --force-reset # sincronizar schema sin historial
npx prisma generate              # regenerar cliente de Prisma
npx prisma studio                # explorador visual de la DB

# Frontend
npm run build   # compilar JS con Rollup
npm run sass    # compilar SCSS
```

---

## 17. Pendiente de Implementar (en orden)

1. Probar endpoint `POST /api/auth/register` y `POST /api/auth/login`
2. Implementar rutas de favoritos, reseñas y listas en el backend
3. Implementar caché de TMDB (`movies_cache`)
4. Rutas de privacidad (borrar cuenta, exportar datos)
5. Componente social (seguir, comentar reseñas)
6. Dashboard de análisis con Chart.js
7. Conectar frontend con backend (autenticación en index.html)
8. Página de perfil de usuario
9. Pruebas y corrección de errores
10. Documentación final y presentación
