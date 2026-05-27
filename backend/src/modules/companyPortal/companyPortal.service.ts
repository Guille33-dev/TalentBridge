import { ApplicationStatus, CompanyStatus, JobCategory, JobModality, JobStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../shared/errors/httpError';

type CompanyBody = {
  name?: unknown;
  logo?: unknown;
  banner?: unknown;
  tagline?: unknown;
  description?: unknown;
  culture?: unknown;
  location?: unknown;
  size?: unknown;
  website?: unknown;
  industry?: unknown;
  taxId?: unknown;
  foundedYear?: unknown;
  tags?: unknown;
  benefits?: unknown;
  gallery?: unknown;
};

type CompanyJobBody = {
  title?: unknown;
  slug?: unknown;
  description?: unknown;
  overview?: unknown;
  category?: unknown;
  location?: unknown;
  modality?: unknown;
  duration?: unknown;
  salaryLabel?: unknown;
  schedule?: unknown;
  startDate?: unknown;
  applicationDeadline?: unknown;
  openings?: unknown;
  tags?: unknown;
  responsibilities?: unknown;
  requirements?: unknown;
  benefits?: unknown;
  skills?: unknown;
  status?: unknown;
};

type CompanyApplicationBody = {
  status?: unknown;
  nextStep?: unknown;
};

const companyJobInclude = {
  company: {
    select: {
      id: true,
      slug: true,
      name: true,
      logo: true,
      industry: true,
      status: true,
    },
  },
  _count: {
    select: {
      applications: true,
      savedBy: true,
    },
  },
} satisfies Prisma.JobInclude;

const companyApplicationInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      profile: true,
    },
  },
  job: {
    include: {
      company: {
        select: {
          id: true,
          slug: true,
          name: true,
          logo: true,
          industry: true,
          status: true,
        },
      },
    },
  },
} satisfies Prisma.ApplicationInclude;

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function getRequiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${field} is required`);
  }

  return value.trim();
}

function getOptionalString(value: unknown, field: string) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} must be a string`);
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function getOptionalStringArray(value: unknown, field: string) {
  if (value === undefined) return undefined;
  if (value === null) return [];
  if (Array.isArray(value)) {
    if (value.some((item) => typeof item !== 'string')) {
      throw new HttpError(400, `${field} must contain only strings`);
    }

    return value.map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  throw new HttpError(400, `${field} must be an array of strings`);
}

function getOptionalInt(value: unknown, field: string) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    throw new HttpError(400, `${field} must be an integer`);
  }

  return parsed;
}

function getOptionalDate(value: unknown, field: string) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} must be a date string`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, `${field} must be a valid date`);
  }

  return date;
}

function getEnumValue<T extends Record<string, string>>(enumObject: T, value: unknown, field: string) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} must be a string`);
  }

  const normalized = value.toUpperCase();
  if (normalized in enumObject) {
    return normalized as T[keyof T];
  }

  throw new HttpError(400, `Invalid ${field}: ${value}`);
}

function getCompanyJobStatus(value: unknown) {
  if (value === undefined || value === null || value === '') return JobStatus.PENDING_REVIEW;

  const status = getEnumValue(JobStatus, value, 'status') as JobStatus;
  const allowedStatuses: JobStatus[] = [JobStatus.DRAFT, JobStatus.PENDING_REVIEW, JobStatus.CLOSED];
  if (!allowedStatuses.includes(status)) {
    throw new HttpError(400, 'Las empresas no pueden publicar practicas directamente');
  }

  return status;
}

function getCompanyApplicationStatus(value: unknown) {
  const status = getEnumValue(ApplicationStatus, value, 'status') as ApplicationStatus | undefined;
  if (!status) return undefined;

  const allowedStatuses: ApplicationStatus[] = [
    ApplicationStatus.SUBMITTED,
    ApplicationStatus.IN_REVIEW,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.REJECTED,
  ];

  if (allowedStatuses.includes(status)) {
    return status;
  }

  throw new HttpError(400, `Invalid status: ${value}`);
}

function serializeJob(job: Prisma.JobGetPayload<{ include: typeof companyJobInclude }>) {
  return {
    ...job,
    applicationCount: job._count.applications,
    savedCount: job._count.savedBy,
    _count: undefined,
  };
}

