from google import genai
from PIL import Image
import io
from typing import Optional
from typing import Optional
from app.config import settings, gemini_client

# Initialize Gemini Client
client = gemini_client


def recognize_tools_in_image(image_bytes: bytes) -> Optional[str]:
    """
    Recognizes a single tool in an image using the Gemini Vision API.

    Args:
        image_bytes: The bytes of the image to analyze.

    Returns:
        The name of the tool found in the image, or None.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        prompt = (
            "Analyze the image and identify any tool or object detected, closest to the camera. "
            "Return the most specific name and type you can. No commas, one name!"
            "Return only the specific name and type, nothing else. "
            "If no tool or object is found, return nothing"
        )
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=[prompt, image]
        )
        
        tool_name = response.text.strip()
        return tool_name if tool_name else None
    except Exception as e:
        print(f"An error occurred during tool recognition: {e}")
        return None

def describe_image(image_bytes: bytes) -> Optional[str]:
    """
    Describes the contents of an image using the Gemini Vision API.

    Args:
        image_bytes: The bytes of the image to analyze.

    Returns:
        A text description of the image, or None if an error occurs.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        prompt = "Describe what you see in this image in a concise but detailed way."
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=[prompt, image]
        )
        
        description = response.text.strip()
        return description if description else None
    except Exception as e:
        print(f"An error occurred during image description: {e}")
        return None
