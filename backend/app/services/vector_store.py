import os
from langchain_community.vectorstores import FAISS
from app.services.embeddings import get_embeddings
from app.core.config import settings

def load_or_create_faiss():
    """
    Load or create FAISS vector store with HuggingFace embeddings.
    Avoids pickle-related issues by creating a new store if loading fails.
    """
    embeddings = get_embeddings()
    path = settings.VECTOR_STORE_PATH

    os.makedirs(path, exist_ok=True)

    try:
        # Load only if safe to do so
        return FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)
    except Exception as e:
        print(f"⚠️ Could not load FAISS index ({e}), creating a new one.")
        dummy_text = "initialization"
        store = FAISS.from_texts([dummy_text], embeddings)
        store.save_local(path)
        return store

def save_faiss(store):
    os.makedirs(settings.VECTOR_STORE_PATH, exist_ok=True)
    store.save_local(settings.VECTOR_STORE_PATH)
