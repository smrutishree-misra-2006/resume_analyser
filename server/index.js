require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const app = express();
app.use(cors());
app.use(express.json());

const ML_URL = process.env.ML_URL || "http://127.0.0.1:8000";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err.message));

const Match = mongoose.model(
  "Match",
  new mongoose.Schema({
    userId: { type: String, index: true },
    source: String,
    filename: String,
    snippet: String,
    matches: [{ title: String, company: String, score: Number }],
    createdAt: { type: Date, default: Date.now },
  })
);

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Login required" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

async function saveMatch(userId, source, filename, snippet, matches) {
  try {
    await Match.create({ userId, source, filename, snippet, matches });
  } catch (err) {
    console.error("Save failed:", err.message);
  }
}

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/metrics", async (req, res) => {
  try {
    const r = await fetch(`${ML_URL}/metrics`);
    res.json(await r.json());
  } catch {
    res.status(503).json({ error: "ML service unavailable" });
  }
});

app.post("/api/match", auth, async (req, res) => {
  const { text, top_n = 8 } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Resume text is required" });
  }

  try {
    const mlRes = await fetch(`${ML_URL}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, top_n }),
    });
    const data = await mlRes.json();
    if (!mlRes.ok) {
      return res
        .status(mlRes.status === 400 ? 400 : 502)
        .json({ error: data.detail || "ML service error" });
    }
    await saveMatch(req.user.userId, "text", null, text.slice(0, 200), data.matches);
    res.json(data);
  } catch (err) {
    res.status(503).json({ error: "ML service unavailable" });
  }
});

app.post("/api/match-pdf", auth, upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "PDF file is required" });
  if (req.file.mimetype !== "application/pdf") {
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }

  try {
    const form = new FormData();
    form.append(
      "file",
      new Blob([req.file.buffer], { type: "application/pdf" }),
      req.file.originalname
    );
    const mlRes = await fetch(`${ML_URL}/match-pdf`, { method: "POST", body: form });
    const data = await mlRes.json();
    if (!mlRes.ok) {
      return res
        .status(mlRes.status === 400 ? 400 : 502)
        .json({ error: data.detail || "ML service error" });
    }
    await saveMatch(req.user.userId, "pdf", req.file.originalname, null, data.matches);
    res.json(data);
  } catch (err) {
    res.status(503).json({ error: "ML service unavailable" });
  }
});

app.get("/api/history", auth, async (req, res) => {
  try {
    const items = await Match.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Could not load history" });
  }
});

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "PDF is larger than 5 MB" });
  }
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));