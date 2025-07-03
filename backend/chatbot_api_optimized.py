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
import openvino as ov

# Import our OpenVINO optimization module
from openvino_optimization import optimize_whisper_model, optimize_easyocr, measure_inference_time
# Import context management
from context_manager import ContextManager
# Import content scraper module
from content_scraper import search_content
# Import text-to-speech module
try:
    from text_to_speech import tts_engine
    tts_available = tts_engine.initialized
except ImportError:
    print("Text-to-speech module not available. TTS functionality will be disabled.")
    tts_available = False
except Exception as e:
    print(f"Error initializing text-to-speech module: {e}")
    tts_available = False

app = Flask(__name__)
# Configure CORS to allow requests from any origin with more specific settings
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Initialize Groq client
client = None
try:
    client = Groq(
        api_key=os.environ.get("GROQ_API_KEY", "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")
    )
    print("Groq client initialized successfully")
except Exception as e:
    print(f"Error initializing Groq client: {e}")
    print("Continuing without Groq client. Check your API key or network connection.")

# Initialize Whisper model with OpenVINO optimization and quantization
whisper_model = None
openvino_core = None
try:
    print("Loading Whisper model with OpenVINO optimization...")
    start_time = time.time()
    whisper_model, openvino_core = optimize_whisper_model()
    load_time = time.time() - start_time
    print(f"Whisper model loaded and optimized in {load_time:.2f} seconds")
    print(f"Available OpenVINO devices: {openvino_core.available_devices if openvino_core else 'None'}")
except Exception as e:
    print(f"Error loading optimized Whisper model: {e}")
    print("Falling back to standard Whisper model")
    try:
        whisper_model = whisper.load_model("tiny")
        print("Standard Whisper model loaded successfully")
    except Exception as e2:
        print(f"Error loading standard Whisper model: {e2}")
        whisper_model = None

# Initialize EasyOCR with OpenVINO optimization
ocr_reader = None
try:
    print("Initializing EasyOCR with OpenVINO optimization...")
    start_time = time.time()
    ocr_reader, _ = optimize_easyocr()
    load_time = time.time() - start_time
    print(f"EasyOCR initialized with OpenVINO optimization in {load_time:.2f} seconds")
except Exception as e:
    print(f"Error initializing optimized EasyOCR: {e}")
    print("Falling back to standard EasyOCR")
    try:
        ocr_reader = easyocr.Reader(['en'])
        print("Standard EasyOCR initialized successfully")
    except Exception as e2:
        print(f"Error initializing standard EasyOCR: {e2}")
        ocr_reader = None

# Initialize conversation history and context manager
conversation_history = {}
context_manager = ContextManager(max_messages=20, max_tokens=4000)

@app.route('/api/chatbot/status', methods=['GET'])
def get_status():
    """Get the status of the chatbot API and available optimizations"""
    return jsonify({
        'status': 'online',
        'whisper_model': 'OpenVINO optimized' if whisper_model is not None else 'Not available',
        'ocr_model': 'OpenVINO optimized' if ocr_reader is not None else 'Not available',
        'openvino_devices': openvino_core.available_devices if openvino_core else [],
        'optimization': 'INT8 quantization enabled' if openvino_core else 'No optimization'
    })

