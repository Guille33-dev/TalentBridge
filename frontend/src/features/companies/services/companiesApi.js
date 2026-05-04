import { apiRequest } from '@/shared/services/apiClient';
import { mapJobToCard } from '@/features/jobs/services/jobsApi';

export function mapCompanyToCard(company) {
  return {
    id: company.id,
    slug: company.slug,
    name: company.name,
    logo: company.logo,
    description: company.description,
    openPositions: company.openPositions ?? company.jobs?.length ?? 0,
    tags: company.tags || [],
  };
}

export async function fetchCompanies(params = {}) {
  const result = await apiRequest('/companies', { params });

  return {
    companies: (result.data || []).map(mapCompanyToCard),
    pagination: result.pagination,
  };
}

export async function fetchCompany(idOrSlug) {
  const result = await apiRequest(`/companies/${idOrSlug}`);
  const company = result.data;

  return {
    ...company,
    jobs: (company.jobs || []).map((job) =>
      mapJobToCard({
        ...job,
        company: {
          id: company.id,
          slug: company.slug,
          name: company.name,
          logo: company.logo,
          industry: company.industry,
        },
      }),
    ),
  };
}
