# HELLFALL: Pixel Siege

Aplicación FPS retro en primera persona, con motor JavaScript, backend Node.js/Express, registro/login, sesiones, roles, PostgreSQL ejecutado en contenedores docker, panel de administración, logs, pruebas y CI. Está organizada para cubrir con los requisitos de la especificación de Procesos de Ingeniería del Software.

## URL de la aplicación desplegada

- **Producción (Render):** [https://hellfall-game.onrender.com](https://hellfall-game.onrender.com)

> **Importante:** Para realizar la ejecución de este codigo primero debes disponer de una maquina virtual docker mediante la cual instales postgres para la base de datos. Debes tener node.js para la librería de javascript.

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


## Pruebas automatizadas

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
  ├── public/index.html + css/styles.css + css/universe.css  (presentación y Universo SLAYER)
  ├── public/js/ui/main.js                                   (vistas, router popstate y formularios; no hace fetch)
  ├── public/js/api/apiClient.js                             (único cliente HTTP del frontend)
  └── public/js/game/{game,weapons,voxels,portrait,rng}.js   (motor raycasting 2.5D en Canvas)
                         │ misma procedencia
                         ▼
src/api/ + src/middleware/                                   (API / autorización / CSRF)
                         ▼
src/services/                                                (reglas de negocio)
                         ▼
src/repositories/                                            (acceso a datos)
             ┌───────────┴───────────┐
             ▼                       ▼
   userRepository.memory.js   userRepository.pg.js
   scoreRepository.memory.js  scoreRepository.pg.js
                                     ▼
                              PostgreSQL (`sql/schema.sql`)
```

La regla principal: `UserService` recibe un repositorio por constructor. En el Hito 3 se sustituye el repositorio de memoria por PostgreSQL **sin modificar las reglas de negocio**.

## Rutas de API

| Método | Ruta | Acceso | Función |
|---|---|---|---|
| `GET` | `/api/health` | Público | Health check |
| `GET` | `/api/auth/csrf` | Público | Obtener token CSRF |
| `POST` | `/api/auth/register` | CSRF | Crear cuenta local (con confirmación opcional por correo) |
| `GET` | `/api/auth/confirm?token=...` | Público | Activar cuenta tras confirmación por correo |
| `POST` | `/api/auth/login` | CSRF | Iniciar sesión |
| `GET` | `/api/auth/google` | Público | Flujo OAuth 2.0 con Google |
| `GET` | `/api/auth/google/callback` | Público | Callback OAuth 2.0 y creación de sesión |
| `GET` | `/api/auth/me` | Sesión | Usuario actual (`publicUser` con `nickname`) y CSRF |
| `POST` | `/api/auth/logout` | Sesión + CSRF | Invalidar la sesión |
| `GET` | `/api/users` | Administrador | Listar email/rol/estado |
| `PATCH` | `/api/users/me/nickname` | Sesión + CSRF | Actualizar el nickname público del usuario en BD |
| `GET` | `/api/users/:id/active` | Administrador | Consultar estado activo |
| `DELETE` | `/api/users/:id` | Sesión + CSRF | Admin elimina cualquiera; usuario normal solo a sí mismo |
| `GET` | `/api/scores/top?limit=10` | Público / Sesión | Ranking filtrable (`period=day\|week\|all`, `dailyOnly`), excluye 0 pts y resalta al jugador actual (`viewerRank`) |
| `GET` | `/api/scores/stats` | Público | Estadísticas globales: partidas, bajas totales, jugadores registrados y sector máximo |
| `GET` | `/api/scores/mine` | Sesión | Historial personal de partidas |
| `GET` | `/api/scores/mine/stats` | Sesión | Estadísticas personales agregadas: totales, media, sector máximo, tiempo jugado, rachas de días (hora de España) y progresión de las 10 últimas partidas |
| `POST` | `/api/scores` | Sesión + CSRF | Registrar bajas, duración, bonus, `sector`, `isDaily` y `nickname` de la partida |
| `GET` | `/api/challenge/today` | Público | Fecha y semilla del desafío diario |

Las rutas mutables requieren `X-CSRF-Token`; el cliente lo solicita automáticamente. Las contraseñas no se devuelven en la API. La eliminación de usuarios es lógica (`status = deleted`) para conservar trazabilidad y evitar que una cuenta borrada vuelva a iniciar sesión.

## Sistema de Nicknames y Privacidad del Ranking

- **Nickname obligatorio al guardar partida (`POST /api/scores`):** tanto al morir como al completar los 10 sectores, la pantalla de informe exige introducir o confirmar tu `nickname` (2–24 caracteres) antes de guardar la puntuación en la base de datos.
- **Nickname aleatorio por defecto:** cualquier usuario nuevo o existente en BD sin `nickname` recibe automáticamente uno aleatorio (por ejemplo `Phobos-742` o migración SQL `Slayer-...`), y puede cambiarlo en cualquier momento desde **Mi Cuenta**, antes de iniciar partida o justo al guardar su puntuación.
- **Ranking libre de correos:** `GET /api/scores/top` y `ScoreService.top()` omiten el campo `email` y devuelven únicamente el `nickname` público del jugador (con `formatPublicAlias` como respaldo).
- **Límite de bajas configurable:** `MAX_SCORE_KILLS` permite hasta `100000` bajas por defecto (configurable hasta `500000` en `.env`) para partidas frenéticas.

## Portal Web y Protagonista Único (`SLAYER`)

- **Protagonista único:** se ha unificado la experiencia alrededor de **SLAYER** (*Centinela del Abismo*) en portada, retrato animado HUD (`public/js/game/portrait.js`) y pantalla de despliegue.
- **Portal web Universo SLAYER y portada interactiva:** en inicio aparecen únicamente `▶ DESPLEGAR SLAYER` junto a `INICIAR SESIÓN` y `CREAR CUENTA` (desaparecen al iniciar sesión), franja de estadísticas en vivo (`GET /api/scores/stats`), demo de gameplay 2.5D en bucle con soporte `prefers-reduced-motion`, tarjeta de **Desafío de Hoy** con cuenta atrás a medianoche de España y Top 3 diario, tira de controles PC, características del juego, retratos voxel del bestiario (`public/js/ui/heroDemo.js`), medallas, novedades, ranking por periodos (`Hoy / Semana / Histórico`) con columna `Sector`, metadatos Open Graph/favicon y sección legal RGPD/LSSI/Cookies y aviso de proyecto de fans (`#view-legal`).

## El juego y Mejoras Recientes (`MEJORIAS`)

El motor de [public/js/game/game.js](file:///c:/Users/Patrik/Documents/Universidad/Quinto%20a%C3%B1o/Procesos/Proyecto_procesos/public/js/game/game.js) dibuja a `320 × 200` usando DDA/raycasting procedural, iluminación dinámica, pathfinding sobre rejilla (flow field), enemigos voxel (`public/js/game/voxels.js`), efectos *Screen Melt* al cambiar de sector o morir, medallas arcade (*Carnicero*, *Intocable*, *Cazatesoros*, *Pirómano*) y pantalla completa ajustada.

### Novedades de combate y progresión
- **Granada EMP `[G]` (`makeGrenadeSprite` + `throwGrenade` / `detonateGrenade`):** empiezas con 3 granadas (máx. 6), recargas en cofres o al avanzar de sector y compras +2 al Mercader `[8]`. Rebotan contra muros y suelos, aturden en área y rompen escudos enemigos durante `3.4 s` con multiplicador `1.45×`.
- **Balanceo del Centinela del Escudo (`SHIELD`):** reducida su vida (`7.8`), ángulo de bloqueo frontal (`0.76 rad`) y velocidad de giro (`1.45 rad/s`); además recibe `22%` de daño residual frontal, se sobrecarga tras `6` impactos (`shieldHeat`) y pierde la guardia al golpearle con puñetazo `[V]`.
- **Arsenal `[1]-[7]` + Mejoras Dinámicas y Jefes:** Super Escopeta, Chaingun, Lanzallamas optimizado, Motosierra, Lanzacohetes, Rifle Plasma y BFG-9000; Altar de Mejoras reactivas (Embestida `[C]`, Contragolpe, Pulso Cinético, Aura Ígnea), Rutas Roguelite `[1-3]`, Jefes de arena e **Icon of Sin** en 3 fases.

### Estadísticas personales y progresión

En **Mi Cuenta**, el panel **MI PROGRESIÓN** consulta `GET /api/scores/mine/stats` y muestra partidas jugadas, bajas totales, mejor puntuación, media por partida, sector máximo, tiempo en combate, desafíos diarios completados, la racha actual y la mejor racha de días consecutivos jugando (calendario `Europe/Madrid`; la racha sigue viva si jugaste ayer), y una gráfica de barras con las 10 últimas partidas en orden cronológico (las del desafío diario se resaltan en ámbar). La agregación se hace en cada repositorio (`personalStats`) y el cálculo de rachas en `computePlayStreaks` (`src/services/scoreService.js`), cubierto por `tests/personalStats.test.js`.

### Desafío diario

El botón **🔥 DESAFÍO DIARIO** pide al servidor la semilla del día (`GET /api/challenge/today`, HMAC-SHA256 con fecha de España y secreto de sesión) y lanza una partida con el mismo plan de sectores y mapas generados mediante `public/js/game/rng.js`.

## Estructura

- `src/`: backend por capas (`api/`, `services/`, `repositories/`, `middleware/`, `config/`, `utils/`). `src/server.js` inicializa tablas automáticamente con `sql/schema.sql`.
- `public/`: frontend modular (`index.html`, `css/styles.css`, `css/universe.css`, `js/ui/main.js`, `js/api/apiClient.js`, `js/game/`).
- `tests/`: pruebas unitarias e integración (`api`, `scoreService`, `personalStats`, `userService`, `challenge`, `semilla`, `variante3`).
- `docs/`: mapa de PBIs (`docs/PBI-MAP.md`) y guía paso a paso (`docs/GUIA-PASO-A-PASO.md`).

## Hito 4: Servicios externos (Google OAuth 2.0 y Correo)

Se ha integrado el inicio de sesión mediante **Google OAuth 2.0** (`GET /api/auth/google` y `/api/auth/google/callback`) y confirmación opcional por correo con **Brevo** (`REQUIRE_EMAIL_CONFIRMATION=true`). Al iniciar por Google también se asigna automáticamente un `nickname` aleatorio editable.
- **Variables de entorno clave:** `SESSION_SECRET`, `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `MAX_SCORE_KILLS`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `REQUIRE_EMAIL_CONFIRMATION`, `BREVO_API_KEY`.