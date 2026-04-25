from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from backend.main import app
from backend.analyzer import AnalysisResult, Suggestion

client = TestClient(app)

VALID_RESULT = AnalysisResult(
    match_score=75,
    missing_keywords=["Docker", "TypeScript"],
    suggestions=[
        Suggestion(
            original="Built REST API",
            improved="Designed RESTful APIs with FastAPI",
            reason="Matches requirement for API design experience",
        )
    ],
)

FAKE_PDF = b"fake-pdf-bytes"
FAKE_JOB = "Looking for a Python developer with Docker experience."


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@patch("backend.main.extract_text_from_pdf", return_value="resume text here")
@patch("backend.main.analyze", new_callable=AsyncMock)
def test_analyze_happy_path(mock_analyze, mock_extract):
    mock_analyze.return_value = VALID_RESULT

    response = client.post(
        "/analyze",
        files={"file": ("resume.pdf", FAKE_PDF, "application/pdf")},
        data={"job_description": FAKE_JOB},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["match_score"] == 75
    assert "Docker" in body["missing_keywords"]
    assert len(body["suggestions"]) == 1


@patch(
    "backend.main.extract_text_from_pdf",
    side_effect=ValueError("No text could be extracted from the PDF."),
)
def test_analyze_empty_pdf_returns_400(mock_extract):
    response = client.post(
        "/analyze",
        files={"file": ("empty.pdf", FAKE_PDF, "application/pdf")},
        data={"job_description": FAKE_JOB},
    )

    assert response.status_code == 400
    assert "No text" in response.json()["detail"]


@patch(
    "backend.main.extract_text_from_pdf",
    side_effect=RuntimeError("Could not read the PDF file."),
)
def test_analyze_corrupt_pdf_returns_500(mock_extract):
    response = client.post(
        "/analyze",
        files={"file": ("corrupt.pdf", FAKE_PDF, "application/pdf")},
        data={"job_description": FAKE_JOB},
    )

    assert response.status_code == 500
    assert "Could not read" in response.json()["detail"]


@patch("backend.main.extract_text_from_pdf", return_value="resume text here")
@patch(
    "backend.main.analyze",
    new_callable=AsyncMock,
    side_effect=RuntimeError("Failed to reach the OpenAI API."),
)
def test_analyze_openai_failure_returns_500(mock_analyze, mock_extract):
    response = client.post(
        "/analyze",
        files={"file": ("resume.pdf", FAKE_PDF, "application/pdf")},
        data={"job_description": FAKE_JOB},
    )

    assert response.status_code == 500
    assert "OpenAI" in response.json()["detail"]
