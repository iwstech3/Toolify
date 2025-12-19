import os
import tempfile
import requests
import google.generativeai as genai
from datetime import datetime
from app.config import settings

# Configure Gemini
genai.configure(api_key=settings.google_api_key)

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

        Args:
            audio_bytes: The audio file content.
            mime_type: The mime type of the audio file.

        Returns:
            The transcribed text.
        """
        temp_audio_path = None
        try:
            model = genai.GenerativeModel(settings.gemini_model)
            
            # Determine extension from mime_type
            ext = ".mp3"
            if "wav" in mime_type:
                ext = ".wav"
            elif "ogg" in mime_type:
                ext = ".ogg"
            elif "m4a" in mime_type or "mp4" in mime_type:
                ext = ".m4a"
            elif "aac" in mime_type:
                ext = ".aac"
            elif "webm" in mime_type:
                ext = ".webm"
            
            # Create a temporary file to store the audio
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_audio:
                temp_audio.write(audio_bytes)
                temp_audio_path = temp_audio.name

            # Upload the file to Gemini
            uploaded_file = genai.upload_file(temp_audio_path, mime_type=mime_type)
            
            prompt = "Transcribe the following audio exactly as spoken. Do not translate. Return only the transcription."
            
            response = model.generate_content([prompt, uploaded_file])
            
            # Cleanup: Delete the file from Gemini after use (optional but good practice)
            # genai.delete_file(uploaded_file.name) 
            
            return response.text.strip()
            
        except Exception as e:

            return ""
        finally:
            # Clean up local temp file
            if temp_audio_path and os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)

audio_service = AudioService()
