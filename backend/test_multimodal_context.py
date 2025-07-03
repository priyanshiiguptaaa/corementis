import requests
import json
import base64
import os
import time

# Test configuration
BASE_URL = "http://localhost:5000"
USER_ID = "test_multimodal_user"

def test_initialize_chatbot():
    """Test initializing the chatbot"""
    response = requests.post(
        f"{BASE_URL}/api/chatbot/initialize",
        json={"user_id": USER_ID}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    print("✅ Chatbot initialized successfully")

def test_text_message():
    """Test sending a text message"""
    response = requests.post(
        f"{BASE_URL}/api/chatbot/message",
        json={
            "user_id": USER_ID,
            "message": "Tell me about the solar system."
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    print("✅ Text message processed successfully")
    print(f"Response: {data['response'][:100]}...")
    return data['response']

def test_speech_to_text_context(audio_file_path):
    """Test speech-to-text with context integration"""
    # Read audio file and convert to base64
    with open(audio_file_path, "rb") as audio_file:
        audio_bytes = audio_file.read()
        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
    
    # Send speech-to-text request
    response = requests.post(
        f"{BASE_URL}/api/chatbot/speech-to-text",
        json={
            "user_id": USER_ID,
            "audio": audio_base64
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    print("✅ Speech-to-text processed successfully")
    print(f"Transcription: {data['text']}")
    
    # Now send a follow-up message to test context integration
    response = requests.post(
        f"{BASE_URL}/api/chatbot/message",
        json={
            "user_id": USER_ID,
            "message": "Can you elaborate on what I just asked about?"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    print("✅ Follow-up message processed successfully")
    print(f"Response: {data['response'][:100]}...")
    return data['response']

def test_image_to_text_context(image_file_path):
    """Test image-to-text with context integration"""
    # Read image file and convert to base64
    with open(image_file_path, "rb") as image_file:
        image_bytes = image_file.read()
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")
    
    # Send image-to-text request
    response = requests.post(
        f"{BASE_URL}/api/chatbot/image-to-text",
        json={
            "user_id": USER_ID,
            "image": image_base64
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    print("✅ Image-to-text processed successfully")
    print(f"Extracted text: {data['text']}")
    
    # Now send a follow-up message to test context integration
    response = requests.post(
        f"{BASE_URL}/api/chatbot/message",
        json={
            "user_id": USER_ID,
            "message": "Can you explain the text from the image I just sent?"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    print("✅ Follow-up message processed successfully")
    print(f"Response: {data['response'][:100]}...")
    return data['response']

def test_context_summary():
    """Test getting context summary with multimodal inputs"""
    response = requests.get(
        f"{BASE_URL}/api/chatbot/context-summary",
        params={"user_id": USER_ID}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    print("✅ Context summary retrieved successfully")
    print(f"Context info: {json.dumps(data['context_info'], indent=2)}")
    
    # Verify multimodal inputs are tracked
    assert "multimodal_inputs" in data["context_info"]
    print(f"Multimodal inputs detected: {data['context_info']['multimodal_inputs']}")
    return data['context_info']

def test_clear_history():
    """Test clearing conversation history"""
    response = requests.post(
        f"{BASE_URL}/api/chatbot/clear",
        json={"user_id": USER_ID}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    print("✅ Conversation history cleared successfully")

def main():
    print("\n🔍 Testing Multimodal Context Integration")
    print("=====================================\n")
    
    # Initialize chatbot
    test_initialize_chatbot()
    
    # Test text message
    print("\n📝 Testing text message...")
    test_text_message()
    
    # Test speech-to-text context integration
    # Note: You need to provide a valid audio file path
    print("\n🎤 Testing speech-to-text context integration...")
    print("Skipping actual test as audio file is not provided.")
    print("To test, uncomment the following line and provide a valid audio file path:")
    print('# test_speech_to_text_context("path/to/audio.wav")')
    
    # Test image-to-text context integration
    # Note: You need to provide a valid image file path
    print("\n📷 Testing image-to-text context integration...")
    print("Skipping actual test as image file is not provided.")
    print("To test, uncomment the following line and provide a valid image file path:")
    print('# test_image_to_text_context("path/to/image.jpg")')
    
    # Test context summary
    print("\n📊 Testing context summary...")
    test_context_summary()
    
    # Clear history
    print("\n🧹 Cleaning up...")
    test_clear_history()
    
    print("\n✨ All tests completed successfully!")

if __name__ == "__main__":
    main()
