import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';

export function authRoutes({ userService, logger = null, googleAuthService = null, cookieName = 'hellfall.sid' }) {
  const router = Router();

  router.post('/register', csrfProtection, async (req, res, next) => {
    try {
      const result = await userService.register({
        email: req.body?.email,
        password: req.body?.password
      });

      if (result && result.pendingConfirmation) {
        logger?.info?.({ event: 'auth.register.pending', email: result.email }, 'Registro pendiente de confirmación por correo');
        return res.status(202).json({
          pendingConfirmation: true,
          email: result.email,
          message: result.message
        });
      }

      logger?.info?.({ event: 'auth.register.success', userId: result.id, email: result.email }, 'Usuario registrado con éxito');
      return res.status(201).json({ id: result.id, email: result.email, role: result.role, status: result.status });
    } catch (err) {
      logger?.warn?.({ event: 'auth.register.failed', reason: err.message }, 'Fallo en registro');
      return next(err);
    }
  });

  router.get('/confirm', async (req, res) => {
    try {
      const token = String(req.query.token || '');
      const user = await userService.confirmEmailToken(token);
      logger?.info?.({ event: 'auth.confirm.success', userId: user.id }, 'Cuenta activada correctamente');
      return res.redirect('/?confirmed=success');
    } catch (err) {
      logger?.warn?.({ event: 'auth.confirm.failed', reason: err.message }, 'Fallo al procesar token de confirmación');
      return res.redirect('/?error=invalid_confirmation_token');
    }
  });

  router.post('/login', csrfProtection, async (req, res, next) => {
    try {
      const user = await userService.authenticate({ email: req.body?.email, password: req.body?.password });

      await new Promise((resolve, reject) => req.session.regenerate((err) => (err ? reject(err) : resolve())));
      req.session.userId = user.id;
      await new Promise((resolve, reject) => req.session.save((err) => (err ? reject(err) : resolve())));

      logger?.info?.({ event: 'auth.login.success', userId: user.id }, 'Login local correcto');
      return res.json({ id: user.id, email: user.email, role: user.role, status: user.status });
    } catch (err) {
      logger?.warn?.({ event: 'auth.login.failed', reason: err.message }, 'Intento fallido de login');
      return next(err);
    }
  });

  router.get('/google', (req, res, next) => {
    try {
      if (!googleAuthService) return res.status(501).json({ error: 'OAuth no configurado.' });
      return res.redirect(googleAuthService.getAuthUrl());
    } catch (err) {
      return next(err);
    }
  });

  router.get('/google/callback', async (req, res) => {
    try {
      const code = req.query.code;
      if (!code || typeof code !== 'string') return res.redirect('/?error=oauth_missing_code');
      if (!googleAuthService || !userService) return res.redirect('/?error=oauth_not_configured');

      const googleProfile = await googleAuthService.exchangeCodeForProfile(code);
      const user = await userService.loginWithGoogle({ email: googleProfile.email });

      await new Promise((resolve, reject) => req.session.regenerate((err) => (err ? reject(err) : resolve())));
      req.session.userId = user.id;
      await new Promise((resolve, reject) => req.session.save((err) => (err ? reject(err) : resolve())));

      return res.redirect('/?oauth=success');
    } catch (err) {
      logger?.error?.({ event: 'auth.oauth.failed', reason: err.message }, 'Error callback OAuth');
      return res.redirect('/?error=oauth_failed');
    }
  });

  router.post('/logout', requireAuth, csrfProtection, async (req, res, next) => {
    try {
      await new Promise((resolve, reject) => req.session.destroy((err) => (err ? reject(err) : resolve())));
      res.clearCookie(cookieName);
      return res.json({ ok: true });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}

export function createAuthRouter(userService, options = {}) {
  return authRoutes({ userService, ...options });
}