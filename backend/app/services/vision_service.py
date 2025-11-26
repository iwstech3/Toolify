import google.generativeai as genai
from PIL import Image
import io
from typing import Optional
from app.config import settings

genai.configure(api_key=settings.google_api_key)

def recognize_tools_in_image(image_bytes: bytes) -> Optional[str]:
    """
    Recognizes a single tool in an image using the Gemini Vision API.

    Args:
        image_bytes: The bytes of the image to analyze.

    Returns:
        The name of the tool found in the image, or None.
    """
    try:
        model = genai.GenerativeModel(settings.gemini_model)
        image = Image.open(io.BytesIO(image_bytes))
        prompt = (
            "Analyze the image and identify any tool or object detected, closest to the camera. "
            "Return the most specific name and type you can. No commas, one name!"
            "Return only the specific name and type, nothing else. "
            "If no tool or object is found, return nothing"
        )
        response = model.generate_content([prompt, image])
        
        tool_name = response.text.strip()
        return tool_name if tool_name else None
    except Exception as e:
        print(f"An error occurred during tool recognition: {e}")
        return None
