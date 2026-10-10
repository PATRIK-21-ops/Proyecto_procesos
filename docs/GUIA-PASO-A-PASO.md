# Guía de trabajo desarrollada — HELLFALL, Hitos 1–3

Esta guía está ligada a los PBIs y al documento de especificación. El orden está pensado para llegar primero a un backend evaluable, después a la sesión y finalmente a la persistencia/roles. El videojuego web ya tiene un prototipo funcional para que se pueda probar la idea, pero **la parte obligatoria evaluable son las capas, usuarios, pruebas, CI/CD, persistencia y permisos**.

## Fase 1 — Preparar repositorio y entorno

1. Instala Node.js 20 o 22 y verifica `node --version` y `npm --version`.
2. Clona tu repo ya creado en GitHub si aún no tienes una copia local: `git clone URL_DE_TU_REPO`; entra en su carpeta.
3. Crea una rama de trabajo, por ejemplo `git switch -c feat/hellfall-base`.
4. Copia los ficheros de este proyecto a la carpeta local de tu repo sin copiar `.env` ni `node_modules`.
5. Comprueba que `.gitignore` contiene `.env`, `node_modules`, logs y secretos.
6. Ejecuta `npm install`. Guarda `package-lock.json` cuando se genere.
7. Copia `.env.example` a `.env`; cambia el secreto de sesión, correo y contraseña del administrador. La contraseña de admin debe tener al menos 12 caracteres.
8. Ejecuta `npm test` antes de integrar cambios. Los tests de esta entrega deben pasar en tu máquina tras instalar las dependencias.
9. Haz commits pequeños y abre un pull request para integrar la rama en `main`; no trabajes directamente en `main`.

## Fase 2 — Hito 1: backend y lógica de usuarios

10. Estudia `src/repositories/userRepository.memory.js`: ofrece `create`, `findByEmail`, `findById`, `list` y `update`.
11. Estudia `src/services/userService.js`: `register` valida el email, aplica política de contraseña y guarda un hash bcrypt. La misma clase recibe cualquier repositorio por constructor.
12. La baja es lógica: `status='deleted'`. Esto conserva el registro y hace que el login rechace la cuenta.
13. El servicio recibe el actor en operaciones sensibles. Solo `admin` puede listar o comprobar actividad; `user` solo puede borrar su propia cuenta; `admin` puede borrar cualquiera.
14. Revisa `src/api/userRoutes.js`: define rutas y transforma respuestas, sin replicar las reglas de negocio.
15. Abre `tests/userService.test.js` y `tests/api.test.js`: son ejemplos automatizados para casos correctos y errores.
16. Comprueba la API con `npm run dev` y `GET http://localhost:8080/api/health`.
17. Revisa `.github/workflows/ci.yml`. GitHub Actions ejecuta la suite al abrir pull requests y al empujar a `main`.
18. Despliega la página base a un servicio cloud y confirma que `/api/health` responde.
19. Cuando el código de Hito 1 esté probado y el despliegue/CI funcionen, etiqueta el commit validado: `git tag hito-1` y `git push origin hito-1`.

## Fase 3 — Hito 2: frontend y sesión

20. Abre `public/index.html` y `public/css/styles.css`: contienen las vistas de inicio, login, registro, juego, perfil y administrador.
21. Solo `public/js/api/apiClient.js` hace `fetch`. `public/js/ui/main.js` maneja las vistas y llama al cliente API.
22. El registro crea un usuario `active` por ahora. No intenta confirmar el email, porque la confirmación corresponde al Hito 4.
23. Comprueba `POST /api/auth/login`: las credenciales se verifican con bcrypt y el id se guarda en una sesión de servidor.
24. Comprueba `GET /api/auth/me` tras recargar la página: restaura la sesión si la cookie sigue siendo válida.
25. Comprueba `POST /api/auth/logout`: destruye la sesión y limpia la cookie.
26. Comprueba el token CSRF. El frontend lo obtiene de `/api/auth/csrf` y lo manda mediante `X-CSRF-Token` en POST/DELETE.
27. Verifica que abrir `/api/users` sin sesión devuelve `401` y abrirlo como `user` devuelve `403`.
28. Cuando los casos estén comprobados, integra mediante PR y etiqueta `hito-2`.

## Fase 4 — Hito 3: PostgreSQL, secretos y roles

