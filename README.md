# ⚙️ Impulsa CEE — Backend API

Backend principal de **Impulsa CEE**, una plataforma para la gestión de **visitas técnicas**, recogida de datos energéticos, documentación técnica y generación de entregables asociados al flujo de certificación energética.

---

## 🚀 Objetivo del proyecto

Este backend está diseñado para digitalizar y estructurar el trabajo técnico de campo, sustituyendo procesos manuales por un sistema centralizado capaz de:

* gestionar usuarios autenticados
* crear y administrar visitas técnicas
* almacenar datos constructivos y energéticos
* registrar envolvente térmica, huecos e instalaciones
* manejar subida de fotos y documentos
* integrar servicios externos como **Airtable** y **Google Drive**
* preparar la base para generación/exportación de documentación técnica

---

# 🏗️ Arquitectura actual

El proyecto está en proceso de migración hacia una **arquitectura modular por capas**.

## Estructura principal

```bash
src/
├── assets/
├── config/
├── middleware/
├── modules/
│   ├── auth/
│   ├── visits/
│   ├── buildings/
│   ├── envelope/
│   ├── windows/
│   ├── installations/
│   └── documents/
├── routes/
├── services/
└── app.js
```

---

## Filosofía de la arquitectura

Cada módulo sigue, cuando aplica, esta separación:

```bash
modules/<modulo>/
├── application/
│   └── use-cases/
├── infrastructure/
│   └── repositories/
└── presentation/
    ├── controllers/
    └── routes/
```

### Capas

### `application`

Contiene la lógica de negocio en forma de **casos de uso**.

Ejemplos:

* login de usuario
* registro de usuario
* creación de visitas
* guardado de datos técnicos

---

### `infrastructure`

Implementación técnica de acceso a datos y servicios.

Ejemplos:

* consultas a PostgreSQL
* repositorios
* servicios de autenticación
* integraciones externas

---

### `presentation`

Capa de entrada/salida HTTP.

Ejemplos:

* controladores Express
* rutas
* orquestación request/response

---

# 🧩 Módulos principales

## `auth`

Responsable de:

* login
* registro de usuarios
* generación de JWT
* control de acceso por rol

---

## `visits`

Responsable de:

* crear visitas técnicas
* listar visitas del usuario autenticado
* eliminar visitas

---

## `buildings`

Responsable de:

* guardar datos generales del inmueble / vivienda
* soportar futura persistencia de datos de fachada / envolvente base

---

## `envelope`

Responsable de:

* registrar elementos de envolvente térmica
* listar elementos
* eliminar elementos

---

## `windows`

Responsable de:

* registrar huecos / ventanas
* almacenar medidas y datos asociados
* eliminar huecos

---

## `installations`

Responsable de:

* registrar equipos / instalaciones
* listar instalaciones por visita

---

## `documents`

Responsable de:

* exportación de documentos
* preparación de entregables técnicos
* cierre/finalización de visita

---

# ⚙️ Stack técnico

* **Node.js**
* **Express**
* **PostgreSQL**
* **JWT**
* **bcrypt**
* **Multer**
* **Helmet**
* **Morgan**
* **Express Rate Limit**
* **Google APIs**
* **Airtable**
* **Render** (deploy)
* **Neon** (producción)

El `package.json` actual incluye scripts de desarrollo y dependencias activas para estas integraciones.

---

# 🔐 Seguridad

La API incorpora medidas básicas de seguridad:

* autenticación mediante **JWT**
* control de acceso por rol
* **rate limiting** en login
* **CORS** controlado por origen
* `helmet()` para hardening HTTP
* subida de archivos controlada con **Multer**

---

# 🌍 Entornos

Actualmente el proyecto se usa en dos contextos:

## Desarrollo local

Normalmente usando **PostgreSQL local** (`localhost`).

## Producción

Desplegado en **Render** y conectado a **Neon**.

> ⚠️ Importante: el esquema local y el de producción pueden no coincidir si no se mantienen sincronizados.
> Esto puede provocar errores de columnas faltantes o comportamiento diferente entre entornos.

