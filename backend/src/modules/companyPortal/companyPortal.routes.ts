import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import { asyncHandler } from '../../shared/http/asyncHandler';
import {
  createMyCompanyJob,
  deleteMyCompanyJob,
  getMyCompany,
  listMyCompanyApplications,
  listMyCompanyJobs,
  updateMyCompany,
  updateMyCompanyApplication,
  updateMyCompanyJob,
} from './companyPortal.service';

export const companyPortalRouter = Router();

companyPortalRouter.use(requireAuth, requireRole(UserRole.COMPANY));

companyPortalRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const company = await getMyCompany(req.user!.id);
    res.json({ data: company });
  }),
);

companyPortalRouter.patch(
  '/me',
  asyncHandler(async (req, res) => {
    const company = await updateMyCompany(req.user!.id, req.body);
    res.json({ data: company });
  }),
);

companyPortalRouter.get(
  '/jobs',
  asyncHandler(async (req, res) => {
    const jobs = await listMyCompanyJobs(req.user!.id);
    res.json({ data: jobs });
  }),
);

companyPortalRouter.post(
  '/jobs',
  asyncHandler(async (req, res) => {
    const job = await createMyCompanyJob(req.user!.id, req.body);
    res.status(201).json({ data: job });
  }),
);

companyPortalRouter.patch(
  '/jobs/:id',
  asyncHandler(async (req, res) => {
    const job = await updateMyCompanyJob(req.user!.id, req.params.id, req.body);
    res.json({ data: job });
  }),
);

companyPortalRouter.delete(
  '/jobs/:id',
  asyncHandler(async (req, res) => {
    await deleteMyCompanyJob(req.user!.id, req.params.id);
    res.status(204).send();
  }),
);

companyPortalRouter.get(
  '/applications',
  asyncHandler(async (req, res) => {
    const applications = await listMyCompanyApplications(req.user!.id);
    res.json({ data: applications });
  }),
);

companyPortalRouter.patch(
  '/applications/:id',
  asyncHandler(async (req, res) => {
    const application = await updateMyCompanyApplication(req.user!.id, req.params.id, req.body);
    res.json({ data: application });
  }),
);
