import { apiRequest } from '@/shared/services/apiClient';

export async function fetchCompanyPortal() {
  const result = await apiRequest('/company/me');
  return result.data;
}

export async function updateCompanyProfile(company) {
  const result = await apiRequest('/company/me', {
    method: 'PATCH',
    body: JSON.stringify(company),
  });

  return result.data;
}

export async function fetchCompanyJobs() {
  const result = await apiRequest('/company/jobs');
  return result.data || [];
}

export async function createCompanyJob(job) {
  const result = await apiRequest('/company/jobs', {
    method: 'POST',
    body: JSON.stringify(job),
  });

  return result.data;
}

export async function updateCompanyJob(jobId, job) {
  const result = await apiRequest(`/company/jobs/${jobId}`, {
    method: 'PATCH',
    body: JSON.stringify(job),
  });

  return result.data;
}

export async function deleteCompanyJob(jobId) {
  await apiRequest(`/company/jobs/${jobId}`, {
    method: 'DELETE',
  });
}

export async function fetchCompanyApplications() {
  const result = await apiRequest('/company/applications');
  return result.data || [];
}

export async function updateCompanyApplication(applicationId, payload) {
  const result = await apiRequest(`/company/applications/${applicationId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return result.data;
}
