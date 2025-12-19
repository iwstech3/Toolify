"""
Configuration management for Toolify
Loads environment variables and LangChain models
"""

import os
from functools import lru_cache
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from supabase import create_client, Client

# Load variables from .env file into environment
load_dotenv()


class Settings:
    """Application settings loaded from environment variables"""

    # API Keys
    google_api_key: str = os.getenv("GOOGLE_API_KEY")
    tavily_api_key: str = os.getenv("TAVILY_API_KEY", "DUMMY_TAVILY_KEY")
    supabase_url: str = os.environ.get("SUPABASE_URL")
    supabase_service_key: str = os.environ.get("SUPABASE_SERVICE_KEY")
    supabase_anon_key: str = os.environ.get("SUPABASE_ANON_KEY")
    yarngpt_api_key: str = os.getenv("YARNGPT_API_KEY")

    # Server settings
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", 8000))
    cors_origins: str = os.getenv("CORS_ORIGINS","http://localhost:3000,https://toolify-gpt.vercel.app")

    # AI Model settings
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    temperature: float = float(os.getenv("TEMPERATURE", 0.7))
    max_tokens: int = int(os.getenv("MAX_TOKENS", 2048))

    # File upload settings
    max_file_size: int = int(os.getenv("MAX_FILE_SIZE", 10 * 1024 * 1024))  # 10MB

    @property
    def cors_origins_list(self):
        """Convert comma-separated CORS origins to list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]

settings = Settings()

@lru_cache()
def load_google_llm():
    """
    Load Google Gemini LLM with LangChain
    Cached to avoid recreating on every request
    """
    return ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.google_api_key,
        temperature=settings.temperature,
        max_output_tokens=settings.max_tokens,
    )


@lru_cache()
def load_google_vision_llm():
    """
    Load Google Gemini with vision capabilities
    """
    return ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.google_api_key,
        temperature=0.5,
        max_output_tokens=settings.max_tokens,
    )

# Supabase Client Initialization
# Supabase Admin Client (Bypasses RLS)
supabase: Client = create_client(settings.supabase_url, settings.supabase_service_key)