29. Para modo Docker, copia `.env.example` a `.env` y reemplaza los valores. En la raíz ejecuta `docker compose up --build`.
30. El contenedor de la aplicación se conecta a PostgreSQL; al iniciar ejecuta `sql/schema.sql`, que crea `users`, `scores` y la tabla de sesiones.
31. Revisa `src/repositories/userRepository.pg.js`: debe mantener la misma interfaz del repositorio de memoria. La selección del repositorio ocurre en `src/server.js`; `UserService` no cambia.
32. El almacén de `express-session` pasa a `connect-pg-simple` si existe `DATABASE_URL`, así la sesión sobrevive a reinicios.
33. `ADMIN_EMAIL` y `ADMIN_PASSWORD` se leen del entorno. La primera vez se crea el admin; si ese correo existe se le asigna rol `admin`.
34. Comprueba el panel admin: lista email, rol, estado y fecha. Prueba eliminar una cuenta de usuario normal y confirma que el estado se vuelve `deleted`.
35. Registra una cuenta, reinicia el servicio, vuelve a iniciar sesión y comprueba que sigue existiendo. Repite con una puntuación.
36. Revisa los logs: eventos `user.registered`, `auth.login.success`, `auth.login.failure`, `user.deleted`, `score.submitted` y avisos de solicitudes rechazadas.
37. Integra mediante PR; confirma que las pruebas pasan y que el despliegue funciona; etiqueta `hito-3`.

## Fase 5 — Verificación final del Hito 3

38. Prueba como invitado: no puede abrir el perfil ni enviar puntuaciones.
39. Prueba como usuario: puede iniciar sesión, jugar, guardar su puntuación y borrar su propia cuenta; no puede listar otros usuarios.
40. Prueba como admin: puede listar usuarios, consultar estado y eliminar otras cuentas.
41. Reinicia app y PostgreSQL sin eliminar el volumen; la tabla `users` debe mantener las cuentas.
42. En GitHub, comprueba que el último commit de `main` está integrado por PR y el workflow de CI está verde.
43. Entrega las URL del repositorio y de la aplicación desplegada junto con el README, siguiendo el documento de la asignatura.

## Después del Hito 3

44. Añade email de confirmación y estado pendiente (Hito 4).
45. Añade OAuth con al menos un proveedor (Hito 4).
46. Fortalece la validación de resultados si las puntuaciones deben ser competitivas: la implementación actual calcula los puntos en el servidor (`kills × 100`) pero las bajas declaradas siguen viniendo del navegador. Para impedir trampas, la partida tendría que validarse desde lógica autoritativa en el servidor.

## Problemas comunes

- **La app inicia pero los datos desaparecen tras reiniciar:** no has configurado `DATABASE_URL`; estás en modo memoria.
- **No puedes iniciar sesión como admin:** comprueba `ADMIN_EMAIL` / `ADMIN_PASSWORD`, reinicia el servidor y vuelve a probar. No escribas la contraseña en archivos versionados.
- **`401` en rutas protegidas:** inicia sesión y comprueba que la cookie se mantiene.
- **`403 CSRF_TOKEN_INVALID`:** recarga la página para renovar el token.
- **`npm ci` falla por no encontrar lockfile:** ejecuta `npm install`, confirma `package-lock.json` y después usa `npm ci`.
- **En producción las cookies no se guardan:** la aplicación necesita HTTPS cuando `NODE_ENV=production`; en el proveedor configura la URL HTTPS y `trust proxy` está activado en ese modo.

## Cómo reflejar el trabajo incremental en GitHub

El ZIP incluye el estado final de los Hitos 1–3 como referencia; **no representa por sí mismo un historial de desarrollo**. No conviene subir todos los archivos con un único commit si se evaluará la evolución. Desarrolla e integra cada parte con ramas y pull requests siguiendo esta secuencia:

1. `feat/user-service-memory`: repositorio de memoria, `UserService` y primeras pruebas de reglas.
2. `feat/users-api`: endpoints de usuarios y pruebas HTTP.
3. `ci/github-actions`: workflow de pruebas y primer health check.
4. `feat/login-session`: registro/login/logout, sesiones, CSRF y pantallas de autenticación.
5. `feat/postgres-persistence`: esquema SQL, repositorios PostgreSQL y almacén de sesiones persistente.
6. `feat/admin-roles-logs`: cuenta admin por variables de entorno, permisos y eventos de auditoría.
7. `feat/pixel-fps`: escenario raycasting, colisiones, enemigos, arma, HUD y pausa.
8. `docs/delivery-readme`: documentar tecnologías, ejecución, pruebas, variables y URL pública.

Para cada rama: créala desde `main`, implementa el bloque, ejecuta `npm test`, haz commits pequeños, sube la rama, abre un PR, espera al CI en verde, integra el PR y borra la rama. Etiqueta `hito-1`, `hito-2` y `hito-3` solo cuando cada etapa esté realmente verificada. Si importas este ZIP completo en un solo commit, tendrás código de referencia funcional, pero el historial no probará por sí solo que hayas seguido esa secuencia.
