# HELLFALL: Pixel Siege

Aplicación web educativa de FPS retro en primera persona, con un motor raycasting en JavaScript, backend Node.js/Express, registro/login, sesiones, roles, PostgreSQL, panel de administración, logs, pruebas y CI. Está organizada para cubrir los **Hitos 1–3** de la especificación de Procesos de Ingeniería del Software. El juego y las puntuaciones son extensiones del proyecto; no son requisitos de esos tres hitos.

> **Importante:** este proyecto es una base de trabajo que tienes que ejecutar, revisar y ser capaz de explicar. La confirmación de correo y OAuth se reservan para el Hito 4. El registro activa la cuenta inmediatamente durante los Hitos 1–3. No subas contraseñas, cookies, secretos o archivos `.env` a GitHub.

## Tecnologías

- **Node.js + Express:** backend y API.
- **HTML/CSS/JavaScript + Canvas:** interfaz y FPS raycasting sin framework frontend.
- **PostgreSQL + `pg`:** persistencia real; alternativa en memoria para pruebas y primer hito. (Docker)
- **`express-session` + `connect-pg-simple`:** sesiones de servidor y sesiones persistentes en PostgreSQL.
- **`bcryptjs`:** hash de contraseñas.
- **Vitest + Supertest:** pruebas automáticas de lógica y API.
- **Pino:** logs estructurados.
- **GitHub Actions:** CI en pull requests y en `main`.

## Requisitos

- Node.js 20 o 22 (recomendado Node.js 22).
- npm.
- Docker Desktop si quieres arrancar PostgreSQL localmente con Compose, o una instancia PostgreSQL accesible.
- Cuenta GitHub para el repositorio y el CI. Para desplegar, una cuenta del proveedor cloud que elijas.

## Arranque local: modo rápido con PostgreSQL en Docker

1. Copia `.env.example` a `.env`.
2. Edita `.env` y cambia `SESSION_SECRET`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`. Usa una contraseña de administrador de al menos 12 caracteres. No compartas ese archivo.
3. Ejecuta:

   ```bash
   docker compose up --build
   ```

4. Abre `http://localhost:8080`.
5. Inicia sesión con el `ADMIN_EMAIL` y `ADMIN_PASSWORD` configurados. El administrador se crea al arrancar si no existe.

Compose crea PostgreSQL y la aplicación. Los datos de PostgreSQL permanecen en el volumen `hellfall_pg_data` al reiniciar los contenedores. Para detenerlos: `docker compose down`. Para borrar también todos los datos de desarrollo: `docker compose down -v`.

## Arranque sin Docker

1. Instala Node.js y PostgreSQL.
2. Copia `.env.example` a `.env`.
3. Ajusta, como mínimo, estas variables:

   ```dotenv
   NODE_ENV=development
   PORT=8080
   SESSION_SECRET=un-secreto-local-largo-y-aleatorio
   DATABASE_URL=postgres://hellfall:TU_CLAVE@localhost:5432/hellfall
   PGSSL=disable
   ADMIN_EMAIL=admin@tu-dominio.test
   ADMIN_PASSWORD=una-clave-local-de-12-caracteres-o-mas
   ```

4. Crea una base de datos llamada `hellfall` y ejecuta `sql/schema.sql` o deja que la aplicación lo ejecute al arrancar.
5. En la raíz del proyecto:

   ```bash
   npm install
   npm run dev
   ```

El primer `npm install` genera `package-lock.json`; añádelo a Git. Si no configuras `DATABASE_URL`, el sistema usa un repositorio en memoria solo para desarrollo/pruebas: **los usuarios y puntuaciones desaparecen al reiniciar**. Eso no satisface el Hito 3.

## Pruebas

```bash
npm test
```

Para vigilar archivos y repetir las pruebas durante el desarrollo:

```bash
npm run test:watch
```

El CI de GitHub ejecuta `npm install` y `npm test` en cada pull request y en cada push a `main`. Después de tener `package-lock.json` comprometido, puedes cambiar el workflow a `npm ci` para instalaciones deterministas.

## Arquitectura obligatoria

```text
Navegador
  ├── public/index.html + css/styles.css          (presentación)
  ├── public/js/ui/main.js                        (pantallas; no hace fetch)
  ├── public/js/api/apiClient.js                  (único cliente HTTP del frontend)
  └── public/js/game/game.js                      (motor raycasting en Canvas)
                         │ misma procedencia
                         ▼
src/api/ + src/middleware/                          (API / autorización / CSRF)
                         ▼
src/services/                                      (reglas de negocio)
                         ▼
src/repositories/                                  (acceso a datos)
             ┌───────────┴───────────┐
             ▼                       ▼
   userRepository.memory.js   userRepository.pg.js
   scoreRepository.memory.js  scoreRepository.pg.js
                                     ▼
                              PostgreSQL
```

La regla principal: `UserService` recibe un repositorio por constructor. En el Hito 3 se sustituye el repositorio de memoria por PostgreSQL **sin modificar las reglas de negocio**.

## Rutas de API

| Método | Ruta | Acceso | Función |
|---|---|---|---|
| `GET` | `/api/health` | Público | Health check |
| `GET` | `/api/auth/csrf` | Público | Obtener token CSRF |
| `POST` | `/api/auth/register` | CSRF | Crear cuenta |
| `POST` | `/api/auth/login` | CSRF | Iniciar sesión |
| `GET` | `/api/auth/me` | Sesión | Usuario actual y CSRF |
| `POST` | `/api/auth/logout` | Sesión + CSRF | Invalidar la sesión |
| `GET` | `/api/users` | Administrador | Listar email/rol/estado |
| `GET` | `/api/users/:id/active` | Administrador | Consultar estado activo |
| `DELETE` | `/api/users/:id` | Sesión + CSRF | Admin elimina cualquiera; usuario normal solo a sí mismo |
| `GET` | `/api/scores/top?limit=10` | Público | Tabla de mejores puntuaciones |
| `GET` | `/api/scores/mine` | Sesión | Historial personal |
| `POST` | `/api/scores` | Sesión + CSRF | Registrar el resultado de una partida |

Las rutas mutables requieren `X-CSRF-Token`; el cliente lo solicita automáticamente. Las contraseñas no se devuelven en la API. La eliminación de usuarios es lógica (`status = deleted`) para conservar trazabilidad y evitar que una cuenta borrada vuelva a iniciar sesión.

## Roles y administrador inicial

- `user`: puede jugar, guardar sus puntuaciones y eliminar su propia cuenta.
- `admin`: además puede listar usuarios, consultar su estado y eliminar otras cuentas.
- `ADMIN_EMAIL` y `ADMIN_PASSWORD` se leen del entorno. Al arrancar, el servidor crea el primer administrador si no existe; si el email ya existe, lo promociona a admin sin cambiar la contraseña existente. No se escribe ninguna contraseña en el código.
- Las comprobaciones se realizan en el backend, no solo ocultando botones en la interfaz.

## El juego

El motor de `public/js/game/game.js` dibuja a 320 × 200 y usa DDA/raycasting para las paredes, texturas pixeladas procedurales, billboards para enemigos y objetos, colisiones, daño, munición, kits médicos, HUD, pausa, victoria y Game Over. Los gráficos se generan por código y son originales; no se incluyen sprites ni logotipos de DOOM.



