# app/utils/session.py

from app.db.mongodb import get_collection  # ✅ ADD THIS

def get_user_from_session(session_id: str):
    if not session_id:
        return None

    sessions = get_collection("sessions")

    session = sessions.find_one({"session_id": session_id})
    if not session:
        return None

    return session.get("user_id")