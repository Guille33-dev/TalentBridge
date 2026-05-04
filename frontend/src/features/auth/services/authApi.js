import { apiRequest } from '@/shared/services/apiClient';

export async function registerUser(formData) {
  const result = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(formData),
  });

  return result.data;
}

export async function loginUser(credentials) {
  const result = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  return result.data;
}

export async function fetchCurrentUser() {
  const result = await apiRequest('/users/me');
  return result.data;
}
