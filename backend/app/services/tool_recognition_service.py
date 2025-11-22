
import google.generativeai as genai
from PIL import Image
import io
from typing import List
from app.config import settings

genai.configure(api_key=settings.google_api_key)

def recognize_tools_in_image(image_bytes: bytes) -> List[str]:
    """
    Recognizes tools in an image using the Gemini Vision API.

    Args:
        image_bytes: The bytes of the image to analyze.

    Returns:
        A list of tool names found in the image.
    """
    try:
        model = genai.GenerativeModel(settings.gemini_model)
        image = Image.open(io.BytesIO(image_bytes))
        prompt = "Analyze the image and identify any tool detected, closest to the camera. Return the specific name of the tool you find, and nothing else. If no tool is found, return what you think the image is of.(A tool can also just be a regular object)"
        response = model.generate_content([prompt, image])
        
        # The response text might contain the tool names.
        # This is a simple parsing strategy. Depending on the model's output,
        # more sophisticated parsing might be needed.
        tools = [tool.strip() for tool in response.text.split(',') if tool.strip()]
        return tools
    except Exception as e:
        # It's a good practice to log the error for debugging purposes.
        print(f"An error occurred during tool recognition: {e}")
        # Depending on the application's needs, you might want to return an empty list
        # or re-raise the exception to be handled by the caller.
        return []
