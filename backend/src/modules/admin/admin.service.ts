import { ApplicationStatus, CompanyStatus, ContactMessageStatus, JobCategory, JobModality, JobStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../shared/errors/httpError';

type AdminCompanyBody = {
  name?: unknown;
  slug?: unknown;
  status?: unknown;
  logo?: unknown;
  banner?: unknown;
  tagline?: unknown;
  description?: unknown;
  culture?: unknown;
  location?: unknown;
  size?: unknown;
  website?: unknown;
  industry?: unknown;
  foundedYear?: unknown;
  tags?: unknown;
  benefits?: unknown;
  gallery?: unknown;
};

type AdminJobBody = {
  companyId?: unknown;
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
  applicantsCount?: unknown;
  tags?: unknown;
  responsibilities?: unknown;
  requirements?: unknown;
  benefits?: unknown;
  skills?: unknown;
  status?: unknown;
};

type AdminApplicationBody = {
  status?: unknown;
  nextStep?: unknown;
};

type AdminContactMessageBody = {
  status?: unknown;
};

const adminCompanyInclude = {
  owner: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
  _count: {
    select: {
      jobs: true,
    },
  },
} satisfies Prisma.CompanyInclude;

const adminJobInclude = {
  company: {
    select: {
      id: true,
      slug: true,
      name: true,
      logo: true,
      industry: true,
    },
  },
  _count: {
    select: {
      applications: true,
      savedBy: true,
    },
  },
} satisfies Prisma.JobInclude;

const adminApplicationInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
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

function serializeCompany(company: Prisma.CompanyGetPayload<{ include: typeof adminCompanyInclude }>) {
  return {
    ...company,
    jobCount: company._count.jobs,
    _count: undefined,
  };
}

function serializeJob(job: Prisma.JobGetPayload<{ include: typeof adminJobInclude }>) {
  return {
    ...job,
    applicationCount: job._count.applications,
    savedCount: job._count.savedBy,
    _count: undefined,
  };
}

function serializeApplication(application: Prisma.ApplicationGetPayload<{ include: typeof adminApplicationInclude }>) {
  return application;
}

function serializeContactMessage<T>(message: T) {
  return message;
}

async function ensureCompanyExists(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) {
    throw new HttpError(404, 'Company not found');
  }
}

function buildCompanyCreateData(body: AdminCompanyBody): Prisma.CompanyCreateInput {
  const name = getRequiredString(body.name, 'name');
  const slug = getOptionalString(body.slug, 'slug') || slugify(name);
  const description = getRequiredString(body.description, 'description');

  return {
    name,
    slug,
    description,
    status: (getEnumValue(CompanyStatus, body.status || CompanyStatus.APPROVED, 'status') as CompanyStatus) || CompanyStatus.APPROVED,
    logo: getOptionalString(body.logo, 'logo'),
    banner: getOptionalString(body.banner, 'banner'),
    tagline: getOptionalString(body.tagline, 'tagline'),
    culture: getOptionalString(body.culture, 'culture'),
    location: getOptionalString(body.location, 'location'),
    size: getOptionalString(body.size, 'size'),
    website: getOptionalString(body.website, 'website'),
    industry: getOptionalString(body.industry, 'industry'),
    foundedYear: getOptionalInt(body.foundedYear, 'foundedYear'),
    tags: getOptionalStringArray(body.tags, 'tags') || [],
    benefits: getOptionalStringArray(body.benefits, 'benefits') || [],
    gallery: getOptionalStringArray(body.gallery, 'gallery') || [],
  };
}