@app.route('/api/chatbot/initialize', methods=['POST', 'OPTIONS'])
def initialize_chatbot():
    """Initialize the chatbot session for a user"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
        
    try:
        # Get user ID and course context from request
        data = request.json
        user_id = data.get('user_id', 'anonymous')
        course_context = data.get('course_context', 'general topics')
        
        # Check if conversation history exists for this user
        if user_id in conversation_history:
            print(f"Conversation history already exists for user {user_id}")
        else:
            print(f"Initializing conversation history for user {user_id}")
            
            # Check if there's a saved conversation history file
            history_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'conversation_history')
            os.makedirs(history_dir, exist_ok=True)
            history_file = os.path.join(history_dir, f"{user_id}.json")
            
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
                                "content": f"You are CoreMentis AI, an educational assistant for the CoreMentis platform. You are a general educational assistant that can help with a wide range of subjects based on the student's needs. The current course context is: {course_context}, but you can assist with other topics as requested. Follow these guidelines:\n1. Provide clear, concise, and accurate answers focused on the student's question\n2. Do not assume the student is specifically interested in computer vision or machine learning unless they ask about these topics\n3. Do not add irrelevant connections to technology or other fields unless specifically asked\n4. Keep explanations educational and appropriate for the student's level\n5. If you don't know something, admit it rather than making up information\n6. Maintain context from previous questions in the conversation\n7. Only provide information that is directly relevant to the question asked\n8. When asked about what you teach or what you can help with, explain that you're a general educational assistant that can help with various subjects based on the student's needs"
                            }
                        ]
                    }
            else:
                # Initialize with system prompt
                conversation_history[user_id] = {
                    "messages": [
                        {
                            "role": "system",
                            "content": f"You are CoreMentis AI, an educational assistant for the CoreMentis platform. You are a general educational assistant that can help with a wide range of subjects based on the student's needs. The current course context is: {course_context}, but you can assist with other topics as requested. Follow these guidelines:\n1. Provide clear, concise, and accurate answers focused on the student's question\n2. Do not assume the student is specifically interested in computer vision or machine learning unless they ask about these topics\n3. Do not add irrelevant connections to technology or other fields unless specifically asked\n4. Keep explanations educational and appropriate for the student's level\n5. If you don't know something, admit it rather than making up information\n6. Maintain context from previous questions in the conversation\n7. Only provide information that is directly relevant to the question asked\n8. When asked about what you teach or what you can help with, explain that you're a general educational assistant that can help with various subjects based on the student's needs"
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
    """Process a message from the user and get a response from the chatbot"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
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
        message = data.get('message', '')
        
        if not message.strip():
            return jsonify({
                'success': False,
                'message': 'Empty message'
            }), 400
            
        # Check for topic shift in the conversation
        topic_shift = context_manager.track_topic_shift(
            conversation_history[user_id]['messages'], 
            message
        )
        if topic_shift:
            print(f"Detected potential topic shift in the conversation")
        
        # Add user message to conversation history
        conversation_history[user_id]['messages'].append({
            "role": "user",
            "content": message
        })
        
        # Manage context window before sending to LLM
        managed_messages = context_manager.manage_context(
            conversation_history[user_id]['messages']
        )
        
        # Extract key topics for logging
        topics = context_manager.extract_key_topics(message)
        if topics:
            print(f"Detected potential topics: {', '.join(topics)}")
        
        # Get response from Groq
        try:
            start_time = time.time()
            
            # Use managed messages for the API call
            chat_completion = client.chat.completions.create(
                messages=managed_messages,
                model="llama3-8b-8192",
                temperature=0.5,
                max_tokens=800,
                top_p=1,
                stream=False
            )
            end_time = time.time()
            processing_time = end_time - start_time
            print(f"LLM response generated in {processing_time:.2f} seconds")
            
            # Extract assistant's response
            assistant_response = chat_completion.choices[0].message.content
            
            # Add assistant response to conversation history
            conversation_history[user_id]['messages'].append({
                "role": "assistant",
                "content": assistant_response
            })
            
            # Save conversation history to file
            try:
                history_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'conversation_history')
                os.makedirs(history_dir, exist_ok=True)
                history_file = os.path.join(history_dir, f"{user_id}.json")
                
                with open(history_file, 'w') as f:
                    json.dump(conversation_history[user_id], f)
            except Exception as e:
                print(f"Error saving conversation history: {e}")
            
            # Return the response
            return jsonify({
                'success': True,
                'message': assistant_response,
                'processing_time': processing_time
            })
        except Exception as e:
            print(f"Error getting response from Groq: {e}")
            return jsonify({
                'success': False,
                'message': f'Error getting response: {str(e)}'
            }), 500
    except Exception as e:
        print(f"Error processing message: {e}")
        return jsonify({
            'success': False,
            'message': f'Error processing message: {str(e)}'
        }), 500