---

# 🔐 Variables de entorno

Crear un archivo:

```bash
.env
```

Ejemplo mínimo para entorno local:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD
DB_NAME=cee_app
DB_PORT=5432

JWT_SECRET=impulsa_clave_super_segura_2026
FRONTEND_URL=http://localhost:5173
```

---

## Variables adicionales según entorno

Según configuración activa del proyecto, pueden ser necesarias también variables relacionadas con:

* Airtable
* Google Drive
* OAuth / credenciales de integración
* servicios de exportación o almacenamiento

---

# ▶️ Ejecución local

## 1. Instalar dependencias

```bash
npm install
```

---

## 2. Ejecutar en desarrollo

```bash
npm run dev
```

---

## 3. Ejecutar en producción local

```bash
npm start
```

---

## Puerto por defecto

```bash
http://localhost:4000
```

---

# 🧪 Validación manual de endpoints

Actualmente se están comprobando manualmente los endpoints con herramientas como:

* **Postman**
* **Thunder Client**

---

## Endpoints ya validados manualmente

### Auth

* ✅ `POST /api/auth/register`
* ✅ `POST /api/auth/login`

### Visits

* ✅ `GET /api/visits`
* ✅ `POST /api/visits`

### Building

* ⚠️ ruta funcional, pendiente de alinear completamente con esquema de base de datos local

---

# 📡 Endpoints principales

## Auth

### Login

```http
POST /api/auth/login
```

### Register

```http
POST /api/auth/register
```

---

## Visits

### Crear visita

```http
POST /api/visits
```

### Obtener visitas del usuario autenticado

```http
GET /api/visits
```

### Eliminar visita

```http
DELETE /api/visits/:id
```

---

## Building

### Guardar datos generales del inmueble

```http
PUT /api/visits/:id/building
```

---

## Envelope

### Añadir elemento

```http
POST /api/visits/:id/envelope
```

### Obtener elementos

```http
GET /api/visits/:id/envelope
```

### Eliminar elemento

```http
DELETE /api/visits/:id/envelope/:elementoId
```

---

## Windows

### Añadir hueco

```http
POST /api/visits/:id/windows
```

### Obtener huecos

```http
GET /api/visits/:id/windows
```

### Eliminar hueco

```http
DELETE /api/visits/:id/windows/:windowId
```

---

## Installations

### Añadir instalación

```http
POST /api/visits/:id/installations
```

### Obtener instalaciones

```http
GET /api/visits/:id/installations
```

---

## Documents

### Exportar PDF

```http
GET /api/visits/:id/export-pdf
```

### Exportar XML

```http
GET /api/visits/:id/export-xml
```

### Finalizar visita

```http
POST /api/visits/:id/finalize
```

---

# 🔄 Flujo funcional resumido

1. Usuario inicia sesión
2. Se crea una visita técnica
3. Se registran datos del inmueble
4. Se añaden elementos de envolvente
5. Se registran huecos / ventanas
6. Se añaden instalaciones
7. Se suben fotos/documentos
8. Se genera o finaliza el expediente

---

# 📌 Estado actual del backend

## Ya implementado

* autenticación
* control de roles
* gestión básica de visitas
* estructura modular por capas
* endpoints principales de flujo técnico
* integración base con servicios externos

## En evolución

* alineación completa entre esquema local y producción
* refactor completo de todos los módulos
* estandarización de rutas/controladores antiguos
* cobertura de tests automáticos
* migraciones de base de datos

---

# 🛠️ Scripts disponibles

```bash
npm run dev
npm start
```

---

# 📂 Repositorio relacionado

## Frontend

[impulsa-cee-frontend](https://github.com/BARRETO019/impulsa-cee-frontend)

---

# 👨‍💻 Notas de desarrollo

Este backend está siendo refactorizado progresivamente desde una estructura más tradicional hacia una arquitectura más limpia, modular y mantenible, manteniendo compatibilidad con el flujo real de negocio.

---

# 📄 Licencia

Uso interno / proyecto privado.
