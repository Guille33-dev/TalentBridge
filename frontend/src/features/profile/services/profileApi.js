import { apiRequest } from '@/shared/services/apiClient';

export async function fetchMyProfile() {
  const result = await apiRequest('/profile/me');
  return result.data;
}

export async function updateMyProfile(profile) {
  const result = await apiRequest('/profile/me', {
    method: 'PATCH',
    body: JSON.stringify(profile),
  });

  return result.data;
}
