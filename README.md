# Resume Analyzer – AI-Powered Resume Analysis & Job Recommendation System

An AI-powered resume analysis platform that analyzes resumes, extracts relevant skills, predicts suitable career categories, identifies skill gaps, and recommends relevant job opportunities.

The application combines a React-based frontend, a Node.js backend, and a Python-based machine learning service to provide an integrated resume analysis experience.

## Features

- **Resume Upload:** Upload resumes in PDF format or enter resume content directly.
- **Skill Extraction:** Extract technical skills and relevant keywords from resume content.
- **Career Category Prediction:** Predict suitable professional categories using a machine learning classifier.
- **Job Recommendations:** Recommend relevant job postings using TF-IDF vectorization and similarity scoring.
- **Skill Gap Analysis:** Identify missing skills by comparing resume skills with job requirements.
- **Match Scoring:** Display similarity-based scores for recommended job postings.
- **User Authentication:** Provide authenticated access to application features.
- **Analysis History:** Maintain access to previous resume analysis results.
- **Interactive Dashboard:** Display predictions, extracted skills, missing skills, and job recommendations.

## Tech Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Machine Learning | Python, Scikit-learn |
| NLP & Feature Extraction | TF-IDF, text preprocessing |
| ML Service | FastAPI |
| Database | MongoDB / Mongoose (if configured) |
| Model Storage | Pickle, Joblib |
| Version Control | Git, GitHub |

## Project Architecture

The application follows a modular architecture with three primary components.

### 1. Frontend – React + Vite

Located in the `client/` directory.

Responsible for:
- Providing the user interface.
- Accepting PDF uploads and resume text.
- Managing authentication and user interactions.
- Sending requests to backend APIs.
- Displaying resume analysis and job recommendation results.

### 2. Backend – Node.js + Express.js

Responsible for:
- Handling REST API requests.
- Managing authentication and authorization.
- Processing resume-related requests.
- Communicating with the Python ML service.
- Managing user and resume-related data.

### 3. Machine Learning Service – Python + FastAPI

Located in the `ml_service/` directory.

Responsible for:
- Processing resume content.
- Extracting relevant skills.
- Predicting professional categories using a trained ML classifier.
- Generating job recommendations through TF-IDF similarity.
- Identifying missing skills based on job requirements.

## Repository Structure

```text
resume_analyser/
│
├── client/                         # React + Vite frontend
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── App.jsx
│       ├── App.css
│       ├── Auth.jsx
│       ├── index.css
│       └── main.jsx
│
├── controllers/                    # Backend controllers
│   ├── authController.js
│   ├── matchController.js
│   ├── movieController.js
│   └── resumeController.js
│
├── routes/                         # API routes
│   ├── authRoutes.js
│   ├── matchRoutes.js
│   ├── movieRoutes.js
│   └── resumeRoutes.js
│
├── models/                         # Data models
│   ├── Resume.js
│   └── User.js
│
├── middleware/                     # Authentication middleware
│   └── authMiddleware.js
│
├── data/                           # Supporting data
│   ├── movies.js
│   └── users.js
│
├── ml_service/                     # Python ML service
│   ├── app.py
│   ├── skills.py
│   ├── utils.py
│   ├── train.py
│   ├── train_classifier.py
│   ├── build_jobs_index.py
│   ├── classifier.pkl
│   ├── jobs_matrix.joblib
│   ├── jobs_meta.joblib
│   ├── jobs_vectorizer.joblib
│   ├── metrics.json
│   └── requirements.txt
│
├── server/                         # Additional server-related files
│   ├── index.js
│   ├── package.json
│   └── pnpm-lock.yaml
│
├── server.js                       # Root backend entry point
├── package.json
├── package-lock.json
└── README.md
```

## System Workflow

