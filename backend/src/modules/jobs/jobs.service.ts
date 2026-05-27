import { CompanyStatus, JobCategory, JobModality, JobStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../shared/errors/httpError';

type ListJobsParams = {
  search?: string;
  location?: string;
  modality?: string;
  category?: string;
  company?: string;
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

function normalizeFilterValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function parseModalityKeyword(value?: string): JobModality | undefined {
  if (!value) return undefined;
  const normalized = normalizeFilterValue(value);

  if (['remote', 'remoto', 'teletrabajo', 'online'].includes(normalized)) return JobModality.REMOTE;
  if (['hybrid', 'hibrido', 'mixto', 'semipresencial'].includes(normalized)) return JobModality.HYBRID;
  if (['onsite', 'presencial', 'oficina'].includes(normalized)) return JobModality.ONSITE;

  return undefined;
}

const categoryAliases: Record<string, JobCategory> = {
  development: JobCategory.DEVELOPMENT,
  desarrollo: JobCategory.DEVELOPMENT,
  programacion: JobCategory.DEVELOPMENT,
  frontend: JobCategory.DEVELOPMENT,
  backend: JobCategory.DEVELOPMENT,
  fullstack: JobCategory.DEVELOPMENT,
  'full-stack': JobCategory.DEVELOPMENT,
  design: JobCategory.DESIGN,
  diseno: JobCategory.DESIGN,
  ux: JobCategory.DESIGN,
  ui: JobCategory.DESIGN,
  marketing: JobCategory.MARKETING,
  data: JobCategory.DATA,
  datos: JobCategory.DATA,
  analytics: JobCategory.DATA,
  analitica: JobCategory.DATA,
  producto: JobCategory.PRODUCT,
  product: JobCategory.PRODUCT,
  cloud: JobCategory.CLOUD_DEVOPS,
  devops: JobCategory.CLOUD_DEVOPS,
  seguridad: JobCategory.CYBERSECURITY,
  ciberseguridad: JobCategory.CYBERSECURITY,
  cybersecurity: JobCategory.CYBERSECURITY,
  qa: JobCategory.QA,
  testing: JobCategory.QA,
  calidad: JobCategory.QA,
  contenido: JobCategory.CONTENT,
  content: JobCategory.CONTENT,
  operaciones: JobCategory.OPERATIONS,
  operations: JobCategory.OPERATIONS,
  soporte: JobCategory.OPERATIONS,
};

function parseCategory(category?: string): JobCategory | undefined {
  if (!category) return undefined;
  const normalizedEnum = category.toUpperCase();

  if (normalizedEnum in JobCategory) {
    return normalizedEnum as JobCategory;
  }

  const normalized = normalizeFilterValue(category);
  const mappedCategory = categoryAliases[normalized];

  if (mappedCategory) return mappedCategory;

  throw new HttpError(400, `Invalid category: ${category}`);
}

function parseCategoryKeyword(value?: string): JobCategory | undefined {
  if (!value) return undefined;
  const normalizedEnum = value.toUpperCase();

  if (normalizedEnum in JobCategory) {
    return normalizedEnum as JobCategory;
  }

  return categoryAliases[normalizeFilterValue(value)];
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
    category: job.category,
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
    category: job.category,
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
  const andFilters: Prisma.JobWhereInput[] = [{ status: JobStatus.OPEN }, { company: { status: CompanyStatus.APPROVED } }];

  if (params.search) {
    const searchModality = parseModalityKeyword(params.search);
    const searchCategory = parseCategoryKeyword(params.search);
    const searchFilters: Prisma.JobWhereInput[] = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
      { overview: { contains: params.search, mode: 'insensitive' } },
      { tags: { has: params.search } },
      { skills: { has: params.search } },
      { requirements: { has: params.search } },
      { benefits: { has: params.search } },
      { company: { name: { contains: params.search, mode: 'insensitive' } } },
      { company: { slug: { contains: normalizeFilterValue(params.search), mode: 'insensitive' } } },
      { company: { industry: { contains: params.search, mode: 'insensitive' } } },
    ];

    if (searchModality) {
      searchFilters.push({ modality: searchModality });
    }

    if (searchCategory) {
      searchFilters.push({ category: searchCategory });
    }

    andFilters.push({ OR: searchFilters });
  }

  if (params.location) {
    const locationModality = parseModalityKeyword(params.location);
    const locationFilters: Prisma.JobWhereInput[] = [{ location: { contains: params.location, mode: 'insensitive' } }];

    if (locationModality) {
      locationFilters.push({ modality: locationModality });
    }

    andFilters.push({ OR: locationFilters });
  }

  if (params.company) {
    andFilters.push({
      company: {
        OR: [{ id: params.company }, { slug: params.company }],
      },
    });
  }

  const modality = parseModality(params.modality);
  if (modality) {
    andFilters.push({ modality });
  }

  const category = parseCategory(params.category);
  if (category) {
    andFilters.push({ category });
  }

  if (params.featured === 'true') {
    andFilters.push({ featured: true });
  }

  const where: Prisma.JobWhereInput = { AND: andFilters };
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
      company: {
        status: CompanyStatus.APPROVED,
      },
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: jobDetailInclude,
  });

  if (!job) {
    throw new HttpError(404, 'Job not found');
  }

  return serializeJobDetail(job);
}
