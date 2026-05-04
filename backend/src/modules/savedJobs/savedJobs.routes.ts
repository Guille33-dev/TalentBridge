import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { listMySavedJobs, saveJob, unsaveJob } from './savedJobs.service';

export const savedJobsRouter = Router();

savedJobsRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const savedJobs = await listMySavedJobs(req.user!.id);
    res.json({ data: savedJobs });
  }),
);

savedJobsRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const savedJob = await saveJob(req.user!.id, req.body);
    res.status(201).json({ data: savedJob });
  }),
);

savedJobsRouter.delete(
  '/:jobId',
  requireAuth,
  asyncHandler(async (req, res) => {
    await unsaveJob(req.user!.id, req.params.jobId);
    res.status(204).send();
  }),
);
