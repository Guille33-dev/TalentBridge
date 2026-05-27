import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { getMyProfile, updateMyProfile } from './profile.service';

export const profileRouter = Router();

profileRouter.use(requireAuth, requireRole(UserRole.STUDENT));

profileRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const profile = await getMyProfile(req.user!.id);
    res.json({ data: profile });
  }),
);

profileRouter.patch(
  '/me',
  asyncHandler(async (req, res) => {
    const profile = await updateMyProfile(req.user!.id, req.body);
    res.json({ data: profile });
  }),
);
