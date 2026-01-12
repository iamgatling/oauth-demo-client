# OAuth2 Demo Client

A React SPA demonstrating integration with an OAuth 2.0 Authorization Server using **Authorization Code + PKCE** flow.

> **Note**: This is an example client for testing and learning purposes. It demonstrates how to integrate with the [OAuth2 Authorization Server](https://github.com/iamgatling/oauth-minimal).

---

## Features

- **PKCE Flow** — Secure authorization code flow for SPAs
- **Token Management** — Access token storage and refresh token rotation
- **State Validation** — CSRF protection via state parameter
- **Protected Routes** — Dashboard accessible only when authenticated

---

## Quick Start

### Prerequisites

- Node.js 18+
- The OAuth2 server running on `http://localhost:3000`

### Installation

```bash
git clone https://github.com/iamgatling/oauth-demo-client.git
cd oauth-demo-client
npm install
```

### Run

```bash
npm run dev
```

Client runs on `http://localhost:3001`

---

## How It Works

### 1. Login Flow

When the user clicks "Login with OAuth":

1. Generate a random **code verifier** (128 chars)
2. Hash it with SHA-256 to create **code challenge**
3. Generate **state** for CSRF protection
4. Store verifier and state in `localStorage`
5. Redirect to `/authorize` on the OAuth server

### 2. Callback Flow

When the OAuth server redirects back with an authorization code:

1. Validate the **state** parameter matches stored value
2. Exchange the **code** + **code verifier** for tokens
3. Store tokens and clean up temporary values
4. Redirect to dashboard

---

## Project Structure

```
src/
├── Login.tsx        # Initiates OAuth flow with PKCE
├── Callback.tsx     # Handles redirect and token exchange
├── Home.tsx         # Protected dashboard (requires auth)
├── api.ts           # Axios instance for API calls
├── utils/
│   ├── pkce.ts          # PKCE helper functions
│   └── tokenManager.ts  # Token storage utilities
├── App.tsx          # Router configuration
└── main.tsx         # Entry point
```

---

## Configuration

The client is configured for local development. To change the OAuth server URL, update these files:

| File          | What to change                          |
|---------------|----------------------------------------|
| `Login.tsx`   | `authUrl` base URL (`localhost:3000`)  |
| `Callback.tsx`| `redirect_uri` and API endpoint        |
| `api.ts`      | `baseURL` for axios                    |

---

## PKCE Implementation

The `utils/pkce.ts` file contains the PKCE helpers:

```typescript
// Generate cryptographically random string
export function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      .charAt(byte % 62)
  ).join('');
}

// Create S256 code challenge from verifier
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
}
```

---

## Scripts

| Command         | Description                    |
|-----------------|--------------------------------|
| `npm run dev`   | Start development server       |
| `npm run build` | Build for production           |
| `npm run preview` | Preview production build     |
| `npm run lint`  | Run ESLint                     |

---

## Security Notes

⚠️ **For Production:**

- **Access tokens**: Store in memory only, not `localStorage`
- **Refresh tokens**: Use `HttpOnly` cookies (requires server-side support)
- **State/Verifier**: Already cleaned up after use ✓

This demo uses `localStorage` for simplicity. In production, implement proper token handling.

---

## Related

- [OAuth2 Authorization Server](https://github.com/iamgatling/oauth-minimal) — The backend this client authenticates with

---

## License

MIT
