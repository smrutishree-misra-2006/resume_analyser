import re

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

from skills import extract_skills
from utils import clean

# Keep software / AI-ML / data / devops roles, drop senior and non-software ones
TECH = (
    r"\b(?:software|developer|sde|full.?stack|front.?end|back.?end|web|react|"
    r"node(?:\.?js)?|python|java|javascript|machine learning|ml|ai|"
    r"artificial intelligence|deep learning|nlp|data scientist|data engineer|"
    r"data analyst|devops|cloud|android|ios|mobile|cyber(?:security)?|sre|programmer)\b"
)
EXCLUDE = (
    r"\b(?:senior|sr|principal|lead|manager|director|architect|head|staff|vp|"
    r"civil|mechanical|electrical|sales|recruiter|nurse|technician|account|clearance)\b"
)

TRACKS = [
    ("AI / ML", r"machine learning|\bml\b|\bai\b|artificial intelligence|deep learning|nlp|data scientist|computer vision|llm"),
    ("Data", r"data analy|data engineer|analytics|\bbi\b"),
    ("DevOps / Cloud", r"devops|cloud|\bsre\b|infrastructure"),
    ("Mobile", r"android|\bios\b|mobile|flutter"),
    ("Web / SDE", r"full.?stack|front.?end|back.?end|web|software|\bsde\b|react|node|java|python|developer|programmer"),
]


def track_of(title):
    t = title.lower()
    for name, pat in TRACKS:
        if re.search(pat, t):
            return name
    return "Web / SDE"


WANTED = {"job_id", "title", "company_name", "location", "description", "job_posting_url"}
df = pd.read_csv("postings.csv", usecols=lambda c: c in WANTED)
print("Loaded", len(df), "rows")

for col in ["location", "job_posting_url"]:
    if col not in df.columns:
        df[col] = ""

df = df.dropna(subset=["title", "description", "company_name"])
df["company_name"] = df["company_name"].str.strip()
df["location"] = df["location"].fillna("")
df["job_posting_url"] = df["job_posting_url"].fillna("")

df = df[df["title"].str.contains(TECH, case=False, regex=True)]
df = df[~df["title"].str.contains(EXCLUDE, case=False, regex=True)]
df = df.drop_duplicates(subset=["title", "company_name"])
df = df.sample(n=min(15000, len(df)), random_state=42).reset_index(drop=True)
print("Using", len(df), "engineering postings")

# Title counts more than the body, so it is repeated 3 times
text = ((df["title"] + " ") * 3 + df["description"].str[:2500]).apply(clean)

vectorizer = TfidfVectorizer(
    stop_words="english", ngram_range=(1, 2), min_df=3,
    max_features=40000, sublinear_tf=True, dtype=np.float32,
)
matrix = vectorizer.fit_transform(text)

# Display snippet with emails and phone numbers removed
snippet = (
    df["description"]
    .str.replace(r"\s+", " ", regex=True)
    .str.replace(r"\S+@\S+", "", regex=True)
    .str.replace(r"\+?\d{0,3}[\s\-.]?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]\d{4}", "", regex=True)
    .str.strip()
    .str[:300]
)

print("Extracting skills (this takes a minute)...")
meta = pd.DataFrame({
    "title": df["title"],
    "company": df["company_name"],
    "location": df["location"],
    "url": df["job_posting_url"],
    "snippet": snippet,
    "track": df["title"].apply(track_of),
    "skills": df["description"].str[:3000].apply(extract_skills),
})

joblib.dump(vectorizer, "jobs_vectorizer.joblib", compress=3)
joblib.dump(matrix, "jobs_matrix.joblib", compress=3)
joblib.dump(meta, "jobs_meta.joblib", compress=3)

print("Saved. Matrix shape:", matrix.shape)
print(meta["track"].value_counts())