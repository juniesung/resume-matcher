import os
import json
import logging
from openai import AsyncOpenAI
import openai
from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
You are a resume analysis expert. Given a resume and a job description, return a JSON object with exactly this structure:

{
  "match_score": <integer 0-100>,
  "missing_keywords": [<string>, ...],
  "suggestions": [
    {
      "original": <string>,
      "improved": <string>,
      "reason": <string>
    }
  ]
}

Rules:
- match_score must be an integer between 0 and 100
- missing_keywords is a list of specific skills or terms in the job description not found in the resume
- suggestions contains one entry per resume bullet point that could be improved
- Each suggestion must quote the original bullet, provide a rewritten version, and explain why
- Return only valid JSON. No prose, no markdown, no explanation outside the JSON.
"""


class Suggestion(BaseModel):
    original: str
    improved: str
    reason: str


class AnalysisResult(BaseModel):
    match_score: int
    missing_keywords: list[str]
    suggestions: list[Suggestion]


async def analyze(resume_text: str, job_description: str) -> AnalysisResult:
    user_message = f"RESUME:\n{resume_text}\n\nJOB DESCRIPTION:\n{job_description}"

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
        )

        raw = response.choices[0].message.content
        data = json.loads(raw)
        return AnalysisResult(**data)

    except openai.APIConnectionError as e:
        logger.error("Could not connect to OpenAI: %s", e)
        raise RuntimeError("Failed to reach the OpenAI API. Check your network.") from e

    except openai.APIStatusError as e:
        logger.error("OpenAI API error %s: %s", e.status_code, e.message)
        raise RuntimeError(f"OpenAI API returned an error: {e.status_code}") from e

    except (json.JSONDecodeError, ValidationError) as e:
        logger.error("Failed to parse LLM response: %s", e)
        raise RuntimeError("The LLM returned an unexpected response format.") from e

    except Exception as e:
        logger.error("Unexpected error during analysis: %s", e)
        raise RuntimeError("An unexpected error occurred during analysis.") from e
