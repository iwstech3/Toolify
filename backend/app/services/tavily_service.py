from tavily import TavilyClient
from app.config import settings


class TavilyService:
    def __init__(self):
        self.client = TavilyClient(api_key=settings.tavily_api_key)

    def search_tool_info(self, query: str, max_results: int = 10):
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

    def search_youtube_tutorials(self, query: str, max_results: int = 5):
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

    def format_results(self, raw_results):
        formatted = []
        for result in raw_results.get("results", []):
            formatted.append({
                "title": result.get("title", "Untitled"),
                "url": result.get("url", ""),
                "content": result.get("content", "")[:500],
                "score": result.get("score", 0.0)
            })
        return formatted


tavily_service = TavilyService()
