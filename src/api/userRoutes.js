import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { publicUser } from '../utils/publicUser.js';

function destroySession(req) {
  return new Promise((resolve, reject) => req.session.destroy((error) => error ? reject(error) : resolve()));
}

export function userRoutes({ userService, logger, cookieName = 'hellfall.sid' }) {
  const router = Router();
  const authenticated = requireAuth(userService);

  router.get('/', authenticated, asyncHandler(async (req, res) => {
    const users = await userService.listUsers(req.currentUser);
    res.json({ users: users.map(publicUser) });
  }));

  router.get('/:id/active', authenticated, asyncHandler(async (req, res) => {
    const active = await userService.isActive(req.currentUser, req.params.id);
    res.json({ id: req.params.id, active });
  }));

  router.delete('/:id', authenticated, csrfProtection, asyncHandler(async (req, res) => {
    const actorId = req.currentUser.id;
    const result = await userService.deleteUser({ id: actorId, role: req.currentUser.role }, req.params.id);
    logger.info({ event: 'user.deleted', targetUserId: result.id, actorId }, 'Cuenta marcada como eliminada');
    const deletedCurrentUser = actorId === result.id;
    if (deletedCurrentUser) {
      await destroySession(req);
      res.clearCookie(cookieName, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
    }
    res.json({ deleted: true, deletedCurrentUser });
  }));

  return router;
}
