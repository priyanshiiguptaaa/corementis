import os
import time
import numpy as np
import torch
from io import BytesIO
import base64

# Global variables for TTS availability
tts_available = False
pyttsx3_available = False

# Try to import TTS libraries with fallbacks
try:
    from TTS.api import TTS
    tts_available = True
except ImportError:
    print("TTS library not found. Installing minimal dependencies for pyttsx3 fallback...")
    tts_available = False

# Fallback to pyttsx3 if TTS is not available
if not tts_available:
    try:
        import pyttsx3
        pyttsx3_available = True
    except ImportError:
        print("pyttsx3 not available. Text-to-speech functionality will be limited.")
        pyttsx3_available = False

class TextToSpeech:
    def __init__(self):
        self.tts_engine = None
        self.model_name = "None"
        self.initialized = False
        self.initialize()
    
    def initialize(self):
        """Initialize the TTS engine"""
        try:
            if tts_available:
                # Try to use Mozilla TTS with a simpler model
                try:
                    # Try a simpler model that might be more reliable
                    self.tts_engine = TTS("tts_models/en/ljspeech/fast_pitch")
                    self.model_name = "Mozilla TTS (FastPitch)"
                    self.initialized = True
                    print("Initialized Mozilla TTS engine with FastPitch model")
                except Exception as e:
                    print(f"Failed to initialize Mozilla TTS: {e}")
                    # If Mozilla TTS fails, we'll try pyttsx3 below
            
            # If Mozilla TTS is not available or failed, try pyttsx3
            if not self.initialized and pyttsx3_available:
                try:
                    self.tts_engine = pyttsx3.init()
                    self.model_name = "pyttsx3 (System Voices)"
                    self.initialized = True
                    print("Initialized pyttsx3 engine")
                except Exception as e:
                    print(f"Failed to initialize pyttsx3: {e}")
            
            if not self.initialized:
                print("No TTS engines available or initialization failed")
                self.initialized = False
        except Exception as e:
            print(f"Error initializing TTS engine: {e}")
            self.initialized = False
        
        # This section is now redundant as we already tried pyttsx3 above
        # Removed duplicate pyttsx3 initialization
        
        if not self.initialized:
            print("WARNING: No TTS engine could be initialized. Text-to-speech will not be available.")
    
    def text_to_speech(self, text):
        """Convert text to speech and return audio data as base64"""
        if not self.initialized or not self.tts_engine:
            return None, "TTS engine not initialized"
        
        try:
            start_time = time.time()
            
            # Process with the appropriate TTS engine
            if tts_available and isinstance(self.tts_engine, TTS):
                # Mozilla TTS
                wav_file = BytesIO()
                self.tts_engine.tts_to_file(text=text, file_path=wav_file)
                audio_data = wav_file.getvalue()
            elif pyttsx3_available and self.tts_engine:
                # pyttsx3
                temp_file = "temp_tts_output.wav"
                self.tts_engine.save_to_file(text, temp_file)
                self.tts_engine.runAndWait()
                
                with open(temp_file, "rb") as f:
                    audio_data = f.read()
                    
                # Clean up temp file
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            else:
                return None, "No TTS engine available"
            
            # Convert to base64
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            processing_time = time.time() - start_time
            print(f"Text-to-speech conversion completed in {processing_time:.2f} seconds")
            
            return audio_base64, None
        except Exception as e:
            error_msg = f"Error in text-to-speech conversion: {str(e)}"
            print(error_msg)
            return None, error_msg
    
    def get_status(self):
        """Get the status of the TTS engine"""
        return {
            "initialized": self.initialized,
            "model_name": self.model_name
        }

# Singleton instance
tts_engine = TextToSpeech()
