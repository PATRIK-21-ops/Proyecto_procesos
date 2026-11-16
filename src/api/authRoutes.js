import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';

export function createAuthRouter(userService, { logger = null, googleAuthService = null } = {}) {
  const router = Router();

  // POST /api/auth/register - Registro de nuevo usuario (soporta confirmación pendiente por correo)
  router.post('/register', csrfProtection, async (req, res, next) => {
    try {
      const result = await userService.register({
        email: req.body?.email,
        password: req.body?.password
      });

      // Si requiere confirmación por correo, no creamos sesión todavía y devolvemos estado 202
      if (result && result.pendingConfirmation) {
        logger?.info?.({ event: 'auth.register.pending', email: result.email }, 'Registro pendiente de confirmación por correo');
        return res.status(202).json({
          pendingConfirmation: true,
          email: result.email,
          message: result.message
        });
      }

      logger?.info?.({ event: 'auth.register.success', userId: result.id, email: result.email }, 'Usuario registrado y activado con éxito');
      return res.status(201).json({
        id: result.id,
        email: result.email,
        role: result.role,
        status: result.status
      });
    } catch (err) {
      logger?.warn?.({ event: 'auth.register.failed', reason: err.message }, 'Fallo en el registro de usuario');
      return next(err);
    }
  });

  // GET /api/auth/confirm - Validación del token de activación recibido por correo electrónico
  router.get('/confirm', async (req, res) => {
    try {
      const token = String(req.query.token || '');
      const user = await userService.confirmEmailToken(token);
      logger?.info?.({ event: 'auth.confirm.success', userId: user.id, email: user.email }, 'Cuenta activada correctamente mediante enlace de correo');
      return res.redirect('/?confirmed=success');
    } catch (err) {
      logger?.warn?.({ event: 'auth.confirm.failed', reason: err.message }, 'Fallo al procesar el token de confirmación de correo');
      return res.redirect('/?error=invalid_confirmation_token');
    }
  });

  // POST /api/auth/login - Inicio de sesión local con correo y contraseña
  router.post('/login', csrfProtection, async (req, res, next) => {
    try {
      const user = await userService.authenticate({
        email: req.body?.email,
        password: req.body?.password
      });

      // Regeneración de sesión para prevenir ataques de fijación de sesión
      await new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      req.session.userId = user.id;

      // Persistencia explícita de la sesión antes de responder
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      logger?.info?.({ event: 'auth.login.success', userId: user.id, email: user.email }, 'Inicio de sesión local correcto');
      return res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      });
    } catch (err) {
      logger?.warn?.({ event: 'auth.login.failed', email: req.body?.email, reason: err.message }, 'Intento fallido de inicio de sesión');
      return next(err);
    }
  });

  // GET /api/auth/google - Redirección hacia la pasarela de consentimiento de Google OAuth 2.0
  router.get('/google', (req, res, next) => {
    try {
      if (!googleAuthService) {
        return res.status(501).json({ error: 'Google OAuth no está configurado en el servidor.' });
      }
      const authUrl = googleAuthService.getAuthUrl();
      return res.redirect(authUrl);
    } catch (err) {
      return next(err);
    }
  });

  // GET /api/auth/google/callback - Retorno desde Google OAuth tras la autorización del usuario
  router.get('/google/callback', async (req, res, next) => {
    try {
      const code = req.query.code;
      if (!code || typeof code !== 'string') {
        logger?.warn?.({ event: 'auth.oauth.missing_code' }, 'Callback de Google recibido sin código de autorización');
        return res.redirect('/?error=oauth_missing_code');
      }

      if (!googleAuthService || !userService) {
        return res.redirect('/?error=oauth_not_configured');
      }

      // Canje del código temporal por perfil verificado
      const googleProfile = await googleAuthService.exchangeCodeForProfile(code);
      const user = await userService.loginWithGoogle({ email: googleProfile.email });

      // Regeneración y guardado de sesión
      await new Promise((resolve, reject) => {
        req.session.regenerate((err) => (err ? reject(err) : resolve()));
      });

      req.session.userId = user.id;

      await new Promise((resolve, reject) => {
        req.session.save((err) => (err ? reject(err) : resolve()));
      });

      logger?.info?.({ event: 'auth.oauth.success', userId: user.id, email: user.email }, 'Autenticación con Google OAuth completada');
      return res.redirect('/?oauth=success');
    } catch (err) {
      logger?.error?.({ event: 'auth.oauth.failed', reason: err.message }, 'Error crítico en el callback de Google OAuth');
      return res.redirect('/?error=oauth_failed');
    }
  });

  // POST /api/auth/logout - Cierre de sesión e invalidación de credenciales
  router.post('/logout', requireAuth, csrfProtection, async (req, res, next) => {
    try {
      const userId = req.session.userId;
      await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      res.clearCookie('hellfall.sid');
      logger?.info?.({ event: 'auth.logout.success', userId }, 'Sesión cerrada correctamente');
      return res.json({ ok: true });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}