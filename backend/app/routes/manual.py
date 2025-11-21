from fastapi import APIRouter, HTTPException
from app.model.schemas import ManualGenerationRequest, ManualGenerationResponse
from app.chains.tool_manual_chain import tool_manual_chain
from datetime import datetime

router = APIRouter(prefix="/api", tags=["Manual Generation"])


@router.post("/generate-manual", response_model=ManualGenerationResponse)
async def generate_tool_manual(request: ManualGenerationRequest):
    """
    Generate a comprehensive tool manual using Gemini AI
    
    This endpoint accepts research data from Tavily and generates
    a complete user manual with safety guidelines, usage instructions,
    maintenance tips, and more.
    
    Args:
        request: Contains tool_name, research_context, tool_description, and language
    
    Returns:
        ManualGenerationResponse with the generated manual
    """
    try:
        # Generate the comprehensive manual
        manual = tool_manual_chain.generate_manual(
            tool_name=request.tool_name,
            research_context=request.research_context,
            tool_description=request.tool_description,
            language=request.language
        )
        
        # Generate a quick summary
        summary = tool_manual_chain.generate_quick_summary(
            tool_name=request.tool_name,
            research_context=request.research_context,
            language=request.language
        )
        
        return ManualGenerationResponse(
            tool_name=request.tool_name,
            manual=manual,
            summary=summary,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Manual generation error: {str(e)}"
        )


@router.post("/generate-safety-guide")
async def generate_safety_guide(request: ManualGenerationRequest):
    """
    Generate a focused safety guide for a tool
    
    Args:
        request: Contains tool_name, research_context, and language
    
    Returns:
        Safety guide for the tool
    """
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
        raise HTTPException(
            status_code=500,
            detail=f"Safety guide generation error: {str(e)}"
        )


@router.post("/generate-quick-summary")
async def generate_quick_summary(
    tool_name: str,
    research_context: str,
    language: str = "en"
):
    """
    Generate a quick 2-3 sentence summary of a tool
    
    Args:
        tool_name: Name of the tool
        research_context: Research data from Tavily
        language: Output language
    
    Returns:
        Brief summary of the tool
    """
    try:
        summary = tool_manual_chain.generate_quick_summary(
            tool_name=tool_name,
            research_context=research_context,
            language=language
        )
        
        return {
            "tool_name": tool_name,
            "summary": summary,
            "timestamp": datetime.now()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Summary generation error: {str(e)}"
        )