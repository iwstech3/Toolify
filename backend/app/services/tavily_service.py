from tavily import TavilyClient
from app.config import settings
from app.model.schemas import ToolResearchResponse, ResearchResult, YouTubeLink
from datetime import datetime
from typing import Optional

class TavilyService:
    def __init__(self):
        self.client = TavilyClient(api_key=settings.tavily_api_key)
    
    def search_tool_info(self, query: str, max_results: int):
        try:
            response = self.client.search(
                query=f"{query} tool usage guide tutorial",
                search_depth="advanced",
                max_results=max_results,
                include_domains=[
                    "wikihow.com",
                    "instructables.com",
                    "wikipedia.org",
                    "homedepot.com",
                    "lowes.com",
                    "toolguyd.com",
                    "familyhandyman.com",
                    "thisoldhouse.com"
                ]
            )
            return response
        except Exception as e:
            raise Exception(f"Tool search error: {str(e)}")
    
    def search_youtube_tutorials(self, query: str, max_results: int):
        try:
            response = self.client.search(
                query=f"{query} how to use tutorial",
                search_depth="basic",
                max_results=max_results,
                include_domains=["youtube.com", "youtu.be"]
            )
            return response
        except Exception as e:
            raise Exception(f"YouTube search error: {str(e)}")
    
    def format_results(self, raw_results, tool_name=None, youtube_only=False, score_threshold=0.1):
        formatted = []
        results_list = raw_results.get("results", [])
        
        for result in results_list:
            score = result.get("score", 0.0)
            title = result.get("title", "Untitled")
            url = result.get("url", "")
            
            # For YouTube results, filter by tool_name in title (case-insensitive)
            # if youtube_only and tool_name:
            #     if tool_name.lower() not in title.lower():
            #         continue
            
            if score >= score_threshold:
                formatted.append({
                    "title": title,
                    "url": url,
                    "content": result.get("content", ""),
                    "score": score
                })
        
        return formatted

tavily_service = TavilyService()

def perform_tool_research(
    tool_name: str,
    tool_description: Optional[str] = None,
    language: str = "en",
    max_results: int = 5
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
        max_results=max_results
    )
    
    formatted_general = tavily_service.format_results(raw_results)
    formatted_youtube = tavily_service.format_results(
        raw_results=youtube_results, 
        tool_name=tool_name, 
        youtube_only=True,
        score_threshold=0.5  # Lower threshold for YouTube videos
    )
    
    youtube_links = [
        YouTubeLink(title=r["title"], url=r["url"], content=r['content'], score=r.get("score", 0.0))
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
    
    return ToolResearchResponse(
        tool_name=tool_name,
        query=general_query,
        research_results=research_results,
        youtube_info=youtube_links,
        timestamp=datetime.now()
    )