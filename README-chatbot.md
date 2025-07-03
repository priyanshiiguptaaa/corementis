# CoreMentis AI Chatbot

This component adds an AI-powered chatbot to the CoreMentis platform using the Groq LLM API. The chatbot provides students with quick answers to their questions with low latency and high accuracy.

## Features

- Floating chatbot button accessible throughout the student dashboard
- Voice input capability for hands-free interaction
- Persistent conversation history stored per user
- Low-latency responses using Groq's LLama 3.3 70B model
- Context-aware responses based on course material
- Ability to clear conversation history

## Setup Instructions

### Backend

1. Install the required Python packages:
   ```
   pip install flask flask-cors groq openai
   ```

2. Set your OpenAI API key in the chatbot_api.py file or use environment variables

3. Run the chatbot API server:
   ```
   python backend/chatbot_api.py
   ```

### Frontend

1. Make sure the React app is running:
   ```
   cd frontend
   npm start
   ```
The chatbot component is already integrated into the application. The floating chatbot button will appear on all authenticated pages.

## Usage

1. Log in to the CoreMentis platform
2. Click on the chat bubble icon in the bottom right corner of the screen
3. Type your question and press Enter or click the send button, OR
4. Click the microphone button and speak your question
5. The AI will respond with relevant information

## Technical Details

- The chatbot uses Groq's LLama 3.3 70B model for fast and accurate responses
- Voice input uses OpenAI's Whisper API for accurate speech-to-text conversion
- Conversation history is stored in JSON files on the server
- Each user has their own conversation history
- The chatbot interface is built with React and styled with Tailwind CSS
- The backend API is built with Flask

## Customization

You can customize the chatbot by modifying the following files:

- `backend/chatbot_api.py` - Backend API and model configuration
- `frontend/src/components/student/ChatbotButton.js` - Frontend UI and interaction logic