@app.route('/api/chatbot/speech-to-text', methods=['POST', 'OPTIONS'])
def speech_to_text():
    """Convert speech to text using OpenVINO-optimized Whisper model"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
        
    try:
        # Get the audio data from the request
        data = request.json
        audio_data = data.get('audio')
        user_id = data.get('user_id', 'default_user')
        
        if not audio_data:
            return jsonify({
                'success': False,
                'message': 'No audio data provided'
            }), 400
        
        # Decode the base64 audio data
        audio_bytes = base64.b64decode(audio_data.split(',')[1] if ',' in audio_data else audio_data)
        
        # Save the audio to a temporary file
        temp_file_path = f"temp_audio_{user_id}_{int(time.time())}.wav"
        with open(temp_file_path, 'wb') as f:
            f.write(audio_bytes)
        
        print(f"Saved audio to {temp_file_path}")
        
        # Use Whisper model to transcribe audio with OpenVINO optimization if possible
        start_time = time.time()
        try:
            # For now, we use the PyTorch model but with performance tracking
            result = whisper_model.transcribe(temp_file_path)
            transcription = result["text"]
            
            processing_time = time.time() - start_time
            print(f"Transcription completed in {processing_time:.2f} seconds")
            
            # Add a note about the input modality to the conversation context if it exists
            if user_id in conversation_history:
                # Add a system note about the speech input (won't be shown to the user)
                conversation_history[user_id]['messages'].append({
                    'role': 'system',
                    'content': f"[The user provided the following input via speech: '{transcription}']"
                })
                
                # Save the updated conversation history
                save_conversation_history(user_id)
            
            return jsonify({
                'success': True,
                'text': transcription,
                'processing_time': processing_time
            })
            
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            return jsonify({
                'success': False,
                'message': f'Error transcribing audio: {str(e)}'
            }), 500
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
    except Exception as e:
        print(f"Error in speech-to-text: {e}")
        return jsonify({
            'success': False,
            'message': f'Error in speech-to-text: {str(e)}'
        }), 500

@app.route('/api/chatbot/image-to-text', methods=['POST', 'OPTIONS'])
def image_to_text():
    """Extract text from images using OpenVINO-optimized EasyOCR"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
        
    try:
        if ocr_reader is None:
            return jsonify({
                'success': False,
                'message': 'OCR model not loaded. Image-to-text is not available.'
            }), 500
            
        data = request.json
        image_data = data.get('image')
        user_id = data.get('user_id', 'default_user')
        if not image_data:
            return jsonify({
                'success': False,
                'message': 'No image data provided'
            }), 400
            
        # Process base64 image data
        try:
            if image_data.startswith('data:image/'):
                image_data = image_data.split(',')[1]
                
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            print(f"Image opened successfully, size: {image.size}")
        except Exception as e:
            print(f"Error processing image: {e}")
            return jsonify({
                'success': False,
                'message': f'Error opening image: {str(e)}'
            }), 500
            
        # Use EasyOCR with OpenVINO optimization to extract text
        try:
            print("Starting OCR with OpenVINO-optimized EasyOCR")
            start_time = time.time()
            
            # Convert PIL Image to numpy array for EasyOCR
            image_np = np.array(image)
            
            # Perform OCR using our optimized reader
            results = ocr_reader.readtext(image_np)
            
            # Extract text from results
            extracted_text = ' '.join([text for _, text, _ in results])
            
            end_time = time.time()
            processing_time = end_time - start_time
            print(f"OCR completed in {processing_time:.2f} seconds, extracted text length: {len(extracted_text)}")
            
            if not extracted_text.strip():
                return jsonify({
                    'success': False,
                    'message': 'No text could be extracted from the image'
                }), 400
            
            # Add a note about the input modality to the conversation context if it exists
            if user_id in conversation_history:
                # Truncate very long extracted text for the context note
                context_text = extracted_text.strip()
                if len(context_text) > 200:
                    context_text = context_text[:197] + '...'
                
                # Add a system note about the image input (won't be shown to the user)
                conversation_history[user_id]['messages'].append({
                    'role': 'system',
                    'content': f"[The user provided an image containing the following text: '{context_text}']"
                })
                
                # Save the updated conversation history
                save_conversation_history(user_id)
                
            return jsonify({
                'success': True,
                'text': extracted_text.strip(),
                'processing_time': processing_time
            })
        except Exception as e:
            print(f"Error extracting text from image: {e}")
            return jsonify({
                'success': False,
                'message': f'Error extracting text from image: {str(e)}'
            }), 500
    except Exception as e:
        print(f"Error in image-to-text: {e}")
        return jsonify({
            'success': False,
            'message': f'Error in image-to-text: {str(e)}'
        }), 500

