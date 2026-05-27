import { apiRequest } from '@/shared/services/apiClient';

export async function sendContactMessage(message) {
  const result = await apiRequest('/contact/messages', {
    method: 'POST',
    body: JSON.stringify(message),
  });

  return result.data;
}
