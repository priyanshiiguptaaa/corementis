import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:5000"
USER_ID = "test_user_" + str(int(time.time()))
COURSE_CONTEXT = "general science"

def print_separator():
    print("\n" + "-" * 50 + "\n")

def test_context_management():
    print("Testing CoreMentis Chatbot Context Management")
    print_separator()
    
    # Step 1: Initialize the chatbot
    print("Step 1: Initializing chatbot session...")
    init_response = requests.post(
        f"{BASE_URL}/api/chatbot/initialize",
        json={"user_id": USER_ID, "course_context": COURSE_CONTEXT}
    )
    
    if init_response.status_code != 200:
        print(f"Error initializing chatbot: {init_response.text}")
        return
    
    print(f"Chatbot initialized successfully for user {USER_ID}")
    print_separator()
    
    # Step 2: Send a first message about a topic
    print("Step 2: Sending first message about photosynthesis...")
    first_message = "What is photosynthesis?"
    message_response = requests.post(
        f"{BASE_URL}/api/chatbot/message",
        json={"user_id": USER_ID, "message": first_message}
    )
    
    if message_response.status_code != 200:
        print(f"Error sending message: {message_response.text}")
        return
    
    first_response = message_response.json()
    print(f"User: {first_message}")
    print(f"AI: {first_response['message']}")
    print_separator()
    
    # Step 3: Send a follow-up message with context reference
    print("Step 3: Sending follow-up message with context reference...")
    second_message = "What are the key steps in this process?"
    message_response = requests.post(
        f"{BASE_URL}/api/chatbot/message",
        json={"user_id": USER_ID, "message": second_message}
    )
    
    if message_response.status_code != 200:
        print(f"Error sending message: {message_response.text}")
        return
    
    second_response = message_response.json()
    print(f"User: {second_message}")
    print(f"AI: {second_response['message']}")
    print_separator()
    
    # Step 4: Check context summary
    print("Step 4: Checking context summary...")
    context_response = requests.get(
        f"{BASE_URL}/api/chatbot/context-summary?user_id={USER_ID}"
    )
    
    if context_response.status_code != 200:
        print(f"Error getting context summary: {context_response.text}")
        return
    
    context_data = context_response.json()
    print("Context Summary:")
    print(json.dumps(context_data['context_info'], indent=2))
    print_separator()
    
    # Step 5: Change topic to test topic shift detection
    print("Step 5: Changing topic to test topic shift detection...")
    third_message = "Tell me about the water cycle instead."
    message_response = requests.post(
        f"{BASE_URL}/api/chatbot/message",
        json={"user_id": USER_ID, "message": third_message}
    )
    
    if message_response.status_code != 200:
        print(f"Error sending message: {message_response.text}")
        return
    
    third_response = message_response.json()
    print(f"User: {third_message}")
    print(f"AI: {third_response['message']}")
    print_separator()
    
    # Step 6: Check updated context summary after topic shift
    print("Step 6: Checking updated context summary after topic shift...")
    context_response = requests.get(
        f"{BASE_URL}/api/chatbot/context-summary?user_id={USER_ID}"
    )
    
    if context_response.status_code != 200:
        print(f"Error getting context summary: {context_response.text}")
        return
    
    context_data = context_response.json()
    print("Updated Context Summary:")
    print(json.dumps(context_data['context_info'], indent=2))
    print_separator()
    
    # Step 7: Clear conversation history
    print("Step 7: Clearing conversation history...")
    clear_response = requests.post(
        f"{BASE_URL}/api/chatbot/clear",
        json={"user_id": USER_ID, "course_context": COURSE_CONTEXT}
    )
    
    if clear_response.status_code != 200:
        print(f"Error clearing history: {clear_response.text}")
        return
    
    print("Conversation history cleared successfully")
    print_separator()
    
    print("Context management test completed successfully!")

if __name__ == "__main__":
    test_context_management()
