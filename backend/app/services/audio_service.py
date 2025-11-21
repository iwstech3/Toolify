import os
from gtts import gTTS
from datetime import datetime


class AudioService:
    """Simple service for generating audio from text using gTTS"""
    
    def __init__(self):
        # Create audio directory if it doesn't exist
        if not os.path.exists("audio"):
            os.makedirs("audio")
    
    def text_to_audio(self, text, tool_name, language="en"):
        """
        Convert text to audio and save to file
        
        Args:
            text: Text to convert
            tool_name: Name of the tool (for filename)
            language: Language code (default: 'en')
            
        Returns:
            Path to saved audio file
        """
        try:
            # Create filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_name = "".join(c if c.isalnum() else "_" for c in tool_name)
            filename = f"{safe_name}_{timestamp}.mp3"
            filepath = os.path.join("audio", filename)
            
            # Generate and save audio
            tts = gTTS(text=text, lang=language)
            tts.save(filepath)
            
            return filepath
            
        except Exception as e:
            raise Exception(f"Audio generation failed: {str(e)}")


# Create instance
audio_service = AudioService()