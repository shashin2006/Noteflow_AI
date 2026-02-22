# AI Document Chatbot

A FastAPI backend that ingests PDFs, indexes their text into a FAISS vector store, and provides a Retrieval-Augmented-Generation (RAG) chat endpoint using a chat-capable LLM.

Short description: a small document search & chat backend that extracts PDF text, builds/loads a FAISS index, and answers user queries with context from uploaded PDFs.

## Features
- Upload PDFs and index text chunks: [`app.api.routes.upload_pdf`](backend/app/api/routes.py)
- Chat over indexed docs (RAG): [`app.api.routes.chat_with_docs`](backend/app/api/routes.py)
- List uploaded PDFs: [`app.api.routes.list_pdfs`](backend/app/api/routes.py)
- Persistent vector store (FAISS): [`app.services.vector_store.load_or_create_faiss`](backend/app/services/vector_store.py), [`app.services.vector_store.save_faiss`](backend/app/services/vector_store.py)
- Local HuggingFace embeddings: [`app.services.embeddings.get_embeddings`](backend/app/services/embeddings.py)
- RAG pipeline builder: [`app.services.rag_pipeline.get_rag_chain`](backend/app/services/rag_pipeline.py)
- PDF text extraction: [`app.services.pdf_loader.extract_text_from_pdf`](backend/app/services/pdf_loader.py)
- MongoDB collections helper: [`app.db.mongodb.get_collection`](backend/app/db/mongodb.py)
- Config via dotenv: [`app.core.config.settings`](backend/app/core/config.py)

## Quickstart (backend)
1. Install dependencies:
   ```sh
   pip install -r backend/app/requirements.txt

2.Configure environment:
Copy or edit .env. Key entries used are:
OPENROUTER_API_KEY, MONGODB_URI, MONGODB_DB_NAME, UPLOAD_DIR, VECTOR_STORE_PATH, LLM_MODEL, EMBEDDING_MODEL
File: .env
Run the API (from backend):
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    
#API Endpoints
POST /api/upload — multipart file upload (PDF). Implementation: app.api.routes.upload_pdf
POST /api/chat — form field query to chat with indexed docs. Implementation: app.api.routes.chat_with_docs
GET /api/pdfs — list uploaded PDFs. Implementation: app.api.routes.list_pdfs

#Storage & Models
Uploaded files go to UPLOAD_DIR (default uploads).
FAISS index path: VECTOR_STORE_PATH (default ./data/vectorstore/faiss_index). Current index file (binary): index.faiss
Embeddings are produced via app.services.embeddings.get_embeddings using a HuggingFace sentence-transformer.
Notes for developAPI Endpoints
POST /api/upload — multipart file upload (PDF). Implementation: app.api.routes.upload_pdf
POST /api/chat — form field query to chat with indexed docs. Implementation: app.api.routes.chat_with_docs
GET /api/pdfs — list uploaded PDFs. Implementation: app.api.routes.list_pdfs
Storage & Models
Uploaded files go to UPLOAD_DIR (default uploads).
FAISS index path: VECTOR_STORE_PATH (default ./data/vectorstore/faiss_index). Current index file (binary): index.faiss
Embeddings are produced via app.services.embeddings.get_embeddings using a HuggingFace sentence-transformer.

#Notes for developers
FAISS store is loaded with a safety fallback that creates a new index if loading fails: app.services.vector_store.load_or_create_faiss
RAG uses LangChain RetrievalQA with a ChatOpenAI wrapper configured in app.services.rag_pipeline.get_rag_chain
PDF extraction is implemented in app.services.pdf_loader.extract_text_from_pdf
MongoDB collections are accessed via app.db.mongodb.get_collection. Ensure MongoDB is reachable per MONGODB_URI.
