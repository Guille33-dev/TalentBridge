# TalentBridge

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)

Plataforma web para conectar estudiantes con empresas que ofrecen practicas profesionales. Los estudiantes pueden buscar ofertas, guardar practicas, postularse y gestionar su perfil. La aplicacion tambien incluye un panel de administracion para gestionar empresas, vacantes y postulaciones.

**Proyecto final - Desarrollo de Aplicaciones Web**

## Tecnologias

**Frontend**

- React 18 + Vite 6
- JavaScript / JSX
- Radix UI

**Backend**

- Node.js + Express
- TypeScript
- Prisma ORM
- JWT para autenticacion
- bcryptjs para contrasenas

**Base de datos y despliegue**

- Supabase PostgreSQL
- Vercel para frontend y backend/API

## Instalacion

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd ProyectofinalGit
```

### 2. Configurar la base de datos

El proyecto usa **Supabase PostgreSQL**.

1. Crea un proyecto en Supabase.
2. Entra en `Project Settings` -> `Database`.
3. Copia la connection string del **Session Pooler**.
4. Usala en el `.env` del backend como `DATABASE_URL` y `DIRECT_URL`.

> Se recomienda anadir `?sslmode=require` si la URL no lo incluye.

### 3. Configurar el backend

```bash
cd backend
npm install
```

Crea un `.env` dentro de `backend/`:

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="cambia_esto_por_un_secreto_largo"
```

Prepara Prisma y carga datos iniciales:

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

Arranca el backend:

```bash
npm run dev
```

Backend en:

```txt
http://localhost:4000/api/v1
```

Healthcheck:

```txt
http://localhost:4000/api/v1/health
```

### 4. Configurar el frontend

Abre una nueva terminal:

```bash
cd frontend
npm install
```

Crea un `.env` dentro de `frontend/`:

```env
VITE_API_URL=http://localhost:4000/api/v1
```

Arranca el frontend:

```bash
npm run dev
```

Frontend en:

```txt
http://localhost:3000
```

## Credenciales de prueba

El seed crea un administrador de desarrollo:

- **Email:** `admin@talentbridge.local`
- **Contraseña:** `Admin12345`

> Esta cuenta es solo para desarrollo. En produccion debe cambiarse o eliminarse.


## Funcionalidades

- Home con practicas y empresas destacadas.
- Buscador de practicas.
- Filtros por texto, ubicacion, modalidad y area.
- Catalogo de empresas.
- Detalle completo de practica.
- Detalle completo de empresa.
- Registro y login con JWT.
- Dashboard privado para estudiantes.
- Perfil editable.
- Sistema de practicas guardadas.
- Sistema de postulaciones.
- Retirada de postulaciones.
- Panel de administracion.
- CRUD de empresas.
- CRUD de practicas.
- Gestion de estados de postulaciones.
- Roles `STUDENT` y `ADMIN`.

## API principal

Base:

```txt
/api/v1
```

Endpoints publicos:

```txt
GET /health
GET /jobs
GET /jobs/:idOrSlug
GET /companies
GET /companies/:idOrSlug
```

Autenticacion:

```txt
POST /auth/register
POST /auth/login
GET /users/me
```

Estudiante:

```txt
GET /profile/me
PATCH /profile/me
GET /applications/me
POST /applications
PATCH /applications/:id/withdraw
GET /saved-jobs
POST /saved-jobs
DELETE /saved-jobs/:jobId
```

Admin:

```txt
GET /admin/summary
GET /admin/companies
POST /admin/companies
PATCH /admin/companies/:id
DELETE /admin/companies/:id
GET /admin/jobs
POST /admin/jobs
PATCH /admin/jobs/:id
DELETE /admin/jobs/:id
GET /admin/applications
PATCH /admin/applications/:id
```

Los endpoints privados requieren:

```txt
Authorization: Bearer <JWT>
```

## Despliegue

El despliegue recomendado es en **Vercel** usando dos proyectos:

- Uno para `backend/`.
- Otro para `frontend/`.

### Backend en Vercel

Configuracion:

- Root Directory: `backend`
- Install Command: `npm install`
- Build Command: `npm run build`

Variables de entorno:

```env
NODE_ENV=production
CORS_ORIGIN=https://tu-frontend.vercel.app
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="secreto_largo_y_seguro"
```

### Frontend en Vercel

Configuracion:

- Root Directory: `frontend`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `build`

Variable de entorno:

```env
VITE_API_URL=https://tu-backend.vercel.app/api/v1
```

## Mejoras futuras

- Portal especifico para empresas.
- Recuperacion de contrasena por email.
- Login con Google.
- Notificaciones.
- Rutas reales con `react-router-dom`.
- Sistema de seguimiento de empresas.
- Tests automatizados de frontend y backend.
- Mejoras visuales y responsive del panel admin.

## Autor

**Guillermo**

2º Desarrollo de Aplicaciones Web
