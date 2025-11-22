from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.model.schemas import ManualGenerationRequest, ManualGenerationResponse
from app.chains.tool_manual_chain import tool_manual_chain
from app.services.audio_service import audio_service
from datetime import datetime
import os

router = APIRouter(prefix="/api", tags=["Manual Generation"])


@router.post("/generate-manual", response_model=ManualGenerationResponse)
async def generate_tool_manual(request: ManualGenerationRequest):
    """
    Generate a comprehensive tool manual with audio
    """
    try:
        # Generate manual
        manual = tool_manual_chain.generate_manual(
            tool_name=request.tool_name,
            research_context=request.research_context,
            tool_description=request.tool_description,
            language=request.language
        )
        
        # Generate summary
        summary = tool_manual_chain.generate_quick_summary(
            tool_name=request.tool_name,
            research_context=request.research_context,
            language=request.language
        )
        
        # Generate audio files
        audio_files = None
        if request.generate_audio:
            try:
                print(f"Attempting to generate audio for: {request.tool_name}")
                manual_audio = audio_service.generate_audio(
                    text=manual,
                    tool_name=request.tool_name,
                    language=request.language
                )
                print(f"Manual audio generated: {manual_audio}")
                
                summary_audio = audio_service.generate_summary_audio(
                    summary=summary,
                    tool_name=request.tool_name,
                    language=request.language
                )
                print(f"Summary audio generated: {summary_audio}")
                
                audio_files = {
                    "manual_audio": manual_audio,
                    "summary_audio": summary_audio
                }
                print(f"Audio files object: {audio_files}")
            except Exception as e:
                print(f"❌ Audio generation failed: {e}")
                import traceback
                traceback.print_exc()
        
        return ManualGenerationResponse(
            tool_name=request.tool_name,
            manual=manual,
            summary=summary,
            audio_files=audio_files,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Manual generation error: {str(e)}")


@router.get("/download-audio/{filename}")
async def download_audio(filename: str):
    """Download an audio file"""
    try:
        filepath = os.path.join("audio", filename)
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        return FileResponse(filepath, media_type="audio/mpeg", filename=filename)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/play-audio/{filename}")
async def play_audio(filename: str):
    """
    Stream audio file for direct playback in browser
    """
    try:
        filepath = os.path.join("audio", filename)
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        return FileResponse(
            filepath, 
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline"}  # Play in browser instead of download
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/list-audio-files")
async def list_audio_files():
    """List all audio files"""
    try:
        if not os.path.exists("audio"):
            return {"audio_files": [], "count": 0}
        
        files = [f for f in os.listdir("audio") if f.endswith(".mp3")]
        return {"audio_files": files, "count": len(files)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/generate-safety-guide")
async def generate_safety_guide(request: ManualGenerationRequest):
    """Generate a safety guide for a tool"""
    try:
        safety_guide = tool_manual_chain.generate_safety_guide(
            tool_name=request.tool_name,
            research_context=request.research_context,
            language=request.language
        )
        
        return {
            "tool_name": request.tool_name,
            "safety_guide": safety_guide,
            "timestamp": datetime.now()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")