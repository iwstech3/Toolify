from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ToolResearchRequest(BaseModel):
    """Request model for tool research"""
    tool_name: str = Field(..., description="Name of the tool identified by Google Vision")
    tool_description: Optional[str] = Field(None, description="Additional description from image recognition")
    language: str = Field(default="en", description="Language for the response")
    max_results: int = Field(default=10, description="Maximum number of research results")


class YouTubeLink(BaseModel):
    """YouTube tutorial link"""
    title: str
    url: str
    content: str
    score: float = Field(default=0.0, description="Relevance score of the YouTube link")


class ResearchResult(BaseModel):
    """Individual research result"""
    title: str
    url: str
    content: str
    score: float


class ToolResearchResponse(BaseModel):
    """Response model for tool research"""
    tool_name: str
    query: str
    research_results: List[ResearchResult]
    youtube_info: List[YouTubeLink]
    timestamp: datetime



class ResearchRequest(BaseModel):
    """Original research request model"""
    query: str
    language: str = "en"
    max_results: int = 10


class ResearchResponse(BaseModel):
    """Original research response model"""
    query: str
    results: List[ResearchResult]
    summary: str
    timestamp: datetime


class ManualGenerationRequest(BaseModel):
    """Request model for manual generation"""
    tool_name: str = Field(..., description="Name of the tool")
    research_context: str = Field(..., description="Research data from Tavily")
    tool_description: Optional[str] = Field(None, description="Optional description from Google Vision")
    language: str = Field(default="en", description="Language for the manual")
    generate_audio: bool = Field(default=False, description="Whether to generate audio file")


class ManualGenerationResponse(BaseModel):
    """Response model for manual generation"""
    tool_name: str
    manual: str
    summary: str
    audio_file: Optional[str] = None 
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ToolResearchRequest(BaseModel):
    """Request model for tool research"""
    tool_name: str = Field(..., description="Name of the tool identified by Google Vision")
    tool_description: Optional[str] = Field(None, description="Additional description from image recognition")
    language: str = Field(default="en", description="Language for the response")
    max_results: int = Field(default=10, description="Maximum number of research results")


class YouTubeLink(BaseModel):
    """YouTube tutorial link"""
    title: str
    url: str
    content: str
    score: float = Field(default=0.0, description="Relevance score of the YouTube link")


class ResearchResult(BaseModel):
    """Individual research result"""
    title: str
    url: str
    content: str
    score: float


class ToolResearchResponse(BaseModel):
    """Response model for tool research"""
    tool_name: str
    query: str
    research_results: List[ResearchResult]
    youtube_info: List[YouTubeLink]
    timestamp: datetime



class ResearchRequest(BaseModel):
    """Original research request model"""
    query: str
    language: str = "en"
    max_results: int = 10


class ResearchResponse(BaseModel):
    """Original research response model"""
    query: str
    results: List[ResearchResult]
    summary: str
    timestamp: datetime


class ManualGenerationRequest(BaseModel):
    """Request model for manual generation"""
    tool_name: str = Field(..., description="Name of the tool")
    research_context: str = Field(..., description="Research data from Tavily")
    tool_description: Optional[str] = Field(None, description="Optional description from Google Vision")
    language: str = Field(default="en", description="Language for the manual")
    generate_audio: bool = Field(default=False, description="Whether to generate audio file")


class ManualGenerationResponse(BaseModel):
    """Response model for manual generation"""
    tool_name: str
    manual: str
    summary: str
    audio_file: Optional[str] = None 
    timestamp: datetime


class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    content: str
    timestamp: datetime
    language: str
    session_id: str

class LLMStructuredOutput(BaseModel):
    language: str = Field(description="The language of the response, chosen from en, fr, or pdg.")
    response: str = Field(description="The content of the response in the identified language.")