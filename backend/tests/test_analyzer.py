import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import openai

from backend.analyzer import analyze, AnalysisResult


VALID_RESPONSE = {
    "match_score": 75,
    "missing_keywords": ["Docker", "TypeScript"],
    "suggestions": [
        {
            "original": "Built REST API",
            "improved": "Designed RESTful APIs with FastAPI",
            "reason": "Matches requirement for API design experience",
        }
    ],
}


def make_openai_response(content: str):
    message = MagicMock()
    message.content = content

    choice = MagicMock()
    choice.message = message

    response = MagicMock()
    response.choices = [choice]
    return response


@pytest.mark.anyio
@patch("backend.analyzer.client.chat.completions.create", new_callable=AsyncMock)
async def test_successful_analysis(mock_create):
    mock_create.return_value = make_openai_response(json.dumps(VALID_RESPONSE))

    result = await analyze("resume text", "job description")

    assert isinstance(result, AnalysisResult)
    assert result.match_score == 75
    assert result.missing_keywords == ["Docker", "TypeScript"]
    assert len(result.suggestions) == 1
    assert result.suggestions[0].original == "Built REST API"


@pytest.mark.anyio
@patch("backend.analyzer.client.chat.completions.create", new_callable=AsyncMock)
async def test_empty_keywords_and_suggestions(mock_create):
    payload = {"match_score": 95, "missing_keywords": [], "suggestions": []}
    mock_create.return_value = make_openai_response(json.dumps(payload))

    result = await analyze("resume text", "job description")

    assert result.match_score == 95
    assert result.missing_keywords == []
    assert result.suggestions == []


@pytest.mark.anyio
@patch("backend.analyzer.client.chat.completions.create", new_callable=AsyncMock)
async def test_score_boundary_zero(mock_create):
    payload = {**VALID_RESPONSE, "match_score": 0}
    mock_create.return_value = make_openai_response(json.dumps(payload))

    result = await analyze("resume text", "job description")
    assert result.match_score == 0


@pytest.mark.anyio
@patch("backend.analyzer.client.chat.completions.create", new_callable=AsyncMock)
async def test_score_boundary_hundred(mock_create):
    payload = {**VALID_RESPONSE, "match_score": 100}
    mock_create.return_value = make_openai_response(json.dumps(payload))

    result = await analyze("resume text", "job description")
    assert result.match_score == 100


@pytest.mark.anyio
@patch("backend.analyzer.client.chat.completions.create", new_callable=AsyncMock)
async def test_connection_error_raises_runtime_error(mock_create):
    mock_create.side_effect = openai.APIConnectionError(request=MagicMock())

    with pytest.raises(RuntimeError, match="Failed to reach the OpenAI API"):
        await analyze("resume text", "job description")


@pytest.mark.anyio
@patch("backend.analyzer.client.chat.completions.create", new_callable=AsyncMock)
async def test_api_status_error_raises_runtime_error(mock_create):
    mock_response = MagicMock()
    mock_response.status_code = 429
    mock_create.side_effect = openai.APIStatusError(
        message="Rate limit exceeded",
        response=mock_response,
        body={"error": {"message": "Rate limit exceeded"}},
    )

    with pytest.raises(RuntimeError, match="OpenAI API returned an error: 429"):
        await analyze("resume text", "job description")


@pytest.mark.anyio
@patch("backend.analyzer.client.chat.completions.create", new_callable=AsyncMock)
async def test_invalid_json_raises_runtime_error(mock_create):
    mock_create.return_value = make_openai_response("This is not JSON at all.")

    with pytest.raises(RuntimeError, match="unexpected response format"):
        await analyze("resume text", "job description")


@pytest.mark.anyio
@patch("backend.analyzer.client.chat.completions.create", new_callable=AsyncMock)
async def test_wrong_shape_raises_runtime_error(mock_create):
    wrong_shape = {"score": 80, "keywords": ["Python"]}
    mock_create.return_value = make_openai_response(json.dumps(wrong_shape))

    with pytest.raises(RuntimeError, match="unexpected response format"):
        await analyze("resume text", "job description")


@pytest.mark.anyio
@patch("backend.analyzer.client.chat.completions.create", new_callable=AsyncMock)
async def test_unexpected_exception_raises_runtime_error(mock_create):
    mock_create.side_effect = Exception("something totally unexpected")

    with pytest.raises(RuntimeError, match="unexpected error occurred"):
        await analyze("resume text", "job description")
