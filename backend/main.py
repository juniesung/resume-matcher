import logging

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from analyzer import analyze
from parser import extract_text_from_pdf

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="ResumeMatcher API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
):
    raw_bytes = await file.read()

    try:
        resume_text = extract_text_from_pdf(raw_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        logger.error("PDF parsing failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

    try:
        result = await analyze(resume_text, job_description)
    except RuntimeError as e:
        logger.error("Analysis failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

    return result
