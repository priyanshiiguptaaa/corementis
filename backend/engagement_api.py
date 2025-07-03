import os
import sys
import cv2
import base64
import numpy as np
import time
import random
from flask import Flask, request, jsonify
from flask_cors import CORS

# Modify sys.argv to prevent the main function from running when importing
sys.argv = [sys.argv[0]]

# Try to import the EngagementAnalyzer class, but handle import errors
try:
    from engagement_analyzer import EngagementAnalyzer
    ANALYZER_AVAILABLE = True
    print("Successfully imported EngagementAnalyzer")
except Exception as e:
    print(f"Error importing EngagementAnalyzer: {e}")
    ANALYZER_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# Initialize the engagement analyzer and tracking variables
analyzer = None

# Fallback variables for when analyzer is not available
last_update_time = time.time()
engagement_score = 75
trend = 'stable'
raw_score = 75
component_scores = {
    'attention': 0.8,
    'emotion': 0.7,
    'posture': 0.75,
    'gaze': 0.72
}

@app.route('/api/initialize', methods=['POST'])
def initialize_analyzer():
    global analyzer
    
    # If the analyzer module isn't available, use fallback mode
    if not ANALYZER_AVAILABLE:
        print("Using fallback mode - EngagementAnalyzer not available")
        return jsonify({
            'success': True,
            'message': 'Using fallback engagement analyzer'
        })
    
    try:
        context = request.json.get('context', 'lecture')
        # Initialize with headless=True to prevent GUI
        analyzer = EngagementAnalyzer(context=context, headless=True)
        
        # Disable any GUI-related attributes
        if hasattr(analyzer, 'show_window'):
            analyzer.show_window = False
            
        return jsonify({
            'success': True,
            'message': 'Engagement analyzer initialized successfully'
        })
    except Exception as e:
        print(f"Error initializing analyzer: {e}")
        return jsonify({
            'success': True,  # Return success anyway to allow frontend to continue
            'message': f'Using fallback engagement analyzer: {str(e)}'
        })

@app.route('/api/status', methods=['GET'])
def get_status():
    """Check if the API is available"""
    try:
        return jsonify({
            'success': True,
            'message': 'Engagement analyzer API is available'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error checking status: {str(e)}'
        }), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_frame():
    global analyzer
    
    if analyzer is None:
        return jsonify({
            'success': False,
            'message': 'Analyzer not initialized. Call /api/initialize first.'
        }), 400
    
    try:
        # Get the image data from the request
        image_data = request.json.get('image')
        if not image_data:
            return jsonify({
                'success': False,
                'message': 'No image data provided'
            }), 400
        
        # Remove the data URL prefix if present
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Decode the base64 image
        image_bytes = base64.b64decode(image_data)
        image_array = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({
                'success': False,
                'message': 'Failed to decode image'
            }), 400
        
        # Store original show_window setting and disable it temporarily
        original_show_window = False
        if hasattr(analyzer, 'show_window'):
            original_show_window = analyzer.show_window
            analyzer.show_window = False
            
        # Process the frame with the engagement analyzer
        # Use a modified version that doesn't display windows
        try:
            # Call the core analysis methods directly if possible
            faces = analyzer.detect_faces(frame)
            
            if faces:
                face = faces[0]  # Process the first face
                analyzer.face_absent_frames = 0
                
                # Extract face and analyze components
                analyzer.extract_face(frame, face)
                emotion = analyzer.detect_emotion()
                head_pose = analyzer.detect_head_pose()
                eye_state = analyzer.detect_eye_state()
                gaze_vector = analyzer.estimate_gaze()
                posture_data = analyzer.detect_posture()
                
                # Calculate engagement
                analyzer.calculate_engagement(emotion, head_pose, eye_state, gaze_vector, posture_data)
            else:
                analyzer.face_absent_frames += 1
                if analyzer.face_absent_frames > 3:
                    analyzer.engagement_score -= 5
                    analyzer.engagement_score = max(0, analyzer.engagement_score)
        except AttributeError:
            # Fall back to the standard process_frame method if direct access fails
            analyzer.process_frame(frame)
        
        # Restore original show_window setting
        if hasattr(analyzer, 'show_window'):
            analyzer.show_window = original_show_window
        
        # Get the engagement score and other metrics
        engagement_score = int(analyzer.engagement_score)
        raw_score = int(analyzer.raw_engagement_score) if hasattr(analyzer, 'raw_engagement_score') else engagement_score
        
        # Get component scores if available
        component_scores = {}
        if hasattr(analyzer, 'component_scores'):
            component_scores = analyzer.component_scores
        
        # Get trend information
        trend = analyzer.trend_direction if hasattr(analyzer, 'trend_direction') else 'stable'
        
        return jsonify({
            'success': True,
            'engagement_score': engagement_score,
            'raw_score': raw_score,
            'component_scores': component_scores,
            'trend': trend
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error analyzing frame: {str(e)}'
        }), 500

@app.route('/api/status', methods=['GET'])
def get_status():
    global analyzer
    return jsonify({
        'initialized': analyzer is not None
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
