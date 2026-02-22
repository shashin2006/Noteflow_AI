import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "ai_doc_chat")
    UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./data/uploads")
    VECTOR_STORE_PATH = os.getenv("VECTOR_STORE_PATH", "./data/vectorstore/faiss_index")
    LLM_MODEL = os.getenv("LLM_MODEL", "mistralai/mistral-small-3.2-24b-instruct:free")
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

settings = Settings()
