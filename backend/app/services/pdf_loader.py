import os
from PyPDF2 import PdfReader

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    if not os.path.exists(file_path):
        return ""
    reader = PdfReader(file_path)
    for page in reader.pages:
        text += page.extract_text() or ""
    return text
