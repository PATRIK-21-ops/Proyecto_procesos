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