```text
              USER
                |
                v
       React + Vite Frontend
                |
                v
       Node.js / Express API
                |
                v
       Python / FastAPI Service
                |
       +--------+---------+
       |        |         |
       v        v         v
    Resume   Career     Job
    Skills   Prediction Matching
    Extract  Model      Engine
       |        |         |
       +--------+---------+
                |
                v
        Analysis Results
                |
                v
        React Dashboard
```

### Workflow Explanation

1. The user uploads a PDF resume or enters resume text.
2. The frontend sends the resume data to the Node.js backend.
3. The backend forwards the analysis request to the Python ML service.
4. The ML service processes the resume and extracts relevant skills.
5. A trained classification model predicts suitable professional categories.
6. The job recommendation engine compares resume content with job descriptions using TF-IDF and similarity scoring.
7. The system identifies missing skills based on job requirements.
8. The backend returns the results to the frontend.
9. The dashboard displays the analysis and recommended job opportunities.

## Machine Learning Approach

### 1. Resume Classification

A supervised machine learning classification pipeline is used to predict suitable professional categories based on resume content.

- Text preprocessing and feature extraction.
- TF-IDF-based text representation.
- Trained classification models.
- Prediction of relevant career categories.

**Reported model evaluation:**
- Classification accuracy: approximately 70%.
- Top-3 accuracy: approximately 91%.

Top-3 accuracy means that the correct category appears among the model's three highest-ranked predictions. It is not the same as overall classification accuracy.

### 2. Job Recommendation Engine

A content-based recommendation approach is used to identify relevant job postings.

- Convert resume content into numerical TF-IDF representations.
- Represent job descriptions using the same feature space.
- Calculate similarity between resume and job representations.
- Rank job postings according to similarity scores.
- Return relevant job recommendations.

The displayed match scores represent text similarity, not the probability of getting hired.

### 3. Skill Gap Analysis

The system compares extracted resume skills with the skills mentioned in job requirements.

It provides:
- Skills already present in the resume.
- Skills missing for relevant job opportunities.
- Potential areas for further learning and improvement.

## Installation and Setup

### Prerequisites

- Node.js and npm
- Python 3.x
- Git
- MongoDB, if database functionality is enabled

### 1. Clone the Repository

```bash
git clone https://github.com/smrutishree-misra-2006/resume_analyser.git

cd resume_analyser
```

### 2. Set Up the Frontend

```bash
cd client
npm install
npm run dev
```

### 3. Set Up the Node.js Backend

Open a new terminal in the project root:

```bash
npm install
```

Start the backend using the start script defined in the root `package.json`.

### 4. Set Up the Python ML Service

Open another terminal:

```bash
cd ml_service

python -m venv venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI application:

```bash
uvicorn app:app --reload --port 8000
```

The above command assumes that `app.py` exposes a FastAPI instance named `app`.

> Configure the backend URLs, database connection, and environment variables according to the application's configuration before running all services together.

## Deployment Architecture

The application is designed for separate frontend and backend deployment.

| Component | Platform |
|---|---|
| React + Vite frontend | Vercel |
| Node.js + Express backend | Render |
| Python + FastAPI ML service | Render |

The frontend communicates with the Node.js backend through the configured API URL. The Node.js backend communicates with the Python ML service for resume analysis and recommendations.

## Future Improvements

- Improve classification performance through model experimentation and hyperparameter tuning.
- Enhance job recommendations using semantic similarity and advanced NLP techniques.
- Improve skill extraction and entity recognition.
- Add resume feedback and improvement suggestions.
- Expand the job dataset and improve recommendation relevance.
- Introduce additional analytics and personalized career insights.

## Author

**Smruti Shree Misra**

B.Tech – Electronics and Telecommunication Engineering

Veer Surendra Sai University of Technology (VSSUT), Burla

- GitHub: [smrutishree-misra-2006](https://github.com/smrutishree-misra-2006)
- LinkedIn: [Profile](https://linkedin.com/in/smrutishree-misra-89966b32a)

---

*Built to make resume analysis, skill assessment, and job discovery more accessible through machine learning.*
