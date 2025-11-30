
import uuid
import json
from fastapi import APIRouter, UploadFile, HTTPException, Depends
from app.model.schemas import ToolResearchResponse
from app.services.tavily_service import perform_tool_research
from app.services.vision_service import recognize_tools_in_image
from app.dependencies import image_file_validator, get_current_user
from app.config import supabase

router = APIRouter(prefix="/api", tags=["Tool Recognition"])

@router.post("/recognize-tool", response_model=ToolResearchResponse)
async def recognize_tool(
    file: UploadFile = Depends(image_file_validator),
    user: dict = Depends(get_current_user)
):
    """
    Accepts an image file, uses Gemini Vision to recognize a tool,
    and then performs research on that tool using Tavily.
    Saves the scan to Supabase.

    Args:
        file: An image file, validated to be an image type.
        user: The authenticated user.

    Returns:
        A ToolResearchResponse with research results and YouTube links for the identified tool.
    """
    try:
        image_bytes = await file.read()
        tool_name = recognize_tools_in_image(image_bytes)

        if not tool_name:
            raise HTTPException(status_code=404, detail="No tool found in the image.")

        research_results = perform_tool_research(tool_name=tool_name)

        # Upload image to Supabase Storage
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        file_path = f"{user.id}/{uuid.uuid4()}.{file_ext}"
        
        try:
            supabase.storage.from_("tool-images").upload(
                file=image_bytes,
                path=file_path,
                file_options={"content-type": file.content_type}
            )
        except Exception as e:
            print(f"Failed to upload image to Supabase: {e}")
            # Continue even if upload fails? Or fail? Let's log and continue for now, but maybe we shouldn't save the scan record if image is missing.
            # Actually, let's fail if storage fails as it's critical for history.
            raise HTTPException(status_code=500, detail="Failed to save image.")

        # Save scan to Database
        scan_data = {
            "user_id": str(user.id),
            "image_path": file_path,
            "tool_name": tool_name,
            "analysis_result": research_results.model_dump(mode='json'),
        }
        
        response = supabase.table("scans").insert(scan_data).execute()
        scan_id = response.data[0]['id']

        # Add scan_id to response
        research_results.scan_id = scan_id

        return research_results

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error processing image or researching tool: {e}")
        raise HTTPException(status_code=500, detail="An error occurred.")
