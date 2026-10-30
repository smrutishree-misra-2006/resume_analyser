# AI-Powered Resume Analyzer & Job Matcher

An intelligent, full-stack web application that analyzes resumes, identifies suitable career fields, extracts technical skills, detects skill gaps, and recommends relevant real-world job postings.

## Features

- **Resume Upload:** Upload PDF resumes (up to 5 MB) or paste resume text.
- **Career Field Prediction:** Predicts suitable professional categories using a machine learning classifier.
- **Skill Extraction:** Automatically identifies technical skills and technologies mentioned in resumes.
- **Skill Gap Analysis:** Identifies skills frequently requested by matching job postings but missing from the resume.
- **Job Recommendations:** Recommends relevant job postings using TF-IDF vectorization and similarity scoring.
- **Match Explanation:** Displays shared skills that contribute to each job recommendation.
- **User Authentication:** Provides login and registration functionality.
- **Search History:** Keeps track of previous resume analyses.
- **Interactive Dashboard:** Displays predicted career fields, extracted skills, and job recommendations.

## Tech Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite, CSS |
| Backend API | Node.js, Express.js |
| Machine Learning Service | Python, FastAPI, Scikit-learn |
| ML Techniques | TF-IDF, LinearSVC, Cosine Similarity |
| Data Processing | Pandas, NumPy |
| Authentication | JWT |
| Database | MongoDB |
| PDF Processing | PyPDF |

## Machine Learning

### 1. Career Field Classification

- Uses TF-IDF to convert resume text into numerical feature vectors.
- Uses a calibrated LinearSVC classifier to predict suitable career categories.
- Trained on 2,481 resumes across 24 professional categories.

**Model Performance:**
- Classification accuracy: 70%
- Top-3 accuracy: 91%

### 2. Job Matching

- Converts resume content and job descriptions into TF-IDF vectors.
- Uses similarity scoring to identify relevant job postings.
- Ranks jobs based on their similarity to the resume.
- Extracts shared skills to explain recommendations.

### 3. Skill Gap Analysis

- Extracts skills present in the uploaded resume.
- Compares them against skills requested in relevant job descriptions.
- Highlights frequently requested skills that are missing from the resume.

## Project Structure

```text
resume_analyser/
│
├── client/                  # React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── Auth.jsx
│   │   └── main.jsx
│   └── package.json
│
├── controllers/              # Express controllers
├── middleware/               # Authentication middleware
├── models/                   # Database models
├── routes/                   # API routes
├── data/                     # Application data
│
├── ml_service/               # Python ML service
│   ├── app.py
│   ├── skills.py
│   ├── utils.py
│   ├── train_classifier.py
│   ├── build_jobs_index.py
│   ├── classifier.pkl
│   ├── jobs_matrix.joblib
│   ├── jobs_meta.joblib
│   ├── jobs_vectorizer.joblib
│   ├── metrics.json
│   └── requirements.txt
│
├── server.js
├── package.json
└── README.md
```

## Application Workflow

1. User uploads a PDF resume or pastes resume text.
2. The application extracts and cleans the resume content.
3. The ML classifier predicts suitable career fields.
4. The skill extraction module identifies technical skills.
5. The job-matching engine compares the resume with available job descriptions.
6. The skill-gap module identifies missing skills.
7. The dashboard displays career predictions, skills, and recommended job postings.

## Installation and Setup

### Prerequisites

- Node.js and npm
- Python 3.10+
- MongoDB
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/smrutishree-misra-2006/resume_analyser.git
cd resume_analyser
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Python Dependencies

```bash
cd ../ml_service
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create the required `.env` files for the frontend, backend, and database configuration.

Do not commit credentials, database URLs, or secret keys to GitHub.

### 5. Run the Application

Start the frontend, Node.js backend, and Python ML service using their respective development commands.

Configure the API URLs and service ports according to your environment.

## Future Improvements

- Improve career classification with larger and more specialized datasets.
- Introduce semantic embeddings for better job recommendations.
- Improve job ranking using career-track relevance and experience requirements.
- Enhance skill extraction and skill-gap analysis.
- Add resume scoring and actionable improvement suggestions.
- Improve PDF parsing and support more resume formats.

## Author

**Smrutishree Misra**

B.Tech – Electronics and Telecommunication Engineering

GitHub: [smrutishree-misra-2006](https://github.com/smrutishree-misra-2006)

---

*Built to make resume analysis, career discovery, and job matching more accessible through machine learning.*