async function getOwnedCompany(userId: string) {
  const company = await prisma.company.findUnique({
    where: { ownerId: userId },
  });

  if (!company) {
    throw new HttpError(404, 'Company profile not found');
  }

  return company;
}

function buildCompanyUpdateData(body: CompanyBody): Prisma.CompanyUpdateInput {
  const data: Prisma.CompanyUpdateInput = {};
  const optionalFields = ['logo', 'banner', 'tagline', 'culture', 'location', 'size', 'website', 'industry'] as const;

  if (body.name !== undefined) data.name = getRequiredString(body.name, 'name');
  if (body.description !== undefined) data.description = getRequiredString(body.description, 'description');
  if (body.taxId !== undefined) data.taxId = getRequiredString(body.taxId, 'taxId').toUpperCase();
  if (body.foundedYear !== undefined) data.foundedYear = getOptionalInt(body.foundedYear, 'foundedYear');
  if (body.tags !== undefined) data.tags = getOptionalStringArray(body.tags, 'tags') || [];
  if (body.benefits !== undefined) data.benefits = getOptionalStringArray(body.benefits, 'benefits') || [];
  if (body.gallery !== undefined) data.gallery = getOptionalStringArray(body.gallery, 'gallery') || [];

  for (const field of optionalFields) {
    if (body[field] !== undefined) {
      data[field] = getOptionalString(body[field], field);
    }
  }

  return data;
}

function buildJobCreateData(companyId: string, body: CompanyJobBody): Prisma.JobUncheckedCreateInput {
  const title = getRequiredString(body.title, 'title');
  const description = getRequiredString(body.description, 'description');
  const location = getRequiredString(body.location, 'location');
  const category = getEnumValue(JobCategory, body.category || JobCategory.DEVELOPMENT, 'category') as JobCategory;
  const modality = getEnumValue(JobModality, body.modality || JobModality.HYBRID, 'modality') as JobModality;

  return {
    companyId,
    title,
    slug: getOptionalString(body.slug, 'slug') || slugify(`${title}-${Date.now()}`),
    description,
    location,
    category,
    modality,
    status: getCompanyJobStatus(body.status),
    overview: getOptionalString(body.overview, 'overview'),
    duration: getOptionalString(body.duration, 'duration'),
    salaryLabel: getOptionalString(body.salaryLabel, 'salaryLabel'),
    schedule: getOptionalString(body.schedule, 'schedule'),
    startDate: getOptionalString(body.startDate, 'startDate'),
    applicationDeadline: getOptionalDate(body.applicationDeadline, 'applicationDeadline'),
    openings: getOptionalInt(body.openings, 'openings') || 1,
    applicantsCount: 0,
    featured: false,
    tags: getOptionalStringArray(body.tags, 'tags') || [],
    responsibilities: getOptionalStringArray(body.responsibilities, 'responsibilities') || [],
    requirements: getOptionalStringArray(body.requirements, 'requirements') || [],
    benefits: getOptionalStringArray(body.benefits, 'benefits') || [],
    skills: getOptionalStringArray(body.skills, 'skills') || [],
  };
}

function buildJobUpdateData(body: CompanyJobBody): Prisma.JobUncheckedUpdateInput {
  const data: Prisma.JobUncheckedUpdateInput = {};
  const optionalStringFields = ['overview', 'duration', 'salaryLabel', 'schedule', 'startDate'] as const;

  if (body.title !== undefined) data.title = getRequiredString(body.title, 'title');
  if (body.slug !== undefined) data.slug = getRequiredString(body.slug, 'slug');
  if (body.description !== undefined) data.description = getRequiredString(body.description, 'description');
  if (body.location !== undefined) data.location = getRequiredString(body.location, 'location');
  if (body.category !== undefined) data.category = getEnumValue(JobCategory, body.category, 'category') as JobCategory;
  if (body.modality !== undefined) data.modality = getEnumValue(JobModality, body.modality, 'modality') as JobModality;
  if (body.status !== undefined) data.status = getCompanyJobStatus(body.status);
  if (body.applicationDeadline !== undefined) data.applicationDeadline = getOptionalDate(body.applicationDeadline, 'applicationDeadline');
  if (body.openings !== undefined) data.openings = getOptionalInt(body.openings, 'openings');
  if (body.tags !== undefined) data.tags = getOptionalStringArray(body.tags, 'tags') || [];
  if (body.responsibilities !== undefined) data.responsibilities = getOptionalStringArray(body.responsibilities, 'responsibilities') || [];
  if (body.requirements !== undefined) data.requirements = getOptionalStringArray(body.requirements, 'requirements') || [];
  if (body.benefits !== undefined) data.benefits = getOptionalStringArray(body.benefits, 'benefits') || [];
  if (body.skills !== undefined) data.skills = getOptionalStringArray(body.skills, 'skills') || [];

  for (const field of optionalStringFields) {
    if (body[field] !== undefined) {
      data[field] = getOptionalString(body[field], field);
    }
  }

  return data;
}

