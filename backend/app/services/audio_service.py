import os
from gtts import gTTS
from datetime import datetime


class AudioService:
    """Simple service for generating audio from text using gTTS"""
    
    def __init__(self):
        #, Create audio directory if it doesn't exist
        if not os.path.exists("audio"):
            os.makedirs("audio")
    
    def generate_audio(self, text, tool_name, language="en"):
        """Generate audio file from text"""
        try:
            print(f"🎵 Starting audio generation for: {tool_name}")
            print(f"   Text length: {len(text)} characters")
            print(f"   Language: {language}")
            
            # Create filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_name = "".join(c if c.isalnum() else "_" for c in tool_name)
            filename = f"{safe_name}_manual_{timestamp}.mp3"
            filepath = os.path.join("audio", filename)
            
            print(f"   Filepath: {filepath}")
            
            # Generate audio
            tts = gTTS(text=text, lang=language)
            tts.save(filepath)
            
            print(f"✅ Audio saved successfully: {filepath}")
            return filepath
            
        except Exception as e:
            print(f"❌ Audio generation error: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Audio generation error: {str(e)}")
    
    def generate_summary_audio(self, summary, tool_name, language="en"):
        """Generate audio for summary only"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_name = "".join(c if c.isalnum() else "_" for c in tool_name)
            filename = f"{safe_name}_summary_{timestamp}.mp3"
            filepath = os.path.join("audio", filename)
            
            tts = gTTS(text=summary, lang=language, tld='ng')
            tts.save(filepath)
            
            return filepath
            
        except Exception as e:
            raise Exception(f"Summary audio error: {str(e)}")


audio_service = AudioService()