from tavily import TavilyClient
from app.config import settings
from app.model.schemas import ToolResearchResponse, ResearchResult, YouTubeLink
from datetime import datetime
from typing import Optional
import re
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable
)


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
                search_depth="advanced",
                max_results=max_results,
                include_domains=["youtube.com", "youtu.be"]
            )
            return response
        except Exception as e:
            raise Exception(f"YouTube search error: {str(e)}")
    
    def format_results(self, raw_results, tool_name=None, youtube_only=False, score_threshold=0.5):
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


class YoutubeTranscript:
    """Handles YouTube video ID extraction and transcript fetching."""
    
    @staticmethod
    def extract_video_id(url: str) -> Optional[str]:
        """
        Extracts YouTube video ID from various YouTube URL formats.
        
        Supports:
        - https://www.youtube.com/watch?v=VIDEO_ID
        - https://youtu.be/VIDEO_ID
        - https://www.youtube.com/embed/VIDEO_ID
        - https://m.youtube.com/watch?v=VIDEO_ID
        
        Args:
            url: YouTube URL
            
        Returns:
            Video ID if found, None otherwise
        """
        # Pattern for standard watch URL: youtube.com/watch?v=VIDEO_ID
        watch_pattern = r'(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})'
        
        # Pattern for shortened URL: youtu.be/VIDEO_ID
        short_pattern = r'youtu\.be\/([a-zA-Z0-9_-]{11})'
        
        # Pattern for embed URL: youtube.com/embed/VIDEO_ID
        embed_pattern = r'youtube\.com\/embed\/([a-zA-Z0-9_-]{11})'
        
        # Try each pattern
        for pattern in [watch_pattern, short_pattern, embed_pattern]:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None

    @staticmethod
    def fetch_transcript(video_id: str, language: str = "en") -> Optional[str]:
        """
        Fetches the transcript for a YouTube video.
        Uses the instance-based approach as seen in backend/test-yt.py.
        
        Args:
            video_id: YouTube video ID
            language: Language code for transcript (default: "en")
            
        Returns:
            Transcript as plain text, or None if unavailable
        """
        try:
            # Create API instance as in test-yt.py
            api = YouTubeTranscriptApi()
            
            # Use fetch method as in test-yt.py
            fetched_transcript = api.fetch(video_id, languages=[language])
            
            # Convert to raw data (list of dicts with 'text', 'start', 'duration')
            transcript_data = fetched_transcript.to_raw_data()
            
            # Join all transcript segments into plain text
            plain_text = " ".join([segment['text'] for segment in transcript_data])
            
            return plain_text
        
        except TranscriptsDisabled:
            print(f"Transcripts are disabled for video ID: {video_id}")
            return None
        
        except NoTranscriptFound:
            print(f"No {language} transcript found for video ID: {video_id}")
            return None
        
        except VideoUnavailable:
            print(f"Video unavailable for video ID: {video_id}")
            return None
        
        except Exception as e:
            print(f"Error fetching transcript for video ID {video_id}: {str(e)}")
            return None


tavily_service = TavilyService()
youtube_transcript = YoutubeTranscript()


def perform_tool_research(
    tool_name: str,
    tool_description: Optional[str] = None,
    language: str = "en",
    max_results: int = 5
) -> ToolResearchResponse:
    """
    Performs tool research using Tavily service.
    For YouTube videos, fetches transcripts and replaces the content field.
    """
    general_query = f"{tool_name} tool usage guide tutorial"
    raw_results = tavily_service.search_tool_info(
        query=general_query,
        max_results=max_results
    )
    
    youtube_query = f"{tool_name} how to use tutorial"
    youtube_results = tavily_service.search_youtube_tutorials(
        query=youtube_query,
        max_results=3
    )
    
    formatted_general = tavily_service.format_results(raw_results)
    formatted_youtube = tavily_service.format_results(
        raw_results=youtube_results, 
        tool_name=tool_name, 
        youtube_only=True,
        score_threshold=0.5  # Lower threshold for YouTube videos
    )
    
    # Process YouTube links and fetch transcripts
    youtube_links = []
    for r in formatted_youtube:
        if "youtube.com" in r["url"] or "youtu.be" in r["url"]:
            # Extract video ID from URL using YoutubeTranscript class
            video_id = youtube_transcript.extract_video_id(r["url"])
            
            # Fetch transcript if video ID was found
            transcript_content = r['content']  # Default to Tavily's content
            if video_id:
                transcript = youtube_transcript.fetch_transcript(video_id, language=language)
                if transcript:
                    transcript_content = transcript  # Replace with transcript
            
            youtube_links.append(
                YouTubeLink(
                    title=r["title"], 
                    url=r["url"], 
                    content=transcript_content,  # Use transcript or fallback to Tavily content
                    score=r.get("score", 0.0)
                )
            )
    
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