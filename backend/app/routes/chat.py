import uuid
import json
from fastapi import APIRouter, HTTPException, Form, UploadFile, Depends, File
from datetime import datetime
from typing import Optional, List
from app.model.schemas import ChatResponse
from app.chains.chat_chain import _chat_chain
from app.services.vision_service import describe_image, recognize_tools_in_image
from app.services.tavily_service import perform_tool_research
from app.services.audio_service import audio_service
from app.dependencies import optional_image_file_validator, get_current_user, get_user_supabase_client
from app.config import supabase
from supabase import Client

try:
    from langsmith import uuid7
except ImportError:
    # Fallback if langsmith not installed
    import uuid as uuid_module
    def uuid7():
        return str(uuid_module.uuid4())

router = APIRouter(prefix="/api", tags=["Chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat(
    message: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = Depends(optional_image_file_validator),
    voice: Optional[UploadFile] = File(None),
    user: dict = Depends(get_current_user),
    supabase_client: Client = Depends(get_user_supabase_client)
):
    """
    A multi-turn chat endpoint to converse with the Gemini AI assistant.
    Supports English (en), French (fr), and Nigerian Pidgin (pdg).
    This endpoint can optionally accept an image file for context.
    If an image is provided, it attempts to recognize a tool and perform research.
    If session_id is not provided, a new one is generated and returned.
    """
    try:
        # Validate and set chat_id
        chat_id = None
        if session_id and session_id.strip():
            # Only use session_id if it looks like a UUID
            # UUIDs are 36 characters with dashes or 32 without
            if len(session_id.replace('-', '')) == 32:
                chat_id = session_id
            else:
                # Invalid session_id, will create a new chat
                chat_id = None
        
        scan_id = None
        
        # Handle voice input
        if voice:
            voice_bytes = await voice.read()
            if voice_bytes:
                transcribed_text = audio_service.transcribe_audio(voice_bytes, mime_type=voice.content_type or "audio/mp3")
                if transcribed_text:
                    if message:
                        message += f"\n[Voice Input]: {transcribed_text}"
                    else:
                        message = transcribed_text

        if not message:
            raise HTTPException(status_code=400, detail="Message or voice input is required")

        full_message = message
        
        # Handle Image Upload & Recognition
        if file:
            image_bytes = await file.read()
            if image_bytes:
                # Upload image to Supabase
                file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
                file_path = f"{user.id}/{uuid.uuid4()}.{file_ext}"
                try:
                    supabase.storage.from_("tool-images").upload(
                        file=image_bytes,
                        path=file_path,
                        file_options={"content-type": file.content_type}
                    )
                except Exception as e:
                    print(f"Failed to upload image: {e}")
                    # Proceed without saving scan if upload fails? 
                    # We'll just log it for now.

                # First try to recognize a tool
                tool_name = recognize_tools_in_image(image_bytes)
                
                if tool_name:
                    # If tool found, research it
                    research_response = perform_tool_research(tool_name)
                    
                    # Save Scan
                    scan_data = {
                        "user_id": str(user.id),
                        "image_path": file_path,
                        "tool_name": tool_name,
                        "analysis_result": research_results.model_dump(mode='json') if 'research_results' in locals() else None, # Wait, research_response is the object
                    }
                    # Fix: research_response is the Pydantic model
                    scan_data["analysis_result"] = research_response.model_dump(mode='json')
                    
                    scan_res = supabase_client.table("scans").insert(scan_data).execute()
                    if scan_res.data:
                        scan_id = scan_res.data[0]['id']

                    # Format research for the LLM
                    research_text = f"Tool Identified: {tool_name}\n\nResearch Results:\n"
                    for res in research_response.research_results[:3]:
                        research_text += f"- {res.title}: {res.content}\n"
                    
                    full_message = (
                        f"The user uploaded an image of a tool identified as '{tool_name}'.\n"
                        f"Here is some research about it:\n{research_text}\n"
                        f"The user's message is: '{message}'"
                    )
                else:
                    # Fallback to general description if no tool recognized
                    image_description = describe_image(image_bytes)
                    if image_description:
                        full_message = (
                            f"The user has uploaded an image with the following description: '{image_description}'.\n"
                            f"The user's message is: '{message}'"
                        )

        # Create Chat Session if needed
        if not chat_id:
            # Generate UUID v7 for new chat sessions (LangSmith compatible)
            new_chat_id = str(uuid7())
            
            chat_data = {
                "id": new_chat_id,  # Explicitly set the ID
                "user_id": str(user.id),
                "title": message[:50] + "..." if message else "New Chat",
                "scan_id": str(scan_id) if scan_id else None
            }
            chat_res = supabase_client.table("chats").insert(chat_data).execute()
            if chat_res.data:
                chat_id = chat_res.data[0]['id']
        
        # Save User Message
        supabase_client.table("messages").insert({
            "chat_id": str(chat_id) if chat_id else None,
            "role": "user",
            "content": message # Save original message, not full_message with context
        }).execute()

        # Invoke LLM
        # invoke_chat now returns a Pydantic object (LLMStructuredOutput)
        structured_response = await _chat_chain.invoke_chat(full_message, chat_id) # Pass chat_id as session_id

        # Save Assistant Message
        supabase_client.table("messages").insert({
            "chat_id": str(chat_id) if chat_id else None,
            "role": "assistant",
            "content": structured_response.response
        }).execute()

        return ChatResponse(
            content=structured_response.response,
            language=structured_response.language,
            timestamp=datetime.now(),
            session_id=chat_id
        )

    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat Error: {str(e)}")

@router.get("/chats")
async def get_chats(
    user: dict = Depends(get_current_user),
    supabase_client: Client = Depends(get_user_supabase_client)
):
    """Fetch all chats for the current user."""
    try:
        # Check if user.id is available, might be a string or property depending on Depends(get_current_user)
        # Based on dependencies.py, it returns response.user which has .id
        user_id = user.id
        res = supabase_client.table("chats").select("*").eq("user_id", str(user_id)).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        print(f"Error fetching chats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chats/{chat_id}/messages")
async def get_chat_messages(
    chat_id: str, 
    user: dict = Depends(get_current_user),
    supabase_client: Client = Depends(get_user_supabase_client)
):
    """Fetch messages for a specific chat."""
    try:
        user_id = user.id
        
        # Verify ownership
        # Note: .single() raises error if no row found, handle that
        try:
            chat_check = supabase_client.table("chats").select("user_id").eq("id", chat_id).single().execute()
        except:
             raise HTTPException(status_code=404, detail="Chat not found")
             
        if not chat_check.data or chat_check.data["user_id"] != str(user_id):
            raise HTTPException(status_code=403, detail="Not authorized to view this chat")
        
        res = supabase_client.table("messages").select("*").eq("chat_id", chat_id).order("created_at", desc=False).execute()
        return res.data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-tts")
async def generate_tts(
    text: str = Form(...),
    language: str = Form("en"),
    user: dict = Depends(get_current_user)
):
    """Generate text-to-speech audio for a message"""
    try:
        from fastapi.responses import StreamingResponse
        import io
        
        # Generate audio using gTTS
        tts_audio = audio_service.generate_audio(
            text=text,
            tool_name="chat_message",
            language=language,
            tld="com"
        )
        
        # Read the file and return as streaming response
        def iterfile():
            with open(tts_audio, "rb") as audio_file:
                yield from audio_file
        
        return StreamingResponse(
            iterfile(),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline"}
        )
        
    except Exception as e:
        print(f"TTS Error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS generation error: {str(e)}")
