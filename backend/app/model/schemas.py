from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


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
    scan_id: Optional[str] = None


class ManualGenerationRequest(BaseModel):
    """Request model for manual generation"""
    tool_name: Optional[str] = Field(None, description="Name of the tool")
    tool_description: Optional[str] = Field(None, description="Optional description from Google Vision")
    language: str = Field(default="en", description="Language for the manual")
    generate_audio: bool = Field(default=False, description="Whether to generate audio file")


class ManualGenerationResponse(BaseModel):
    """Response model for manual generation"""
    tool_name: str
    manual: str
    summary: str
    audio_files: Optional[dict] = None 
    timestamp: datetime


class ChatResponse(BaseModel):
    """Response model for chat"""
    content: str
    timestamp: datetime
    language: str
    session_id: str


class LLMStructuredOutput(BaseModel):
    """Structured output from LLM for language-aware responses"""
    language: str = Field(description="The language of the response, chosen from en, fr, or pdg.")
    response: str = Field(description="The content of the response in the identified language.")


# Auth Models
class TokenResponse(BaseModel):
    """Response model for authentication tokens"""
    access_token: str
    token_type: str = "bearer"


class TestTokenRequest(BaseModel):
    """Request model for test token generation"""
    email: str = "test@toolify.local"
    password: str = "testpassword123"
    full_name: Optional[str] = "Test User"