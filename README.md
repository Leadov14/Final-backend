# API de Alquiler de Canchas — TP Final Backend

API REST para administrar el alquiler de **canchas** de un polideportivo: las canchas se reservan por horario, sin que dos reservas activas se superpongan, y los **usuarios** se registran e inician sesión con dos roles (`admin` y `socio`). Cada reserva referencia a un usuario y a una cancha. Toda la lógica de negocio vive en una capa de servicios, separada de los controladores.

Hecha con Node.js, Express y MongoDB (Mongoose).

Trabajo Práctico Final del curso de **Backend Developer** (Centro de e-Learning UTN BA).

**Contenido**

- [Tecnologías](#tecnologías)
- [Esquema de la base de datos](#esquema-de-la-base-de-datos)
- [Cómo correr el proyecto](#cómo-correr-el-proyecto)
- [Variables de entorno (.env)](#variables-de-entorno-env)
- [Endpoints](#endpoints)
- [Datos de ejemplo (mock)](#datos-de-ejemplo-mock)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Funcionalidades](#funcionalidades-implementadas)

---

## Tecnologías

| Tecnología | Para qué | Versión |
|---|---|---|
| **Node.js** | entorno de ejecución (módulos ES) | 20.19 o superior |
| **express** | servidor y rutas | 5.x |
| **mongoose** | modelado y conexión a MongoDB | 9.x |
| **MongoDB** | base de datos | Community Server (local) |
| **dotenv** | variables de entorno | 17.x |
| **bcrypt** | hashear las contraseñas | 6.x |
| **jsonwebtoken** | generar y verificar los tokens JWT | 9.x |
| **cors** | permitir que un frontend consuma la API | 2.x |
| **validator** | validar el email y el teléfono | 13.x |

Herramientas usadas durante el desarrollo: MongoDB Compass (ver la base de datos) y Thunder Client (probar los endpoints).

---

## Esquema de la base de datos

Base de datos: **Polideportivo**, con tres colecciones.

### `usuario`

| Campo | Tipo | Detalle |
|---|---|---|
| `_id` | ObjectId | automático |
| `nombre` | String | obligatorio, mínimo 3 caracteres, se guarda en minúsculas |
| `apellido` | String | obligatorio, mínimo 3 caracteres, se guarda en minúsculas |
| `email` | String | obligatorio, **único**, formato de email válido, se guarda en minúsculas |
| `password` | String | obligatoria, mínimo 8 caracteres, **hasheada con bcrypt**, `select: false` (nunca se devuelve) |
| `telefono` | String | obligatorio, **único**, solo números, mínimo 8 dígitos |
| `rol` | String | `admin` o `socio`, por defecto `socio` |
| `createdAt` / `updatedAt` | Date | automáticos |

### `cancha`

| Campo | Tipo | Detalle |
|---|---|---|
| `_id` | ObjectId | automático |
| `deporte` | String | obligatorio: `basquet`, `futbol`, `tenis` o `padel` |
| `nombre` | String | obligatorio, **único**, mínimo 8 caracteres, se guarda en minúsculas |
| `detalle` | String | obligatorio, mínimo 5 caracteres, se guarda en minúsculas |
| `precio_hora` | Number | obligatorio, mínimo 10000 |

### `reserva`

| Campo | Tipo | Detalle |
|---|---|---|
| `_id` | ObjectId | automático |
| `usuarioID` | ObjectId | **referencia a `usuario`**, obligatoria. La completa el servidor con el usuario del token |
| `canchaID` | ObjectId | **referencia a `cancha`**, obligatoria |
| `hora_inicio` | Date | obligatoria |
| `hora_fin` | Date | obligatoria, posterior a `hora_inicio` |
| `estado` | String | `pendiente`, `confirmada` o `cancelada`, por defecto `pendiente` |
| `createdAt` / `updatedAt` | Date | automáticos |

### Las relaciones

```
usuario (1) ────< reserva >──── (1) cancha
```

`Reserva.usuarioID` y `Reserva.canchaID` guardan el `_id` de un documento de `usuario` y de `cancha`. En las lecturas de reservas se usa `populate()` para traer los datos en lugar del id:

```json
"usuarioID": { "_id": "6720a1b2c3d4e5f6a7b8c9d1", "nombre": "marina", "apellido": "perez" },
"canchaID": { "_id": "6720b1b2c3d4e5f6a7b8c9d0", "nombre": "cancha 1 futbol 5", "deporte": "futbol", "precio_hora": 20000 }
```

---

## Cómo correr el proyecto

Necesitás **Node.js 20.19 o superior** y **MongoDB** corriendo (local, en el puerto 27017, o una URI de Atlas).

```bash
git clone https://github.com/Leadov14/Final-backend
cd Final-backend
```

```bash
npm install
```

El repositorio ya incluye el archivo `.env` con valores de ejemplo (ver la sección siguiente), así que no hace falta crearlo.

```bash
npm start
```

`npm run dev` levanta el servidor reiniciándolo solo cada vez que guardás un archivo.

Si todo está bien, la terminal muestra:

```
Conectado a la base de datos Polideportivo correctamente.
Servidor funcionando en http://localhost:3000
```


## Variables de entorno (.env)

El repositorio incluye un archivo `.env` con **valores de ejemplo**, listo para usar con una base de datos local (también está `.env.example`, con el mismo contenido):

```env
MONGO_URI = "mongodb://localhost:27017/Polideportivo"
PORT = 3000
JWT_SECRET = "secreto_de_ejemplo"
JWT_EXPIRA = "2h"
```

| Variable | Descripción |
|---|---|
| `MONGO_URI` | cadena de conexión a MongoDB |
| `PORT` | puerto en el que escucha el servidor (por defecto `3000`) |
| `JWT_SECRET` | clave secreta con la que se firman los tokens |
| `JWT_EXPIRA` | duración de los tokens (por defecto `2h`) |

Fuera de un entorno de práctica habría que cambiar el valor de `JWT_SECRET`.

---

## Endpoints

URL base: `http://localhost:3000`

Niveles de acceso: **Público** (sin token), **Logueado** (cualquier usuario con token), **Dueño o admin** (el dueño del recurso o un administrador) y **Admin** (solo administradores).

### Autenticación — `/api/auth`

| Método | Ruta | Acceso | Qué hace |
|---|---|---|---|
| POST | `/api/auth/registro` | Público | registra un usuario (siempre con rol `socio`) y devuelve el token |
| POST | `/api/auth/login` | Público | inicia sesión y devuelve el token |

### Usuarios — `/api/usuarios`

| Método | Ruta | Acceso | Qué hace |
|---|---|---|---|
| POST | `/api/usuarios` | Admin | crea un usuario; el admin puede asignar el rol |
| GET | `/api/usuarios` | Admin | lista los usuarios. Filtro opcional `?apellido=` |
| GET | `/api/usuarios/:id` | Dueño o admin | trae un usuario |
| PATCH | `/api/usuarios/:id` | Dueño o admin | edita un usuario; solo un admin puede cambiar el `rol` |
| DELETE | `/api/usuarios/:id` | Dueño o admin | elimina un usuario (falla con 409 si tiene reservas activas) |

### Canchas — `/api/canchas`

| Método | Ruta | Acceso | Qué hace |
|---|---|---|---|
| POST | `/api/canchas` | Admin | crea una cancha |
| GET | `/api/canchas` | Público | lista las canchas. Filtros opcionales `?deporte=` y `?nombre=` |
| GET | `/api/canchas/:id` | Público | trae una cancha |
| PATCH | `/api/canchas/:id` | Admin | edita una cancha |
| DELETE | `/api/canchas/:id` | Admin | elimina una cancha (falla con 409 si tiene reservas activas) |

### Reservas — `/api/reservas`

| Método | Ruta | Acceso | Qué hace |
|---|---|---|---|
| POST | `/api/reservas` | Logueado | crea una reserva a nombre del usuario del token |
| GET | `/api/reservas` | Logueado | lista todas las reservas (con usuario y cancha populados). Filtros opcionales `?canchaID=` y `?usuarioID=` |
| GET | `/api/reservas/mis-reservas` | Logueado | lista solo las reservas del usuario logueado |
| GET | `/api/reservas/:id` | Dueño o admin | trae una reserva |
| PATCH | `/api/reservas/:id` | Dueño o admin | edita una reserva (horario, cancha o estado) |
| DELETE | `/api/reservas/:id` | Dueño o admin | elimina una reserva |

### Cómo mandar el token

Las rutas protegidas esperan este header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

El token sale de `POST /api/auth/login` o de `POST /api/auth/registro`, y dura el tiempo configurado en `JWT_EXPIRA`.

### Códigos de estado

| Código | Cuándo |
|---|---|
| 200 | todo bien (lecturas, ediciones, borrados, login) |
| 201 | se creó un recurso |
| 400 | datos inválidos, id mal formado, valor duplicado o horario ocupado |
| 401 | falta el token, está vencido o es inválido; o credenciales incorrectas |
| 403 | el usuario no tiene permiso (rol o dueño) |
| 404 | el recurso o la ruta no existen |
| 409 | la operación choca con el estado actual (ej. borrar una cancha con reservas activas) |
| 500 | error interno del servidor |

---

## Datos de ejemplo (mock)

> Los `_id` de los ejemplos son ilustrativos: en tu base de datos van a ser distintos. Cuando un pedido necesite un `_id` (por ejemplo `canchaID`), pegá el `_id` real que devolvió la creación.

### POST `/api/auth/registro` (primer administrador)

El registro siempre crea usuarios con rol `socio`, y solo un `admin` puede crear canchas o asignar roles. Por eso el **primer admin** se crea así:

1. Registrar a Lucas (va a ser el administrador):

   ```json
   {
     "nombre": "lucas",
     "apellido": "gomez",
     "email": "lucas@ejemplo.com",
     "password": "clave12345",
     "telefono": "1123456789"
   }
   ```

2. Abrir la colección `usuario` en MongoDB Compass, editar ese documento y cambiar el campo `rol` de `"socio"` a `"admin"`.

### POST `/api/auth/login` (Lucas, admin)

Primero iniciá sesión con Lucas: solo los administradores pueden crear, editar y eliminar canchas.

```json
{
  "email": "lucas@ejemplo.com",
  "password": "clave12345"
}
```

Copiá el token que devuelve el login y pegalo en Thunder Client, en la pestaña **Auth → Bearer**. Con ese token se hacen los pedidos de canchas siguientes.

### POST `/api/canchas` 🔒 admin

Cancha de fútbol:

```json
{
  "deporte": "futbol",
  "nombre": "cancha 1 futbol 5",
  "detalle": "cesped sintetico",
  "precio_hora": 20000
}
```

Cancha de básquet:

```json
{
  "deporte": "basquet",
  "nombre": "cancha de basquet 1",
  "detalle": "piso parquet",
  "precio_hora": 18000
}
```

Cancha de tenis:

```json
{
  "deporte": "tenis",
  "nombre": "cancha de tenis 1",
  "detalle": "cancha ladrillo",
  "precio_hora": 15000
}
```

### PATCH `/api/canchas/:id` 🔒 admin

Sin sacar el token de Lucas, se modifica la cancha de tenis (en la URL va el `_id` de esa cancha):

```json
{ "precio_hora": 12000 }
```

### DELETE `/api/canchas/:id` 🔒 admin

Sin sacar el token de Lucas, se elimina la cancha de tenis (en la URL va el `_id` de esa cancha). No lleva body.

### POST `/api/usuarios` 🔒 admin

Todavía con el token de Lucas, se crea a Federico (socio):

```json
{
  "nombre": "federico",
  "apellido": "lopes",
  "email": "federico@ejemplo.com",
  "password": "fede12345",
  "telefono": "1115161718",
  "rol": "socio"
}
```

---

### POST `/api/auth/registro` (socios)

Se registran los dos socios que van a hacer reservas.

Marina:

```json
{
  "nombre": "marina",
  "apellido": "perez",
  "email": "marina@ejemplo.com",
  "password": "marina123",
  "telefono": "1155667788"
}
```

Leandro:

```json
{
  "nombre": "leandro",
  "apellido": "dovale",
  "email": "leandro@ejemplo.com",
  "password": "leandro123",
  "telefono": "1151617181"
}
```

### POST `/api/auth/login` (Federico)

Federico se usa para mostrar cómo se modifica y se da de baja un usuario. Primero iniciá sesión con él:

```json
{
  "email": "federico@ejemplo.com",
  "password": "fede12345"
}
```

Copiá el token que devuelve el login y pegalo en Thunder Client, en la pestaña **Auth → Bearer**. Con ese token se hacen los dos pedidos siguientes.

### PATCH `/api/usuarios/:id` 🔒 dueño o admin

Sin sacar el token de Federico, se modifica su teléfono (en la URL va el `_id` de Federico):

```json
{
  "telefono": "1120304050"
}
```

### DELETE `/api/usuarios/:id` 🔒 dueño o admin

Federico se da de baja del sistema (en la URL va el `_id` de Federico). No lleva body.

---

### POST `/api/auth/login` (Marina)

Para crear las reservas, primero iniciá sesión con Marina:

```json
{
  "email": "marina@ejemplo.com",
  "password": "marina123"
}
```

Copiá el token que devuelve el login y pegalo en Thunder Client, en la pestaña **Auth → Bearer**.

### POST `/api/reservas` 🔒 (Marina)

El `usuarioID` no se envía: el servidor lo toma del token. En `canchaID` va el `_id` de la cancha.

Marina, con su token, reserva la cancha de fútbol:

```json
{
  "canchaID": "copia y pega el _id de la cancha de futbol",
  "hora_inicio": "2027-01-15T10:00:00.000Z",
  "hora_fin": "2027-01-15T11:00:00.000Z"
}
```

Respuesta `201`:

```json
{
  "usuarioID": {
    "_id": "6720a1b2c3d4e5f6a7b8c9d1",
    "nombre": "marina",
    "apellido": "perez",
    "telefono": "1155667788",
    "email": "marina@ejemplo.com"
  },
  "canchaID": {
    "_id": "6720b1b2c3d4e5f6a7b8c9d0",
    "deporte": "futbol",
    "nombre": "cancha 1 futbol 5",
    "precio_hora": 20000
  },
  "hora_inicio": "2027-01-15T10:00:00.000Z",
  "hora_fin": "2027-01-15T11:00:00.000Z",
  "estado": "pendiente",
  "_id": "6720c1b2c3d4e5f6a7b8c9d0",
  "createdAt": "2026-11-07T20:15:00.000Z",
  "updatedAt": "2026-11-07T20:15:00.000Z",
  "__v": 0
}
```

### POST `/api/auth/login` (Leandro)

Para la reserva a nombre de Leandro, iniciá sesión con él:

```json
{
  "email": "leandro@ejemplo.com",
  "password": "leandro123"
}
```

Copiá el token que devuelve el login y pegalo en Thunder Client, en la pestaña **Auth → Bearer**.

### POST `/api/reservas` 🔒 (Leandro)

Leandro, con su token, reserva la cancha de básquet:

```json
{
  "canchaID": "copia y pega el _id de la cancha de basquet",
  "hora_inicio": "2027-01-16T18:00:00.000Z",
  "hora_fin": "2027-01-16T19:00:00.000Z"
}
```

Respuesta `201`:

```json
{
  "usuarioID": {
    "_id": "6720a1b2c3d4e5f6a7b8c9d2",
    "nombre": "leandro",
    "apellido": "dovale",
    "telefono": "1151617181",
    "email": "leandro@ejemplo.com"
  },
  "canchaID": {
    "_id": "6720b1b2c3d4e5f6a7b8c9d1",
    "deporte": "basquet",
    "nombre": "cancha de basquet 1",
    "precio_hora": 18000
  },
  "hora_inicio": "2027-01-16T18:00:00.000Z",
  "hora_fin": "2027-01-16T19:00:00.000Z",
  "estado": "pendiente",
  "_id": "6720c1b2c3d4e5f6a7b8c9d1",
  "createdAt": "2026-11-07T20:20:00.000Z",
  "updatedAt": "2026-11-07T20:20:00.000Z",
  "__v": 0
}
```

### PATCH `/api/reservas/:id` 🔒 dueño o admin

Sin sacar el token de Leandro, se confirma su reserva (en la URL va el `_id` de esa reserva):

```json
{ "estado": "confirmada" }
```

### POST `/api/auth/login` (Marina, de nuevo)

Para eliminar la reserva de Marina hace falta su token, así que se inicia sesión otra vez con ella:

```json
{
  "email": "marina@ejemplo.com",
  "password": "marina123"
}
```

### DELETE `/api/reservas/:id` 🔒 dueño o admin

Con el token de Marina, se elimina su reserva (en la URL va el `_id` de esa reserva). No lleva body.

---

### Pedidos sin body (GET y DELETE)

No llevan body. Solo hay que reemplazar `:id` por el `_id` real.

| Método | Ruta de ejemplo | Token |
|---|---|---|
| GET | `/api/usuarios` | 🔒 admin |
| GET | `/api/usuarios?apellido=perez` | 🔒 admin |
| GET | `/api/usuarios/:id` | 🔒 dueño o admin |
| DELETE | `/api/usuarios/:id` | 🔒 dueño o admin |
| GET | `/api/canchas` | no |
| GET | `/api/canchas?deporte=futbol` | no |
| GET | `/api/canchas/:id` | no |
| DELETE | `/api/canchas/:id` | 🔒 admin |
| GET | `/api/reservas` | 🔒 |
| GET | `/api/reservas?canchaID=6720b1b2c3d4e5f6a7b8c9d0` | 🔒 |
| GET | `/api/reservas/mis-reservas` | 🔒 |
| GET | `/api/reservas/:id` | 🔒 dueño o admin |
| DELETE | `/api/reservas/:id` | 🔒 dueño o admin |

### Ejemplos de errores

Datos inválidos, `400` (cada error indica el campo):

```json
{
  "error": "Los datos no son validos",
  "detalles": [
    { "campo": "nombre", "mensaje": "Campo obligatorio" },
    { "campo": "email", "mensaje": "Campo obligatorio" }
  ]
}
```

Horario ocupado, `400`:

```json
{ "error": "La cancha no esta disponible en ese horario" }
```

Sin token, `401`:

```json
{ "error": "Falta el token. Mandá el header Authorization: Bearer <token>" }
```

Sin permiso, `403`:

```json
{ "error": "Esta acción requiere rol de admin" }
```

Usuario con reservas activas, `409`:

```json
{ "error": "Debes cancelar las reservas activas para borrar tu cuenta" }
```

---

## Estructura del proyecto

```
.
├── index.js                      (punto de entrada)
├── .env
├── .env.example
├── package.json
└── src/
    ├── models/
    │   ├── usuario.js
    │   ├── cancha.js
    │   └── reserva.js
    ├── services/                 <- lógica de negocio y acceso a la base
    │   ├── serviceAuth.js
    │   ├── serviceUsuario.js
    │   ├── serviceCancha.js
    │   └── serviceReserva.js
    ├── controllers/              <- solo manejan HTTP
    │   ├── authController.js
    │   ├── usuarioController.js
    │   ├── canchaController.js
    │   └── reservaController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── usuarioRoutes.js
    │   ├── canchaRoutes.js
    │   └── reservaRoutes.js
    ├── config/
    │   └── db.js                 (conexión a MongoDB)
    ├── middleware/
    │   ├── verificarToken.js     (JWT)
    │   ├── permitirRoles.js      (control de roles)
    │   └── manejarErrores.js     (manejo centralizado de errores)
    └── utils/
        ├── ErrorApp.js           (error con código HTTP)
        └── config.js             (lee las variables de entorno)
```

### Separación de responsabilidades

Cada pedido recorre las mismas capas:

```
Pedido → Ruta → Middlewares (token, rol) → Controlador → Servicio → Modelo → MongoDB
```

- **Routes**: dicen qué URL llama a qué controlador y qué middlewares la protegen. No tienen lógica.
- **Controllers**: leen `req`, llaman al servicio y arman `res`. No tocan Mongoose ni toman decisiones.
- **Services**: toda la lógica de negocio, los permisos y las consultas a la base. No conocen `req` ni `res`.
- **Models**: la forma del dato, sus validaciones y el hash de la contraseña (`pre("save")`).
- **Middleware**: `verificarToken` valida el JWT, `permitirRoles` controla el rol y `manejarErrores` convierte cualquier error en su respuesta HTTP.
- **Manejo de errores**: Express 5 envía automáticamente a `manejarErrores` cualquier error lanzado dentro de un controlador o servicio `async`, por eso los controladores no repiten bloques `try/catch`. Los `try/catch` explícitos están en la conexión a la base (`src/config/db.js`) y en la verificación del token (`src/middleware/verificarToken.js`).

---

## Funcionalidades implementadas

- CRUD completo de canchas, reservas y usuarios.
- Reservas que referencian a un usuario y a una cancha, con `populate()` en las lecturas.
- Capa de servicios, controladores ligeros y códigos HTTP correctos, con manejo centralizado de errores.
- Registro y login de usuarios con contraseña hasheada (bcrypt, pre-save hook).
- Autenticación con JWT y middleware que protege las rutas sensibles.
- Roles `admin` y `socio`: solo un admin crea, edita y borra canchas, lista usuarios y crea usuarios con cualquier rol. El registro siempre crea `socio`.
- Permisos "dueño o admin": cada usuario ve, edita y borra solo sus reservas y su cuenta. Un socio no puede cambiar su propio rol.
- `GET /api/reservas/mis-reservas` con las reservas del usuario logueado.
- Filtros en los listados y `PATCH` para ediciones parciales.
- Errores de validación que indican el campo que falló.
- CORS habilitado y variables de entorno con dotenv.

**Reglas de negocio de las reservas**

- Una cancha no se puede reservar dos veces en el mismo horario. Se ignoran las reservas canceladas y los horarios contiguos no cuentan como superposición.
- La cancha tiene que existir, y la hora de fin tiene que ser posterior a la de inicio, tanto al crear como al editar.
- El dueño de la reserva sale siempre del token y no se puede modificar.
- Al cancelar una reserva (`"estado": "cancelada"`) el horario queda libre. Reactivarla vuelve a controlar que nadie lo haya ocupado.
- No se puede eliminar una cancha ni un usuario que tenga reservas activas (no canceladas y que todavía no terminaron): responde `409`.

## Funcionalidades a futuro

- Frontend para consumir la API.
- Tests automatizados y documentación con Swagger.
