from pymongo import MongoClient
from app.core.config import settings

# Create MongoDB client using config
client = MongoClient(settings.MONGODB_URI)

# Select database
db = client[settings.MONGODB_DB_NAME]

# Helper to get collections
def get_collection(name: str):
    return db[name]

print("Connected DB:", settings.MONGODB_DB_NAME)
