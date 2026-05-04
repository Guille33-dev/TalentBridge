import { JobStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../shared/errors/httpError';

type ListCompaniesParams = {
  search?: string;
  page: number;
  limit: number;
};

const companyListInclude = {
  _count: {
    select: {
      jobs: {
        where: {
          status: JobStatus.OPEN,
        },
      },
    },
  },
} satisfies Prisma.CompanyInclude;

const companyDetailInclude = {
  jobs: {
    where: {
      status: JobStatus.OPEN,
    },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  },
} satisfies Prisma.CompanyInclude;

function serializeCompanyListItem(company: Prisma.CompanyGetPayload<{ include: typeof companyListInclude }>) {
  return {
    id: company.id,
    slug: company.slug,
    name: company.name,
    logo: company.logo,
    banner: company.banner,
    tagline: company.tagline,
    description: company.description,
    location: company.location,
    size: company.size,
    website: company.website,
    industry: company.industry,
    tags: company.tags,
    openPositions: company._count.jobs,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

function serializeCompanyDetail(company: Prisma.CompanyGetPayload<{ include: typeof companyDetailInclude }>) {
  return {
    id: company.id,
    slug: company.slug,
    name: company.name,
    logo: company.logo,
    banner: company.banner,
    tagline: company.tagline,
    description: company.description,
    culture: company.culture,
    location: company.location,
    size: company.size,
    website: company.website,
    industry: company.industry,
    foundedYear: company.foundedYear,
    tags: company.tags,
    benefits: company.benefits,
    gallery: company.gallery,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
    jobs: company.jobs,
  };
}

export async function listCompanies(params: ListCompaniesParams) {
  const where: Prisma.CompanyWhereInput = {};

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
      { industry: { contains: params.search, mode: 'insensitive' } },
      { tags: { has: params.search } },
    ];
  }

  const skip = (params.page - 1) * params.limit;

  const [items, total] = await prisma.$transaction([
    prisma.company.findMany({
      where,
      include: companyListInclude,
      orderBy: [{ name: 'asc' }],
      skip,
      take: params.limit,
    }),
    prisma.company.count({ where }),
  ]);

  return {
    data: items.map(serializeCompanyListItem),
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}

export async function getCompanyByIdOrSlug(idOrSlug: string) {
  const company = await prisma.company.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: companyDetailInclude,
  });

  if (!company) {
    throw new HttpError(404, 'Company not found');
  }

  return serializeCompanyDetail(company);
}
