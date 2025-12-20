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
# PDF generation moved to frontend
from app.dependencies import get_current_user, get_user_supabase_client, image_file_validator
from app.config import supabase
from supabase import Client
from datetime import datetime
import os
import logging

# Set up logger
logger = logging.getLogger(__name__)

try:
    from langsmith import uuid7
except ImportError:
    # Fallback if langsmith not installed
    import uuid as uuid_module
    def uuid7():
        return str(uuid_module.uuid4())

router = APIRouter(prefix="/api", tags=["Manual Generation"])


@router.post("/generate-manual", response_model=ManualGenerationResponse)
async def generate_tool_manual(
    file: Optional[UploadFile] = File(None),
    tool_name: Optional[str] = Form(None),
    language: str = Form("en"),
    generate_audio: bool = Form(False),
    session_id: Optional[str] = Form(None),
    user: dict = Depends(get_current_user),
    supabase_client: Client = Depends(get_user_supabase_client)
):
    """
    Generate a comprehensive tool manual.
    Can accept an image file for tool recognition OR direct tool name.
    """
    logger.info(f"Manual generation request received. Tool: {tool_name}, Language: {language}, Audio: {generate_audio}")

    try:
        scan_id = None
        final_tool_name = tool_name
        final_research_context = None
        tool_description = None
        file_path = None
        chat_id = None

        # Validate session_id if provided
        if session_id and session_id.strip():
            if len(session_id.replace('-', '')) == 32:
                chat_id = session_id
            else:
                chat_id = None

        # 1. Handle File Upload & Recognition
        if file:
            # Validate image file
            image_file_validator(file)
            
            image_bytes = await file.read()
            recognized_name = recognize_tools_in_image(image_bytes)
            logger.info(f"Image recognition result: {recognized_name}")

            if not recognized_name:
                logger.warning("No tool recognized in the uploaded image")
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
                logger.info(f"Image uploaded to Supabase: {file_path}")
            except Exception as e:
                logger.error(f"Failed to upload image to Supabase: {e}")
                # Continue without failing the whole request, but log it

        # 2. Validate Inputs if no file provided
        if not final_tool_name:
             raise HTTPException(status_code=400, detail="Either an image file or a tool name is required.")

        # Create Chat Session if needed (and persist user message)
        if not chat_id:
            new_chat_id = str(uuid7())
            chat_title = f"Manual: {final_tool_name}"
            
            chat_data = {
                "id": new_chat_id,
                "user_id": str(user.id),
                "title": chat_title,
                "scan_id": None # We'll update this later if we have a scan_id
            }
            chat_res = supabase_client.table("chats").insert(chat_data).execute()
            if chat_res.data:
                chat_id = chat_res.data[0]['id']
                logger.info(f"New chat session created: {chat_id}")
            else:
                logger.error("Failed to create new chat session")

        # Save User Message
        user_content = f"Generate manual for {final_tool_name}"
        if file:
            user_content = "Generate manual for this tool (image uploaded)"
        
        # Get public URL for image if it exists
        image_url = None
        if file_path:
             image_url = supabase.storage.from_("tool-images").get_public_url(file_path)

        try:
            supabase_client.table("messages").insert({
                "chat_id": str(chat_id) if chat_id else None,
                "role": "user",
                "content": user_content,
                "image_url": image_url # Assuming schema supports this, otherwise append to content
            }).execute()
            logger.info(f"User message saved to chat: {chat_id}")
        except Exception as e:
            logger.error(f"Failed to save user message: {e}")


        # 3. Perform Research (ALWAYS)
        logger.info(f"Performing research for tool: {final_tool_name}")
        research_results = perform_tool_research(tool_name=final_tool_name)
        final_research_context = json.dumps(research_results.model_dump(mode='json'), indent=2)
        logger.info("Research completed successfully")

        # 4. Save Scan Data (Research Result)
        # We save this for both image-based and text-based requests
        scan_data = {
            "user_id": str(user.id),
            "tool_name": final_tool_name,
            "analysis_result": research_results.model_dump(mode='json'),
            "image_path": file_path if file else None
        }
        
        try:
            scan_response = supabase.table("scans").insert(scan_data).execute()
            if scan_response.data:
                scan_id = scan_response.data[0]['id']
                logger.info(f"Scan data saved: {scan_id}")
                # Update chat with scan_id
                if chat_id:
                     supabase_client.table("chats").update({"scan_id": scan_id}).eq("id", chat_id).execute()
                     logger.info(f"Chat {chat_id} updated with scan_id {scan_id}")
        except Exception as e:
            logger.error(f"Failed to save scan data: {e}")

        # 5. Generate Manual
        logger.info("Generating manual content...")
        manual = tool_manual_chain.generate_manual(
            tool_name=final_tool_name,
            research_context=final_research_context,
            tool_description=tool_description,
            language=language
        )
        logger.info("Manual content generated")
        
        # 6. Generate Summary
        logger.info("Generating summary...")
        summary = tool_manual_chain.generate_quick_summary(
            tool_name=final_tool_name,
            research_context=final_research_context,
            language=language
        )
        logger.info("Summary generated")

        # Ensure summary and manual are never just empty or None
        if not summary or len(summary.strip()) < 5:
            summary = f"A summary for {final_tool_name} could not be generated at this time, but you can find details in the manual below."
        
        if not manual or len(manual.strip()) < 5:
            manual = f"Detailed manual generation for {final_tool_name} failed. Please try again or provide more details."

        
        # 7. Generate Audio (Optional)
        audio_files_data = None
        if generate_audio:
            logger.info("Generating audio for summary...")
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
                logger.info(f"Audio generated: {audio_url}")
            except Exception as e:
                logger.error(f"Audio generation failed: {e}")
                # Don't fail the request if audio fails
                pass

        # PDF generation has been moved to frontend

        # 8. Save Manual to Database
        manual_data = {
            "user_id": str(user.id),
            "scan_id": scan_id,
            "tool_name": final_tool_name,
            "manual_content": manual,
            "summary_content": summary,
            "audio_files": audio_files_data
        }
        
        try:
            supabase.table("manuals").insert(manual_data).execute()
            logger.info("Manual saved to database")
        except Exception as e:
            logger.error(f"Database insertion failed for manual: {e}")
            # Don't fail the whole request just because history saving failed
            pass

        # Save Assistant Message (Summary + Manual Metadata)
        # We'll save the summary as the content. The frontend can render the manual button/PDF based on context or we can append a link.
        # For now, let's just save the summary. The frontend handles the "real-time" manual display.
        # To persist the PDF/Manual availability, we might need to store the manual ID or content in the message metadata if the schema allows,
        # or just rely on the summary text.
        
        # Ideally, we should store the PDF URL if we generated it, but PDF is generated on frontend.
        # So we just store the summary.
        
        assistant_msg_data = {
            "chat_id": str(chat_id) if chat_id else None,
            "role": "assistant",
            "content": summary,
            "audio_url": audio_files_data['url'] if audio_files_data else None
        }
        
        try:
            supabase_client.table("messages").insert(assistant_msg_data).execute()
            logger.info("Assistant message saved to chat")
        except Exception as e:
            logger.error(f"Failed to save assistant message: {e}")

        return ManualGenerationResponse(
            tool_name=final_tool_name,
            manual=manual,
            summary=summary,
            audio_files=audio_files_data,
            timestamp=datetime.now(),
            session_id=chat_id # Return the session ID
        )
        
    except HTTPException as e:
        logger.error(f"HTTP Exception in manual generation: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in manual generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Manual generation error: {str(e)}")
