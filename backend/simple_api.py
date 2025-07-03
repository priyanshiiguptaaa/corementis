from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import time
import random
import base64
import numpy as np
import cv2

app = Flask(__name__)
# Configure CORS to allow requests from any origin
CORS(app, resources={r"/api/*": {"origins": "*", "supports_credentials": True}})

# Initialize global variables for engagement tracking
engagement_score = 75
raw_score = 75
trend = 'stable'
component_scores = {
    'attention': 0.8,
    'emotion': 0.7,
    'posture': 0.75,
    'gaze': 0.72
}
# Initialize with some sample history data
engagement_history = [70, 72, 75, 73, 78, 75, 72, 78, 74]  

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        'success': True,
        'message': 'Engagement analyzer API is available'
    })

@app.route('/api/initialize', methods=['POST'])
def initialize_analyzer():
    try:
        # Get the context from the request
        context = request.json.get('context', 'lecture')
        print(f"Initializing analyzer with context: {context}")
        
        # In a real implementation, this would load models based on context
        # For this simplified version, we just return success
        response_data = {
            'success': True,
            'message': 'Engagement analyzer initialized successfully'
        }
        
        # Create a response with proper CORS headers
        response = make_response(jsonify(response_data))
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response
    except Exception as e:
        print(f"Error initializing analyzer: {e}")
        response_data = {
            'success': False,
            'message': f'Error initializing analyzer: {str(e)}'
        }
        response = make_response(jsonify(response_data))
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response

@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze_frame():
    global engagement_score, trend, component_scores, engagement_history, raw_score
    
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response
    
    print("Analyzing frame...")
    
    try:
        # Get the image data from the request
        image_data = request.json.get('image')
        if not image_data:
            return jsonify({
                'success': False,
                'message': 'No image data provided'
            }), 400
        
        print(f"Received image data of length: {len(str(image_data))}")
        
        # For this simplified API, we don't actually need to decode the image
        # We'll just generate engagement data regardless of the image content
        
        # Update component scores with some randomness
        for key in component_scores:
            change = (random.random() - 0.5) * 0.1  # -0.05 to 0.05
            component_scores[key] = max(0.3, min(1.0, component_scores[key] + change))
        
        # Calculate new engagement score
        new_score = sum(component_scores.values()) / len(component_scores) * 100
        raw_score = new_score
        
        # Smooth the engagement score changes
        score_change = (new_score - engagement_score) * 0.3
        engagement_score += score_change
        engagement_score = max(0, min(100, engagement_score))
        
        # Determine trend
        if score_change > 1:
            trend = 'increasing'
        elif score_change < -1:
            trend = 'decreasing'
        else:
            trend = 'stable'
        
        # Update history - ensure we always have history data
        if not engagement_history:
            # If history is empty, initialize with some values
            engagement_history = [int(engagement_score) - 2, int(engagement_score) - 1, int(engagement_score)]
        
        # Add new score to history
        if len(engagement_history) >= 10:
            engagement_history.pop(0)
        engagement_history.append(int(engagement_score))
        
        # Print detailed information about what we're returning
        print(f"Engagement score: {int(engagement_score)}, Trend: {trend}")
        print(f"Component scores: {component_scores}")
        print(f"History: {engagement_history}")
        
        response_data = {
            'success': True,
            'engagement_score': int(engagement_score),
            'raw_score': int(raw_score),
            'component_scores': component_scores,
            'trend': trend,
            'history': engagement_history
        }
        
        print(f"Sending response with history length: {len(engagement_history)}")
        
        # Create a response with proper CORS headers
        response = make_response(jsonify(response_data))
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        response.headers.add('Access-Control-Max-Age', '3600')
        return response
    except Exception as e:
        print(f"Error analyzing frame: {e}")
        return jsonify({
            'success': False,
            'message': f'Error analyzing frame: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("Starting simple engagement API server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
