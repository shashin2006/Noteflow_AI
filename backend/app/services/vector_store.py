import os
from langchain_community.vectorstores import FAISS
from langchain.schema import Document
from app.services.embeddings import get_embeddings
from app.core.config import settings


VECTOR_PATH = settings.VECTOR_STORE_PATH


# =========================================
# 🔹 LOAD OR CREATE VECTOR STORE
# =========================================
def load_or_create_faiss():
    embeddings = get_embeddings()
    os.makedirs(VECTOR_PATH, exist_ok=True)

    index_file = os.path.join(VECTOR_PATH, "index.faiss")

    # ✅ LOAD EXISTING
    if os.path.exists(index_file):
        try:
            store = FAISS.load_local(
                VECTOR_PATH,
                embeddings,
                allow_dangerous_deserialization=True
            )
            print("✅ FAISS loaded successfully")
            print(f"📊 Total vectors: {len(store.index_to_docstore_id)}")
            return store

        except Exception as e:
            print("❌ FAISS load failed:", e)

    # ✅ CREATE EMPTY STORE (NO DUMMY DATA)
    print("⚠️ Creating new FAISS index")

    return FAISS.from_documents([], embeddings)


# =========================================
# 🔹 ADD DOCUMENTS (WITH METADATA)
# =========================================
def add_documents_to_faiss(chunks, user_id, source):
    """
    chunks: list[str]
    user_id: str
    source: filename
    """

    store = load_or_create_faiss()

    docs = [
        Document(
            page_content=chunk,
            metadata={
                "user_id": user_id,
                "source": source
            }
        )
        for chunk in chunks
    ]

    store.add_documents(docs)

    print(f"✅ Added {len(docs)} chunks for user {user_id}")

    save_faiss(store)

    return store


# =========================================
# 🔹 SAVE VECTOR STORE
# =========================================
def save_faiss(store):
    os.makedirs(VECTOR_PATH, exist_ok=True)

    store.save_local(VECTOR_PATH)

    print("💾 FAISS saved successfully")