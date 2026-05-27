import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { getNumberQuery, getStringQuery } from '../../shared/http/query';
import { getCompanyByIdOrSlug, listCompanies } from './companies.service';

export const companiesRouter = Router();

companiesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await listCompanies({
      search: getStringQuery(req.query.search),
      category: getStringQuery(req.query.category),
      page: getNumberQuery(req.query.page, 1, { min: 1 }),
      limit: getNumberQuery(req.query.limit, 20, { min: 1, max: 100 }),
    });

    res.json(result);
  }),
);

companiesRouter.get(
  '/:idOrSlug',
  asyncHandler(async (req, res) => {
    const company = await getCompanyByIdOrSlug(req.params.idOrSlug);
    res.json({ data: company });
  }),
);
