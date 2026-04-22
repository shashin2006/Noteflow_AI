from fastapi import Header, HTTPException

def get_user(user_id: str = Header(None, alias="user-id")):
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID missing")
    return user_id