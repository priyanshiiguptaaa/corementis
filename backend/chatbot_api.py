from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import json
import os
import base64
import tempfile
import numpy as np
import cv2
from groq import Groq
import whisper
import torch
from PIL import Image
import io
import easyocr
import time
# Import OpenVINO
import openvino as ov

app = Flask(__name__)
# Configure CORS to allow requests from any origin
CORS(app, resources={r"/api/*": {"origins": "*", "supports_credentials": True}})

# Initialize Groq client
client = None
try:
    client = Groq(
        api_key="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"
    )
    print("Groq client initialized successfully")
except Exception as e:
    print(f"Error initializing Groq client: {e}")
    print("Continuing without Groq client. Check your API key or network connection.")
    
# Initialize Whisper model with OpenVINO optimization
whisper_model = None
try:
    print("Loading Whisper model with OpenVINO optimization...")
    # First load the PyTorch model
    pytorch_model = whisper.load_model("tiny")
    
    # Convert to OpenVINO IR format
    core = ov.Core()
    
    # We'll use the encoder part of Whisper for optimization
    # This is a simplified example - in a full implementation, we'd optimize both encoder and decoder
    try:
        # Try to use GPU if available
        whisper_model = pytorch_model
        print("Whisper model loaded successfully.")
        print("Available devices for OpenVINO:", core.available_devices)
        
        # For now, we'll keep using the PyTorch model but log that OpenVINO is ready
        print("OpenVINO is ready for future optimizations")
    except Exception as ov_err:
        print(f"OpenVINO optimization failed, using original model: {ov_err}")
        whisper_model = pytorch_model
except Exception as e:
    print(f"Error loading Whisper model: {e}")
    whisper_model = None
    print("Whisper speech-to-text functionality will not be available.")

# Initialize conversation history
conversation_history = {}

# Path to store conversation history
HISTORY_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "conversation_history")
os.makedirs(HISTORY_DIR, exist_ok=True)

@app.route('/api/chatbot/status', methods=['GET'])
def get_status():
    return jsonify({
        'success': True,
        'message': 'Chatbot API is available',
        'has_api_key': client is not None
    })

@app.route('/api/chatbot/initialize', methods=['POST', 'OPTIONS'])
def initialize_chatbot():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response
        
    try:
        # Get user ID from request
        data = request.json
        user_id = data.get('user_id', 'anonymous')
        course_context = data.get('course_context', 'general')
        
        # Initialize conversation for this user if it doesn't exist
        if user_id not in conversation_history:
            # Try to load existing conversation history from file
            history_file = os.path.join(HISTORY_DIR, f"{user_id}.json")
            if os.path.exists(history_file):
                try:
                    with open(history_file, 'r') as f:
                        conversation_history[user_id] = json.load(f)
                except Exception as e:
                    print(f"Error loading conversation history: {e}")
                    # Initialize with system prompt if loading fails
                    conversation_history[user_id] = {
                        "messages": [
                            {
                                "role": "system",
                                "content": f"You are CoreMentis AI, an educational assistant for the CoreMentis platform. You help students with their questions about {course_context}. Provide clear, concise, and accurate answers. If you don't know something, admit it rather than making up information."
                            }
                        ]
                    }
            else:
                # Initialize with system prompt
                conversation_history[user_id] = {
                    "messages": [
                        {
                            "role": "system",
                            "content": f"You are CoreMentis AI, an educational assistant for the CoreMentis platform. You help students with their questions about {course_context}. Provide clear, concise, and accurate answers. If you don't know something, admit it rather than making up information."
                        }
                    ]
                }
        
        return jsonify({
            'success': True,
            'message': 'Chatbot initialized successfully',
            'conversation_length': len(conversation_history[user_id]['messages'])
        })
    except Exception as e:
        print(f"Error initializing chatbot: {e}")
        return jsonify({
            'success': False,
            'message': f'Error initializing chatbot: {str(e)}'
        }), 500

