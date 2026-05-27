import { Router } from 'express';
import { adminRouter } from '../modules/admin/admin.routes';
import { applicationsRouter } from '../modules/applications/applications.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { companiesRouter } from '../modules/companies/companies.routes';
import { companyPortalRouter } from '../modules/companyPortal/companyPortal.routes';
import { contactRouter } from '../modules/contact/contact.routes';
import { healthRouter } from '../modules/health/health.routes';
import { jobsRouter } from '../modules/jobs/jobs.routes';
import { profileRouter } from '../modules/profile/profile.routes';
import { savedJobsRouter } from '../modules/savedJobs/savedJobs.routes';
import { usersRouter } from '../modules/users/users.routes';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/company', companyPortalRouter);
apiRouter.use('/contact', contactRouter);
apiRouter.use('/applications', applicationsRouter);
apiRouter.use('/saved-jobs', savedJobsRouter);
apiRouter.use('/jobs', jobsRouter);
apiRouter.use('/companies', companiesRouter);
