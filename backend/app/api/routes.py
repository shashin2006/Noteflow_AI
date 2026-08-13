import os
from bson.errors import InvalidId
from fastapi import APIRouter, UploadFile, File, Form, Header
from bson import ObjectId
from datetime import datetime
from uuid import uuid4
from langchain.text_splitter import RecursiveCharacterTextSplitter
from fastapi.responses import StreamingResponse
from app.utils.session import get_user_from_session
from app.services.vector_store import load_or_create_faiss, save_faiss
from app.services.rag_pipeline import get_rag_chain
from app.db.mongodb import get_collection
from app.core.config import settings
from app.services.pdf_loader import extract_text_from_pdf
from app.services.cloudinary_service import upload_to_cloudinary
from passlib.context import CryptContext


# 🔥 NEW IMPORTS
from app.services.image_service import generate_image
from app.services.image_detector import is_image_request

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/login")
async def login(email: str = Form(...), password: str = Form(...)):
    users = get_collection("users")

    user = users.find_one({"email": email})
    if not user:
        return {"error": "User not found"}

    password = str(password).strip()
    password = password.encode("utf-8")[:72].decode("utf-8", "ignore")

    if not pwd_context.verify(password, user["password"]):
        return {"error": "Invalid password"}

    session_id = str(uuid4())

    get_collection("sessions").insert_one({
        "session_id": session_id,
        "user_id": str(user["_id"])
    })

    return {"session_id": session_id}
# =========================================
# ☁️ UPLOAD PDF
# =========================================

@router.post("/upload-cloud")
async def upload_pdf_cloud(
    file: UploadFile = File(...),
    session_id: str = Header(None, alias="session-id")
):
    user_id = get_user_from_session(session_id)

    if not user_id:
        return {"error": "Invalid session"}

    try:

        # -----------------------------
        # 1. Prepare upload directory
        # -----------------------------

        os.makedirs("data/uploads", exist_ok=True)

        safe_filename = f"{uuid4()}_{file.filename}"

        file_path = os.path.join(
            "data",
            "uploads",
            safe_filename
        )

        # -----------------------------
        # 2. Read file
        # -----------------------------

        contents = await file.read()

        if not contents:
            return {"error": "Empty file"}

        with open(file_path, "wb") as f:
            f.write(contents)

        print("✅ PDF saved locally")

        # -----------------------------
        # 3. Cloudinary
        # -----------------------------

        url = upload_to_cloudinary(file_path)

        print("✅ Cloudinary upload successful")

        # -----------------------------
        # 4. Extract text
        # -----------------------------

        text = extract_text_from_pdf(file_path)

        if not text.strip():
            return {
                "error": "No text found in PDF"
            }

        print(
            f"📄 Extracted text length: {len(text)}"
        )

        # -----------------------------
        # 5. Chunking
        # -----------------------------

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150
        )

        chunks = splitter.split_text(text)

        print(
            f"🧩 Generated {len(chunks)} chunks"
        )

        if not chunks:
            return {
                "error": "No chunks generated from PDF"
            }

        # -----------------------------
        # 6. FAISS
        # -----------------------------

        metadata = [
            {
                "user_id": user_id,
                "source": file.filename
            }
        ] * len(chunks)

        index_file = os.path.join(
            settings.VECTOR_STORE_PATH,
            "index.faiss"
        )

        if os.path.exists(index_file):

            print("📚 Loading existing FAISS")

            vector_store = load_or_create_faiss()

            vector_store.add_texts(
                chunks,
                metadatas=metadata
            )

        else:

            print(
                "🔨 Creating first FAISS index"
            )

            vector_store = load_or_create_faiss(
                chunks=chunks,
                user_id=user_id,
                source=file.filename
            )

        save_faiss(vector_store)

        print("✅ FAISS saved")

        # -----------------------------
        # 7. MongoDB metadata
        # -----------------------------

        get_collection("extra").insert_one({
            "user_id": user_id,
            "filename": file.filename,
            "cloudinary_url": url,
            "uploaded_at": datetime.utcnow()
        })

        print("✅ MongoDB metadata saved")

        # -----------------------------
        # 8. Response
        # -----------------------------

        return {
            "message": "Uploaded & indexed",
            "url": url,
            "chunks": len(chunks)
        }

    except Exception as e:

        import traceback

        print("UPLOAD ERROR:", e)
        traceback.print_exc()

        return {
            "error": str(e)
        }

# =========================================
# 💬 CHAT
# =========================================
@router.post("/chat")
async def chat_with_docs(
    query: str = Form(...),
    session_id: str = Header(None, alias="session-id")
):
    user_id = get_user_from_session(session_id)
    if not user_id:
        return {"error": "Invalid session"}

    chats_collection = get_collection("chats")

    chain = get_rag_chain(user_id)
    result = chain.invoke({"query": query})
    chat_id = str(uuid4())
    answer = result.get("result") or result.get("answer") or ""

    if not answer.strip():
        answer = "Answer not found in document"

    chats_collection.insert_one({
        "user_id": user_id,
        "chat_id": chat_id,
        "query": query,
        "response": answer,
        "timestamp": datetime.utcnow()
    })

    return {"answer": answer}


# =========================================
# 📂 LIST PDFs
# =========================================
@router.get("/pdfs")
async def list_pdfs(session_id: str = Header(None, alias="session-id")):
    print("SESSION HEADER:", session_id) 
    user_id = get_user_from_session(session_id)
    if not user_id:
        return []

    docs_collection = get_collection("extra")

    data = list(docs_collection.find({"user_id": user_id}))

    return [
        {
            "filename": doc["filename"],
            "url": doc["cloudinary_url"]
        }
        for doc in data
    ]
# =========================================
# 💬 CHAT HISTORY
# =========================================
@router.get("/chat-history")
async def get_chat_history(session_id: str = Header(None, alias="session-id")):
    user_id = get_user_from_session(session_id)
    if not user_id:
        return [] 

    chats = get_collection("chats")

    data = list(
        chats.find({"user_id": user_id})
        .sort("timestamp", 1)
    )

    # ✅ FIX: convert ObjectId to string
    cleaned = []
    for chat in data:
        cleaned.append({
            "_id": str(chat["_id"]),  # ✅ FIX
            "user_id": chat.get("user_id"),
            "chat_id": chat.get("chat_id"),
            "query": chat.get("query"),
            "response": chat.get("response"),
            "timestamp": chat.get("timestamp"),
        })

    return cleaned

# =========================================
# 🔥 STREAM CHAT + IMAGE (NEW)
# =========================================
@router.post("/chat-stream")
async def chat_stream(
    query: str = Form(...),
    chat_id: str = Form(...),  # ✅ NEW
    session_id: str = Header(None, alias="session-id")
):
    user_id = get_user_from_session(session_id)
    if not user_id:
        return {"error": "Invalid session"}

    chats_collection = get_collection("chats")

    if is_image_request(query):

        async def stream():
            try:
                chain = get_rag_chain(user_id)
                result = chain.invoke({"query": query})
                context = result.get("result") or result.get("answer") or ""

                image_url = generate_image(query, context)

                chats_collection.insert_one({
                    "user_id": user_id,
                    "chat_id": chat_id,  # ✅ FIXED
                    "query": query,
                    "response": f"[IMAGE]{image_url}",
                    "timestamp": datetime.utcnow()
                })

                yield f"[IMAGE]{image_url}"

            except Exception as e:
                print("IMAGE ERROR:", e)
                yield "Image generation failed"

        return StreamingResponse(stream(), media_type="text/plain")

    chain = get_rag_chain(user_id)

    async def stream():
        try:
            result = chain.invoke({"query": query})
            answer = result.get("result") or result.get("answer") or ""

            if not answer.strip():
                answer = "Answer not found in document"

            chats_collection.insert_one({
                "user_id": user_id,
                "chat_id": chat_id,  # ✅ FIXED
                "query": query,
                "response": answer,
                "timestamp": datetime.utcnow()
            })

            for word in answer.split():
                yield word + " "

        except Exception as e:
            print("RAG ERROR:", e)
            yield "Something went wrong"

    return StreamingResponse(stream(), media_type="text/plain")

@router.post("/register")
async def register(email: str = Form(...), password: str = Form(...)):
    try:
        users = get_collection("users")

        password = str(password).strip()
        password = password.encode("utf-8")[:72].decode("utf-8", "ignore")

        existing_user = users.find_one({"email": email})
        if existing_user:
            return {"error": "User already exists"}

        hashed_password = pwd_context.hash(password)

        result = users.insert_one({
            "email": email,
            "password": hashed_password
        })

        return {"user_id": str(result.inserted_id)}

    except Exception as e:
        print("REGISTER ERROR:", e)
        return {"error": str(e)}