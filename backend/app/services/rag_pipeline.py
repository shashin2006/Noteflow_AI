from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from app.services.vector_store import load_or_create_faiss
from app.core.config import settings

def get_rag_chain():
    vector_store = load_or_create_faiss()
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})

    llm = ChatOpenAI(
        openai_api_key=settings.OPENROUTER_API_KEY,
        openai_api_base="https://openrouter.ai/api/v1",
        model=settings.LLM_MODEL,
        temperature=0.2,
    )

    return RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")
