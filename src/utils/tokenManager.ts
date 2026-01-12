import { api } from '../api';

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refresh_token');

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await api.post('/token', new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: import.meta.env.VITE_CLIENT_ID,
    }));

    const { access_token, refresh_token: new_refresh_token } = response.data;

    localStorage.setItem('access_token', access_token); 
    if (new_refresh_token) {
      localStorage.setItem('refresh_token', new_refresh_token);
    }

    return access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return null;
  }
};