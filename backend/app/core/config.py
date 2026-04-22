import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings:
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    MONGODB_URI = os.getenv("MONGODB_URI", "")
    MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "ai_doc_search")
    UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./data/uploads")
    VECTOR_STORE_PATH = os.getenv("VECTOR_STORE_PATH", "./data/vectorstore/faiss_index")
    LLM_MODEL = os.getenv("LLM_MODEL", "mistralai/mistral-7b-instruct-v0.1")
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
    HF_API_KEY= os.getenv("HF_API_KEY")

settings = Settings()
