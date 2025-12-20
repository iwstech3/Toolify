from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Form
from app.services.audio_service import audio_service
from app.dependencies import get_current_user, get_user_supabase_client
from supabase import Client

router = APIRouter(prefix="/api", tags=["Audio"])

@router.post("/generate-tts")
async def generate_tts(
    text: str = Form(...),
    language: str = Form("en"),
    message_id: Optional[str] = Form(None),
    user: dict = Depends(get_current_user),
    supabase_client: Client = Depends(get_user_supabase_client)
):
    """Generate text-to-speech audio for a message"""
    try:
        # Generate audio using YarnGPT via audio_service
        audio_url = audio_service.generate_audio(
            text=text,
            tool_name="chat_message",
            user_id=str(user.id)
        )
        
        # If message_id is provided, save the audio URL to the message history
        if message_id:
            try:
                supabase_client.table("messages").update({
                    "audio_url": audio_url
                }).eq("id", message_id).execute()
            except Exception as db_error:
                print(f"Failed to update message with audio URL: {db_error}")
                # Don't fail the request, just log the error
        
        return {"url": audio_url}
        
    except Exception as e:
        print(f"TTS Error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS generation error: {str(e)}")
