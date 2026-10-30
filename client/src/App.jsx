import { useState, useEffect } from "react";
import Auth from "./Auth";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function formatCategory(name) {
  return name
    .split("-")
    .map((w) => (w.length <= 3 ? w : w.charAt(0) + w.slice(1).toLowerCase()))
    .join(" ");
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [notice, setNotice] = useState("");

  const [mode, setMode] = useState("pdf");
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (newToken, name) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", name);
    setToken(newToken);
    setUsername(name);
    setNotice("");
  };

  const logout = (message = "") => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername("");
    setResult(null);
    setHistory([]);
    setFile(null);
    setText("");
    setError("");
    setNotice(typeof message === "string" ? message : "");
  };

  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      logout("Your session expired. Please log in again.");
      throw new Error("Session expired");
    }
    return res;
  };

  const loadHistory = async () => {
    try {
      const res = await authFetch(`${API}/history`);
      if (res.ok) setHistory(await res.json());
    } catch {
      /* history is optional */
    }
  };

  useEffect(() => {
    fetch(`${API}/metrics`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setMetrics)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (token) loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const pickFile = (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
      return;
    }
    setFile(f);
    setError("");
  };

  const canSubmit = mode === "pdf" ? !!file : text.trim().length > 0;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      let res;
      if (mode === "pdf") {
        const form = new FormData();
        form.append("resume", file);
        res = await authFetch(`${API}/match-pdf`, { method: "POST", body: form });
      } else {
        res = await authFetch(`${API}/match`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setResult(data);
      loadHistory();
    } catch (err) {
      if (err.message !== "Session expired") setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="app">
        <header className="header">
          <h1>Resume Analyzer</h1>
          <p>Log in to analyze your resume and keep your search history.</p>
        </header>
        <Auth onLogin={handleLogin} notice={notice} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header header-row">
        <div>
          <h1>Resume Analyzer</h1>
          <p>Find the career field and real job postings that fit your resume.</p>
        </div>
        <div className="user-box">
          <span>{username}</span>
          <button className="link-btn" onClick={() => logout()}>
            Log out
          </button>
        </div>
      </header>

      <div className="layout">
        <aside>
          <div className="card">
            <h2>Your resume</h2>
            <div className="tabs">
              <button
                className={`tab ${mode === "pdf" ? "active" : ""}`}
                onClick={() => setMode("pdf")}
              >
                Upload PDF
              </button>
              <button
                className={`tab ${mode === "text" ? "active" : ""}`}
                onClick={() => setMode("text")}
              >
                Paste text
              </button>
            </div>

            {mode === "pdf" ? (
              <label
                htmlFor="resume-input"
                className={`dropzone ${dragging ? "dragging" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pickFile(e.dataTransfer.files[0]);
                }}
              >
                <strong>Drop your PDF here</strong>
                or click to browse (max 5 MB)
                {file && <div className="file-name">{file.name}</div>}
                <input
                  id="resume-input"
                  type="file"
                  accept=".pdf,application/pdf"
                  hidden
                  onChange={(e) => {
                    pickFile(e.target.files[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            ) : (
              <textarea
                placeholder="Paste your full resume text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            )}

            <button className="btn" onClick={handleSubmit} disabled={loading || !canSubmit}>
              {loading ? "Analyzing..." : "Analyze resume"}
            </button>
            {error && <p className="error">{error}</p>}
          </div>

          {history.length > 0 && (
            <div className="card section-gap">
              <h2>Your recent searches</h2>
              {history.map((h) => (
                <div className="history-item" key={h._id}>
                  <span className="h-left">
                    {h.source === "pdf" ? h.filename : h.snippet}
                  </span>
                  <span className="h-right">{h.matches[0]?.title}</span>
                </div>
              ))}
            </div>
          )}
        </aside>

        <main>
          {loading && (
            <div className="card loading">
              <div className="spinner" /> Analyzing your resume...
            </div>
          )}

          {!loading && !result && (
            <div className="card empty">
              Upload a resume or paste text, then click <strong>Analyze resume</strong>.
            </div>
          )}

          {!loading && result && (
            <>
              <div className="card">
                <h2>Your profile</h2>
                {result.track && (
                  <p className="note">
                    Best-fit track: <strong>{result.track}</strong>
                  </p>
                )}
                <div className="tag-group">
                  <span className="tag-label">Skills found in your resume</span>
                  {result.skills?.length ? (
                    result.skills.map((s) => (
                      <span key={s} className="tag tag-green">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="note">No known skills detected.</span>
                  )}
                </div>
                <div className="tag-group">
                  <span className="tag-label">
                    Asked for in these jobs, missing from your resume
                  </span>
                  {result.missing_skills?.length ? (
                    result.missing_skills.map((m) => (
                      <span key={m.skill} className="tag tag-red">
                        {m.skill} ({m.count}/10)
                      </span>
                    ))
                  ) : (
                    <span className="note">None. Good coverage.</span>
                  )}
                </div>
              </div>

              {result.categories?.length > 0 && (
                <div className="card section-gap">
                  <h2>Predicted field</h2>
                  <div className="chips">
                    {result.categories.map((c) => (
                      <div className="chip-row" key={c.name}>
                        <span className="chip-name">{formatCategory(c.name)}</span>
                        <div className="bar">
                          <div className="bar-fill" style={{ width: `${c.probability}%` }} />
                        </div>
                        <span className="chip-val">{c.probability}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="card section-gap">
                <h2>Top job matches</h2>
                {result.matches.map((m, i) => (
                  <div className="job" key={`${m.title}-${m.company}-${i}`}>
                    <div className="job-top">
                      <div>
                        <div className="job-title">{m.title}</div>
                        <div className="job-meta">
                          {m.company}
                          {m.location ? ` · ${m.location}` : ""}
                          {m.track ? ` · ${m.track}` : ""}
                        </div>
                      </div>
                      <div className="job-score">
                        <span>Match {m.match}%</span>
                        <div className="bar">
                          <div className="bar-fill" style={{ width: `${m.match}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="tag-group">
                      <span className="tag-label">Why</span>
                      {m.shared_skills?.length ? (
                        m.shared_skills.map((s) => (
                          <span key={s} className="tag tag-green">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="note">Text similarity only</span>
                      )}
                    </div>
                    {m.url && (
                      <a href={m.url} target="_blank" rel="noreferrer">
                        View posting
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {metrics && (
        <footer className="footer">
          Model: {metrics.model} · trained on {metrics.rows?.toLocaleString()} resumes ·{" "}
          {Math.round(metrics.accuracy * 100)}% accuracy ·{" "}
          {Math.round(metrics.top3_accuracy * 100)}% top-3
        </footer>
      )}
    </div>
  );
}