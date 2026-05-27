import { apiRequest } from '@/shared/services/apiClient';

function formatPostedDate(value) {
  if (!value) return 'Publicado recientemente';

  const createdAt = new Date(value);
  const diffMs = Date.now() - createdAt.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / 86400000));

  if (diffDays === 0) return 'Publicado hoy';
  if (diffDays === 1) return 'Hace 1 dia';
  if (diffDays < 30) return `Hace ${diffDays} dias`;

  return createdAt.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function mapJobToCard(job) {
  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    company: job.company?.name || 'Empresa',
    companyId: job.company?.id,
    companySlug: job.company?.slug,
    companyLogo: job.company?.logo,
    category: job.category,
    location: job.location,
    type: job.duration || job.modality,
    salary: job.salaryLabel || 'No especificado',
    tags: job.tags || [],
    postedDate: formatPostedDate(job.createdAt),
    featured: job.featured,
  };
}

export async function fetchJobs(params = {}) {
  const result = await apiRequest('/jobs', { params });

  return {
    jobs: (result.data || []).map(mapJobToCard),
    pagination: result.pagination,
  };
}

export async function fetchJob(idOrSlug) {
  const result = await apiRequest(`/jobs/${idOrSlug}`);
  return result.data;
}
