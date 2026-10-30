import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

jobs = pd.read_csv("jobs.csv")

vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
job_vectors = vectorizer.fit_transform(jobs["description"])

resume = "Final year CS student. Skills: JavaScript, React, Node.js, MongoDB, Python, SQL. Built a REST API with JWT auth."
resume_vec = vectorizer.transform([resume])

scores = cosine_similarity(resume_vec, job_vectors)[0]
top = scores.argsort()[::-1][:5]

for i in top:
    print(jobs.loc[i, "title"], "-", round(scores[i] * 100, 1))

with open("vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)
with open("job_vectors.pkl", "wb") as f:
    pickle.dump(job_vectors, f)

print("Saved vectorizer.pkl and job_vectors.pkl")