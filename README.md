# Resume Matcher

Upload your resume (PDF) and paste a job description. An LLM analyzes the match, returns a score out of 100, identifies missing keywords, and gives specific rewrite suggestions per bullet point.

## Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI, pdfplumber, OpenAI API |
| Frontend | React, Vite |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Hosting | AWS EC2 |

## Project Structure

```
resume-matcher/
├── backend/
│   ├── main.py          # FastAPI app + endpoints
│   ├── parser.py        # PDF text extraction (pdfplumber)
│   ├── analyzer.py      # LLM analysis (OpenAI)
│   ├── tests/
│   │   └── test_main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   └── src/
│       └── App.jsx
├── docker-compose.yml
└── .github/
    └── workflows/
        └── deploy.yml
```

## Running Locally

**Prerequisites:** Docker Desktop installed and running.

```bash
# 1. Clone the repo
git clone https://github.com/juniesung/resume-matcher.git
cd resume-matcher

# 2. Add your OpenAI API key
echo "OPENAI_API_KEY=sk-..." > backend/.env

# 3. Start both services
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## API

### `POST /analyze`

Accepts a PDF file and job description, returns analysis.

**Request** — `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | PDF | Resume file |
| `job_description` | string | Job posting text |

**Response**

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

### `GET /health`

Returns `{"status": "ok"}` — used by CI to verify the server is up.

## Tests

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
```

Tests mock both the PDF parser and OpenAI API, so no API key is needed to run them.

## Deployment

Pushes to `main` trigger a GitHub Actions workflow that:

1. Runs the test suite
2. SSHs into the EC2 instance and runs `docker compose up --build -d`

Deploy only happens if tests pass. PRs run tests only — never deploy.

**Required GitHub Secrets**

| Secret | Value |
|---|---|
| `EC2_HOST` | EC2 public IPv4 address |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_KEY` | Contents of your `.pem` key file |

**Required on the EC2 server**

- Docker installed
- Repo cloned to `/home/ubuntu/resume-matcher`
- `backend/.env` file with `OPENAI_API_KEY`
- Security group with ports 8000 and 5173 open

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | OpenAI API key for LLM analysis |
