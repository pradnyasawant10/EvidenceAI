import os
import pytesseract
from PIL import Image

try:
    import pypdf
except ImportError:
    pypdf = None


# =====================================================
# TESSERACT PATH
# =====================================================

TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

DOC_EXTENSIONS = (
    ".txt",
    ".log",
    ".csv",
    ".json",
    ".md",
    ".xml",
    ".html"
)


# =====================================================
# PDF TEXT EXTRACTION
# =====================================================

def extract_pdf_text(pdf_path):
    if not pypdf:
        return {
            "success": False,
            "message": "pypdf library is required for PDF text extraction.",
            "text": "",
            "confidence": 0
        }

    try:
        reader = pypdf.PdfReader(pdf_path)
        total_pages = len(reader.pages)
        pages_text = []

        for idx, page in enumerate(reader.pages):
            page_content = page.extract_text() or ""
            if page_content.strip():
                pages_text.append(f"--- Page {idx + 1} ---\n{page_content.strip()}")

        extracted = "\n\n".join(pages_text).strip()

        if not extracted:
            return {
                "success": True,
                "message": f"PDF document contains {total_pages} page(s), but no direct selectable text was found.",
                "text": "No readable digital text found in PDF document (may contain scanned images).",
                "confidence": 0,
                "pages": total_pages
            }

        word_count = len(extracted.split())

        return {
            "success": True,
            "message": f"Extracted {word_count} word(s) across {total_pages} page(s) from PDF document.",
            "text": extracted,
            "confidence": 98.0,
            "pages": total_pages,
            "word_count": word_count
        }

    except Exception as error:
        return {
            "success": False,
            "message": f"PDF extraction error: {str(error)}",
            "text": "",
            "confidence": 0
        }


# =====================================================
# DOCUMENT TEXT EXTRACTION
# =====================================================

def extract_document_text(doc_path):
    try:
        with open(doc_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read().strip()

        if not content:
            return {
                "success": True,
                "message": "Document file is empty.",
                "text": "",
                "confidence": 0
            }

        word_count = len(content.split())

        return {
            "success": True,
            "message": f"Document read successfully ({word_count} words).",
            "text": content,
            "confidence": 99.0,
            "word_count": word_count
        }

    except Exception as error:
        return {
            "success": False,
            "message": f"Document read error: {str(error)}",
            "text": "",
            "confidence": 0
        }


# =====================================================
# MAIN OCR & TEXT EXTRACTION (IMAGE, PDF, DOCUMENT)
# =====================================================

def extract_text(file_path):
    if not os.path.exists(file_path):
        return {
            "success": False,
            "message": "File not found.",
            "text": "",
            "confidence": 0
        }

    # PDF documents
    if file_path.lower().endswith(".pdf"):
        return extract_pdf_text(file_path)

    # Plain text / structured documents
    if file_path.lower().endswith(DOC_EXTENSIONS):
        return extract_document_text(file_path)

    # Image OCR via Tesseract
    if not os.path.exists(TESSERACT_PATH):
        return {
            "success": False,
            "message": "Tesseract executable not found.",
            "text": "",
            "confidence": 0
        }

    try:
        image = Image.open(file_path)

        extracted_text = pytesseract.image_to_string(image).strip()

        data = pytesseract.image_to_data(
            image,
            output_type=pytesseract.Output.DICT
        )

        confidence_values = []
        for value in data["conf"]:
            try:
                confidence = float(value)
                if confidence >= 0:
                    confidence_values.append(confidence)
            except (ValueError, TypeError):
                pass

        average_confidence = (
            sum(confidence_values) / len(confidence_values)
        ) if confidence_values else 0

        if not extracted_text:
            return {
                "success": True,
                "message": "No text detected in image.",
                "text": "",
                "confidence": round(average_confidence, 2)
            }

        return {
            "success": True,
            "message": "Text extracted successfully.",
            "text": extracted_text,
            "confidence": round(average_confidence, 2)
        }

    except Exception as error:
        return {
            "success": False,
            "message": str(error),
            "text": "",
            "confidence": 0
        }


if __name__ == "__main__":
    print("OCR & Document Extraction Module Loaded Successfully (Images, PDFs & Documents)!")