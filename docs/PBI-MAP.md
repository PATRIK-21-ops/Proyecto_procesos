# Relación entre PBIs, hitos y código

| PBI | Hito objetivo | Dónde está implementado | Estado en esta base |
|---|---|---|---|
| 1 Registro de usuario | Hito 1/2 | `src/services/userService.js`, `src/api/authRoutes.js`, `public/js/ui/main.js` | Implementado; activación inmediata temporal |
| 2 Confirmación de correo | Hito 4 | No implementado aún | Pendiente; no se debe dar por completado |
| 3 Login local | Hito 2 | `src/services/userService.js`, `src/api/authRoutes.js` | Implementado |
| 4 OAuth | Hito 4 | No implementado aún | Pendiente |
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
| 22 README | Entrega | `README.md` | Incluido |
| 23/24 Puntuaciones (extensión) | Después del Hito 3 | `src/services/scoreService.js`, repositorios de scores, `/api/scores` | Prototipo implementado; no es parte de los requisitos originales |

## Nota importante de alcance

La especificación original exige confirmación de correo y OAuth en el proyecto completo; la guía de hitos sitúa estas funciones en el Hito 4. Esta entrega prioriza llegar al Hito 3 y deja esos dos elementos identificados como pendientes. También requiere desplegar de forma pública: el código de CI está incluido, pero no puedo conectar cuentas externas ni desplegar en tu nombre desde el ZIP.
