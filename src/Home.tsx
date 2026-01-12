import { useEffect, useState } from "react";
import { api } from "./api";
import { useNavigate } from "react-router-dom";
import { refreshAccessToken } from "./utils/tokenManager";

interface UserInfo {
  id: number;
  email: string;
  name: string;
}

export const Home = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("access_token"));
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchUserInfo(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserInfo = async (accessToken: string) => {
    try {
      setLoading(true);
      const response = await api.get("/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUserInfo(response.data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          setToken(newToken);
          return;
        } else {
          setError("Session expired. Please login again.");
          handleLogout();
          return;
        }
      }
      setError(err.response?.data?.error || "Failed to load user info");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setUserInfo(null);
    navigate("/login");
  };

  const handleRevoke = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await api.post("/revoke", new URLSearchParams({ token: refreshToken }));
      }
    } catch (e) {
      console.error("Revoke failed", e);
    } finally {
      handleLogout();
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    alignItems: "center"
  };

  if (!token) {
    return (
      <div style={containerStyle}>
        <h1>Welcome to OAuth2 Demo</h1>
        <p>You are not logged in.</p>
        <button onClick={() => navigate("/login")}>
          Login with OAuth
        </button>
      </div>
    );
  }

  if (loading && !userInfo) {
    return (
      <div style={containerStyle}>
        <p>Loading user info...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ width: "100%" }}>
        <h1>Dashboard</h1>

        {error && (
          <div style={{
            background: "rgba(255, 0, 0, 0.1)",
            border: "1px solid #ff6666",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            color: "#ff6666"
          }}>
            {error}
          </div>
        )}

        {userInfo && (
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            padding: "2rem",
            borderRadius: "12px",
            textAlign: "left",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <h2 style={{ marginTop: 0 }}>User Profile</h2>
            <p><strong>Name:</strong> {userInfo.name}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
            <p><strong>User ID:</strong> <code>{userInfo.id}</code></p>
          </div>
        )}

        <div style={{ margin: "1.5rem 0", textAlign: "left" }}>
          <details style={{ cursor: "pointer" }}>
            <summary style={{ fontWeight: "bold", color: "#646cff" }}>
              View Access Token
            </summary>
            <pre style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              fontSize: "0.75rem",
              background: "#1a1a1a",
              padding: "1rem",
              borderRadius: "5px"
            }}>
              {token}
            </pre>
          </details>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button onClick={handleLogout}>Logout</button>
          <button 
            onClick={handleRevoke} 
            style={{ backgroundColor: "transparent", border: "1px solid #ff4444", color: "#ff4444" }}
          >
            Revoke Access
          </button>
        </div>
      </div>
    </div>
  );
};