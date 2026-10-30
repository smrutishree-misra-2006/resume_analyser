
import json
import pickle

import pandas as pd

from sklearn.calibration import CalibratedClassifierCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

from utils import clean


# ==========================================
# 1. LOAD DATASET
# ==========================================

df = pd.read_csv("Resume.csv")[["Resume_str", "Category"]].dropna()

print("\n========== DATASET INFORMATION ==========")

print("Dataset shape:", df.shape)

print("\nCategory distribution:")
print(df["Category"].value_counts())

print("\nPercentage distribution:")
print(
    (df["Category"].value_counts(normalize=True) * 100).round(2)
)

print("\nMissing values:")
print(df[["Resume_str", "Category"]].isnull().sum())

print("\nDuplicate resumes:")
print(df["Resume_str"].duplicated().sum())


# ==========================================
# 2. REMOVE DUPLICATE RESUMES
# ==========================================

df = df.drop_duplicates(subset=["Resume_str"]).reset_index(drop=True)

print("\nRows after removing duplicates:", len(df))


# ==========================================
# 3. TEXT PREPROCESSING
# ==========================================

df["text"] = df["Resume_str"].apply(clean)

# Remove empty or extremely short resumes
df = df[df["text"].str.split().str.len() >= 5].reset_index(drop=True)

print("Rows after cleaning:", len(df))
print("Categories:", df["Category"].nunique())


# ==========================================
# 4. TRAIN-TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    df["text"],
    df["Category"],
    test_size=0.2,
    random_state=42,
    stratify=df["Category"]
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ==========================================
# 5. MODEL PIPELINE
# ==========================================

def make(clf):
    return Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                stop_words="english",
                ngram_range=(1, 2),
                min_df=2,
                max_features=60000,
                sublinear_tf=True
            )
        ),
        ("clf", clf)
    ])


# ==========================================
# 6. CANDIDATE MODELS
# ==========================================

candidates = {
    "LogReg (balanced)": make(
        LogisticRegression(
            max_iter=3000,
            C=20,
            class_weight="balanced"
        )
    ),

    "LinearSVC (calibrated)": make(
        CalibratedClassifierCV(
            LinearSVC(
                C=1.0,
                class_weight="balanced"
            ),
            cv=3
        )
    )
}


# ==========================================
# 7. TOP-K ACCURACY
# ==========================================

def top_k_accuracy(model, X, y, k=3):

    probs = model.predict_proba(X)
    classes = model.classes_

    hits = 0

    for p, true in zip(probs, y):

        top_indices = p.argsort()[::-1][:k]
        top_classes = classes[top_indices]

        if true in top_classes:
            hits += 1

    return hits / len(y)


# ==========================================
# 8. TRAIN AND COMPARE MODELS
# ==========================================

best_name = None
best_model = None
best_acc = 0

print("\n========== MODEL TRAINING ==========")

for name, model in candidates.items():

    print(f"\nTraining {name}...")

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)

    top3 = top_k_accuracy(model, X_test, y_test)

    print(f"Accuracy: {accuracy:.3f}")
    print(f"Top-3 Accuracy: {top3:.3f}")

    if accuracy > best_acc:

        best_name = name
        best_model = model
        best_acc = accuracy


# ==========================================
# 9. FINAL MODEL EVALUATION
# ==========================================

print("\n========== BEST MODEL ==========")

print("Best model:", best_name)

predictions = best_model.predict(X_test)

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)

top3 = top_k_accuracy(best_model, X_test, y_test)

print("Final Accuracy:", round(best_acc, 3))
print("Final Top-3 Accuracy:", round(top3, 3))


# ==========================================
# 10. SAVE CLASSIFIER
# ==========================================

with open("classifier.pkl", "wb") as f:
    pickle.dump(best_model, f)

print("\nclassifier.pkl saved successfully!")


# ==========================================
# 11. SAVE METRICS
# ==========================================

with open("metrics.json", "w") as f:

    json.dump(
        {
            "model": best_name,
            "accuracy": round(best_acc, 3),
            "top3_accuracy": round(top3, 3),
            "rows": len(df),
            "categories": int(df["Category"].nunique())
        },
        f,
        indent=4
    )

print("metrics.json saved successfully!")


# ==========================================
# 12. TEST WITH SAMPLE SOFTWARE RESUME
# ==========================================

sample = clean(
    """
    Software developer.
    Built REST APIs with Node.js, Express and MongoDB.
    Developed React frontend applications.
    Skills include Python, SQL, JavaScript, C++, Git,
    JWT authentication, cloud deployment, unit testing,
    debugging, code review, data structures and algorithms.
    Experience with machine learning and artificial intelligence.
    """
)

probs = best_model.predict_proba([sample])[0]

print("\n========== SAMPLE RESUME PREDICTION ==========")

for i in probs.argsort()[::-1][:3]:

    print(
        f"{best_model.classes_[i]}: {probs[i] * 100:.1f}%"
    )

print("\nTraining completed successfully!")
