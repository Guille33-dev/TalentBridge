import { JobModality, JobStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../shared/errors/httpError';

type ListJobsParams = {
  search?: string;
  location?: string;
  modality?: string;
  featured?: string;
  page: number;
  limit: number;
};

const jobListInclude = {
  company: {
    select: {
      id: true,
      slug: true,
      name: true,
      logo: true,
      industry: true,
    },
  },
} satisfies Prisma.JobInclude;

const jobDetailInclude = {
  company: true,
} satisfies Prisma.JobInclude;

function parseModality(modality?: string): JobModality | undefined {
  const normalized = modality?.toUpperCase();
  if (!normalized) return undefined;

  if (normalized in JobModality) {
    return normalized as JobModality;
  }

  throw new HttpError(400, `Invalid modality: ${modality}`);
}

function serializeCompanySummary(company: {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  industry: string | null;
}) {
  return {
    id: company.id,
    slug: company.slug,
    name: company.name,
    logo: company.logo,
    industry: company.industry,
  };
}

function serializeJobListItem(job: Prisma.JobGetPayload<{ include: typeof jobListInclude }>) {
  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    description: job.description,
    location: job.location,
    modality: job.modality,
    duration: job.duration,
    salaryLabel: job.salaryLabel,
    openings: job.openings,
    applicantsCount: job.applicantsCount,
    featured: job.featured,
    tags: job.tags,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    company: serializeCompanySummary(job.company),
  };
}

function serializeJobDetail(job: Prisma.JobGetPayload<{ include: typeof jobDetailInclude }>) {
  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    description: job.description,
    overview: job.overview,
    location: job.location,
    modality: job.modality,
    duration: job.duration,
    salaryLabel: job.salaryLabel,
    schedule: job.schedule,
    startDate: job.startDate,
    applicationDeadline: job.applicationDeadline,
    openings: job.openings,
    applicantsCount: job.applicantsCount,
    featured: job.featured,
    tags: job.tags,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    benefits: job.benefits,
    skills: job.skills,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    company: job.company,
  };
}

export async function listJobs(params: ListJobsParams) {
  const where: Prisma.JobWhereInput = {
    status: JobStatus.OPEN,
  };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
      { tags: { has: params.search } },
      { company: { name: { contains: params.search, mode: 'insensitive' } } },
    ];
  }

  if (params.location) {
    where.location = { contains: params.location, mode: 'insensitive' };
  }

  const modality = parseModality(params.modality);
  if (modality) {
    where.modality = modality;
  }

  if (params.featured === 'true') {
    where.featured = true;
  }

  const skip = (params.page - 1) * params.limit;
  const orderBy: Prisma.JobOrderByWithRelationInput[] = [{ featured: 'desc' }, { createdAt: 'desc' }];

  const [items, total] = await prisma.$transaction([
    prisma.job.findMany({
      where,
      include: jobListInclude,
      orderBy,
      skip,
      take: params.limit,
    }),
    prisma.job.count({ where }),
  ]);

  return {
    data: items.map(serializeJobListItem),
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}

export async function getJobByIdOrSlug(idOrSlug: string) {
  const job = await prisma.job.findFirst({
    where: {
      status: JobStatus.OPEN,
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: jobDetailInclude,
  });

  if (!job) {
    throw new HttpError(404, 'Job not found');
  }

  return serializeJobDetail(job);
}
