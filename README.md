# HELLFALL: Pixel Siege

Aplicación FPS retro en primera persona, con motor JavaScript, backend Node.js/Express, registro/login, sesiones, roles, PostgreSQL ejecutado en contenedores docker, panel de administración, logs, pruebas y CI. Está organizada para cubrir con los requisitos de la especificación de Procesos de Ingeniería del Software. 

> **Importante:** Para realizar la ejecución de este codigo primero debes disponer de una maquina virtual docker mediante la cual instales postgres para la base de datos. Debes tener node.js para la librería de javascript.

## Tecnologías

- **Node.js + Express:** backend y API.
- **HTML/CSS/JavaScript + Canvas:** interfaz y FPS raycasting sin framework frontend.
- **PostgreSQL + `pg`:** persistencia real; alternativa en memoria para pruebas y primer hito. (Docker)
- **`express-session` + `connect-pg-simple`:** sesiones de servidor y sesiones persistentes en PostgreSQL.
- **`bcryptjs`:** hash de contraseñas.
- **`nodemailer`:** envío de correos SMTP para la confirmación de cuentas.
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

## Confirmación de correo electrónico

El registro exige que el usuario confirme su correo antes de poder iniciar sesión. El flujo es:

1. `POST /api/auth/register` valida el correo (formato y dominio permitido) y crea la cuenta con `status = 'pending'`.
2. El servidor genera un token aleatorio de 32 bytes (64 caracteres hexadecimales). **En la base de datos solo se guarda su hash SHA-256** en `confirmation_token`; el token en claro únicamente viaja dentro del enlace del correo.
3. El token caduca a las **24 horas** (`confirmation_expires_at`). Se envía un correo SMTP con un enlace con el formato:

   ```text
   {APP_URL}/api/auth/confirm?token=<token>
   ```

4. Al abrir el enlace, `GET /api/auth/confirm` valida el token, activa la cuenta (`status = 'active'`), limpia el token y redirige a `/?confirmed=success`. Si el token no existe o ha caducado, redirige a `/?error=invalid_confirmation_token`.
5. Mientras la cuenta siga pendiente, `POST /api/auth/login` responde `403` con el código `ACCOUNT_PENDING_CONFIRMATION`.
6. Si se vuelve a registrar un correo pendiente, se renueva el token, se actualiza la contraseña y se reenvía el correo. Un correo ya activo sigue devolviendo `EMAIL_EXISTS`.

La funcionalidad se controla con `REQUIRE_EMAIL_CONFIRMATION`:

- `true`: registro con confirmación obligatoria (comportamiento recomendado y activo en `.env`).
- `false` o ausente: el registro crea la cuenta directamente como activa (útil para pruebas y compatibilidad).

Si no hay SMTP configurado (`SMTP_HOST`, `SMTP_USER` o `SMTP_PASS` vacíos), `EmailService` funciona en **modo simulado**: no envía el correo y escribe el enlace de activación por consola para poder probar el flujo en desarrollo.

### Variables de entorno para el correo

| Variable | Descripción |
|---|---|
| `APP_URL` | URL pública de la aplicación; se usa para construir el enlace de confirmación. En local `http://localhost:8080`; en Render, la URL pública del servicio. |
| `REQUIRE_EMAIL_CONFIRMATION` | `true` para exigir confirmación por correo; `false` o ausente para desactivarla. |
| `SMTP_HOST` | Servidor SMTP (por ejemplo `smtp.gmail.com`). |
| `SMTP_PORT` | Puerto SMTP; `465` usa TLS directo y otros puertos usan STARTTLS. |
| `SMTP_USER` | Usuario/cuenta SMTP. |
| `SMTP_PASS` | Contraseña o contraseña de aplicación del proveedor. No debe subirse al repositorio. |
| `SMTP_FROM` | Remitente visible, por ejemplo `HELLFALL UAC Command <correo@gmail.com>`. |
| `ALLOWED_DOMAINS` | Dominios de correo admitidos en el registro, separados por comas. |

> Con Gmail hay que generar una **contraseña de aplicación** y usarla en `SMTP_PASS`. Si `APP_URL` apunta a Render pero el servidor se ejecuta en local, los enlaces abrirán la versión desplegada (que debe tener la ruta `/api/auth/confirm`); para probar en local, ajusta `APP_URL=http://localhost:8080`.

## Pruebas automatizadas

```bash
npm test
```

Para vigilar archivos y repetir las pruebas durante el desarrollo:

```bash
npm run test:watch
```

Las pruebas cubren, entre otros casos:

