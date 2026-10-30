import io
import json
import pickle
from collections import Counter

import joblib
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel
from pypdf import PdfReader
from sklearn.metrics.pairwise import linear_kernel

from skills import extract_skills
from utils import clean

app = FastAPI(title="Resume Analyzer ML Service")

with open("classifier.pkl", "rb") as f:
    classifier = pickle.load(f)
with open("metrics.json") as f:
    metrics = json.load(f)

vectorizer = joblib.load("jobs_vectorizer.joblib")
matrix = joblib.load("jobs_matrix.joblib")
meta = joblib.load("jobs_meta.joblib")


class ResumeIn(BaseModel):
    text: str
    top_n: int = 8


def analyze(text: str, top_n: int = 8):
    cleaned = clean(text)
    if len(cleaned.split()) < 5:
        raise HTTPException(status_code=400, detail="Resume text is too short")

    my_skills = extract_skills(text)

    probs = classifier.predict_proba([cleaned])[0]
    top_c = probs.argsort()[::-1][:3]
    categories = [
        {"name": str(classifier.classes_[i]), "probability": round(float(probs[i]) * 100, 1)}
        for i in top_c
    ]
    if categories[0]["probability"] < 25:
        categories = []

    sims = linear_kernel(vectorizer.transform([cleaned]), matrix)[0]
    order = sims.argsort()[::-1]
    best = float(sims[order[0]]) or 1.0

    jobs = []
    for i in order[:top_n]:
        row = meta.iloc[i]
        required = row["skills"]
        jobs.append({
            "title": row["title"],
            "company": row["company"],
            "location": row["location"],
            "url": row["url"],
            "snippet": row["snippet"],
            "track": row["track"],
            "match": round(float(sims[i]) / best * 100),
            "score": round(float(sims[i]) * 100, 1),
            "shared_skills": [s for s in required if s in my_skills],
            "required_skills": required,
        })

    counts = Counter(
        s for i in order[:10] for s in meta.iloc[i]["skills"] if s not in my_skills
    )
    missing = [{"skill": s, "count": c} for s, c in counts.most_common(8)]
    track = Counter(meta.iloc[i]["track"] for i in order[:top_n]).most_common(1)[0][0]

    return {
        "track": track,
        "categories": categories,
        "skills": my_skills,
        "missing_skills": missing,
        "matches": jobs,
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/metrics")
def get_metrics():
    return metrics


@app.post("/match")
def match(resume: ResumeIn):
    return analyze(resume.text, resume.top_n)


@app.post("/match-pdf")
async def match_pdf(file: UploadFile = File(...), top_n: int = 8):
    data = await file.read()
    try:
        reader = PdfReader(io.BytesIO(data))
        text = " ".join((p.extract_text() or "") for p in reader.pages)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read this PDF")
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text found in PDF (is it a scanned image?)")
    return analyze(text, top_n)