import { apiRequest } from '@/shared/services/apiClient';
import { mapJobToCard } from '@/features/jobs/services/jobsApi';

export async function fetchMySavedJobs() {
  const result = await apiRequest('/saved-jobs');

  return (result.data || []).map((savedJob) => ({
    id: savedJob.id,
    createdAt: savedJob.createdAt,
    job: mapJobToCard(savedJob.job),
  }));
}

export async function saveJob(jobId) {
  const result = await apiRequest('/saved-jobs', {
    method: 'POST',
    body: JSON.stringify({ jobId }),
  });

  return result.data;
}

export async function deleteSavedJob(jobId) {
  await apiRequest(`/saved-jobs/${jobId}`, {
    method: 'DELETE',
  });
}
