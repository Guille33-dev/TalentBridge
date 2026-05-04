import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { getNumberQuery, getStringQuery } from '../../shared/http/query';
import { getJobByIdOrSlug, listJobs } from './jobs.service';

export const jobsRouter = Router();

jobsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await listJobs({
      search: getStringQuery(req.query.search),
      location: getStringQuery(req.query.location),
      modality: getStringQuery(req.query.modality),
      featured: getStringQuery(req.query.featured),
      page: getNumberQuery(req.query.page, 1, { min: 1 }),
      limit: getNumberQuery(req.query.limit, 20, { min: 1, max: 100 }),
    });

    res.json(result);
  }),
);

jobsRouter.get(
  '/:idOrSlug',
  asyncHandler(async (req, res) => {
    const job = await getJobByIdOrSlug(req.params.idOrSlug);
    res.json({ data: job });
  }),
);
