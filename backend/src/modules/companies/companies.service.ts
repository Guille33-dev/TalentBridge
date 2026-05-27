import { CompanyStatus, JobStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../shared/errors/httpError';

type ListCompaniesParams = {
  search?: string;
  category?: string;
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

function normalizeFilterValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function buildCategoryTerms(category: string) {
  const normalized = normalizeFilterValue(category);
  const aliases: Record<string, string[]> = {
    tecnologia: ['Tecnologia', 'Tecnología', 'Tech', 'Software', 'Cloud'],
    diseno: ['Diseno', 'Diseño', 'UX', 'UI'],
    marketing: ['Marketing', 'Comunicacion', 'Comunicación'],
    finanzas: ['Finanzas', 'Finance', 'Fintech'],
    comunicacion: ['Comunicacion', 'Comunicación', 'Contenido'],
    'recursos-humanos': ['Recursos Humanos', 'RRHH', 'People'],
    rrhh: ['Recursos Humanos', 'RRHH', 'People'],
  };

  return aliases[normalized] || [category];
}

export async function listCompanies(params: ListCompaniesParams) {
  const andFilters: Prisma.CompanyWhereInput[] = [{ status: CompanyStatus.APPROVED }];

  if (params.search) {
    const search = params.search.trim();

    if (search) {
      andFilters.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: normalizeFilterValue(search), mode: 'insensitive' } },
        ],
      });
    }
  }

  if (params.category) {
    const categoryTerms = buildCategoryTerms(params.category);
    const industryFilters: Prisma.CompanyWhereInput[] = categoryTerms.map((term) => ({
      industry: { contains: term, mode: 'insensitive' },
    }));

    andFilters.push({
      OR: [
        ...industryFilters,
        { tags: { hasSome: categoryTerms } },
      ],
    });
  }

  const where: Prisma.CompanyWhereInput = { AND: andFilters };
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
      status: CompanyStatus.APPROVED,
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: companyDetailInclude,
  });

  if (!company) {
    throw new HttpError(404, 'Company not found');
  }

  return serializeCompanyDetail(company);
}
