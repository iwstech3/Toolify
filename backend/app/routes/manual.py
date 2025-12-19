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
from app.services.pdf_service import PDFService
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

        # Ensure summary and manual are never just empty or None
        if not summary or len(summary.strip()) < 5:
            summary = f"A summary for {final_tool_name} could not be generated at this time, but you can find details in the manual below."
        
        if not manual or len(manual.strip()) < 5:
            manual = f"Detailed manual generation for {final_tool_name} failed. Please try again or provide more details."

        
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

        # 8. Generate PDF Manual
        pdf_url = None
        try:
            # Combine summary and manual for the content
            full_manual_content = f"# Manual for {final_tool_name}\n\n## Summary\n{summary}\n\n## Detailed Guide\n{manual}"
            
            pdf_res = PDFService.create_manual_pdf(
                tool_name=final_tool_name,
                manual_content=full_manual_content,
                user_id=str(user.id)
            )
            if pdf_res and 'publicUrl' in pdf_res:
                 pdf_url = pdf_res['publicUrl']
            elif isinstance(pdf_res, str): # Fallback if signature differs or just returns string
                 pdf_url = pdf_res

        except Exception as e:
            print(f"Failed to generate PDF: {e}")
            # Don't fail the request if PDF fails
            pass

        # 9. Save Manual to Database
        manual_data = {
            "user_id": str(user.id),
            "scan_id": scan_id,
            "tool_name": final_tool_name,
            "manual_content": manual,
            "summary_content": summary,
            "audio_files": audio_files_data,
            "pdf_url": pdf_url
        }
        
        try:
            supabase.table("manuals").insert(manual_data).execute()
        except Exception as e:
            print(f"Database insertion failed (possibly missing pdf_url column?): {e}")
            # Try once more without pdf_url if it failed
            try:
                del manual_data["pdf_url"]
                supabase.table("manuals").insert(manual_data).execute()
            except Exception as e2:
                print(f"Fallback database insertion failed: {e2}")
                # Still don't fail the whole request just because history saving failed
                pass

        return ManualGenerationResponse(
            tool_name=final_tool_name,
            manual=manual,
            summary=summary,
            audio_files=audio_files_data,
            pdf_url=pdf_url,
            timestamp=datetime.now()
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Manual generation error: {str(e)}")