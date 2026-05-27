import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { createApplication, listMyApplications, withdrawApplication } from './applications.service';

export const applicationsRouter = Router();

applicationsRouter.use(requireAuth, requireRole(UserRole.STUDENT));

applicationsRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const applications = await listMyApplications(req.user!.id);
    res.json({ data: applications });
  }),
);

applicationsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const application = await createApplication(req.user!.id, req.body);
    res.status(201).json({ data: application });
  }),
);

applicationsRouter.patch(
  '/:id/withdraw',
  asyncHandler(async (req, res) => {
    const application = await withdrawApplication(req.user!.id, req.params.id);
    res.json({ data: application });
  }),
);
