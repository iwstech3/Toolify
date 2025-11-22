from fastapi import APIRouter, HTTPException
from app.model.schemas import ToolResearchRequest, ToolResearchResponse, ResearchResult
from app.services.tavily_service import tavily_service
from datetime import datetime
from typing import List

router = APIRouter(prefix="/api", tags=["Tool Research"])


@router.post("/tool-research", response_model=ToolResearchResponse)
async def research_tool(request: ToolResearchRequest):
    """
    Research a tool identified by Google Vision and return search results + YouTube links
    
    Args:
        request: Contains tool_name, tool_description (optional), and language
    
    Returns:
        ToolResearchResponse with research results and YouTube links
    """
    try:
        # Step 1: Search for general tool information
        general_query = f"{request.tool_name} tool usage guide tutorial"
        raw_results = tavily_service.search_tool_info(
            query=general_query,
            max_results=request.max_results
        )
        
        # Step 2: Search specifically for YouTube tutorials
        youtube_query = f"{request.tool_name} how to use tutorial"
        youtube_results = tavily_service.search_youtube_tutorials(
            query=youtube_query,
            max_results=5
        )
        
        # Format all results
        formatted_general = tavily_service.format_results(raw_results)
        formatted_youtube = tavily_service.format_results(youtube_results)
        
        # Extract YouTube links
        youtube_links = [
            {"title": r["title"], "url": r["url"]}
            for r in formatted_youtube
            if "youtube.com" in r["url"] or "youtu.be" in r["url"]
        ]
        
        # Prepare research results
        research_results = [
            ResearchResult(
                title=r["title"],
                url=r["url"],
                content=r["content"],
                score=r["score"]
            )
            for r in formatted_general
        ]
        
        # Build context text for downstream processing
        context_text = _build_context_text(
            tool_name=request.tool_name,
            tool_description=request.tool_description,
            general_results=formatted_general,
            youtube_results=formatted_youtube
        )
        
        return ToolResearchResponse(
            tool_name=request.tool_name,
            query=general_query,
            results=research_results,
            youtube_links=youtube_links,
            research_context=context_text,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Tool research error: {str(e)}"
        )


def _build_context_text(
    tool_name: str,
    tool_description: str,
    general_results: List[dict],
    youtube_results: List[dict]
) -> str:
    """Build comprehensive context from all research sources"""
    
    context_parts = []
    
    # Add tool description if available
    if tool_description:
        context_parts.append(f"=== Tool Description (from Image Recognition) ===")
        context_parts.append(f"{tool_description}\n")
    
    # Add general research
    if general_results:
        context_parts.append("=== General Information ===")
        for i, result in enumerate(general_results[:5], 1):
            context_parts.append(f"\n{i}. {result['title']}")
            context_parts.append(f"   {result['content'][:500]}...")
    
    # Add YouTube tutorial info
    if youtube_results:
        context_parts.append("\n\n=== Video Tutorial Information ===")
        for i, result in enumerate(youtube_results[:3], 1):
            if "youtube.com" in result['url'] or "youtu.be" in result['url']:
                context_parts.append(f"\n{i}. {result['title']}")
                context_parts.append(f"   URL: {result['url']}")
                context_parts.append(f"   {result['content'][:300]}...")
    
    return "\n".join(context_parts)


@router.post("/quick-tool-summary")
async def get_quick_tool_summary(tool_name: str, language: str = "en"):
    """
    Quick endpoint to get just basic search results for a tool
    """
    try:
        query = f"{tool_name} tool purpose and usage"
        raw_results = tavily_service.search_tool_info(
            query=query,
            max_results=3
        )
        
        formatted = tavily_service.format_results(raw_results)
        
        return {
            "tool_name": tool_name,
            "query": query,
            "results": formatted,
            "timestamp": datetime.now()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Quick summary error: {str(e)}"
        )