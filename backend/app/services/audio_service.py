
import os
import tempfile
import google.generativeai as genai
from gtts import gTTS
from datetime import datetime
from app.config import settings

# Configure Gemini
genai.configure(api_key=settings.google_api_key)

class AudioService:
    """Service for handling audio operations: TTS and STT"""
    
    def __init__(self):
        # Create audio directory if it doesn't exist
        if not os.path.exists("audio"):
            os.makedirs("audio")
    
    def generate_audio(self, text, tool_name, language="en", tld="ng"):
        """Generate audio file from text"""
        try:
            print(f"🎵 Starting audio generation for: {tool_name}")
            print(f"   Text length: {len(text)} characters")
            print(f"   Language: {language}")
            print(f"   TLD: {tld}")
            
            # Create filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_name = "".join(c if c.isalnum() else "_" for c in tool_name)
            filename = f"{safe_name}_manual_{timestamp}.mp3"
            filepath = os.path.join("audio", filename)
            
            print(f"   Filepath: {filepath}")
            
            # Generate audio
            tts = gTTS(text=text, lang=language, tld=tld)
            tts.save(filepath)
            
            print(f"✅ Audio saved successfully: {filepath}")
            return filepath
            
        except Exception as e:
            print(f"❌ Audio generation error: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Audio generation error: {str(e)}")
    
    def generate_summary_audio(self, summary, tool_name, language="en", tld="ng"):
        """Generate audio for summary only"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_name = "".join(c if c.isalnum() else "_" for c in tool_name)
            filename = f"{safe_name}_summary_{timestamp}.mp3"
            filepath = os.path.join("audio", filename)
            
            tts = gTTS(text=summary, lang=language, tld=tld)
            tts.save(filepath)
            
            return filepath
            
        except Exception as e:
            raise Exception(f"Summary audio error: {str(e)}")

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
            print(f"Error transcribing audio: {e}")
            return ""
        finally:
            # Clean up local temp file
            if temp_audio_path and os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)

audio_service = AudioService()