- **`tests/emailService.test.js`**: generación del token, hash SHA-256, caducidad, enlace `/api/auth/confirm` y configuración del transporte SMTP.
- **`tests/confirmation.test.js`**: cuenta pendiente, envío del token, bloqueo de login, activación con token válido, token caducado o inexistente, re-registro de una cuenta pendiente y dominios no permitidos.
- **`tests/api.test.js`**: flujo HTTP completo de registro, confirmación por enlace, login, CSRF, sesiones, roles, puntuaciones y logout.
- **`tests/userService.test.js`** y **`tests/variante3.test.js`**: reglas de negocio, contraseñas, roles y validación de dominios.

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
| `GET` | `/api/csrf-token` | Público | Obtener/renovar token CSRF |
| `POST` | `/api/prueba/dominio` | Público | Comprobar si un dominio de correo está permitido |
| `POST` | `/api/auth/register` | CSRF | Crear cuenta; devuelve `202` si queda pendiente de confirmación |
| `GET` | `/api/auth/confirm?token=...` | Público | Confirmar el correo y activar la cuenta |
| `POST` | `/api/auth/login` | CSRF | Iniciar sesión (bloqueado si la cuenta está pendiente) |
| `GET` | `/api/auth/google` | Público | Iniciar OAuth con Google (si está configurado) |
| `GET` | `/api/auth/google/callback` | Público | Callback de Google OAuth |
| `POST` | `/api/auth/logout` | Sesión + CSRF | Invalidar la sesión |
| `GET` | `/api/user/me` | Público | Usuario actual (`null` si no hay sesión) |
| `GET` | `/api/users` | Administrador | Listar email/rol/estado |
| `GET` | `/api/users/:id/active` | Administrador | Consultar estado activo |
| `DELETE` | `/api/users/:id` | Sesión + CSRF | Admin elimina cualquiera; usuario normal solo a sí mismo |
| `GET` | `/api/scores/top?limit=10` | Público | Tabla de mejores puntuaciones |
| `GET` | `/api/scores/mine` | Sesión | Historial personal |
| `POST` | `/api/scores` | Sesión + CSRF | Registrar el resultado de una partida |

Las rutas mutables requieren `X-CSRF-Token`; el cliente lo solicita automáticamente y lo renueva tras login/logout. Las contraseñas y los tokens de confirmación no se devuelven en la API. La eliminación de usuarios es lógica (`status = deleted`) para conservar trazabilidad y evitar que una cuenta borrada vuelva a iniciar sesión.

## Roles y administrador inicial

- `user`: puede jugar, guardar sus puntuaciones y eliminar su propia cuenta.
- `admin`: además puede listar usuarios, consultar su estado y eliminar otras cuentas.
- `ADMIN_EMAIL` y `ADMIN_PASSWORD` se leen del entorno. Al arrancar, el servidor crea el primer administrador si no existe; si el email ya existe, lo promociona a admin sin cambiar la contraseña existente. No se escribe ninguna contraseña en el código.
- Las comprobaciones se realizan en el backend, no solo ocultando botones en la interfaz.

## El juego

El motor de `public/js/game/game.js` dibuja a 320 × 200 y usa DDA/raycasting para las paredes, texturas pixeladas procedurales, billboards para enemigos y objetos, colisiones, daño, munición, kits médicos, HUD, pausa, victoria y Game Over. Los gráficos se generan por código y son originales; no se incluyen sprites ni logotipos de DOOM.

## Estructura 

Backend: Carpeta "src" ->  api, config, archivos.js, etc. 
Dentro del backend: Capa API, capa de lógica de negocio y capa de acceso a datos, claramente separadas
en distintos módulos/archivos -> rutas de redes entre clientes (authRoutes,scoreRoutes,userRouter), etc. Base de datos vinculada internamente al código (server.js -> Crea automaticamente las tablas dentro del código)

Frontend: Publico (public) -> archivos .js, index.html, etc. Portada para el público, enlaces de las rutas con comandos JavaScript. 

## Hito 4: Servicios externos (Google OAuth 2.0) y manejo de errores

Se ha integrado el inicio de sesión y registro mediante **Google OAuth 2.0**:
- **Rutas OAuth (`src/api/authRoutes.js`):**
  - `GET /api/auth/google`: Redirige al usuario a la pantalla de consentimiento de Google.
  - `GET /api/auth/google/callback`: Intercambia el código de autorización por el token de acceso, obtiene el correo verificado de Google, invoca `userService.loginWithGoogle()` y regenera la sesión segura (`hellfall.sid`) junto con el token CSRF.
- **Lógica de negocio (`src/services/userService.js`):** El método `loginWithGoogle({ email })` autentica al usuario si ya existe o crea automáticamente la cuenta activa en caso de ser su primer acceso.
- **Variables de entorno necesarias:**
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_CALLBACK_URL` (en local `http://localhost:8080/api/auth/google/callback` y en producción la URL de Render).

## Despliegue en Render

1. Configura el servicio para desplegar la rama que contiene la confirmación por correo (`confirmacionCorreo`) y lanza un *Manual Deploy → Deploy latest commit*.
2. En **Environment**, define al menos:
   - `APP_URL=https://<tu-servicio>.onrender.com` (sin barra final).
   - `SESSION_SECRET` con un valor largo y aleatorio.
   - `DATABASE_URL` y `PGSSL=require` para PostgreSQL gestionado.
   - `REQUIRE_EMAIL_CONFIRMATION=true` y las credenciales `SMTP_*`.
   - `ALLOWED_DOMAINS` con los dominios que quieras admitir.
3. La cookie de sesión usa `secure: 'auto'`: funciona tanto en HTTP local como detrás del proxy HTTPS de Render.
4. Si los enlaces del correo abren una versión antigua (`API_NOT_FOUND` en `/api/auth/confirm`), revisa que `APP_URL` apunte al servicio correcto y que el despliegue incluya la rama con la ruta de confirmación. Los enlaces ya enviados no se pueden reutilizar; solicita uno nuevo registrándote otra vez.