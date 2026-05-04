import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { createApplication, listMyApplications, withdrawApplication } from './applications.service';

export const applicationsRouter = Router();

applicationsRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const applications = await listMyApplications(req.user!.id);
    res.json({ data: applications });
  }),
);

applicationsRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const application = await createApplication(req.user!.id, req.body);
    res.status(201).json({ data: application });
  }),
);

applicationsRouter.patch(
  '/:id/withdraw',
  requireAuth,
  asyncHandler(async (req, res) => {
    const application = await withdrawApplication(req.user!.id, req.params.id);
    res.json({ data: application });
  }),
);
