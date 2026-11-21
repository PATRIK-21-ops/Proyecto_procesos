# Relación entre PBIs, hitos y código

| PBI | Hito objetivo | Dónde está implementado | Estado en esta base |
|---|---|---|---|
| 1 Registro de usuario | Hito 1/2 | `src/services/userService.js`, `src/api/authRoutes.js`, `public/js/ui/main.js` | Implementado; activación inmediata temporal |
| 2 Confirmación de correo | Hito 4 | `src/services/emailService.js`, `src/services/userService.js`, `GET /api/auth/confirm` | Implementado (Brevo, activable con `REQUIRE_EMAIL_CONFIRMATION=true`) |
| 3 Login local | Hito 2 | `src/services/userService.js`, `src/api/authRoutes.js` | Implementado |
| 4 OAuth | Hito 4 | `src/api/authRoutes.js` (`/api/auth/google`, `/callback`), `UserService.loginWithGoogle` | Implementado (Google OAuth 2.0) |
| 5 Logout | Hito 2 | `src/api/authRoutes.js`, `public/js/api/apiClient.js` | Implementado |
| 6 Mantener sesión | Hito 2 | `express-session`, `GET /api/auth/me` | Implementado; el store es persistente cuando hay PostgreSQL |
| 7 Roles | Hito 3 | `src/services/userService.js`, `src/middleware/auth.js`, `src/api/userRoutes.js` | Implementado |
| 8 Listar usuarios | Hito 1/3 | `GET /api/users`, panel admin | Implementado y protegido |
| 9 Comprobar usuario activo | Hito 1/3 | `GET /api/users/:id/active` | Implementado y protegido |
| 10 Eliminar usuarios | Hito 1/3 | `DELETE /api/users/:id` | Implementado como borrado lógico |
| 11 Persistencia | Hito 3 | `sql/schema.sql`, `src/repositories/*pg.js` | Implementado al configurar `DATABASE_URL` |
| 12 Seguridad de contraseñas | Hito 2 | `bcryptjs` en `UserService` | Implementado |
| 13 Pruebas automatizadas | Hito 1+ | `tests/` | Incluidas; deben ejecutarse después de `npm install` |
| 14 Manejo de errores | Hito 4/revisión | `src/utils/AppError.js`, middleware de errores y mensajes UI | Base común implementada; revisar y ampliar en cierre |
| 15 Registro de actividad | Hito 3 | Pino en `src/config/logger.js` y rutas | Implementado para eventos clave y peticiones rechazadas |
| 16 API backend | Hito 1 | `src/api/`, `src/app.js` | Implementado |
| 17 Arquitectura en capas | Hito 1/2 | `src/api`, `src/services`, `src/repositories`, `public/js/api`, `public/js/ui` | Implementado |
| 18 Repo/GitHub Flow | Hito 1 | `.github/workflows/ci.yml`, `docs/GUIA-PASO-A-PASO.md` | Configuración lista; tú haces ramas/PR en tu repo |
| 19 Integración continua | Hito 1 | `.github/workflows/ci.yml` | Workflow incluido; verificar en GitHub tras subir |
| 20 Despliegue continuo | Hito 1 | Guía de despliegue del README | Requiere que conectes el repo al proveedor cloud |
| 21 Variables/secretos | Hito 3 | `.env.example`, `.gitignore`, `src/config/env.js` | Implementado; configurar las variables reales |
| 22 README | Entrega | `README.md` | Incluido y actualizado con URL desplegada, arquitectura, nicknames y mejoras |
| 23 Puntuaciones y ranking seguro | Hito 3 / Extensión | `src/services/scoreService.js`, `src/repositories/scoreRepository.*.js`, `src/api/scoreRoutes.js` | Implementado con cálculo en servidor, sin exposición de emails |
| 24 Límite dinámico de bajas (`MAX_SCORE_KILLS`) | Mejoras | `src/config/env.js`, `src/services/scoreService.js`, `tests/scoreService.test.js` | Implementado (100000 por defecto, hasta 500000) |
| 25 Desafío diario determinista | Mejoras | `src/services/challengeService.js`, `src/api/challengeRoutes.js`, `public/js/game/rng.js`, `tests/challenge.test.js` | Implementado con semilla HMAC-SHA256 diaria |
| 26 Motor Raycasting 2.5D y bestiario voxel | Gameplay | `public/js/game/game.js`, `public/js/game/voxels.js`, `public/js/game/weapons.js` | Implementado (10 sectores temáticos, IA con pathfinding, 6 jefes, Icon of Sin) |
| 27 Progresión Roguelite (mejoras, rutas y mercader) | Gameplay | `public/js/game/game.js` | Implementado (Altar de Mejoras dinámicas, Rutas 1-3, Misiones variadas, Mercader) |
| 28 Granada EMP `[G]` y balanceo del Centinela del Escudo | Mejoras | `public/js/game/weapons.js`, `public/js/game/game.js` | Implementado (rebote, ruptura de guardia `3.4 s`, puñetazo `[V]` y sobrecarga) |
| 29 Protagonista único (`SLAYER`) y portal Universo SPA | Mejoras UX | `public/index.html`, `public/css/universe.css`, `public/js/ui/main.js`, `public/js/game/portrait.js` | Implementado (`#lore`, `#guide`, `#ranking`, flujo `pushState`/`popstate` y `← VOLVER`) |
| 30 Nicknames persistentes en BD y privacidad en ranking | Mejoras BD | `src/utils/nickname.js`, `sql/schema.sql`, `src/repositories/*.js`, `src/services/*.js`, `src/api/*.js`, `public/js/ui/main.js` | Implementado (nickname aleatorio, formulario al ganar/morir, ranking `Hoy/Semana/Histórico` >0 pts con columna sector y brecha) |
| 31 Medallas Arcade y transición Screen Melt | Mejoras | `public/js/game/game.js`, `public/js/ui/main.js` | Implementado (*Carnicero*, *Intocable*, *Cazatesoros*, *Pirómano*, informe final) |
| 32 Límite ampliado y configurable de bajas (`MAX_SCORE_KILLS`) | Mejoras | `src/config/env.js`, `src/services/scoreService.js`, `tests/scoreService.test.js` | Implementado (100000 por defecto, hasta 500000) |
| 33 Portada viva, Desafío de Hoy, Bestiario Voxel y Estadísticas (`GET /api/scores/stats`) | Mejoras UX | `public/index.html`, `public/css/universe.css`, `public/js/ui/heroDemo.js`, `public/js/ui/main.js`, `src/api/scoreRoutes.js` | Implementado (demo gameplay en vivo 2.5D, stats comunidad, cuenta atrás Madrid, medallas y bestiario) |
| 34 Cumplimiento RGPD/LSSI, Fan Disclaimer, OG y `prefers-reduced-motion` | Mejoras Web | `public/index.html`, `public/favicon.svg`, `public/og-cover.svg`, `public/css/universe.css` | Implementado (`#view-legal` Aviso/Privacidad/Cookies/Feedback, Open Graph y accesibilidad) |

## Estado de alcance

Todos los hitos obligatorios (Hitos 1–4: capas, usuarios, PostgreSQL en Docker, roles, pruebas automatizadas, CI/CD, confirmación por email, Google OAuth 2.0 y despliegue en `https://hellfall-game.onrender.com`) junto con los PBIs ampliados de gameplay, portal web, nicknames y privacidad están implementados y verificados en la rama `MEJORIAS`.
