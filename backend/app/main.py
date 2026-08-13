from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api.routes import router

app = FastAPI(title="AI Document Chatbot Backend")

# CORS
# During development, localhost is allowed.
# We will add the Cloud Run frontend URL after deployment.
allowed_origins = [
    "http://localhost:5173",
]

frontend_url = os.getenv("FRONTEND_URL")

if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(router, prefix="/api")

# Static files
if os.path.exists("data"):
    app.mount("/data", StaticFiles(directory="data"), name="data")


@app.get("/")
async def root():
    return {
        "message": "AI Document Chatbot Backend is running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }