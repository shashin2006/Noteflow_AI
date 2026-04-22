from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import router

app = FastAPI(title="AI Document Chatbot Backend")

# ✅ ADD CORS FIRST (VERY IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ THEN ROUTES
app.include_router(router, prefix="/api")

# ✅ THEN STATIC
app.mount("/data", StaticFiles(directory="data"), name="data")


@app.get("/")
async def root():
    return {"message": "AI Document Chatbot Backend is running"}