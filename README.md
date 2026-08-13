# AI Document Chatbot

# 🧠 NoteFlow – AI-Powered Document Chatbot

An intelligent full-stack application that allows users to upload documents and interact with them using AI-powered chat.

---

## 🚀 Features

- 🔐 User Authentication (Session-based)
- 📄 PDF Upload (Cloudinary Integration)
- 🧠 AI Chat (RAG-based)
- 💬 Streaming Responses
- 🖼 Image Generation (AI)
- 📚 Chat History
- ⚡ FastAPI + React Architecture

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS

### Backend
- FastAPI
- MongoDB
- LangChain / RAG
- Cloudinary

---

## 📁 Project Structure


AI-DOC-SEARCH/
│
├── backend/
├── frontend/
├── data/ (ignored)
├── venv/ (ignored)


---

## ⚙️ Setup Instructions

### 🔹 Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
🔹 Frontend
cd frontend
npm install
npm run dev
🔐 Environment Variables

Create .env inside backend:

OPENROUTER_API_KEY=OPENROUTER_API_KEY
MONGODB_URI=mongodb://localhost:27017
UPLOAD_DIR=./data/uploads
VECTOR_STORE_PATH=./data/vectorstore/faiss_index
LLM_MODEL=nvidia/nemotron-3-super-120b-a12b:free
EMBEDDING_MODEL=text-embedding-3-small
MONGODB_URI=LINK MONGODB CONNECTION STRING
MONGODB_DB_NAME=DATABASE_NAME
CLOUDINARY_CLOUD_NAME = CLOUD_NAME
CLOUDINARY_API_KEY = API_KEY
CLOUDINARY_API_SECRET = API_CLOUDINARY_SECRET
HF_API_KEY=huggingface_key

📌 API Endpoints
/api/login
/api/register
/api/upload-cloud
/api/chat
/api/chat-stream
/api/chat-history
/api/pdfs

📸 Demo
<img width="1919" height="1009" alt="image" src="https://github.com/user-attachments/assets/6157e25d-b2dd-401b-9829-05b8b10bee98" />
<img width="1919" height="1023" alt="image" src="https://github.com/user-attachments/assets/b90ee204-b193-4193-b71a-5ce5d86e9044" />
<img width="1919" height="1000" alt="image" src="https://github.com/user-attachments/assets/48dd62ec-c1fa-4c28-bd58-2a6ff2f0560d" />

Working Demo LinkedIn
https://www.linkedin.com/posts/shashin-r-985a2a321_genai-artificialintelligence-fullstackdevelopment-activity-7452660117457608705-16Sz?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFF88vUBx1xNO3toA5TTEvOk95wRDYmPoLs

🧠 Future Improvements
Chat sidebar (multi-session UI)
JWT Authentication
Deployment (Docker + AWS)
File type support (DOCX, TXT)
