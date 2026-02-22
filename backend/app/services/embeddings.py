from langchain_community.embeddings import HuggingFaceEmbeddings

def get_embeddings():
    """
    Use a local HuggingFace embedding model (no OpenAI dependency).
    """
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    return HuggingFaceEmbeddings(model_name=model_name)
