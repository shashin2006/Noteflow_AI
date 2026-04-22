import cloudinary
import cloudinary.uploader
from app.core.config import settings


# 🔥 CONFIGURE CLOUDINARY
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


def upload_to_cloudinary(file_path: str):
    try:
        result = cloudinary.uploader.upload(
            file_path,
            resource_type="raw",      # PDF support
            upload_preset="public_pdf",
            type="upload"
        )

        print("✅ Upload success:", result)

        return result["secure_url"]

    except Exception as e:
        print("❌ FULL ERROR:", str(e))
        raise e