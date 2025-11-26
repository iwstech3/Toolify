
from fastapi import APIRouter, File, UploadFile, HTTPException
from app.model.schemas import ToolResearchResponse
from app.services.tavily_service import perform_tool_research
from app.services.vision_service import recognize_tools_in_image

router = APIRouter(prefix="/api", tags=["Tool Recognition"])

@router.post("/recognize-tool", response_model=ToolResearchResponse)
async def recognize_tool(file: UploadFile = File(...)):
    """
    Accepts an image file, uses Gemini Vision to recognize a tool,
    and then performs research on that tool using Tavily.

    Args:
        file: An image file.

    Returns:
        A ToolResearchResponse with research results and YouTube links for the identified tool.
    """
    try:
        image_bytes = await file.read()
        tool_name = recognize_tools_in_image(image_bytes)

        if not tool_name:
            raise HTTPException(status_code=404, detail="No tool found in the image.")

        research_results = perform_tool_research(tool_name=tool_name)

        return research_results

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error processing image or researching tool: {e}")
        raise HTTPException(status_code=500, detail="An error occurred.")
