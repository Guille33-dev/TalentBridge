import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { getCurrentUser } from './users.service';

export const usersRouter = Router();

usersRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req.user!.id);
    res.json({ data: user });
  }),
);
