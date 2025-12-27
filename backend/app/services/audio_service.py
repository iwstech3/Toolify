import os
import tempfile
import requests
from google import genai
from datetime import datetime
from datetime import datetime
from app.config import settings, gemini_client

# Initialize Gemini Client
client = gemini_client


# YarnGPT API Configuration
YARNGPT_API_URL = "https://yarngpt.ai/api/v1/tts"

class AudioService:
    """Service for handling audio operations: TTS and STT"""
    
    def __init__(self):
        pass
    
    def clean_text_for_tts(self, text: str) -> str:
        """
        Cleans text for TTS generation by removing markdown and normalizing whitespace.
        """
        import re
        
        # Remove bold/italic markers (* or _)
        text = re.sub(r'[\*_]{1,3}', '', text)
        
        # Remove headers (### Title -> Title)
        text = re.sub(r'^#+\s*', '', text, flags=re.MULTILINE)
        
        # Remove links ([text](url) -> text)
        text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
        
        # Remove code blocks (```code``` -> code)
        text = re.sub(r'```[\w]*', '', text)
        
        # Remove inline code (`code` -> code)
        text = re.sub(r'`', '', text)
        
        # Remove list bullets (* Item -> Item, - Item -> Item)
        text = re.sub(r'^[\*\-]\s+', '', text, flags=re.MULTILINE)
        
        # Normalize newlines: replace literal \n with actual newline if needed
        text = text.replace('\\n', '\n')
        
        # Collapse multiple newlines to max 2
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        return text.strip()

    def generate_audio(self, text, tool_name, user_id):
        """
        Generate audio file from text using YarnGPT and upload to Supabase.
        """
        try:
            # Clean text before processing
            text = self.clean_text_for_tts(text)
            
            # Prepare headers
            if not settings.yarngpt_api_key:
                pass
            
            headers = {
                "Authorization": f"Bearer {settings.yarngpt_api_key}",
                "Content-Type": "application/json"
            }

            # Prepare request to YarnGPT
            payload = {
                "text": text,
                "voice": "Idera", # Default voice
            }
            
            response = requests.post(YARNGPT_API_URL, json=payload, headers=headers, stream=True)
            
            if response.status_code != 200:
                raise Exception(f"YarnGPT API failed: {response.text}")
            
            # Create filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_name = "".join(c if c.isalnum() else "_" for c in tool_name)
            filename = f"{safe_name}_{timestamp}.mp3"
            
            # Stream to memory
            import io
            audio_buffer = io.BytesIO()
            for chunk in response.iter_content(chunk_size=8192):
                audio_buffer.write(chunk)
            
            audio_content = audio_buffer.getvalue()

            # Upload to Supabase Storage
            from app.config import supabase
            storage_path = f"{user_id}/{filename}"
            bucket_name = "tool-audio"
            
            supabase.storage.from_(bucket_name).upload(
                file=audio_content,
                path=storage_path,
                file_options={"content-type": "audio/mp3"}
            )
            
            # Get Public URL
            public_url = supabase.storage.from_(bucket_name).get_public_url(storage_path)
            
            return public_url
            
        except Exception as e:

            raise Exception(f"Audio generation error: {str(e)}")


    def transcribe_audio(self, audio_bytes: bytes, mime_type: str = "audio/mp3") -> str:
        """
        Transcribes audio using the Gemini API.
        Uses inline data for files < 15MB to bypass file upload/polling issues.
        """
        import logging
        logger = logging.getLogger(__name__)
        
        temp_audio_path = None
        uploaded_file_name = None
        
        try:
            audio_size = len(audio_bytes)
            if audio_size == 0:
                logger.error("[TRANSCRIBE] Audio bytes are empty")
                return ""
            
            # Clean mime_type
            base_mime_type = mime_type.split(';')[0].strip()
            prompt = "Transcribe the following audio exactly as spoken. Do not translate. Return only the transcription."
            
            # --- OPTION 1: Inline Data (for files < 15MB) ---
            if audio_size < 15 * 1024 * 1024:
                from google.genai import types
                
                max_gen_retries = 3
                response = None
                for attempt in range(max_gen_retries):
                    try:
                        response = client.models.generate_content(
                            model=settings.gemini_model,
                            contents=[
                                prompt,
                                types.Part.from_bytes(data=audio_bytes, mime_type=base_mime_type)
                            ]
                        )
                        break
                    except Exception as api_error:
                        if attempt == max_gen_retries - 1:
                            logger.error(f"[TRANSCRIBE] Inline generation failed after {max_gen_retries} attempts: {str(api_error)}")
                            break
                        time.sleep(2 ** attempt)
                
                if response:
                    return self._process_transcription_response(response)

            # --- OPTION 2: File Upload (Fallback or for files >= 15MB) ---
            ext = ".mp3"
            if "wav" in base_mime_type: ext = ".wav"
            elif "ogg" in base_mime_type: ext = ".ogg"
            elif "m4a" in base_mime_type or "mp4" in base_mime_type: ext = ".m4a"
            elif "aac" in base_mime_type: ext = ".aac"
            elif "webm" in base_mime_type: ext = ".webm"
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_audio:
                temp_audio.write(audio_bytes)
                temp_audio_path = temp_audio.name
            
            try:
                uploaded_file = client.files.upload(file=temp_audio_path)
                uploaded_file_name = uploaded_file.name
            except Exception as upload_error:
                logger.error(f"[TRANSCRIBE] File upload failed: {str(upload_error)}")
                raise
            
            import time
            max_wait = 60
            wait_time = 0
            poll_interval = 1
            
            while uploaded_file.state.name != "ACTIVE":
                if wait_time >= max_wait:
                    raise Exception(f"File processing timeout after {max_wait}s")
                
                time.sleep(poll_interval)
                wait_time += poll_interval
                
                max_retries = 3
                for attempt in range(max_retries):
                    try:
                        uploaded_file = client.files.get(name=uploaded_file.name)
                        break
                    except Exception as poll_error:
                        if attempt == max_retries - 1: raise
                        time.sleep(2 ** attempt)
            
            max_gen_retries = 3
            response = None
            for attempt in range(max_gen_retries):
                try:
                    response = client.models.generate_content(
                        model=settings.gemini_model,
                        contents=[prompt, uploaded_file]
                    )
                    break
                except Exception as api_error:
                    if attempt == max_gen_retries - 1: raise
                    time.sleep(2 ** attempt)
            
            if response:
                return self._process_transcription_response(response)
            return ""
            
        except Exception as e:
            logger.error(f"[TRANSCRIBE] Fatal error: {str(e)}")
            return ""
        finally:
            if uploaded_file_name:
                try: client.files.delete(name=uploaded_file_name)
                except: pass
            if temp_audio_path and os.path.exists(temp_audio_path):
                try: os.unlink(temp_audio_path)
                except: pass

    def _process_transcription_response(self, response) -> str:
        """Helper to extract text from Gemini response."""
        try:
            if hasattr(response, 'text') and response.text:
                return response.text.strip()
            if hasattr(response, 'candidates') and response.candidates:
                return response.candidates[0].content.parts[0].text.strip()
            return ""
        except Exception:
            return ""


audio_service = AudioService()