function buildCompanyUpdateData(body: AdminCompanyBody): Prisma.CompanyUpdateInput {
  const data: Prisma.CompanyUpdateInput = {};
  const optionalFields = ['logo', 'banner', 'tagline', 'culture', 'location', 'size', 'website', 'industry'] as const;

  if (body.name !== undefined) {
    data.name = getRequiredString(body.name, 'name');
  }

  if (body.slug !== undefined) {
    data.slug = getRequiredString(body.slug, 'slug');
  }

  if (body.description !== undefined) {
    data.description = getRequiredString(body.description, 'description');
  }

  if (body.status !== undefined) {
    data.status = getEnumValue(CompanyStatus, body.status, 'status') as CompanyStatus;
  }

  for (const field of optionalFields) {
    if (body[field] !== undefined) {
      data[field] = getOptionalString(body[field], field);
    }
  }

  if (body.foundedYear !== undefined) data.foundedYear = getOptionalInt(body.foundedYear, 'foundedYear');
  if (body.tags !== undefined) data.tags = getOptionalStringArray(body.tags, 'tags') || [];
  if (body.benefits !== undefined) data.benefits = getOptionalStringArray(body.benefits, 'benefits') || [];
  if (body.gallery !== undefined) data.gallery = getOptionalStringArray(body.gallery, 'gallery') || [];

  return data;
}

function buildJobCreateData(body: AdminJobBody): Prisma.JobUncheckedCreateInput {
  const title = getRequiredString(body.title, 'title');
  const companyId = getRequiredString(body.companyId, 'companyId');
  const description = getRequiredString(body.description, 'description');
  const location = getRequiredString(body.location, 'location');
  const category = getEnumValue(JobCategory, body.category || JobCategory.DEVELOPMENT, 'category') as JobCategory;
  const modality = getEnumValue(JobModality, body.modality || JobModality.HYBRID, 'modality') as JobModality;
  const status = getEnumValue(JobStatus, body.status || JobStatus.OPEN, 'status') as JobStatus;

  return {
    companyId,
    title,
    slug: getOptionalString(body.slug, 'slug') || slugify(`${title}-${Date.now()}`),
    description,
    location,
    category,
    modality,
    status,
    overview: getOptionalString(body.overview, 'overview'),
    duration: getOptionalString(body.duration, 'duration'),
    salaryLabel: getOptionalString(body.salaryLabel, 'salaryLabel'),
    schedule: getOptionalString(body.schedule, 'schedule'),
    startDate: getOptionalString(body.startDate, 'startDate'),
    applicationDeadline: getOptionalDate(body.applicationDeadline, 'applicationDeadline'),
    openings: getOptionalInt(body.openings, 'openings') || 1,
    applicantsCount: getOptionalInt(body.applicantsCount, 'applicantsCount') || 0,
    tags: getOptionalStringArray(body.tags, 'tags') || [],
    responsibilities: getOptionalStringArray(body.responsibilities, 'responsibilities') || [],
    requirements: getOptionalStringArray(body.requirements, 'requirements') || [],
    benefits: getOptionalStringArray(body.benefits, 'benefits') || [],
    skills: getOptionalStringArray(body.skills, 'skills') || [],
  };
}

function buildJobUpdateData(body: AdminJobBody): Prisma.JobUncheckedUpdateInput {
  const data: Prisma.JobUncheckedUpdateInput = {};
  const optionalStringFields = ['overview', 'duration', 'salaryLabel', 'schedule', 'startDate'] as const;

  if (body.companyId !== undefined) data.companyId = getRequiredString(body.companyId, 'companyId');
  if (body.title !== undefined) data.title = getRequiredString(body.title, 'title');
  if (body.slug !== undefined) data.slug = getRequiredString(body.slug, 'slug');
  if (body.description !== undefined) data.description = getRequiredString(body.description, 'description');
  if (body.category !== undefined) data.category = getEnumValue(JobCategory, body.category, 'category') as JobCategory;
  if (body.location !== undefined) data.location = getRequiredString(body.location, 'location');

  for (const field of optionalStringFields) {
    if (body[field] !== undefined) {
      data[field] = getOptionalString(body[field], field);
    }
  }

  if (body.modality !== undefined) data.modality = getEnumValue(JobModality, body.modality, 'modality') as JobModality;
  if (body.status !== undefined) data.status = getEnumValue(JobStatus, body.status, 'status') as JobStatus;
  if (body.applicationDeadline !== undefined) data.applicationDeadline = getOptionalDate(body.applicationDeadline, 'applicationDeadline');
  if (body.openings !== undefined) data.openings = getOptionalInt(body.openings, 'openings');
  if (body.applicantsCount !== undefined) data.applicantsCount = getOptionalInt(body.applicantsCount, 'applicantsCount');
  if (body.tags !== undefined) data.tags = getOptionalStringArray(body.tags, 'tags') || [];
  if (body.responsibilities !== undefined) data.responsibilities = getOptionalStringArray(body.responsibilities, 'responsibilities') || [];
  if (body.requirements !== undefined) data.requirements = getOptionalStringArray(body.requirements, 'requirements') || [];
  if (body.benefits !== undefined) data.benefits = getOptionalStringArray(body.benefits, 'benefits') || [];
  if (body.skills !== undefined) data.skills = getOptionalStringArray(body.skills, 'skills') || [];

  return data;
}