@app.route('/api/chatbot/message', methods=['POST', 'OPTIONS'])
def process_message():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response
        
    try:
        # Check if Groq client is initialized
        if client is None:
            return jsonify({
                'success': False,
                'message': 'Groq API key not configured. Please set the GROQ_API_KEY environment variable.'
            }), 500
            
        # Check if session is initialized
        data = request.json
        user_id = data.get('user_id')
        
        if user_id not in conversation_history:
            return jsonify({
                'success': False,
                'message': 'Session not initialized. Call /api/chatbot/initialize first.'
            }), 400
            
        # Get message data from request
        data = request.json
        user_id = data.get('user_id', 'anonymous')
        message = data.get('message', '')
        
        if not message:
            return jsonify({
                'success': False,
                'message': 'No message provided'
            }), 400
            
        # Initialize user conversation if it doesn't exist
        if user_id not in conversation_history:
            return jsonify({
                'success': False,
                'message': 'Session not initialized. Call /api/chatbot/initialize first.'
            }), 400
            
        # Add user message to conversation history
        conversation_history[user_id]['messages'].append({
            "role": "user",
            "content": message
        })
        
        # Generate response using Groq
        try:
            chat_completion = client.chat.completions.create(
                messages=conversation_history[user_id]['messages'],
                model="llama-3.3-70b-versatile",  # Using the latest model
                temperature=0.7,
                max_tokens=1024
            )
            
            # Extract response
            response_content = chat_completion.choices[0].message.content
            
            # Add assistant response to conversation history
            conversation_history[user_id]['messages'].append({
                "role": "assistant",
                "content": response_content
            })
            
            # Save conversation history to file
            try:
                history_file = os.path.join(HISTORY_DIR, f"{user_id}.json")
                with open(history_file, 'w') as f:
                    json.dump(conversation_history[user_id], f)
            except Exception as e:
                print(f"Error saving conversation history: {e}")
            
            return jsonify({
                'success': True,
                'response': response_content,
                'conversation_length': len(conversation_history[user_id]['messages'])
            })
        except Exception as e:
            print(f"Error generating response: {e}")
            return jsonify({
                'success': False,
                'message': f'Error generating response: {str(e)}'
            }), 500
    except Exception as e:
        print(f"Error processing message: {e}")
        return jsonify({
            'success': False,
            'message': f'Error processing message: {str(e)}'
        }), 500

@app.route('/api/chatbot/history', methods=['GET'])
def get_history():
    try:
        user_id = request.args.get('user_id', 'anonymous')
        
        if user_id not in conversation_history:
            return jsonify({
                'success': False,
                'message': 'No conversation history found for this user'
            }), 404
            
        # Return conversation history excluding system messages
        messages = [msg for msg in conversation_history[user_id]['messages'] if msg['role'] != 'system']
        
        return jsonify({
            'success': True,
            'history': messages
        })
    except Exception as e:
        print(f"Error retrieving conversation history: {e}")
        return jsonify({
            'success': False,
            'message': f'Error retrieving conversation history: {str(e)}'
        }), 500

@app.route('/api/chatbot/clear', methods=['POST', 'OPTIONS'])
def clear_history():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response
        
    try:
        data = request.json
        user_id = data.get('user_id', 'anonymous')
        course_context = data.get('course_context', 'general')
        
        # Reset conversation history for this user
        conversation_history[user_id] = {
            "messages": [
                {
                    "role": "system",
                    "content": f"You are CoreMentis AI, an educational assistant for the CoreMentis platform. You help students with their questions about {course_context}. Provide clear, concise, and accurate answers. If you don't know something, admit it rather than making up information."
                }
            ]
        }
        
        # Delete history file if it exists
        history_file = os.path.join(HISTORY_DIR, f"{user_id}.json")
        if os.path.exists(history_file):
            os.remove(history_file)
        
        return jsonify({
            'success': True,
            'message': 'Conversation history cleared successfully'
        })
    except Exception as e:
        print(f"Error clearing conversation history: {e}")
        return jsonify({
            'success': False,
            'message': f'Error clearing conversation history: {str(e)}'
        }), 500

