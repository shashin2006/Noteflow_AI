from langchain.chains import RetrievalQA
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate

from app.services.vector_store import load_or_create_faiss
from app.core.config import settings


custom_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""
You are an AI assistant that answers based on documents.

RULES:
- First try to answer using the context
- If context is insufficient, you MAY expand using general knowledge
- Keep answers short and clear

Context:
{context}

Question:
{question}

Answer:
"""
)


def get_rag_chain(user_id: str):
    vector_store = load_or_create_faiss()

    # ✅ ONLY THIS — NO CUSTOM FUNCTION
    retriever = vector_store.as_retriever(
        search_kwargs={
            "k": 4,
            "filter": {"user_id": user_id}   # ✅ THIS replaces your custom filter
        }
    )

    llm = ChatOpenAI(
        openai_api_key=settings.OPENROUTER_API_KEY,
        openai_api_base="https://openrouter.ai/api/v1",
        model="nvidia/nemotron-3-super-120b-a12b:free",
        temperature=0.1,
    )

    chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,   # ✅ MUST be BaseRetriever
        chain_type="stuff",
        chain_type_kwargs={"prompt": custom_prompt},
    )

    return chain