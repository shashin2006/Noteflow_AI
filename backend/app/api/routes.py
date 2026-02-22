import os
from fastapi import APIRouter, UploadFile, File, Form
from langchain.text_splitter import CharacterTextSplitter
from app.services.vector_store import load_or_create_faiss, save_faiss
from app.services.embeddings import get_embeddings
from app.services.rag_pipeline import get_rag_chain
from app.db.mongodb import get_collection
from app.core.config import settings

router = APIRouter()

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    upload_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    with open(upload_path, "wb") as f:
        f.write(await file.read())

    text = extract_text_from_pdf(upload_path)
    if not text or not text.strip():
        return {"error": "No text found in PDF"}

    splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_text(text)

    vector_store = load_or_create_faiss()
    vector_store.add_texts(chunks)
    save_faiss(vector_store)

    pdfs = get_collection("pdfs")
    pdfs.insert_one({"filename": file.filename, "path": upload_path})

    return {"message": f"Uploaded and indexed {file.filename}", "chunks_indexed": len(chunks)}



@router.post("/chat")
async def chat_with_docs(query: str = Form(...)):
    chain = get_rag_chain()
    response = chain.run(query)
    chats = get_collection("chats")
    chats.insert_one({"query": query, "response": response})
    return {"answer": response}


@router.get("/pdfs")
async def list_pdfs():
    pdfs = get_collection("pdfs")
    return [{"filename": doc["filename"], "path": doc["path"]} for doc in pdfs.find()]
