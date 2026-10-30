import { useState } from "react";

const AUTH_API = import.meta.env.VITE_AUTH_URL || "http://localhost:3000/auth";

export default function Auth({ onLogin, notice }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const call = async (path) => {
    const res = await fetch(`${AUTH_API}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      /* non-JSON response */
    }
    if (!res.ok) throw new Error(data.message || data.error || "Request failed");
    return data;
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isRegister) await call("register");
      const data = await call("login");
      onLogin(data.token, username);
    } catch (err) {
      setError(
        err.message === "Failed to fetch" ? "Cannot reach the login server." : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card">
      <h2>{isRegister ? "Create an account" : "Log in"}</h2>
      {notice && <p className="note">{notice}</p>}
      <form onSubmit={submit}>
        <label className="field">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </label>
        <button className="btn" disabled={loading || !username.trim() || !password}>
          {loading ? "Please wait..." : isRegister ? "Sign up" : "Log in"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p className="note switch">
        {isRegister ? "Already have an account?" : "New here?"}{" "}
        <button
          className="link-btn"
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
          }}
        >
          {isRegister ? "Log in" : "Create an account"}
        </button>
      </p>
    </div>
  );
}