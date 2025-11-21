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
    Generate a comprehensive tool manual with optional audio
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
        
        # Generate audio if requested
        audio_path = None
        if request.generate_audio:
            try:
                audio_path = audio_service.text_to_audio(
                    text=f"{summary}. {manual}",
                    tool_name=request.tool_name,
                    language=request.language
                )
            except Exception as e:
                print(f"Audio generation failed: {e}")
        
        return ManualGenerationResponse(
            tool_name=request.tool_name,
            manual=manual,
            summary=summary,
            audio_file=audio_path,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Manual generation error: {str(e)}"
        )


@router.get("/download-audio/{filename}")
async def download_audio(filename: str):
    """Download an audio file"""
    try:
        filepath = os.path.join("audio", filename)
        
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        return FileResponse(
            path=filepath,
            media_type="audio/mpeg",
            filename=filename
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list-audio")
async def list_audio_files():
    """List all audio files"""
    try:
        files = [f for f in os.listdir("audio") if f.endswith(".mp3")]
        return {"files": files, "count": len(files)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-safety-guide")
async def generate_safety_guide(request: ManualGenerationRequest):
    """Generate safety guide for a tool"""
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
        raise HTTPException(status_code=500, detail=str(e))