"""
Configuration management for Toolify
Loads environment variables and LangChain models.
Implements Gemini API key rotation logic.

"""

import os
from functools import lru_cache
from dotenv import load_dotenv
import time
import logging
from typing import List, Optional
from google import genai
from google.genai import types
from langchain_google_genai import ChatGoogleGenerativeAI
from supabase import create_client, Client

# Load variables from .env file into environment
load_dotenv()


class Settings:
    """Application settings loaded from environment variables"""

    # API Keys
    # API Keys
    google_api_key: str = os.getenv("GOOGLE_API_KEY")
    google_api_keys: str = os.getenv("GOOGLE_API_KEYS") # Comma-separated list of keys
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
    
    @property
    def api_keys_list(self):
        """Returns a list of Google API keys."""
        if self.google_api_keys:
             return [key.strip() for key in self.google_api_keys.split(",") if key.strip()]
        if self.google_api_key:
             return [self.google_api_key]
        return []

settings = Settings()


# --- Gemini Key Rotation Logic ---

logger = logging.getLogger("gemini-rotator")

class GeminiKeyManager:
    """Singleton to manage Gemini API keys and rotation."""
    _instance = None

    def __new__(cls, api_keys: List[str]):
        if cls._instance is None:
            cls._instance = super(GeminiKeyManager, cls).__new__(cls)
            cls._instance.api_keys = api_keys
            cls._instance.current_index = 0
            cls._instance.disabled_until = {} # index -> timestamp
            cls._instance.cooldown_seconds = 60
        return cls._instance

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            # Initialize with keys from settings
            cls(settings.api_keys_list)
        return cls._instance

    def get_current_key(self) -> str:
        """Returns the current active key."""
        if not self.api_keys:
             raise ValueError("No Google API keys configured.")
        
        # Check if current key is valid
        if self._is_key_disabled(self.current_index):
             # Try to find a valid key
             for i in range(len(self.api_keys)):
                 if not self._is_key_disabled(i):
                     self.current_index = i
                     return self.api_keys[i]
             
             # All keys disabled
             wait_time = min(t - time.time() for t in self.disabled_until.values()) if self.disabled_until else 10
             raise RuntimeError(f"All {len(self.api_keys)} API keys are rate-limited. Retry in {wait_time:.1f}s")
        
        return self.api_keys[self.current_index]

    def _is_key_disabled(self, index: int) -> bool:
        if index in self.disabled_until:
             if time.time() > self.disabled_until[index]:
                 del self.disabled_until[index]
                 return False
             return True
        return False

    def rotate_key(self):
        """Marks current key as disabled and rotates to next."""
        logger.warning(f"Rate limit hit on key index {self.current_index}. Rotating...")
        self.disabled_until[self.current_index] = time.time() + self.cooldown_seconds
        
        # Advance index
        self.current_index = (self.current_index + 1) % len(self.api_keys)

key_manager = GeminiKeyManager(settings.api_keys_list)


class RotatableClient:
    """
    A wrapper around google.genai.Client that rotates API keys on rate limit errors.
    """
    def __init__(self):
        self.manager = GeminiKeyManager.get_instance()
        # We don't cache the client instance per key here aggressively to keep it simple,
        # or we can. For SDK usage, instantiating Client is cheap.
    
    def _get_client(self):
        api_key = self.manager.get_current_key()
        return genai.Client(api_key=api_key)

    @property
    def files(self):
        """Expose files property to mimic genai.Client"""
        return self._get_client().files
        
    @property
    def models(self):
         """Expose models property that wraps generate_content"""
         return _RotatableModels(self)

class _RotatableModels:
    """Helper to intercept model calls"""
    def __init__(self, parent: RotatableClient):
        self.parent = parent
        
    def generate_content(self, model: str, contents, config: Optional[types.GenerateContentConfig] = None):
        max_attempts = len(self.parent.manager.api_keys) * 2
        
        for _ in range(max_attempts):
            client = self.parent._get_client()
            try:
                return client.models.generate_content(
                    model=model,
                    contents=contents,
                    config=config
                )
            except Exception as e:
                error_str = str(e).lower()
                if "429" in error_str or "resource_exhausted" in error_str:
                    print(f"Hit 429/Exhausted. Rotating key.")
                    self.parent.manager.rotate_key()
                    continue
                raise e
        raise RuntimeError("Max retries exceeded for rate limits.")

# Initialize global rotatable client
gemini_client = RotatableClient()


@lru_cache()
def load_google_llm():
    """
    Load Google Gemini LLM with LangChain
    Cached to avoid recreating on every request
    """
    return ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=key_manager.get_current_key(),
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
        google_api_key=key_manager.get_current_key(),
        temperature=0.5,
        max_output_tokens=settings.max_tokens,
    )


# Supabase Client Initialization
# Supabase Admin Client (Bypasses RLS)
supabase: Client = create_client(settings.supabase_url, settings.supabase_service_key)