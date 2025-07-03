import os
import sys
import cv2
import base64
import numpy as np
import time
import random
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Global variables to track engagement metrics
engagement_score = 75
trend = 'stable'
raw_score = 75
component_scores = {
    'attention': 0.8,
    'emotion': 0.7,
    'posture': 0.75,
    'gaze': 0.72
}
last_update_time = time.time()
face_detected = False
face_absent_frames = 0
engagement_history = []

@app.route('/api/status', methods=['GET'])
def get_status():
    """Check if the API is available"""
    return jsonify({
        'success': True,
        'message': 'Engagement analyzer API is available'
    })

@app.route('/api/initialize', methods=['POST'])
def initialize_analyzer():
    global engagement_score, trend, component_scores, last_update_time
    
    # Reset engagement metrics
    engagement_score = 75
    trend = 'stable'
    component_scores = {
        'attention': 0.8,
        'emotion': 0.7,
        'posture': 0.75,
        'gaze': 0.72
    }
    last_update_time = time.time()
    
    return jsonify({
        'success': True,
        'message': 'Engagement analyzer initialized successfully'
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_frame():
    global engagement_score, trend, component_scores, last_update_time, face_detected, face_absent_frames, engagement_history, raw_score
    
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
        
        # Detect face using OpenCV's Haar cascade classifier
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        # Process the frame for engagement analysis
        if len(faces) > 0:
            face_detected = True
            face_absent_frames = 0
            
            # Simulate engagement analysis with realistic changes
            # Time-based changes to make it more realistic
            time_now = time.time()
            time_diff = time_now - last_update_time
            last_update_time = time_now
            
            # Calculate new engagement score with realistic changes
            # Base change on face position, size, and random factors
            face_x, face_y, face_w, face_h = faces[0]
            face_center_x = face_x + face_w/2
            face_center_y = face_y + face_h/2
            
            # Center of frame
            frame_center_x = frame.shape[1]/2
            frame_center_y = frame.shape[0]/2
            
            # Distance from center affects engagement
            distance_from_center = np.sqrt((face_center_x - frame_center_x)**2 + 
                                          (face_center_y - frame_center_y)**2)
            normalized_distance = min(1.0, distance_from_center / (frame.shape[1]/2))
            
            # Face size affects engagement (larger face = more engaged)
            face_size_ratio = (face_w * face_h) / (frame.shape[0] * frame.shape[1])
            normalized_size = min(1.0, face_size_ratio * 20)  # Scale up for better range
            
            # Calculate attention based on face position and size
            attention_score = 0.8 - (normalized_distance * 0.3) + (normalized_size * 0.3)
            attention_score = max(0.3, min(1.0, attention_score))  # Clamp between 0.3 and 1.0
            
            # Simulate other component scores with some randomness
            emotion_change = (random.random() - 0.5) * 0.1  # -0.05 to 0.05
            component_scores['emotion'] = max(0.3, min(1.0, component_scores['emotion'] + emotion_change))
            
            posture_change = (random.random() - 0.5) * 0.08
            component_scores['posture'] = max(0.3, min(1.0, component_scores['posture'] + posture_change))
            
            gaze_change = (random.random() - 0.5) * 0.12
            component_scores['gaze'] = max(0.3, min(1.0, component_scores['gaze'] + gaze_change))
            
            # Update attention component directly
            component_scores['attention'] = attention_score
            
            # Calculate overall engagement score (weighted average of components)
            weights = {'attention': 0.4, 'emotion': 0.2, 'posture': 0.2, 'gaze': 0.2}
            new_score = sum(component_scores[k] * weights[k] for k in weights.keys()) * 100
            
            # Smooth the engagement score changes
            score_change = (new_score - engagement_score) * 0.3  # Only move 30% toward new score
            raw_score = new_score
            engagement_score += score_change
            engagement_score = max(0, min(100, engagement_score))
            
            # Determine trend
            if score_change > 1:
                trend = 'increasing'
            elif score_change < -1:
                trend = 'decreasing'
            else:
                trend = 'stable'
                
            # Add to history
            if len(engagement_history) >= 10:
                engagement_history.pop(0)
            engagement_history.append(int(engagement_score))
        else:
            face_detected = False
            face_absent_frames += 1
            
            # Decrease engagement score if face is absent for too long
            if face_absent_frames > 3:
                engagement_score -= 5
                engagement_score = max(0, engagement_score)
                trend = 'decreasing'
        
        return jsonify({
            'success': True,
            'engagement_score': int(engagement_score),
            'raw_score': int(raw_score),
            'component_scores': component_scores,
            'trend': trend,
            'face_detected': face_detected,
            'history': engagement_history
        })
    except Exception as e:
        print(f"Error in analyze_frame: {e}")
        return jsonify({
            'success': False,
            'message': f'Error analyzing frame: {str(e)}'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting engagement analyzer API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
