import { apiRequest } from '@/shared/services/apiClient';

export async function fetchMyApplications() {
  const result = await apiRequest('/applications/me');
  return result.data || [];
}

export async function createApplication(jobId, coverLetter) {
  const result = await apiRequest('/applications', {
    method: 'POST',
    body: JSON.stringify({ jobId, coverLetter }),
  });

  return result.data;
}

export async function withdrawApplication(applicationId) {
  const result = await apiRequest(`/applications/${applicationId}/withdraw`, {
    method: 'PATCH',
  });

  return result.data;
}
