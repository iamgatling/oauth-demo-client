import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from './api';

export const Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const storedState = localStorage.getItem('auth_state');
      const codeVerifier = localStorage.getItem('code_verifier');

      if (!code) {
        setError('No authorization code received.');
        return;
      }

      if (state !== storedState) {
        setError('State mismatch. Possible CSRF attack.');
        return;
      }

      if (!codeVerifier) {
        setError('No code verifier found. Please try logging in again.');
        return;
      }

      try {
        const response = await api.post('/token', new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: import.meta.env.VITE_REDIRECT_URI,
          client_id: import.meta.env.VITE_CLIENT_ID,
          code_verifier: codeVerifier,
        }));

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }
        localStorage.removeItem('code_verifier');
        localStorage.removeItem('auth_state');

        navigate('/');
      } catch (err: any) {
        console.error(err);
        setError('Failed to exchange token: ' + (err.response?.data?.error || err.message));
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;
  }

  return <div>Processing login...</div>;
};