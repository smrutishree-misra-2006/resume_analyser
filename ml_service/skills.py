import re

SKILLS = {
    "Languages": ["python", "java", "javascript", "typescript", "c++", "c#", "c", "go", "rust", "kotlin", "swift", "sql", "r"],
    "Web": ["react", "next.js", "angular", "vue", "node.js", "express", "django", "flask", "fastapi", "spring boot", "html", "css", "tailwind", "rest api", "graphql"],
    "Databases": ["mongodb", "mysql", "postgresql", "redis", "firebase", "sqlite"],
    "Cloud & DevOps": ["aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "jenkins", "linux", "git", "github actions"],
    "ML & Data": ["machine learning", "deep learning", "nlp", "pytorch", "tensorflow", "scikit-learn", "pandas", "numpy", "computer vision", "llm", "data analysis"],
    "CS Fundamentals": ["data structures", "algorithms", "oop", "system design", "dbms", "operating systems"],
}

ALIASES = {"nodejs": "node.js", "node js": "node.js", "reactjs": "react", "react.js": "react",
           "expressjs": "express", "express.js": "express", "postgres": "postgresql",
           "mongo": "mongodb", "ml": "machine learning", "dsa": "data structures"}

def _pattern(term):
    # lookarounds instead of \b, so c++, c# and node.js match correctly
    return re.compile(r"(?<![a-z0-9+#.])" + re.escape(term) + r"(?![a-z0-9+#])")

ALL = {s: cat for cat, items in SKILLS.items() for s in items}
PATTERNS = {s: _pattern(s) for s in ALL}
ALIAS_PATTERNS = {a: (_pattern(a), t) for a, t in ALIASES.items()}

def extract_skills(text):
    t = text.lower()
    found = {s for s, p in PATTERNS.items() if p.search(t)}
    found |= {target for _, (p, target) in ALIAS_PATTERNS.items() if p.search(t)}
    return sorted(found)

def skill_gap(resume_skills, job_texts, top=8):
    counts = {}
    for jt in job_texts:
        for s in extract_skills(jt):
            counts[s] = counts.get(s, 0) + 1
    missing = [(s, c) for s, c in counts.items() if s not in set(resume_skills)]
    return sorted(missing, key=lambda x: -x[1])[:top]