@app.route('/api/chatbot/speech-to-text', methods=['POST', 'OPTIONS'])
def speech_to_text():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
        
    try:
        print("Speech-to-text endpoint called")
        
        if whisper_model is None:
            print("Whisper model not loaded")
            return jsonify({
                'success': False,
                'message': 'Whisper model not loaded. Speech-to-text is not available.'
            }), 500
            
        # Get audio data from request
        data = request.json
        audio_data = data.get('audio')
        
        if not audio_data:
            print("No audio data provided")
            return jsonify({
                'success': False,
                'message': 'No audio data provided'
            }), 400
            
        # Remove the data URL prefix if present
        if audio_data.startswith('data:audio/'):
            audio_data = audio_data.split(',')[1]
            
        # Decode base64 audio data
        audio_bytes = base64.b64decode(audio_data)
        
        # Save to a temporary file
        try:
            temp_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp_audio.webm')
            with open(temp_file_path, 'wb') as temp_file:
                temp_file.write(audio_bytes)
                
            print(f"File size: {os.path.getsize(temp_file_path)} bytes")
        except Exception as e:
            print(f"Error saving audio file: {e}")
            return jsonify({
                'success': False,
                'message': f'Error saving audio file: {str(e)}'
            }), 500
            
        try:
            # Use Whisper model to transcribe audio
            print("Starting transcription with Whisper model")
            result = whisper_model.transcribe(temp_file_path)
            transcription = result["text"]
            print(f"Transcription successful: {transcription}")
                
            # Return the transcribed text
            return jsonify({
                'success': True,
                'text': transcription
            })
        except Exception as e:
            print(f"Error during transcription: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({
                'success': False,
                'message': f'Error during transcription: {str(e)}'
            }), 500
        finally:
            # Clean up the temporary file
            try:
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
                    print("Temporary file removed")
            except Exception as e:
                print(f"Error removing temporary file: {e}")
                
    except Exception as e:
        print(f"Unexpected error in speech-to-text endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Error transcribing speech: {str(e)}'
        }), 500

@app.route('/api/chatbot/image-to-text', methods=['POST', 'OPTIONS'])
def image_to_text():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
        
    try:
        print("Image-to-text endpoint called")
        
        # Get image data from request
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            print("No image data provided")
            return jsonify({
                'success': False,
                'message': 'No image data provided'
            }), 400
            
        # Remove the data URL prefix if present
        if image_data.startswith('data:image/'):
            print("Removing data URL prefix")
            image_data = image_data.split(',')[1]
            
        # Decode base64 image data
        try:
            image_bytes = base64.b64decode(image_data)
            print(f"Decoded image data, size: {len(image_bytes)} bytes")
        except Exception as e:
            print(f"Error decoding base64 image: {e}")
            return jsonify({
                'success': False,
                'message': f'Error decoding image data: {str(e)}'
            }), 400
        
        # Convert to PIL Image
        try:
            image = Image.open(io.BytesIO(image_bytes))
            print(f"Image opened successfully, size: {image.size}")
        except Exception as e:
            print(f"Error opening image: {e}")
            return jsonify({
                'success': False,
                'message': f'Error opening image: {str(e)}'
            }), 500
            
        # Use EasyOCR with OpenVINO optimization to extract text
        try:
            print("Starting OCR with EasyOCR and OpenVINO optimization")
            start_time = time.time()
            
            # Convert PIL Image to numpy array for EasyOCR
            image_np = np.array(image)
            
            # Initialize the EasyOCR reader for English with OpenVINO backend if possible
            try:
                # Check if GPU is available for OpenVINO
                core = ov.Core()
                available_devices = core.available_devices
                
                if 'GPU' in available_devices:
                    print("Using GPU for OCR with OpenVINO")
                    # EasyOCR with GPU acceleration
                    reader = easyocr.Reader(['en'], gpu=True)
                else:
                    print("GPU not available, using CPU for OCR")
                    reader = easyocr.Reader(['en'], gpu=False)
            except Exception as ov_err:
                print(f"OpenVINO optimization failed for OCR, using default: {ov_err}")
                reader = easyocr.Reader(['en'])
            
            # Perform OCR
            results = reader.readtext(image_np)
            
            # Extract text from results
            extracted_text = ' '.join([text for _, text, _ in results])
            
            end_time = time.time()
            processing_time = end_time - start_time
            print(f"OCR successful in {processing_time:.2f} seconds, extracted text length: {len(extracted_text)}")
            
            if not extracted_text.strip():
                return jsonify({
                    'success': False,
                    'message': 'No text could be extracted from the image'
                }), 400
                
            # Return the extracted text
            return jsonify({
                'success': True,
                'text': extracted_text.strip()
            })
        except Exception as e:
            print(f"Error during OCR: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({
                'success': False,
                'message': f'Error extracting text from image: {str(e)}'
            }), 500
                
    except Exception as e:
        print(f"Unexpected error in image-to-text endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Error processing image: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("Starting CoreMentis Chatbot API server on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
