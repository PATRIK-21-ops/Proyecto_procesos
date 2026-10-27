import { Router } from 'express';
import { csrfProtection, issueCsrfToken } from '../middleware/csrf.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { publicUser } from '../utils/publicUser.js';
import { AppError } from '../utils/AppError.js';
import { randomBytes } from 'node:crypto';

function regenerateSession(req) {
  return new Promise((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()));
}
function saveSession(req) {
  return new Promise((resolve, reject) => {
    if (!req.session || typeof req.session.save !== 'function') return resolve();
    req.session.save((error) => error ? reject(error) : resolve());
  });
}
function destroySession(req) {
  return new Promise((resolve, reject) => {
    if (!req.session) return resolve();
    req.session.destroy((error) => error ? reject(error) : resolve());
  });
}

export function authRoutes({ userService, logger, cookieName = 'hellfall.sid' }) {
  const router = Router();
  const authenticated = requireAuth(userService);

  router.get('/csrf', (req, res) => {
    const token = issueCsrfToken(req.session);
    res.json({ csrfToken: token });
  });

  router.post('/register', csrfProtection, asyncHandler(async (req, res) => {
    const user = await userService.register(req.body || {});
    logger.info({ event: 'user.registered', userId: user.id }, 'Nuevo usuario registrado');
    res.status(201).json({ user: publicUser(user), message: 'Cuenta creada. Ya puedes iniciar sesión.' });
  }));

  router.post('/login', csrfProtection, asyncHandler(async (req, res) => {
    let user;
    try {
      user = await userService.authenticate(req.body || {});
    } catch (error) {
      logger.warn({ event: 'auth.login.failure', email: typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : undefined, code: error.code || 'LOGIN_FAILED' }, 'Intento de inicio de sesión fallido');
      throw error;
    }
    await regenerateSession(req);
    req.session.userId = user.id;
    req.session.csrfToken = randomBytes(32).toString('hex');
    logger.info({ event: 'auth.login.success', userId: user.id }, 'Inicio de sesión correcto');
    res.json({ user: publicUser(user), csrfToken: req.session.csrfToken });
  }));

  // --- OAUTH 2.0 CON GOOGLE (HITO 4) ---
  router.get('/google', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;

    if (!clientId || !redirectUri) {
      logger.warn({ event: 'auth.oauth.misconfigured' }, 'OAuth de Google no configurado');
      return res.redirect('/?error=oauth_not_configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account'
    });

    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  });

  router.get('/google/callback', asyncHandler(async (req, res) => {
    const { code, error } = req.query;

    if (error || !code) {
      logger.warn({ event: 'auth.oauth.cancelled', error }, 'Inicio de sesión con Google cancelado');
      return res.redirect('/?error=oauth_cancelled');
    }

    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: String(code),
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: process.env.GOOGLE_CALLBACK_URL || '',
          grant_type: 'authorization_code'
        })
      });

      if (!tokenResponse.ok) {
        logger.warn({ event: 'auth.oauth.token_failed', status: tokenResponse.status }, 'Fallo al obtener token de Google');
        return res.redirect('/?error=oauth_token_failed');
      }

      const tokenData = await tokenResponse.json();

      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });

      if (!profileResponse.ok) {
        logger.warn({ event: 'auth.oauth.profile_failed', status: profileResponse.status }, 'Fallo al obtener perfil de Google');
        return res.redirect('/?error=oauth_profile_failed');
      }

      const profile = await profileResponse.json();
      const user = await userService.loginWithGoogle({ email: profile.email });

      await regenerateSession(req);
      req.session.userId = user.id;
      req.session.csrfToken = randomBytes(32).toString('hex');
      await saveSession(req);

      logger.info({ event: 'auth.oauth.success', userId: user.id }, 'Inicio de sesión con Google correcto');
      return res.redirect('/?oauth=success');
    } catch (err) {
      logger.error({ event: 'auth.oauth.error', err }, 'Error en autenticación con Google');
      if (err instanceof AppError && err.code === 'ACCOUNT_NOT_ACTIVE') {
        return res.redirect('/?error=oauth_account_inactive');
      }
      return res.redirect('/?error=oauth_server_error');
    }
  }));

  router.get('/me', authenticated, (req, res) => {
    const token = req.session.csrfToken || issueCsrfToken(req.session);
    res.json({ user: publicUser(req.currentUser), csrfToken: token });
  });

  router.post('/logout', csrfProtection, asyncHandler(async (req, res) => {
    const userId = req.session?.userId;
    await destroySession(req);
    res.clearCookie(cookieName, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
    if (userId) logger.info({ event: 'auth.logout', userId }, 'Sesión cerrada');
    res.status(200).json({ loggedOut: true });
  }));

  router.use((error, req, res, next) => {
    if (error instanceof AppError) return next(error);
    logger.error({ event: 'auth.failure', err: error }, 'Error en autenticación');
    return next(error);
  });

  return router;
}