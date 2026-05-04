import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { getMyProfile, updateMyProfile } from './profile.service';

export const profileRouter = Router();

profileRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = await getMyProfile(req.user!.id);
    res.json({ data: profile });
  }),
);

profileRouter.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = await updateMyProfile(req.user!.id, req.body);
    res.json({ data: profile });
  }),
);