export async function listAdminCompanies() {
  const companies = await prisma.company.findMany({
    include: adminCompanyInclude,
    orderBy: { updatedAt: 'desc' },
  });

  return companies.map(serializeCompany);
}

export async function createAdminCompany(body: AdminCompanyBody) {
  try {
    const company = await prisma.company.create({
      data: buildCompanyCreateData(body),
      include: adminCompanyInclude,
    });

    return serializeCompany(company);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(409, 'Company slug already exists');
    }

    throw error;
  }
}

export async function updateAdminCompany(companyId: string, body: AdminCompanyBody) {
  try {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: buildCompanyUpdateData(body),
      include: adminCompanyInclude,
    });

    return serializeCompany(company);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new HttpError(404, 'Company not found');
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(409, 'Company slug already exists');
    }

    throw error;
  }
}

export async function deleteAdminCompany(companyId: string) {
  try {
    await prisma.company.delete({
      where: { id: companyId },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new HttpError(404, 'Company not found');
    }

    throw error;
  }
}

export async function listAdminJobs() {
  const jobs = await prisma.job.findMany({
    include: adminJobInclude,
    orderBy: [{ updatedAt: 'desc' }],
  });

  return jobs.map(serializeJob);
}

export async function createAdminJob(body: AdminJobBody) {
  const data = buildJobCreateData(body);
  await ensureCompanyExists(data.companyId);

  try {
    const job = await prisma.job.create({
      data,
      include: adminJobInclude,
    });

    return serializeJob(job);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(409, 'Job slug already exists');
    }

    throw error;
  }
}

export async function updateAdminJob(jobId: string, body: AdminJobBody) {
  const data = buildJobUpdateData(body);
  if (typeof data.companyId === 'string') {
    await ensureCompanyExists(data.companyId);
  }

  try {
    const job = await prisma.job.update({
      where: { id: jobId },
      data,
      include: adminJobInclude,
    });

    return serializeJob(job);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new HttpError(404, 'Job not found');
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(409, 'Job slug already exists');
    }

    throw error;
  }
}

export async function deleteAdminJob(jobId: string) {
  try {
    await prisma.job.delete({
      where: { id: jobId },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new HttpError(404, 'Job not found');
    }

    throw error;
  }
}

export async function listAdminApplications() {
  const applications = await prisma.application.findMany({
    include: adminApplicationInclude,
    orderBy: { updatedAt: 'desc' },
  });

  return applications.map(serializeApplication);
}

export async function updateAdminApplication(applicationId: string, body: AdminApplicationBody) {
  const status = getEnumValue(ApplicationStatus, body.status, 'status') as ApplicationStatus | undefined;
  const nextStep = getOptionalString(body.nextStep, 'nextStep');

  try {
    const application = await prisma.application.update({
      where: { id: applicationId },
      data: {
        ...(status ? { status } : {}),
        ...(body.nextStep !== undefined ? { nextStep } : {}),
      },
      include: adminApplicationInclude,
    });

    return serializeApplication(application);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new HttpError(404, 'Application not found');
    }

    throw error;
  }
}

export async function listAdminContactMessages() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return messages.map(serializeContactMessage);
}

export async function updateAdminContactMessage(messageId: string, body: AdminContactMessageBody) {
  const status = getEnumValue(ContactMessageStatus, body.status, 'status') as ContactMessageStatus | undefined;

  if (!status) {
    throw new HttpError(400, 'status is required');
  }

  try {
    const message = await prisma.contactMessage.update({
      where: { id: messageId },
      data: { status },
    });

    return serializeContactMessage(message);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new HttpError(404, 'Contact message not found');
    }

    throw error;
  }
}
