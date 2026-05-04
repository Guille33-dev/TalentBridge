import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { requireAuth, requireRole } from '../../middleware/auth';
import { asyncHandler } from '../../shared/http/asyncHandler';
import {
  createAdminCompany,
  createAdminJob,
  deleteAdminCompany,
  deleteAdminJob,
  getAdminSummary,
  listAdminApplications,
  listAdminCompanies,
  listAdminJobs,
  updateAdminApplication,
  updateAdminCompany,
  updateAdminJob,
} from './admin.service';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(UserRole.ADMIN));

adminRouter.get(
  '/summary',
  asyncHandler(async (_req, res) => {
    const summary = await getAdminSummary();
    res.json({ data: summary });
  }),
);

adminRouter.get(
  '/companies',
  asyncHandler(async (_req, res) => {
    const companies = await listAdminCompanies();
    res.json({ data: companies });
  }),
);

adminRouter.post(
  '/companies',
  asyncHandler(async (req, res) => {
    const company = await createAdminCompany(req.body);
    res.status(201).json({ data: company });
  }),
);

adminRouter.patch(
  '/companies/:id',
  asyncHandler(async (req, res) => {
    const company = await updateAdminCompany(req.params.id, req.body);
    res.json({ data: company });
  }),
);

adminRouter.delete(
  '/companies/:id',
  asyncHandler(async (req, res) => {
    await deleteAdminCompany(req.params.id);
    res.status(204).send();
  }),
);

adminRouter.get(
  '/jobs',
  asyncHandler(async (_req, res) => {
    const jobs = await listAdminJobs();
    res.json({ data: jobs });
  }),
);

adminRouter.post(
  '/jobs',
  asyncHandler(async (req, res) => {
    const job = await createAdminJob(req.body);
    res.status(201).json({ data: job });
  }),
);

adminRouter.patch(
  '/jobs/:id',
  asyncHandler(async (req, res) => {
    const job = await updateAdminJob(req.params.id, req.body);
    res.json({ data: job });
  }),
);

adminRouter.delete(
  '/jobs/:id',
  asyncHandler(async (req, res) => {
    await deleteAdminJob(req.params.id);
    res.status(204).send();
  }),
);

adminRouter.get(
  '/applications',
  asyncHandler(async (_req, res) => {
    const applications = await listAdminApplications();
    res.json({ data: applications });
  }),
);

adminRouter.patch(
  '/applications/:id',
  asyncHandler(async (req, res) => {
    const application = await updateAdminApplication(req.params.id, req.body);
    res.json({ data: application });
  }),
);
