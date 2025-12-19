import uuid
import json
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from app.model.schemas import ManualGenerationResponse
from app.chains.tool_manual_chain import tool_manual_chain
from app.services.audio_service import audio_service
from app.services.tavily_service import perform_tool_research
from app.services.vision_service import recognize_tools_in_image
from app.dependencies import get_current_user, get_user_supabase_client, image_file_validator
from app.config import supabase
from supabase import Client
from datetime import datetime
import os

router = APIRouter(prefix="/api", tags=["Manual Generation"])


@router.post("/generate-manual", response_model=ManualGenerationResponse)
async def generate_tool_manual(
    file: Optional[UploadFile] = File(None),
    tool_name: Optional[str] = Form(None),
    language: str = Form("en"),
    generate_audio: bool = Form(False),
    user: dict = Depends(get_current_user),
    supabase_client: Client = Depends(get_user_supabase_client)
):
    """
    Generate a comprehensive tool manual.
    Can accept an image file for tool recognition OR direct tool name.
    """

    try:
        scan_id = None
        final_tool_name = tool_name
        final_research_context = None
        tool_description = None
        file_path = None

        # 1. Handle File Upload & Recognition
        if file:
            # Validate image file
            image_file_validator(file)
            
            image_bytes = await file.read()
            recognized_name = recognize_tools_in_image(image_bytes)

            if not recognized_name:
                raise HTTPException(status_code=404, detail="No tool found in the image.")
            
            final_tool_name = recognized_name
            tool_description = f"Recognized from image: {recognized_name}"

            # Upload image to Supabase Storage
            file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
            file_path = f"{user.id}/{uuid.uuid4()}.{file_ext}"
            
            try:
                # Use admin client for storage to avoid RLS issues with fresh tokens if any
                supabase.storage.from_("tool-images").upload(
                    file=image_bytes,
                    path=file_path,
                    file_options={"content-type": file.content_type}
                )
            except Exception as e:
                print(f"Failed to upload image to Supabase: {e}")
                # Continue without failing the whole request, but log it

        # 2. Validate Inputs if no file provided
        if not final_tool_name:
             raise HTTPException(status_code=400, detail="Either an image file or a tool name is required.")

        # 3. Perform Research (ALWAYS)
        research_results = perform_tool_research(tool_name=final_tool_name)
        final_research_context = json.dumps(research_results.model_dump(mode='json'), indent=2)

        # 4. Save Scan Data (Research Result)
        # We save this for both image-based and text-based requests
        scan_data = {
            "user_id": str(user.id),
            "tool_name": final_tool_name,
            "analysis_result": research_results.model_dump(mode='json'),
            "image_path": file_path if file else None
        }
        
        scan_response = supabase.table("scans").insert(scan_data).execute()
        if scan_response.data:
            scan_id = scan_response.data[0]['id']

        # 5. Generate Manual
        manual = tool_manual_chain.generate_manual(
            tool_name=final_tool_name,
            research_context=final_research_context,
            tool_description=tool_description,
            language=language
        )
        
        # 6. Generate Summary
        summary = tool_manual_chain.generate_quick_summary(
            tool_name=final_tool_name,
            research_context=final_research_context,
            language=language
        )
        
        # 7. Generate Audio (Optional)
        audio_files_data = None
        if generate_audio:
            try:
                audio_url = audio_service.generate_audio(
                    text=summary,
                    tool_name=final_tool_name,
                    user_id=str(user.id)
                )
                
                audio_files_data = {
                    "url": audio_url,
                    "generated_at": datetime.now().isoformat()
                }
            except Exception as e:
                # Don't fail the request if audio fails
                pass

        # 8. Save Manual to Database
        manual_data = {
            "user_id": str(user.id),
            "scan_id": scan_id,
            "tool_name": final_tool_name,
            "manual_content": manual,
            "summary_content": summary,
            "audio_files": audio_files_data
        }
        
        supabase.table("manuals").insert(manual_data).execute()

        return ManualGenerationResponse(
            tool_name=final_tool_name,
            manual=manual,
            summary=summary,
            audio_files=audio_files_data,
            timestamp=datetime.now()
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Manual generation error: {str(e)}")