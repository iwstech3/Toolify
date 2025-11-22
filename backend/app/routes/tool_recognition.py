
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from typing import List

from app.services.tool_recognition_service import recognize_tools_in_image

router = APIRouter(prefix="/api", tags=["Tool Recognition"])

@router.post("/recognize-tool", response_model=List[str])
async def recognize_tool(file: UploadFile = File(...)):
    """
    Accepts an image file and uses Gemini Vision to recognize tools in it.

    Args:
        file: An image file.

    Returns:
        A JSON response containing a list of identified tool names.
    """
    try:
        image_bytes = await file.read()
        tools = recognize_tools_in_image(image_bytes)
        return JSONResponse(content={"tools": tools})
    except Exception as e:
        # Log the error for debugging
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing the image.")
