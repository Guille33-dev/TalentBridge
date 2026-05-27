# TalentBridge

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)

TalentBridge es una plataforma web para conectar estudiantes con empresas que ofrecen practicas profesionales. Los estudiantes pueden buscar practicas, guardar oportunidades, postularse y completar su perfil. Las empresas pueden registrarse, gestionar su perfil, publicar practicas y revisar candidaturas. El administrador controla empresas, practicas, postulaciones y mensajes de contacto.

**Proyecto final - Desarrollo de Aplicaciones Web**

## Tecnologias

**Frontend**

- React 18 + Vite 6
- React Router DOM
- JavaScript / JSX
- Componentes UI basados en Radix UI
- lucide-react
- CSS en `frontend/src/shared/styles/index.css`

**Backend**

- Node.js + Express
- TypeScript
- Prisma ORM
- JWT para autenticacion
- bcryptjs para contrasenas
- helmet y express-rate-limit
- Vitest + Supertest

**Base de datos y despliegue**

- Supabase PostgreSQL
- Frontend en Vercel
- Backend desplegado en Railway

## Instalacion

### 1. Clonar el repositorio

```bash
git clone https://github.com/Guille33-dev/TalentBridge.git
cd TalentBridge
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

Crea `backend/.env`:

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

Backend local:

```txt
http://localhost:4000/api/v1
```

### 3. Configurar el frontend

Abre otra terminal:

```bash
cd frontend
npm install
```

Crea `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api/v1
```

Arranca el frontend:

```bash
npm run dev
```

Frontend local:

```txt
http://localhost:3000
```

## Funcionalidades

- Home con buscador, practicas destacadas y empresas destacadas.
- Registro e inicio de sesion con JWT.
- Registro diferenciado para estudiantes y empresas.
- Politica de contrasenas: minimo 8 caracteres, numero, mayuscula, minuscula y caracter especial.
- Dashboard privado para estudiantes.
- Perfil de estudiante editable.
- Practicas guardadas.
- Postulaciones y retirada de postulaciones.
- Listado y detalle de practicas.
- Listado y detalle de empresas.
- Portal de empresa para editar perfil, crear practicas y revisar candidatos.
- Panel de administracion para empresas, practicas, postulaciones y mensajes de contacto.
- Pagina de contacto con formulario.
- Roles `STUDENT`, `COMPANY` y `ADMIN`.

## Tests y validacion

**Backend**

```bash
cd backend
npm test
npm run typecheck
npm run build
```

Los tests backend cubren healthcheck, catalogo publico, filtros, paginacion, autenticacion, perfil de estudiante, practicas guardadas, postulaciones, permisos y acceso al panel admin.

Para los tests se usa una base de datos separada mediante `backend/.env.test`. Ese archivo no debe subirse a Git.

**Frontend**

```bash
cd frontend
npm run build
```

El frontend se valida actualmente con build y pruebas manuales de los flujos principales.

## API principal

Base:

```txt
/api/v1
```

Publico:

```txt
GET /health
GET /jobs
GET /jobs/:idOrSlug
GET /companies
GET /companies/:idOrSlug
POST /contact/messages
```

Autenticacion:

```txt
POST /auth/register
POST /auth/register-company
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

Empresa:

```txt
GET /company/me
PATCH /company/me
GET /company/jobs
POST /company/jobs
PATCH /company/jobs/:id
DELETE /company/jobs/:id
GET /company/applications
PATCH /company/applications/:id
```

Admin:

```txt
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
GET /admin/contact-messages
PATCH /admin/contact-messages/:id
```

Los endpoints privados requieren:

```txt
Authorization: Bearer <JWT>
```

## Despliegue

El proyecto usa Vercel para el frontend y Railway para el backend.

### Backend en Railway

Configuracion recomendada:

- Root Directory: `/backend`
- Install Command: `npm install`
- Build Command: `npm run build`
- Start Command: `npm start`

Variables de entorno:

```env
NODE_ENV=production
CORS_ORIGIN=https://<DOMINIO_FRONTEND>
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="secreto_largo_y_seguro"
```

### Frontend en Vercel

Configuracion recomendada:

- Root Directory: `frontend`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `build`

Variable de entorno:

```env
VITE_API_URL=https://<DOMINIO_BACKEND>/api/v1
```

En produccion todo debe funcionar mediante **HTTPS**. No uses `CORS_ORIGIN=*` en produccion.

## Seguridad

- Passwords cifradas con `bcryptjs`.
- Autenticacion con JWT.
- Rutas privadas protegidas con middleware.
- Control de roles `STUDENT`, `COMPANY` y `ADMIN`.
- CORS configurable por entorno.
- `helmet` para cabeceras de seguridad.
- Rate limit en login, registro y contacto.
- Conexion a Supabase PostgreSQL con SSL.
- Las credenciales reales y archivos `.env` no deben subirse al repositorio.

## Limpieza del proyecto

Las carpetas generadas no forman parte del codigo fuente:

- `frontend/build`
- `frontend/.vite`
- `backend/dist`
- `node_modules`

Se regeneran con los comandos de desarrollo o build.

## Mejoras futuras

- Tests automatizados de frontend.
- Recuperacion de contrasena por email.
- Login con Google.
- Notificaciones.


## Autor

**Guillermo Jose Suarez Lopez**

2 DAW - Desarrollo de Aplicaciones Web
