# Resume Matcher Project

## What this app does
A fullstack web app where users upload their resume (PDF) and paste 
a job description. The app uses an LLM to analyze the match, return 
a score 0-100, identify missing keywords, and give specific rewrite 
suggestions per bullet point.

## Stack
- Backend: FastAPI (Python), pdfplumber, OpenAI API
- Frontend: React, Tailwind CSS
- Deployment: AWS EC2 + Docker + GitHub Actions CI/CD
- Tests: pytest + FastAPI TestClient

## Project Structure
resume-matcher/
├── backend/
│   ├── main.py        # FastAPI app
│   ├── parser.py      # PDF parsing logic
│   ├── analyzer.py    # LLM analysis logic
│   ├── tests/
│   │   └── test_main.py
│   └── requirements.txt
├── frontend/
│   └── src/
│       └── App.jsx
├── Dockerfile
├── .github/
│   └── workflows/
│       └── deploy.yml
└── CLAUDE.md

## API Endpoints
- POST /analyze — accepts PDF file + job description text, returns match score + suggestions
- GET /health — returns 200 if app is running

## What /analyze returns
```json
{
  "match_score": 67,
  "missing_keywords": ["Docker", "TypeScript", "CI/CD"],
  "suggestions": [
    {
      "original": "Built REST API",
      "improved": "Designed and implemented RESTful APIs with FastAPI handling auth and database integration",
      "reason": "Matches requirement #3 which asks for API design experience"
    }
  ]
}
```

## Code Rules
- Always use async/await for FastAPI endpoints
- Always validate inputs with Pydantic models
- Never hardcode API keys — always use os.getenv()
- Always wrap external calls in try/except with proper error handling
- Use logger not print() statements
- Write a pytest test for every new endpoint
- Follow REST conventions for status codes

## Don'ts
- Never install new packages without telling me first
- Never modify test files without asking
- Never skip error handling
- Never use print() statements
- Never commit .env files

## Build Phases
- Phase 1: parser.py — PDF text extraction with pdfplumber
- Phase 2: analyzer.py — LLM analysis with OpenAI API
- Phase 3: main.py — FastAPI endpoints wiring everything together
- Phase 4: tests/test_main.py — pytest tests for all endpoints
- Phase 5: React frontend
- Phase 6: Dockerfile + Docker containerization
- Phase 7: GitHub Actions CI/CD pipeline + AWS EC2 deployment

## Current Phase
Phase 1 — Building backend endpoints locally

## My Learning Goal
I want to understand every line of code written. After each phase 
explain what was built and why each decision was made.