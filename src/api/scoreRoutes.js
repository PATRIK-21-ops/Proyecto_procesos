import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export function scoreRoutes({ userService, scoreService, logger }) {
  const router = Router();
  router.get('/mine', requireAuth(userService), asyncHandler(async (req, res) => {
    const scores = await scoreService.mine({ id: req.currentUser.id, role: req.currentUser.role });
    res.json({ scores });
  }));

  router.get('/top', asyncHandler(async (req, res) => {
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit || '10', 10) || 10));
    res.json({ scores: await scoreService.top(limit) });
  }));

  router.post('/', requireAuth(userService), csrfProtection, asyncHandler(async (req, res) => {
    const score = await scoreService.submit({ id: req.currentUser.id, role: req.currentUser.role }, req.body || {});
    logger.info({ event: 'score.submitted', userId: req.currentUser.id, kills: score.kills, points: score.points }, 'Puntuación guardada');
    res.status(201).json({ score });
  }));
  return router;
}
