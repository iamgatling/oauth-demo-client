import { generateRandomString, generateCodeChallenge } from './utils/pkce';

export const Login = () => {
  const handleLogin = async () => {
    const codeVerifier = generateRandomString(128);
    localStorage.setItem('code_verifier', codeVerifier);

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const state = generateRandomString(32);
    localStorage.setItem('auth_state', state);

    const clientId = 'test-client-id'; 
    const redirectUri = 'http://localhost:3001/callback';
    const scope = 'read';

    const authUrl = new URL('http://localhost:3000/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', scope);

    window.location.href = authUrl.toString();
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>OAuth2 Login</h1>
      <p>Click the button below to authenticate with the backend.</p>
      <button onClick={handleLogin} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Login with OAuth
      </button>
    </div>
  );
};
