import pdfplumber
import logging
import io

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file: bytes) -> str:
    try:
        with pdfplumber.open(io.BytesIO(file)) as pdf:
            pages = [page.extract_text() for page in pdf.pages]
            text = "\n".join(page for page in pages if page)

        if not text.strip():
            raise ValueError("No text could be extracted from the PDF.")

        return text.strip()

    except ValueError:
        raise
    except Exception as e:
        logger.error("Failed to parse PDF: %s", e)
        raise RuntimeError("Could not read the PDF file.") from e