@app.route('/api/chatbot/history', methods=['GET'])
def get_history():
    """Get conversation history for a user"""
    try:
        user_id = request.args.get('user_id', 'anonymous')
        
        if user_id not in conversation_history:
            return jsonify({
                'success': False,
                'message': 'No conversation history found for this user'
            }), 404
            
        # Extract messages from conversation history (excluding system messages)
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
    """Clear conversation history for a user"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
        
    try:
        data = request.json
        user_id = data.get('user_id', 'anonymous')
        course_context = data.get('course_context', 'general topics')
        
        if user_id not in conversation_history:
            return jsonify({
                'success': False,
                'message': 'No conversation history found for this user'
            }), 404
            
        # Reset conversation history with just the system prompt
        conversation_history[user_id] = {
            "messages": [
                {
                    "role": "system",
                    "content": f"You are CoreMentis AI, an educational assistant for the CoreMentis platform. You are a general educational assistant that can help with a wide range of subjects based on the student's needs. The current course context is: {course_context}, but you can assist with other topics as requested. Follow these guidelines:\n1. Provide clear, concise, and accurate answers focused on the student's question\n2. Do not assume the student is specifically interested in computer vision or machine learning unless they ask about these topics\n3. Do not add irrelevant connections to technology or other fields unless specifically asked\n4. Keep explanations educational and appropriate for the student's level\n5. If you don't know something, admit it rather than making up information\n6. Maintain context from previous questions in the conversation\n7. Only provide information that is directly relevant to the question asked\n8. When asked about what you teach or what you can help with, explain that you're a general educational assistant that can help with various subjects based on the student's needs"
                }
            ]
        }
        
        # Delete the history file if it exists
        try:
            history_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'conversation_history')
            history_file = os.path.join(history_dir, f"{user_id}.json")
            
            if os.path.exists(history_file):
                os.remove(history_file)
        except Exception as e:
            print(f"Error deleting conversation history file: {e}")
        
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

@app.route('/api/chatbot/performance', methods=['GET'])
def get_performance():
    """Get performance metrics for the optimized models"""
    try:
        metrics = {
            'whisper': {
                'optimized': whisper_model is not None,
                'backend': 'OpenVINO INT8' if openvino_core else 'PyTorch FP32',
                'devices': openvino_core.available_devices if openvino_core else ['CPU']
            },
            'ocr': {
                'optimized': ocr_reader is not None,
                'backend': 'OpenVINO INT8' if openvino_core else 'PyTorch FP32',
                'devices': openvino_core.available_devices if openvino_core else ['CPU']
            }
        }
        
        return jsonify({
            'success': True,
            'metrics': metrics
        })
    except Exception as e:
        print(f"Error retrieving performance metrics: {e}")
        return jsonify({
            'success': False,
            'message': f'Error retrieving performance metrics: {str(e)}'
        }), 500

@app.route('/api/chatbot/context-summary', methods=['GET'])
def get_context_summary():
    """Get a summary of the current conversation context"""
    try:
        user_id = request.args.get('user_id', 'default_user')
        
        if user_id not in conversation_history:
            return jsonify({
                'success': False,
                'message': 'No conversation history found for this user'
            }), 404
        
        # Get the conversation history
        messages = conversation_history[user_id]['messages']
        
        # Initialize context manager
        context_manager = ContextManager()
        
        # Extract topics from user messages
        user_messages = [msg['content'] for msg in messages if msg['role'] == 'user']
        all_topics = []
        for msg in user_messages:
            all_topics.extend(context_manager.extract_key_topics(msg))
        
        # Count topic frequencies
        topic_counts = {}
        for topic in all_topics:
            if topic in topic_counts:
                topic_counts[topic] += 1
            else:
                topic_counts[topic] = 1
        
        # Get the most frequent topics
        top_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Calculate token usage
        total_tokens = sum(context_manager.estimate_tokens(msg['content']) for msg in messages)
        
        # Determine if context is being truncated
        is_truncated = len(messages) > context_manager.max_messages
        
        # Detect multimodal inputs in the conversation
        multimodal_inputs = {
            'speech_inputs': 0,
            'image_inputs': 0
        }
        
        for msg in messages:
            if msg['role'] == 'system':
                content = msg['content']
                if '[The user provided the following input via speech:' in content:
                    multimodal_inputs['speech_inputs'] += 1
                elif '[The user provided an image containing the following text:' in content:
                    multimodal_inputs['image_inputs'] += 1
        
        return jsonify({
            'success': True,
            'context_info': {
                'message_count': len(messages),
                'token_estimate': total_tokens,
                'is_truncated': is_truncated,
                'top_topics': [topic for topic, _ in top_topics],
                'system_message': next((msg['content'] for msg in messages if msg['role'] == 'system' and not msg['content'].startswith('[')), None),
                'multimodal_inputs': multimodal_inputs
            }
        })
    except Exception as e:
        print(f"Error getting context summary: {e}")
        return jsonify({
            'success': False,
            'message': f'Error getting context summary: {str(e)}'
        }), 500

@app.route('/api/chatbot/text-to-speech', methods=['POST', 'OPTIONS'])
def text_to_speech():
    """Convert text to speech using TTS engine"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    # Check if TTS is available
    if not tts_available:
        return jsonify({
            'success': False,
            'message': 'Text-to-speech functionality is not available on this server.'
        }), 503  # Service Unavailable
        
    try:
        data = request.json
        text = data.get('text')
        user_id = data.get('user_id', 'default_user')
        
        if not text:
            return jsonify({
                'success': False,
                'message': 'No text provided'
            }), 400
        
        # Use TTS engine to convert text to speech
        start_time = time.time()
        audio_base64, error = tts_engine.text_to_speech(text)
        
        if error or not audio_base64:
            return jsonify({
                'success': False,
                'message': error or 'Failed to convert text to speech'
            }), 500
        
        processing_time = time.time() - start_time
        
        # Add a note about the output modality to the conversation context if it exists
        if user_id in conversation_history:
            # Add a system note about the speech output (won't be shown to the user)
            conversation_history[user_id]['messages'].append({
                'role': 'system',
                'content': f"[The assistant provided an audio response for: '{text[:50]}{'...' if len(text) > 50 else ''}']" 
            })
            
            # Save the updated conversation history
            save_conversation_history(user_id)
        
        return jsonify({
            'success': True,
            'audio': audio_base64,
            'processing_time': processing_time,
            'tts_engine': tts_engine.get_status()['model_name'] if hasattr(tts_engine, 'get_status') else 'Unknown'
        })
    except Exception as e:
        print(f"Error in text-to-speech: {e}")
        return jsonify({
            'success': False,
            'message': f'Error in text-to-speech: {str(e)}'
        }), 500

