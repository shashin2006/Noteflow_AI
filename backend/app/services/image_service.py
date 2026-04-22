from huggingface_hub import InferenceClient
from app.core.config import settings
import cloudinary.uploader
import uuid
import io

client = InferenceClient(
    provider="hf-inference",
    api_key=settings.HF_API_KEY,
)

def build_image_prompt(query: str, context: str = ""):
    return f"""
Create a PROFESSIONAL system architecture diagram.

STRICT RULES:
- clean layout (no sketch)
- rectangular boxes only
- arrows must clearly show flow
- labeled components
- no handwritten style
- no artistic drawing
- no randomness

CONTENT:
{context}

USER REQUEST:
{query}

STYLE:
- modern UI diagram
- white background
- minimal
- vector style
- similar to AWS architecture diagrams
"""


def generate_image(prompt: str, context: str = ""):
    try:
        final_prompt = f"""
Clean system architecture diagram.

Components:
{context}

User request:
{prompt}

Style:
- professional diagram
- labeled boxes
- arrows
- white background
"""

        image = client.text_to_image(
            final_prompt,
            model="stabilityai/stable-diffusion-3-medium-diffusers"
        )

        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)

        result = cloudinary.uploader.upload(
            buffer,
            folder="ai_generated",
            resource_type="image"
        )

        print("✅ Cloudinary URL:", result["secure_url"])

        return result["secure_url"]

    except Exception as e:
        print("❌ IMAGE ERROR:", e)
        return None