export async function getMyCompany(userId: string) {
  const company = await getOwnedCompany(userId);
  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    include: companyJobInclude,
    orderBy: [{ updatedAt: 'desc' }],
  });

  return {
    ...company,
    jobs: jobs.map(serializeJob),
  };
}

export async function updateMyCompany(userId: string, body: CompanyBody) {
  const company = await getOwnedCompany(userId);

  const updated = await prisma.company.update({
    where: { id: company.id },
    data: {
      ...buildCompanyUpdateData(body),
      status: company.status === CompanyStatus.REJECTED ? CompanyStatus.PENDING : company.status,
    },
  });

  return updated;
}

export async function listMyCompanyJobs(userId: string) {
  const company = await getOwnedCompany(userId);
  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    include: companyJobInclude,
    orderBy: [{ updatedAt: 'desc' }],
  });

  return jobs.map(serializeJob);
}

export async function createMyCompanyJob(userId: string, body: CompanyJobBody) {
  const company = await getOwnedCompany(userId);
  const data = buildJobCreateData(company.id, body);

  try {
    const job = await prisma.job.create({
      data,
      include: companyJobInclude,
    });

    return serializeJob(job);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(409, 'Job slug already exists');
    }

    throw error;
  }
}

export async function updateMyCompanyJob(userId: string, jobId: string, body: CompanyJobBody) {
  const company = await getOwnedCompany(userId);
  const existingJob = await prisma.job.findFirst({
    where: {
      id: jobId,
      companyId: company.id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existingJob) {
    throw new HttpError(404, 'Job not found');
  }

  const data = buildJobUpdateData(body);
  if (body.status === undefined && existingJob.status === JobStatus.OPEN && Object.keys(data).length > 0) {
    data.status = JobStatus.PENDING_REVIEW;
  }

  try {
    const job = await prisma.job.update({
      where: { id: existingJob.id },
      data,
      include: companyJobInclude,
    });

    return serializeJob(job);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(409, 'Job slug already exists');
    }

    throw error;
  }
}

export async function deleteMyCompanyJob(userId: string, jobId: string) {
  const company = await getOwnedCompany(userId);

  const result = await prisma.job.deleteMany({
    where: {
      id: jobId,
      companyId: company.id,
    },
  });

  if (result.count === 0) {
    throw new HttpError(404, 'Job not found');
  }
}

export async function listMyCompanyApplications(userId: string) {
  const company = await getOwnedCompany(userId);
  return prisma.application.findMany({
    where: {
      job: {
        companyId: company.id,
      },
    },
    include: companyApplicationInclude,
    orderBy: { updatedAt: 'desc' },
  });
}

export async function updateMyCompanyApplication(userId: string, applicationId: string, body: CompanyApplicationBody) {
  const company = await getOwnedCompany(userId);
  const status = getCompanyApplicationStatus(body.status);
  const nextStep = getOptionalString(body.nextStep, 'nextStep');

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      job: {
        companyId: company.id,
      },
    },
    select: { id: true },
  });

  if (!application) {
    throw new HttpError(404, 'Application not found');
  }

  return prisma.application.update({
    where: { id: application.id },
    data: {
      ...(status ? { status } : {}),
      ...(body.nextStep !== undefined ? { nextStep } : {}),
    },
    include: companyApplicationInclude,
  });
}