@app.route('/api/chatbot/search-content', methods=['POST', 'OPTIONS'])
def search_educational_content():
    """Search for educational content (images and videos) on a given topic"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
        
    try:
        data = request.json
        topic = data.get('topic', '')
        
        if not topic.strip():
            return jsonify({
                'success': False,
                'message': 'Empty topic'
            }), 400
            
        # Search for content
        start_time = time.time()
        images, videos = search_content(topic)
        processing_time = time.time() - start_time
        
        # Format video data for frontend
        formatted_videos = []
        for video in videos:
            formatted_videos.append({
                'title': video['title'],
                'url': video['url']
            })
        
        return jsonify({
            'success': True,
            'images': images,
            'videos': formatted_videos,
            'processing_time': processing_time
        })
    except Exception as e:
        print(f"Error searching for content: {e}")
        return jsonify({
            'success': False,
            'message': f'Error searching for content: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("Starting CoreMentis Chatbot API with OpenVINO optimization...")
    print(f"Available OpenVINO devices: {openvino_core.available_devices if openvino_core else 'None'}")
    print(f"Whisper model: {'Optimized' if whisper_model is not None else 'Not available'}")
    print(f"EasyOCR model: {'Optimized' if ocr_reader is not None else 'Not available'}")
    print(f"TTS engine: {tts_engine.get_status()['model_name'] if tts_engine.get_status()['initialized'] else 'Not available'}")
    app.run(host='0.0.0.0', port=5001, debug=True)
