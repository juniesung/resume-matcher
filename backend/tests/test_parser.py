import pytest
from unittest.mock import patch, MagicMock
from backend.parser import extract_text_from_pdf


def make_pdf_mock(pages_text: list):
    mock_page_objects = []
    for text in pages_text:
        page = MagicMock()
        page.extract_text.return_value = text
        mock_page_objects.append(page)

    mock_pdf = MagicMock()
    mock_pdf.pages = mock_page_objects

    mock_context = MagicMock()
    mock_context.__enter__ = MagicMock(return_value=mock_pdf)
    mock_context.__exit__ = MagicMock(return_value=False)

    return mock_context


@patch("backend.parser.pdfplumber.open")
def test_single_page_returns_text(mock_open):
    mock_open.return_value = make_pdf_mock(["John Doe\nSoftware Engineer"])
    result = extract_text_from_pdf(b"fake-pdf-bytes")
    assert result == "John Doe\nSoftware Engineer"


@patch("backend.parser.pdfplumber.open")
def test_multi_page_joins_with_newline(mock_open):
    mock_open.return_value = make_pdf_mock(["Page one text", "Page two text"])
    result = extract_text_from_pdf(b"fake-pdf-bytes")
    assert result == "Page one text\nPage two text"


@patch("backend.parser.pdfplumber.open")
def test_none_pages_are_skipped(mock_open):
    mock_open.return_value = make_pdf_mock(["Real content", None, "More content"])
    result = extract_text_from_pdf(b"fake-pdf-bytes")
    assert result == "Real content\nMore content"


@patch("backend.parser.pdfplumber.open")
def test_all_none_pages_raises_value_error(mock_open):
    mock_open.return_value = make_pdf_mock([None, None])
    with pytest.raises(ValueError, match="No text could be extracted"):
        extract_text_from_pdf(b"fake-pdf-bytes")


@patch("backend.parser.pdfplumber.open")
def test_whitespace_only_raises_value_error(mock_open):
    mock_open.return_value = make_pdf_mock(["     ", "\n\n\n"])
    with pytest.raises(ValueError, match="No text could be extracted"):
        extract_text_from_pdf(b"fake-pdf-bytes")


@patch("backend.parser.pdfplumber.open")
def test_pdfplumber_crash_raises_runtime_error(mock_open):
    mock_open.side_effect = Exception("pdfplumber internal error")
    with pytest.raises(RuntimeError, match="Could not read the PDF file"):
        extract_text_from_pdf(b"corrupt-bytes")


@patch("backend.parser.pdfplumber.open")
def test_extract_text_crash_raises_runtime_error(mock_open):
    mock_pdf = MagicMock()
    broken_page = MagicMock()
    broken_page.extract_text.side_effect = Exception("page read failure")
    mock_pdf.pages = [broken_page]

    mock_context = MagicMock()
    mock_context.__enter__ = MagicMock(return_value=mock_pdf)
    mock_context.__exit__ = MagicMock(return_value=False)
    mock_open.return_value = mock_context

    with pytest.raises(RuntimeError, match="Could not read the PDF file"):
        extract_text_from_pdf(b"fake-pdf-bytes")


@patch("backend.parser.pdfplumber.open")
def test_strips_leading_trailing_whitespace(mock_open):
    mock_open.return_value = make_pdf_mock(["   clean text here   "])
    result = extract_text_from_pdf(b"fake-pdf-bytes")
    assert result == "clean text here"
