import { apiRequest } from '@/shared/services/apiClient';

export async function fetchAdminCompanies() {
  const result = await apiRequest('/admin/companies');
  return result.data || [];
}

export async function createAdminCompany(company) {
  const result = await apiRequest('/admin/companies', {
    method: 'POST',
    body: JSON.stringify(company),
  });

  return result.data;
}

export async function updateAdminCompany(companyId, company) {
  const result = await apiRequest(`/admin/companies/${companyId}`, {
    method: 'PATCH',
    body: JSON.stringify(company),
  });

  return result.data;
}

export async function deleteAdminCompany(companyId) {
  await apiRequest(`/admin/companies/${companyId}`, {
    method: 'DELETE',
  });
}

export async function fetchAdminJobs() {
  const result = await apiRequest('/admin/jobs');
  return result.data || [];
}

export async function createAdminJob(job) {
  const result = await apiRequest('/admin/jobs', {
    method: 'POST',
    body: JSON.stringify(job),
  });

  return result.data;
}

export async function updateAdminJob(jobId, job) {
  const result = await apiRequest(`/admin/jobs/${jobId}`, {
    method: 'PATCH',
    body: JSON.stringify(job),
  });

  return result.data;
}

export async function deleteAdminJob(jobId) {
  await apiRequest(`/admin/jobs/${jobId}`, {
    method: 'DELETE',
  });
}

export async function fetchAdminApplications() {
  const result = await apiRequest('/admin/applications');
  return result.data || [];
}

export async function updateAdminApplication(applicationId, payload) {
  const result = await apiRequest(`/admin/applications/${applicationId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return result.data;
}

export async function fetchAdminContactMessages() {
  const result = await apiRequest('/admin/contact-messages');
  return result.data || [];
}

export async function updateAdminContactMessage(messageId, payload) {
  const result = await apiRequest(`/admin/contact-messages/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return result.data;
}
