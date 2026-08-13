import os

from langchain_community.vectorstores import FAISS
from langchain.schema import Document

from app.services.embeddings import get_embeddings
from app.core.config import settings


VECTOR_PATH = settings.VECTOR_STORE_PATH


def load_or_create_faiss(chunks=None, user_id=None, source=None):
    """
    Load an existing FAISS index.

    If no index exists, create one using the supplied chunks.
    """

    embeddings = get_embeddings()

    index_file = os.path.join(VECTOR_PATH, "index.faiss")

    # -----------------------------------------
    # EXISTING FAISS INDEX
    # -----------------------------------------

    if os.path.exists(index_file):

        print("📚 Loading existing FAISS index")

        store = FAISS.load_local(
            VECTOR_PATH,
            embeddings,
            allow_dangerous_deserialization=True
        )

        print(
            f"✅ FAISS loaded successfully - "
            f"{len(store.index_to_docstore_id)} vectors"
        )

        return store

    # -----------------------------------------
    # FIRST UPLOAD
    # -----------------------------------------

    print("⚠️ No FAISS index found")

    if not chunks:
        raise ValueError(
            "Cannot create FAISS index: no document chunks were provided."
        )

    print("🔨 Creating new FAISS index")

    documents = [
        Document(
            page_content=chunk,
            metadata={
                "user_id": user_id,
                "source": source
            }
        )
        for chunk in chunks
        if chunk and chunk.strip()
    ]

    if not documents:
        raise ValueError(
            "Cannot create FAISS index: document chunks are empty."
        )

    store = FAISS.from_documents(
        documents,
        embeddings
    )

    print(
        f"✅ Created FAISS index with "
        f"{len(documents)} chunks"
    )

    return store


def save_faiss(store):

    os.makedirs(VECTOR_PATH, exist_ok=True)

    store.save_local(VECTOR_PATH)

    print("💾 FAISS index saved successfully")