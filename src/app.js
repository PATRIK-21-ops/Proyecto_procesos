import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { authRoutes } from './api/authRoutes.js';
import { userRoutes } from './api/userRoutes.js';
import { scoreRoutes } from './api/scoreRoutes.js';
import { verificarDominioEmail } from './services/userService.js';
import { AppError } from './utils/AppError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

export function createApp({ userService, scoreService, sessionStore, sessionSecret, production = false, logger, cookieName = 'hellfall.sid' }) {
  if (!userService || !scoreService || !logger) throw new Error('createApp necesita userService, scoreService y logger.');
  if (!sessionSecret) throw new Error('Falta SESSION_SECRET.');

  const app = express();
  if (production) app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));
  app.use(express.json({ limit: '32kb' }));
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));
  app.use(session({
    name: cookieName,
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: production,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 2,
      path: '/'
    }
  }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'hellfall-pixel-siege' }));

  app.post('/api/prueba/dominio', (req, res) => {
    try {
      const { email } = req.body || {};
      const resultado = verificarDominioEmail(email);
      return res.status(200).json(resultado);
    } catch (error) {
      return res.status(400).json({ error: error.message || 'Petición inválida' });
    }
  });

  app.use('/api/auth', authRoutes({ userService, logger, cookieName }));
  app.use('/api/users', userRoutes({ userService, logger, cookieName }));
  app.use('/api/scores', scoreRoutes({ userService, scoreService, logger }));
  app.use('/static', express.static(publicDir, { index: false, maxAge: production ? '1h' : 0 }));
  app.use(express.static(publicDir, { index: 'index.html', maxAge: production ? '1h' : 0 }));

  app.use('/api', (_req, _res, next) => next(new AppError(404, 'API_NOT_FOUND', 'La ruta de API no existe.')));
  app.use((req, res) => {
    if (req.accepts('html')) return res.sendFile(path.join(publicDir, 'index.html'));
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No se ha encontrado el recurso.' } });
  });

  // El mensaje interno del error nunca se expone cuando es un error inesperado.
  app.use((error, req, res, _next) => {
    const status = Number.isInteger(error.status) ? error.status : 500;
    const code = error.code || (status < 500 ? 'BAD_REQUEST' : 'INTERNAL_ERROR');
    const message = status >= 500 ? 'Ha ocurrido un error interno.' : (error instanceof AppError ? error.message : 'La petición no es válida.');
    if (status >= 500) logger.error({ event: 'http.error', err: error, method: req.method, path: req.path }, 'Error interno');
    else logger.warn({ event: 'http.rejected', status, code, method: req.method, path: req.path }, message);
    res.status(status).json({ error: { code, message } });
  });

  return app;
}