from app.model.schemas import ToolResearchResponse, ResearchResult, YouTubeLink
from app.services.tavily_service import tavily_service
from datetime import datetime
from typing import List, Optional

def _build_context_text(
    tool_name: str,
    tool_description: Optional[str],
    general_results: List[dict],
    youtube_results: List[dict]
) -> str:
    """Build comprehensive context from all research sources"""
    
    context_parts = []
    
    if tool_description:
        context_parts.append(f"=== Tool Description (from Image Recognition) ===")
        context_parts.append(f"{tool_description}\n")
    
    if general_results:
        context_parts.append("=== General Information ===")
        for i, result in enumerate(general_results[:5], 1):
            context_parts.append(f"\n{i}. {result['title']}")
            context_parts.append(f"   {result['content'][:500]}...")
    
    if youtube_results:
        context_parts.append("\n\n=== Video Tutorial Information ===")
        for i, result in enumerate(youtube_results[:3], 1):
            if "youtube.com" in result['url'] or "youtu.be" in result['url']:
                context_parts.append(f"\n{i}. {result['title']}")
                context_parts.append(f"   URL: {result['url']}")
                context_parts.append(f"   {result['content'][:300]}...")
    
    return "\n".join(context_parts)

def perform_tool_research(
    tool_name: str,
    tool_description: Optional[str] = None,
    language: str = "en",
    max_results: int = 10
) -> ToolResearchResponse:
    """
    Performs tool research using Tavily service.
    """
    general_query = f"{tool_name} tool usage guide tutorial"
    raw_results = tavily_service.search_tool_info(
        query=general_query,
        max_results=max_results
    )
    
    youtube_query = f"{tool_name} how to use tutorial"
    youtube_results = tavily_service.search_youtube_tutorials(
        query=youtube_query,
        max_results=5
    )
    
    formatted_general = tavily_service.format_results(raw_results)
    formatted_youtube = tavily_service.format_results(youtube_results)
    
    youtube_links = [
        YouTubeLink(title=r["title"], url=r["url"])
        for r in formatted_youtube
        if "youtube.com" in r["url"] or "youtu.be" in r["url"]
    ]
    
    research_results = [
        ResearchResult(
            title=r["title"],
            url=r["url"],
            content=r["content"],
            score=r["score"]
        )
        for r in formatted_general
    ]
    
    context_text = _build_context_text(
        tool_name=tool_name,
        tool_description=tool_description,
        general_results=formatted_general,
        youtube_results=formatted_youtube
    )
    
    return ToolResearchResponse(
        tool_name=tool_name,
        query=general_query,
        results=research_results,
        youtube_links=youtube_links,
        research_context=context_text,
        timestamp=datetime.now()
    )