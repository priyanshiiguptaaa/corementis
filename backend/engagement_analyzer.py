import cv2
import numpy as np
import time
import math
import os
import openvino as ov
import pickle
from collections import deque
from datetime import datetime
import json
from pathlib import Path


class EngagementWeightOptimizer:
    """
    A class for optimizing engagement scoring weights using machine learning.
    This implements data-driven weight optimization for the engagement analyzer.
    """
    def __init__(self, data_dir=None):
        # Set default data directory if not provided
        self.data_dir = data_dir or os.path.join(os.getcwd(), "engagement_data")
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Model file paths
        self.model_path = os.path.join(self.data_dir, "weight_model.pkl")
        self.context_weights_path = os.path.join(self.data_dir, "context_weights.json")
        
        # Initialize weights with default values
        self.default_weights = {
            'face_presence': 25,
            'emotion': 15,
            'eye_state': 15,
            'head_pose': 15,
            'gaze': 10,
            'posture': 15,
            'gesture': 5
        }
        
        # Context-specific weight sets
        self.context_weights = {
            'lecture': {
                'face_presence': 30,
                'emotion': 10,
                'eye_state': 20,
                'head_pose': 15,
                'gaze': 15,
                'posture': 10,
                'gesture': 0
            },
            'interactive': {
                'face_presence': 20,
                'emotion': 15,
                'eye_state': 10,
                'head_pose': 10,
                'gaze': 10,
                'posture': 15,
                'gesture': 20
            },
            'exam': {
                'face_presence': 35,
                'emotion': 5,
                'eye_state': 25,
                'head_pose': 20,
                'gaze': 10,
                'posture': 5,
                'gesture': 0
            }
        }
        
        # Load saved weights if available
        self.load_context_weights()
        
        # Data collection for model training
        self.training_data = []
        self.model = None
        self.load_model()
        
    def load_model(self):
        """Load a pre-trained weight optimization model if available"""
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                print("Loaded trained weight optimization model")
                return True
            except Exception as e:
                print(f"Error loading weight model: {e}")
        return False
    
    def load_context_weights(self):
        """Load context-specific weights if available"""
        if os.path.exists(self.context_weights_path):
            try:
                with open(self.context_weights_path, 'r') as f:
                    saved_weights = json.load(f)
                    self.context_weights.update(saved_weights)
                print("Loaded context-specific weights")
            except Exception as e:
                print(f"Error loading context weights: {e}")
    
    def save_context_weights(self):
        """Save context-specific weights"""
        try:
            with open(self.context_weights_path, 'w') as f:
                json.dump(self.context_weights, f, indent=2)
        except Exception as e:
            print(f"Error saving context weights: {e}")
    
    def add_training_sample(self, component_scores, ground_truth_score):
        """Add a training sample for weight optimization"""
        self.training_data.append({
            'features': component_scores,
            'target': ground_truth_score,
            'timestamp': datetime.now().isoformat()
        })
        
        # Save training data periodically
        if len(self.training_data) % 10 == 0:
            self.save_training_data()
    
    def save_training_data(self):
        """Save collected training data"""
        try:
            data_file = os.path.join(self.data_dir, "training_data.json")
            with open(data_file, 'w') as f:
                json.dump(self.training_data, f, indent=2)
        except Exception as e:
            print(f"Error saving training data: {e}")
    
    def train_model(self):
        """Train a model to optimize weights based on collected data"""
        if len(self.training_data) < 20:  # Need sufficient data
            print(f"Insufficient training data: {len(self.training_data)} samples")
            return False
            
        try:
            import numpy as np
            from sklearn.linear_model import LinearRegression
            
            # Extract features and targets
            X = []
            y = []
            
            for sample in self.training_data:
                features = []
                for component in self.default_weights.keys():
                    features.append(sample['features'].get(component, 0))
                X.append(features)
                y.append(sample['target'])
            
            # Convert to numpy arrays
            X = np.array(X)
            y = np.array(y)
            
            # Train linear regression model
            self.model = LinearRegression()
            self.model.fit(X, y)
            
            # Save the trained model
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.model, f)
            
            # Extract and normalize weights
            weights = {}
            coefficients = self.model.coef_
            total = sum(abs(c) for c in coefficients)
            
            for i, component in enumerate(self.default_weights.keys()):
                # Ensure weights are positive and sum to 100
                weight = abs(coefficients[i]) / total * 100
                weights[component] = max(1, min(50, weight))  # Limit range
            
            # Normalize to ensure sum is 100
            total = sum(weights.values())
            for component in weights:
                weights[component] = weights[component] / total * 100
            
            # Save as a new context
            self.context_weights['learned'] = weights
            self.save_context_weights()
            
            print("Model trained successfully. New weights:")
            for component, weight in weights.items():
                print(f"  {component}: {weight:.1f}%")
            
            return True
        except Exception as e:
            print(f"Error training model: {e}")
            return False
    
    def get_optimized_weights(self, context=None):
        """Get optimized weights based on context or model"""
        # If context is specified and exists, use those weights
        if context and context in self.context_weights:
            return self.context_weights[context]
        
        # If we have a trained model, use 'learned' weights
        if self.model and 'learned' in self.context_weights:
            return self.context_weights['learned']
        
        # Fall back to default weights
        return self.default_weights
    
    def create_custom_context(self, name, weights):
        """Create a custom context with specified weights"""
        # Validate weights
        if not all(component in weights for component in self.default_weights):
            print("Error: All components must have weights specified")
            return False
        
        # Normalize weights to sum to 100
        total = sum(weights.values())
        normalized_weights = {}
        for component, weight in weights.items():
            normalized_weights[component] = weight / total * 100
        
        # Save the new context
        self.context_weights[name] = normalized_weights
        self.save_context_weights()
        return True


class EngagementAnalyzer:
    def __init__(self, context=None, headless=False):
        # Headless mode prevents opening GUI windows
        self.headless = headless
        # Initialize OpenVINO core
        self.core = ov.Core()
        
        # Model paths
        self.base_dir = "c:/Users/rkgup/OneDrive/Desktop/corementis/backend"
        
        # Initialize variables
        self.use_landmarks = False
        self.landmarks_input_shape = None
        self.landmarks_input_layer = None
        self.landmarks_output_layer = None
        self.landmarks_compiled_model = None
        
        # Initialize weight optimizer
        self.weight_optimizer = EngagementWeightOptimizer()
        self.context = context  # Current context (lecture, interactive, exam)
        
        # Enhanced temporal context tracking
        self.long_term_scores = deque(maxlen=300)  # 5-minute window (at 1 fps)
        self.medium_term_scores = deque(maxlen=60)  # 1-minute window
        self.short_term_scores = deque(maxlen=10)  # 10-second window
        
        # Track engagement trends
        self.trend_direction = "stable"  # "increasing", "decreasing", or "stable"
        self.trend_duration = 0  # How long the current trend has persisted
        
        # Define standard model paths first (traditional approach)
        self.face_model_path = os.path.join(self.base_dir, "face-detection-adas-0001/FP32/face-detection-adas-0001.xml")
        self.emotion_model_path = os.path.join(self.base_dir, "emotions-recognition-retail-0003/FP32/emotions-recognition-retail-0003.xml")
        self.head_pose_model_path = os.path.join(self.base_dir, "head-pose-estimation-adas-0001/FP32/head-pose-estimation-adas-0001.xml")
        
        # Updated path for eye model - check multiple possible locations
        eye_model_paths = [
            os.path.join(self.base_dir, "open-closed-eye-0001/FP32/open-closed-eye-0001.xml"),
            os.path.join(self.base_dir, "public/open-closed-eye-0001/FP32/open-closed-eye-0001.xml"),
            os.path.join(self.base_dir, "intel/open-closed-eye-0001/FP32/open-closed-eye-0001.xml"),
            os.path.join(self.base_dir, "models/open-closed-eye-0001/FP32/open-closed-eye-0001.xml")
        ]
        
        # Find the first valid path
        self.eye_model_path = None
        for path in eye_model_paths:
            if os.path.exists(path):
                self.eye_model_path = path
                print(f"Found eye state model at: {path}")
                break
                
        # Try to find gaze model in local directories
        self.gaze_model_path = None
        gaze_model_paths = [
            os.path.join(self.base_dir, "gaze-estimation-adas-0002/FP32/gaze-estimation-adas-0002.xml"),
            os.path.join(os.path.dirname(self.base_dir), "gaze-estimation-adas-0002/FP32/gaze-estimation-adas-0002.xml")
        ]
        for path in gaze_model_paths:
            if os.path.exists(path):
                self.gaze_model_path = path
                print(f"Found gaze model at: {path}")
                break
        # Try to find landmarks model in local directories
        self.landmarks_model_path = None
        landmarks_model_paths = [
            os.path.join(self.base_dir, "facial-landmarks-35-adas-0002/FP32/facial-landmarks-35-adas-0002.xml"),
            os.path.join(os.path.dirname(self.base_dir), "facial-landmarks-35-adas-0002/FP32/facial-landmarks-35-adas-0002.xml")
        ]
        for path in landmarks_model_paths:
            if os.path.exists(path):
                self.landmarks_model_path = path
                print(f"Found landmarks model at: {path}")
                break
        
        # Only check for fine-tuned models if the directory exists
        finetuned_dir = os.path.join(self.base_dir, "finetuned_models")
        if os.path.exists(finetuned_dir):
            # Check for fine-tuned eye model
            finetuned_eye = os.path.join(finetuned_dir, "eye_state_finetuned.xml")
            if os.path.exists(finetuned_eye):
                print("Using fine-tuned eye state detection model")
                self.eye_model_path = finetuned_eye
            
            # Check for fine-tuned emotion model
            finetuned_emotion = os.path.join(finetuned_dir, "emotion_finetuned.xml")
            if os.path.exists(finetuned_emotion):
                print("Using fine-tuned emotion recognition model")
                self.emotion_model_path = finetuned_emotion
        
        # Load models
        self.load_models()
        
        # Engagement metrics
        self.engagement_score = 50  # Start with neutral score
        self.last_face_time = time.time()
        self.face_present = False
        self.face_absent_frames = 0  # Counter for consecutive frames with no face
        
        # Temporal smoothing for engagement score
        self.score_history = [50] * 10  # Store last 10 scores, initialize with neutral score
        self.smoothing_window = 10  # Size of the moving average window
        self.raw_engagement_score = 50  # Store the raw score before smoothing
        
        # Blink detection variables
        self.left_eye_closed_frames = 0
        self.right_eye_closed_frames = 0
        self.blink_threshold = 3  # Number of consecutive frames to consider a blink
        self.left_eye_state = "Open"  # Current state: "Open", "Blinking", or "Closed"
        self.right_eye_state = "Open"
        
    def load_models(self):
        # Load face detection model
        self.face_model = self.core.read_model(self.face_model_path)
        self.face_compiled_model = self.core.compile_model(self.face_model, "CPU")
        self.face_input_layer = self.face_compiled_model.input(0)
        self.face_output_layer = self.face_compiled_model.output(0)
        self.face_input_shape = self.face_input_layer.shape
        
        # Load emotion recognition model
        self.emotion_model = self.core.read_model(self.emotion_model_path)
        self.emotion_compiled_model = self.core.compile_model(self.emotion_model, "CPU")
        self.emotion_input_layer = self.emotion_compiled_model.input(0)
        self.emotion_output_layer = self.emotion_compiled_model.output(0)
        self.emotion_input_shape = self.emotion_input_layer.shape
        
        # Load head pose estimation model
        self.head_pose_model = self.core.read_model(self.head_pose_model_path)
        self.head_pose_compiled_model = self.core.compile_model(self.head_pose_model, "CPU")
        self.head_pose_input_layer = self.head_pose_compiled_model.input(0)
        self.head_pose_input_shape = self.head_pose_input_layer.shape
        # Get output layers for yaw, pitch, roll
        self.head_pose_output_layers = {}
        for output in self.head_pose_compiled_model.outputs:
            self.head_pose_output_layers[output.any_name] = output
            
        # Load eye state detection model
        try:
            if self.eye_model_path and os.path.exists(self.eye_model_path):
                print(f"Loading eye state detection model from: {self.eye_model_path}")
                self.eye_model = self.core.read_model(self.eye_model_path)
                self.eye_compiled_model = self.core.compile_model(self.eye_model, "CPU")
                self.eye_input_layer = self.eye_compiled_model.input(0)
                self.eye_output_layer = self.eye_compiled_model.output(0)
                self.eye_input_shape = self.eye_input_layer.shape
                self.use_eye_model = True
                print("Eye state detection model loaded successfully")
            else:
                print("Warning: Eye state detection model file not found")
                self.use_eye_model = False
        except Exception as e:
            print(f"Error loading eye state detection model: {e}")
            self.use_eye_model = False
        
        # Load gaze estimation model if available
        self.use_gaze_model = False
        try:
            if self.gaze_model_path and os.path.exists(self.gaze_model_path):
                print(f"Loading gaze estimation model from: {self.gaze_model_path}")
                self.gaze_model = self.core.read_model(self.gaze_model_path)
                self.gaze_compiled_model = self.core.compile_model(self.gaze_model, "CPU")
                # Gaze model has multiple inputs: left_eye_image, right_eye_image, head_pose_angles
                self.gaze_input_layers = {input_layer.any_name: input_layer for input_layer in self.gaze_compiled_model.inputs}
                self.gaze_output_layer = self.gaze_compiled_model.output(0)
                # Get input shapes for left and right eye images
                self.gaze_input_shape = self.gaze_input_layers['left_eye_image'].shape
                self.use_gaze_model = True
                print("Gaze estimation model loaded successfully")
            else:
                print("Warning: Gaze estimation model file not found")
                self.use_gaze_model = False
        except Exception as e:
            print(f"Error loading gaze estimation model: {e}")
            self.use_gaze_model = False
        
        # Load facial landmarks model for more accurate eye region detection
        try:
            self.landmarks_model = self.core.read_model(self.landmarks_model_path)
            self.landmarks_compiled_model = self.core.compile_model(self.landmarks_model, "CPU")
            self.landmarks_input_layer = self.landmarks_compiled_model.input(0)
            self.landmarks_output_layer = self.landmarks_compiled_model.output(0)
            self.landmarks_input_shape = self.landmarks_input_layer.shape
            self.use_landmarks = True
            print("Facial landmarks model loaded successfully")
        except Exception as e:
            print(f"Warning: Could not load facial landmarks model: {e}")
            print("Falling back to approximate eye region detection")
            self.use_landmarks = False
    
    def detect_faces(self, frame):
        # Prepare input for face detection
        h, w = frame.shape[:2]
        input_frame = cv2.resize(frame, (self.face_input_shape[3], self.face_input_shape[2]))
        input_frame = input_frame.transpose((2, 0, 1))  # HWC to CHW
        input_frame = np.expand_dims(input_frame, axis=0)
        
        # Run face detection
        results = self.face_compiled_model([input_frame])[self.face_output_layer]
        detections = results[0][0]
        
        faces = []
        for detection in detections:
            confidence = float(detection[2])
            if confidence > 0.5:  # Filter by confidence threshold
                x_min = int(detection[3] * w)
                y_min = int(detection[4] * h)
                x_max = int(detection[5] * w)
                y_max = int(detection[6] * h)
                
                # Ensure coordinates are within frame boundaries
                x_min = max(0, x_min)
                y_min = max(0, y_min)
                x_max = min(w, x_max)
                y_max = min(h, y_max)
                
                if x_min < x_max and y_min < y_max:  # Valid face area
                    faces.append((x_min, y_min, x_max, y_max))
        
        return faces
    
    def analyze_emotion(self, frame, face_coords):
        x_min, y_min, x_max, y_max = face_coords
        face_img = frame[y_min:y_max, x_min:x_max]
        
        if face_img.size == 0:  # Skip if face crop is empty
            return "neutral"
        
        # Prepare input for emotion recognition
        try:
            input_frame = cv2.resize(face_img, (self.emotion_input_shape[3], self.emotion_input_shape[2]))
            input_frame = input_frame.transpose((2, 0, 1))  # HWC to CHW
            input_frame = np.expand_dims(input_frame, axis=0)
            
            # Run emotion recognition
            results = self.emotion_compiled_model([input_frame])[self.emotion_output_layer]
            emotions = results[0]
            
            # Emotion classes: neutral, happy, sad, surprise, anger
            emotion_classes = ['neutral', 'happy', 'sad', 'surprise', 'anger']
            emotion_idx = np.argmax(emotions)
            return emotion_classes[emotion_idx]
        except Exception as e:
            print(f"Error in emotion analysis: {e}")
            return "neutral"
    
    def analyze_head_pose(self, frame, face_coords):
        x_min, y_min, x_max, y_max = face_coords
        face_img = frame[y_min:y_max, x_min:x_max]
        
        if face_img.size == 0:  # Skip if face crop is empty
            return 0, 0, 0
        
        # Prepare input for head pose estimation
        try:
            input_frame = cv2.resize(face_img, (self.head_pose_input_shape[3], self.head_pose_input_shape[2]))
            input_frame = input_frame.transpose((2, 0, 1))  # HWC to CHW
            input_frame = np.expand_dims(input_frame, axis=0)
            
            # Run head pose estimation
            results = self.head_pose_compiled_model([input_frame])
            
            # Get angles (yaw, pitch, roll)
            yaw = results[self.head_pose_output_layers['angle_y_fc']][0][0]   # Left-Right rotation
            pitch = results[self.head_pose_output_layers['angle_p_fc']][0][0] # Up-Down rotation
            roll = results[self.head_pose_output_layers['angle_r_fc']][0][0]  # Tilt rotation
            
            return yaw, pitch, roll
        except Exception as e:
            print(f"Error in head pose analysis: {e}")
            return 0, 0, 0
            
    def extract_eyes_from_landmarks(self, frame, landmarks, face_rect):
        """Extract eye regions using facial landmarks with improved region definition"""
        try:
            # Extract face region
            x1, y1, x2, y2 = face_rect
            face_width = x2 - x1
            face_height = y2 - y1
            
            # Get landmarks for left and right eyes
            # Landmark indices for eyes in facial-landmarks-35-adas-0002
            # Left eye: 0, 1, 2, 3, 4, 5
            # Right eye: 6, 7, 8, 9, 10, 11
            left_eye_points = landmarks[0:6]
            right_eye_points = landmarks[6:12]
            
            # Calculate eye centers
            left_eye_center = np.mean(left_eye_points, axis=0).astype(int)
            right_eye_center = np.mean(right_eye_points, axis=0).astype(int)
            
            # Calculate eye sizes based on landmarks
            left_eye_width = int(max(p[0] for p in left_eye_points) - min(p[0] for p in left_eye_points))
            left_eye_height = int(max(p[1] for p in left_eye_points) - min(p[1] for p in left_eye_points))
            right_eye_width = int(max(p[0] for p in right_eye_points) - min(p[0] for p in right_eye_points))
            right_eye_height = int(max(p[1] for p in right_eye_points) - min(p[1] for p in right_eye_points))
            
            # Calculate adaptive margins based on face size and eye size
            # Larger margin for width to capture eyelids
            width_margin_factor = 0.7  # 70% of eye width as margin
            height_margin_factor = 0.5  # 50% of eye height as margin
            
            # Ensure minimum margins
            min_margin_x = int(face_width * 0.015)  # 1.5% of face width
            min_margin_y = int(face_height * 0.015)  # 1.5% of face height
            
            # Calculate margins
            left_margin_x = max(min_margin_x, int(left_eye_width * width_margin_factor))
            left_margin_y = max(min_margin_y, int(left_eye_height * height_margin_factor))
            right_margin_x = max(min_margin_x, int(right_eye_width * width_margin_factor))
            right_margin_y = max(min_margin_y, int(right_eye_height * height_margin_factor))
            
            # Calculate bounding boxes with adaptive margins
            # Left eye bounding box
            left_x_min = max(0, int(min(p[0] for p in left_eye_points)) - left_margin_x)
            left_y_min = max(0, int(min(p[1] for p in left_eye_points)) - left_margin_y)
            left_x_max = min(frame.shape[1], int(max(p[0] for p in left_eye_points)) + left_margin_x)
            left_y_max = min(frame.shape[0], int(max(p[1] for p in left_eye_points)) + left_margin_y)
            
            # Right eye bounding box
            right_x_min = max(0, int(min(p[0] for p in right_eye_points)) - right_margin_x)
            right_y_min = max(0, int(min(p[1] for p in right_eye_points)) - right_margin_y)
            right_x_max = min(frame.shape[1], int(max(p[0] for p in right_eye_points)) + right_margin_x)
            right_y_max = min(frame.shape[0], int(max(p[1] for p in right_eye_points)) + right_margin_y)
            
            # Make sure we have valid regions with minimum size
            min_size = 5  # Minimum size in pixels
            if (left_x_max - left_x_min) < min_size or (left_y_max - left_y_min) < min_size:
                left_eye = None
            else:
                # Extract eye regions
                left_eye = frame[left_y_min:left_y_max, left_x_min:left_x_max].copy()
            
            if (right_x_max - right_x_min) < min_size or (right_y_max - right_y_min) < min_size:
                right_eye = None
            else:
                right_eye = frame[right_y_min:right_y_max, right_x_min:right_x_max].copy()
            
            # Validate extracted regions
            if left_eye is None and right_eye is None:
                return None, None
                
            # Debug occasionally
            if np.random.random() < 0.01:  # 1% of the time
                if left_eye is not None:
                    print(f"Left eye region: {left_eye.shape[1]}x{left_eye.shape[0]}")
                if right_eye is not None:
                    print(f"Right eye region: {right_eye.shape[1]}x{right_eye.shape[0]}")
                
            return left_eye, right_eye
            
        except Exception as e:
            print(f"Error extracting eyes from landmarks: {e}")
            return None, None
            
    def detect_eye_state(self, frame, face_coords):
        """Detect if eyes are open or closed"""
        x_min, y_min, x_max, y_max = face_coords
        face_width = x_max - x_min
        face_height = y_max - y_min
        
        # Default to both eyes closed
        left_eye_open = False
        right_eye_open = False
        left_eye_img = None
        right_eye_img = None
        face_img = None
        left_eye_x, left_eye_y, left_eye_w, left_eye_h = 0, 0, 0, 0
        right_eye_x, right_eye_y, right_eye_w, right_eye_h = 0, 0, 0, 0
        
        try:
            # Use facial landmarks to extract eye regions if available
            if self.use_landmarks:
                face_img = frame[y_min:y_max, x_min:x_max]
                face_height, face_width = face_img.shape[:2]
                
                # Prepare input for landmarks model
                input_frame = cv2.resize(face_img, (self.landmarks_input_shape[3], self.landmarks_input_shape[2]))
                input_frame = input_frame.transpose((2, 0, 1))  # HWC to CHW
                input_frame = np.expand_dims(input_frame, axis=0)
                
                # Run inference
                landmarks = self.landmarks_compiled_model([input_frame])[self.landmarks_output_layer]
                landmarks = landmarks.reshape(-1, 2)  # Reshape to (N, 2) where N is number of landmarks
                
                # Scale landmarks to original face size
                landmarks[:, 0] *= face_width
                landmarks[:, 1] *= face_height
                
                # Use the new extract_eyes_from_landmarks method
                face_rect = [0, 0, face_width, face_height]  # Relative to face_img
                left_eye_img, right_eye_img = self.extract_eyes_from_landmarks(face_img, landmarks, face_rect)
                
                # Store eye coordinates for visualization
                if left_eye_img is not None:
                    left_eye_h, left_eye_w = left_eye_img.shape[:2]
                    left_eye_x = int(np.min(landmarks[0:6, 0]) - left_eye_w * 0.3)
                    left_eye_y = int(np.min(landmarks[0:6, 1]) - left_eye_h * 0.3)
                    left_eye_x = max(0, left_eye_x)
                    left_eye_y = max(0, left_eye_y)
                
                if right_eye_img is not None:
                    right_eye_h, right_eye_w = right_eye_img.shape[:2]
                    right_eye_x = int(np.min(landmarks[6:12, 0]) - right_eye_w * 0.3)
                    right_eye_y = int(np.min(landmarks[6:12, 1]) - right_eye_h * 0.3)
                    right_eye_x = max(0, right_eye_x)
                    right_eye_y = max(0, right_eye_y)
                
                # Draw landmarks on face for visualization
                for point in landmarks:
                    cv2.circle(face_img, tuple(point.astype(int)), 1, (0, 0, 255), -1)
                    
                # Draw eye regions for visualization if we have valid eye images
                if left_eye_img is not None:
                    cv2.rectangle(face_img, (left_eye_x, left_eye_y), 
                                (left_eye_x + left_eye_w, left_eye_y + left_eye_h), (0, 255, 0), 1)
                
                if right_eye_img is not None:
                    cv2.rectangle(face_img, (right_eye_x, right_eye_y), 
                                (right_eye_x + right_eye_w, right_eye_y + right_eye_h), (0, 255, 0), 1)
                    
                # Only print debug message occasionally to reduce console spam
                if np.random.random() < 0.01:  # Only print 1% of the time
                    print("Using facial landmarks for eye detection")
            else:
                # Fall back to approximate eye regions
                left_eye_x = int(x_min + face_width * 0.3)
                left_eye_y = int(y_min + face_height * 0.4)
                left_eye_w = int(face_width * 0.15)
                left_eye_h = int(face_height * 0.1)
                
                right_eye_x = int(x_min + face_width * 0.55)
                right_eye_y = int(y_min + face_height * 0.4)
                right_eye_w = int(face_width * 0.15)
                right_eye_h = int(face_height * 0.1)
                
                # Extract eye images from the original frame
                left_eye_img = frame[left_eye_y:left_eye_y+left_eye_h, left_eye_x:left_eye_x+left_eye_w]
                right_eye_img = frame[right_eye_y:right_eye_y+right_eye_h, right_eye_x:right_eye_x+right_eye_w]
                
            # Process eye images if they're valid
            if left_eye_img is not None and left_eye_img.size > 0:
                left_eye_open = self.process_eye_image(left_eye_img)
            
            if right_eye_img is not None and right_eye_img.size > 0:
                right_eye_open = self.process_eye_image(right_eye_img)
            
            # Improved blink detection for left eye with better state transitions
            if not left_eye_open:
                self.left_eye_closed_frames += 1
                # Only transition to Closed state after sufficient closed frames
                if self.left_eye_closed_frames > self.blink_threshold:
                    self.left_eye_state = "Closed"
            else:  # Eye is currently open
                # If eye was closed for a short time and now open, it was a blink
                if 1 <= self.left_eye_closed_frames <= self.blink_threshold:
                    self.left_eye_state = "Blinking"
                    # Reset the counter after detecting a blink
                    self.left_eye_closed_frames = 0
                # If eye was closed for longer and now open, it was closed and now opened
                elif self.left_eye_closed_frames > self.blink_threshold:
                    self.left_eye_state = "Open"  # Transition directly to Open
                    self.left_eye_closed_frames = 0
                # If eye was already open and still open, maintain Open state
                else:
                    self.left_eye_state = "Open"
            
            # Improved blink detection for right eye with better state transitions
            if not right_eye_open:
                self.right_eye_closed_frames += 1
                # Only transition to Closed state after sufficient closed frames
                if self.right_eye_closed_frames > self.blink_threshold:
                    self.right_eye_state = "Closed"
            else:  # Eye is currently open
                # If eye was closed for a short time and now open, it was a blink
                if 1 <= self.right_eye_closed_frames <= self.blink_threshold:
                    self.right_eye_state = "Blinking"
                    # Reset the counter after detecting a blink
                    self.right_eye_closed_frames = 0
                # If eye was closed for longer and now open, it was closed and now opened
                elif self.right_eye_closed_frames > self.blink_threshold:
                    self.right_eye_state = "Open"  # Transition directly to Open
                    self.right_eye_closed_frames = 0
                # If eye was already open and still open, maintain Open state
                else:
                    self.right_eye_state = "Open"
        except Exception as e:
            print(f"Error in eye state detection: {e}")
            # Default to eyes open if there's an error
            self.left_eye_state = "Open"
            self.right_eye_state = "Open"
            left_eye_open = True
            right_eye_open = True
            
        # Set colors based on eye states
        left_eye_color = (0, 255, 0) if self.left_eye_state == "Open" else \
                       (0, 165, 255) if self.left_eye_state == "Blinking" else (0, 0, 255)
        right_eye_color = (0, 255, 0) if self.right_eye_state == "Open" else \
                        (0, 165, 255) if self.right_eye_state == "Blinking" else (0, 0, 255)
                        
        # Draw rectangles with thicker lines for better visibility if we have valid eye regions
        try:
            if 'face_img' in locals() and 'left_eye_x' in locals():
                cv2.rectangle(face_img, (left_eye_x, left_eye_y), 
                            (left_eye_x + left_eye_w, left_eye_y + left_eye_h), left_eye_color, 2)
                cv2.rectangle(face_img, (right_eye_x, right_eye_y), 
                            (right_eye_x + right_eye_w, right_eye_y + right_eye_h), right_eye_color, 2)
        except Exception as e:
            print(f"Error drawing eye rectangles: {e}")
            
        # Add eye state text to the main frame for debugging
        cv2.putText(frame, f"L: {self.left_eye_state}", 
                  (x_min, y_min - 10), 
                  cv2.FONT_HERSHEY_SIMPLEX, 0.5, left_eye_color, 2)
        cv2.putText(frame, f"R: {self.right_eye_state}", 
                  (x_min + 80, y_min - 10), 
                  cv2.FONT_HERSHEY_SIMPLEX, 0.5, right_eye_color, 2)
        
        # Return the eye states
        return left_eye_open, right_eye_open
    
    def process_eye_image(self, eye_img):
        """Process an eye image and determine if it's open or closed using a hybrid approach"""
        try:
            # Store original dimensions for debugging
            orig_h, orig_w = eye_img.shape[:2] if eye_img is not None else (0, 0)
            
            # Basic validation
            if eye_img is None or eye_img.size == 0 or eye_img.shape[0] < 5 or eye_img.shape[1] < 5:
                return False  # Consider invalid eyes as closed
            
            # Always get CV-based result for comparison and fallback
            is_open_cv = self.detect_eye_open_using_cv(eye_img)
            
            # If deep learning model is available and properly loaded, use it
            if hasattr(self, 'use_eye_model') and self.use_eye_model:
                try:
                    # Apply CLAHE for better contrast before ML processing
                    gray_eye = cv2.cvtColor(eye_img, cv2.COLOR_BGR2GRAY)
                    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
                    enhanced_eye = clahe.apply(gray_eye)
                    enhanced_eye = cv2.cvtColor(enhanced_eye, cv2.COLOR_GRAY2BGR)
                    
                    # Resize to model input size
                    n, c, h, w = self.eye_input_shape
                    input_frame = cv2.resize(enhanced_eye, (w, h), interpolation=cv2.INTER_AREA)
                    
                    # Normalize and format for model
                    input_frame = input_frame.astype(np.float32) / 255.0
                    input_frame = input_frame.transpose((2, 0, 1))  # HWC to CHW
                    input_frame = np.expand_dims(input_frame, axis=0)
                    
                    # Run inference
                    results = self.eye_compiled_model([input_frame])[self.eye_output_layer]
                    prediction = results[0]
                    
                    # Get probabilities - model output format may vary
                    # Some models output [open_prob, closed_prob], others [closed_prob, open_prob]
                    # Check documentation or test with known samples
                    open_prob = float(prediction[1])  # Assuming index 1 is open probability
                    closed_prob = float(prediction[0])  # Assuming index 0 is closed probability
                    
                    # Calculate additional features for more robust decision
                    local_variance = np.var(gray_eye)
                    
                    # Edge detection for additional validation
                    edges = cv2.Canny(gray_eye, 50, 150)
                    edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
                    
                    # Hybrid decision logic with bias toward detecting closed eyes
                    # Strong indicators for closed eyes - override model if needed
                    if local_variance < 150 and edge_density < 0.05:
                        final_decision = False  # Definitely closed based on strong CV indicators
                        if np.random.random() < 0.1:  # 10% of these cases
                            print(f"Strong CV override: Closed eye detected (var={local_variance:.1f}, edge={edge_density:.3f})")
                    # If model is very confident about closed eyes, trust it
                    elif closed_prob > 0.7:  # Lower threshold for closed eyes
                        final_decision = False  # Definitely closed
                    # Higher threshold for open eyes to avoid false positives
                    elif open_prob > 0.85 and local_variance > 300:  
                        final_decision = True  # Definitely open
                    # Medium confidence - use CV features to validate with bias toward closed
                    elif abs(open_prob - closed_prob) > 0.2:
                        # If ML says open but variance is low or edges are few, it's likely wrong
                        if is_open_cv and (local_variance < 250 or edge_density < 0.03):
                            final_decision = False
                        # If ML says closed but variance and edge density are very high, reconsider
                        elif not is_open_cv and local_variance > 600 and edge_density > 0.06:
                            final_decision = True
                        else:
                            # Bias toward closed eyes
                            final_decision = open_prob > (closed_prob + 0.1)  # Need 10% more confidence for open
                    # Low confidence - rely more on CV features with closed eye bias
                    else:
                        # Use weighted combination with bias toward closed eyes
                        ml_weight = 0.5
                        cv_weight = 0.5
                        ml_score = open_prob  # Use actual probability instead of binary
                        cv_score = 1.0 if is_open_cv else 0.0
                        
                        # Higher threshold (0.55) to favor closed eye detection
                        final_decision = (ml_weight * ml_score + cv_weight * cv_score) > 0.55
                    
                    # Print debug info more frequently for better monitoring
                    if np.random.random() < 0.1:  # Print 10% of the time
                        print(f"Eye ({orig_w}x{orig_h}) - CV: {'Open' if is_open_cv else 'Closed'}, "
                              f"Var: {local_variance:.1f}, Edge: {edge_density:.3f}, "
                              f"ML: open={open_prob:.2f}/closed={closed_prob:.2f}, "
                              f"Final: {'Open' if final_decision else 'Closed'}")
                    
                    return final_decision
                    
                except Exception as e:
                    print(f"Error in ML eye processing: {e}")
                    return is_open_cv  # Fallback to CV method
            else:
                # Use only CV-based method
                return is_open_cv
                
        except Exception as e:
            print(f"Error processing eye image: {e}")
            return False  # Default to closed in case of errors - safer for detecting sleeping
    
    def detect_eye_open_using_cv(self, eye_img):
        """Improved eye detection using robust CV techniques optimized for closed eye detection"""
        # Basic validation
        if eye_img is None or eye_img.size == 0 or eye_img.shape[0] < 3 or eye_img.shape[1] < 3:
            return False
        
        try:
            # Convert to grayscale
            if len(eye_img.shape) == 3:
                gray = cv2.cvtColor(eye_img, cv2.COLOR_BGR2GRAY)
            else:
                gray = eye_img
            
            # Apply CLAHE for better contrast
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(4,4))
            enhanced = clahe.apply(gray)
                
            # Calculate variance (closed eyes have less variance)
            var = np.var(enhanced)
            
            # Calculate histogram and entropy
            hist = cv2.calcHist([enhanced], [0], None, [256], [0, 256])
            hist = hist / (hist.sum() + 1e-5)  # Normalize with epsilon
            entropy = -np.sum(hist * np.log2(hist + 1e-7))  # Add small epsilon to avoid log(0)
            
            # Detect edges (open eyes have more edges)
            edges = cv2.Canny(enhanced, 30, 150)
            edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
            
            # Calculate Laplacian variance (measure of focus/detail)
            lap_var = cv2.Laplacian(enhanced, cv2.CV_64F).var()
            
            # Calculate horizontal line density (for detecting eye openness)
            # Horizontal projection - sum of pixel values along rows
            h_projection = np.sum(enhanced, axis=1)
            h_projection_norm = h_projection / (np.max(h_projection) + 1e-5)
            
            # Calculate peaks in the horizontal projection
            peaks = np.sum(h_projection_norm > 0.7)
            peak_density = peaks / len(h_projection_norm)
            
            # Calculate Eye Aspect Ratio (EAR) if possible
            ear_score = 0.0
            try:
                # Find contours for eye shape analysis
                _, thresh = cv2.threshold(enhanced, 70, 255, cv2.THRESH_BINARY)
                contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                if contours:
                    largest_contour = max(contours, key=cv2.contourArea)
                    if len(largest_contour) >= 5:  # Need at least 5 points for ellipse fitting
                        ellipse = cv2.fitEllipse(largest_contour)
                        (_, _), (width, height), _ = ellipse
                        if width > 0:
                            ear = height / width
                            # Typical EAR for open eyes is 0.2-0.4
                            ear_score = min(1.0, ear * 2.5) if 0.15 <= ear <= 0.5 else 0.0
            except Exception as e:
                # Just continue with other methods if EAR calculation fails
                pass
            
            # Adaptive thresholds based on image size
            h, w = enhanced.shape
            size_factor = np.sqrt(h * w) / 20  # Normalize for different eye sizes
            
            # Calculate weighted score with more emphasis on variance and edge density
            var_score = min(1.0, var / 500)  # Lower threshold to detect more closed eyes
            edge_score = min(1.0, edge_density / 0.12)  # Lower threshold for edge density
            entropy_score = min(1.0, entropy / 7.0)
            lap_score = min(1.0, lap_var / 100)
            peak_score = min(1.0, peak_density / 0.3)
            
            # Add EAR to features if available
            if ear_score > 0:
                # Weighted combination with EAR
                weights = [0.25, 0.2, 0.1, 0.15, 0.1, 0.2]  # Last weight is for EAR
                features = [var_score, edge_score, entropy_score, lap_score, peak_score, ear_score]
            else:
                # Weighted combination without EAR
                weights = [0.3, 0.25, 0.15, 0.15, 0.15]
                features = [var_score, edge_score, entropy_score, lap_score, peak_score]
            
            final_score = sum(w * f for w, f in zip(weights, features))
            
            # More aggressive threshold for detecting closed eyes
            threshold = 0.4  # Lower threshold to detect more closed eyes
            is_open = final_score > threshold
            
            # Strong override for clearly closed eyes
            if var < 150 and edge_density < 0.05 and lap_var < 50:
                is_open = False
                final_score = 0.0  # Force very low score
            
            # Debug occasionally
            if np.random.random() < 0.02:  # 2% of calls
                ear_info = f", EAR: {ear_score:.2f}" if ear_score > 0 else ""
                print(f"CV eye scores - Var: {var:.1f}, Edge: {edge_density:.3f}, Ent: {entropy:.2f}, "
                      f"Lap: {lap_var:.1f}, Peaks: {peak_density:.2f}{ear_info}, Score: {final_score:.2f}, "
                      f"Decision: {'Open' if is_open else 'Closed'}")
                
            return is_open
            
        except Exception as e:
            print(f"Error in CV eye detection: {e}")
            return False  # Default to closed in case of errors
            
        except Exception as e:
            print(f"Error in CV eye detection: {e}")
            return True  # Default to open in case of errors
            
            #-------------------------------------------------------------
            # FEATURE 1: Eye Aspect Ratio (EAR) - Most reliable for closed eyes
            #-------------------------------------------------------------
            ear_score = self._calculate_eye_aspect_ratio(blurred)
            
            #-------------------------------------------------------------
            # FEATURE 2: Horizontal line density - closed eyes have strong horizontal patterns
            #-------------------------------------------------------------
            horizontal_score = self._calculate_horizontal_line_density(blurred)
            
            #-------------------------------------------------------------
            # FEATURE 3: Variance in middle region - closed eyes have low variance
            #-------------------------------------------------------------
            variance_score = self._calculate_variance_score(blurred)
            
            #-------------------------------------------------------------
            # FEATURE 4: Edge pattern analysis - open eyes have circular/curved edges
            #-------------------------------------------------------------
            edge_pattern_score = self._calculate_edge_pattern_score(blurred)
            
            #-------------------------------------------------------------
            # FEATURE 5: Intensity gradient analysis - closed eyes have minimal gradients
            #-------------------------------------------------------------
            gradient_score = self._calculate_gradient_score(blurred)
            
            #-------------------------------------------------------------
            # Weighted scoring system optimized for closed eye detection
            #-------------------------------------------------------------
            # Weights based on feature reliability (higher weight = more reliable)
            weights = {
                'ear': 0.35,           # Most reliable
                'horizontal': 0.25,    # Very good for closed eyes
                'variance': 0.20,      # Good discriminator
                'edge_pattern': 0.15,  # Moderate reliability
                'gradient': 0.05       # Least reliable but helpful
            }
            
            # Calculate weighted score (0-1 range, higher = more likely open)
            total_score = (
                ear_score * weights['ear'] +
                horizontal_score * weights['horizontal'] +
                variance_score * weights['variance'] +
                edge_pattern_score * weights['edge_pattern'] +
                gradient_score * weights['gradient']
            )
            
            # Adaptive threshold based on image quality
            threshold = 0.4  # Base threshold
            
            # Adjust for very small images
            if orig_h < 15 or orig_w < 15:
                threshold = 0.35  # Lower threshold for tiny images
            
            # Adjust for low contrast images
            if np.std(enhanced) < 20:
                threshold = 0.35
            
            is_open = total_score > threshold
            
            # Debug logging (reduced frequency)
            if hasattr(self, 'debug_eye_detection') and self.debug_eye_detection and np.random.random() < 0.02:
                print(f"Eye detection - EAR: {ear_score:.2f}, Horiz: {horizontal_score:.2f}, "
                      f"Var: {variance_score:.2f}, Edge: {edge_pattern_score:.2f}, "
                      f"Grad: {gradient_score:.2f}, Total: {total_score:.2f}, "
                      f"Threshold: {threshold:.2f}, Open: {is_open}")
            
            return is_open
            
        except Exception as e:
            print(f"Error in CV eye detection: {e}")
            return False  # Default to closed in case of error

    def _calculate_eye_aspect_ratio(self, gray_img):
        """Calculate a score based on eye aspect ratio concept"""
        h, w = gray_img.shape
        if h < 5 or w < 5:
            return 0.0
        
        # Find contours
        edges = cv2.Canny(gray_img, 30, 100)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return 0.0
        
        # Find the largest contour (likely the eye boundary)
        largest_contour = max(contours, key=cv2.contourArea)
        
        if len(largest_contour) < 5:
            return 0.0
        
        # Fit ellipse to the largest contour
        try:
            ellipse = cv2.fitEllipse(largest_contour)
            (center_x, center_y), (width, height), angle = ellipse
            
            # Calculate aspect ratio (height/width)
            if width > 0:
                aspect_ratio = height / width
                # Open eyes typically have aspect ratio 0.2-0.4
                # Closed eyes have aspect ratio < 0.15 or very elongated
                if 0.2 <= aspect_ratio <= 0.5:
                    return min(1.0, aspect_ratio * 2.5)  # Scale to 0-1
                else:
                    return 0.0
            else:
                return 0.0
        except:
            return 0.0

    def _calculate_horizontal_line_density(self, gray_img):
        """Calculate density of horizontal lines (strong indicator of closed eyes)"""
        h, w = gray_img.shape
        
        # Create horizontal line detection kernel
        kernel = np.array([[-1, -1, -1],
                           [ 2,  2,  2],
                           [-1, -1, -1]], dtype=np.float32)
        
        # Apply kernel
        horizontal_lines = cv2.filter2D(gray_img, -1, kernel)
        
        # Threshold to get strong horizontal features
        _, binary = cv2.threshold(np.abs(horizontal_lines), 30, 255, cv2.THRESH_BINARY)
        
        # Calculate density of horizontal features
        density = np.sum(binary > 0) / (h * w)
        
        # Closed eyes typically have high horizontal line density
        # Invert score: high density = low open score
        return max(0.0, 1.0 - min(1.0, density * 5))

    def _calculate_variance_score(self, gray_img):
        """Calculate variance-based score (closed eyes have lower variance)"""
        # Focus on center region where pupil/iris would be
        h, w = gray_img.shape
        center_h_start = h // 4
        center_h_end = 3 * h // 4
        center_w_start = w // 4
        center_w_end = 3 * w // 4
        
        center_region = gray_img[center_h_start:center_h_end, center_w_start:center_w_end]
        
        if center_region.size == 0:
            return 0.0
        
        variance = np.var(center_region)
        
        # Normalize variance score
        # Open eyes typically have variance > 200
        # Closed eyes typically have variance < 100
        if variance > 300:
            return 1.0
        elif variance > 150:
            return 0.7
        elif variance > 75:
            return 0.4
        else:
            return 0.0

    def _calculate_edge_pattern_score(self, gray_img):
        """Analyze edge patterns - open eyes have curved/circular patterns"""
        # Apply edge detection
        edges = cv2.Canny(gray_img, 20, 100)
        
        # Look for circular patterns using Hough circles
        try:
            circles = cv2.HoughCircles(gray_img, cv2.HOUGH_GRADIENT, dp=1, minDist=10,
                                     param1=50, param2=15, 
                                     minRadius=2, maxRadius=max(gray_img.shape) // 2)
            if circles is not None:
                return 1.0  # Strong indicator of open eye
        except:
            pass
        
        # Analyze edge density and distribution
        edge_density = np.sum(edges > 0) / edges.size
        
        # Open eyes typically have moderate edge density (0.05-0.2)
        # Closed eyes have either very low or very high edge density
        if 0.05 <= edge_density <= 0.2:
            return min(1.0, edge_density * 10)
        else:
            return 0.0

    def _calculate_gradient_score(self, gray_img):
        """Calculate gradient-based score"""
        # Calculate gradients
        grad_x = cv2.Sobel(gray_img, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray_img, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        avg_gradient = np.mean(gradient_magnitude)
        
        # Open eyes typically have higher gradients due to iris/pupil boundaries
        if avg_gradient > 20:
            return 1.0
        elif avg_gradient > 10:
            return 0.7
        elif avg_gradient > 5:
            return 0.3
        else:
            return 0.0
            
    def estimate_gaze(self, frame, face_coords, head_pose):
        """Estimate gaze direction based on head pose and eye landmarks
        Returns a 3D vector representing the gaze direction (x,y,z)
        """
        try:
            # Extract face coordinates
            x_min, y_min, x_max, y_max = face_coords
            face_width = x_max - x_min
            face_height = y_max - y_min
            
            # Use head pose as primary gaze direction indicator
            yaw, pitch, roll = head_pose
            
            # Convert from degrees to normalized vector
            # Yaw affects x, pitch affects y
            # Normalize to [-1, 1] range (approximate)
            x_gaze = np.sin(np.radians(yaw)) * -1  # Negative because positive yaw is right
            y_gaze = np.sin(np.radians(pitch))
            z_gaze = np.cos(np.radians(yaw)) * np.cos(np.radians(pitch))
            
            # Normalization
            magnitude = np.sqrt(x_gaze**2 + y_gaze**2 + z_gaze**2)
            if magnitude > 0:
                x_gaze /= magnitude
                y_gaze /= magnitude
                z_gaze /= magnitude
            
            return np.array([x_gaze, y_gaze, z_gaze])
        except Exception as e:
            print(f"Error estimating gaze: {e}")
            return np.array([0.0, 0.0, 1.0])  # Default to looking forward

    def calculate_engagement(self, emotion, head_pose, eye_state=None, gaze_vector=None, posture_data=None):
        """Calculate engagement score using a weighted sum of all tracked parameters with optimized weights"""
        # Extract individual parameters
        yaw, pitch, roll = head_pose
        left_eye_open, right_eye_open = eye_state if eye_state else (True, True)
        
        # Get posture and gesture data if available
        posture_score = 0.7  # Default to reasonable posture
        posture_state = "Upright"
        gesture_state = "None"
        if hasattr(self, 'posture_score') and self.posture_score is not None:
            posture_score = self.posture_score
            posture_state = self.posture_state
            gesture_state = self.gesture_state
        
        # Get optimized weights based on current context
        weights = self.weight_optimizer.get_optimized_weights(self.context)
        
        # Dynamic weight adjustment based on classroom activity
        if gesture_state != "None" and weights['gesture'] < 15:
            # Temporarily boost gesture importance in interactive sessions
            weights = self._adjust_weights(weights, 'gesture', 10)
        
        # Initialize individual component scores (0-100 scale)
        component_scores = {}
        if self.face_present:
            component_scores['face_presence'] = 100
        else:
            # Decrease based on time without face
            time_without_face = time.time() - self.last_face_time
            if time_without_face <= 1:
                component_scores['face_presence'] = 80  # Brief absence
            elif time_without_face <= 3:
                component_scores['face_presence'] = 50  # Short absence
            elif time_without_face <= 6:
                component_scores['face_presence'] = 20  # Medium absence
            else:
                component_scores['face_presence'] = 0   # Long absence
        
        # 2. Emotion score
        emotion_values = {
            'happy': 100,
            'surprise': 80,
            'neutral': 70,
            'sad': 40,
            'anger': 20,
            'fear': 30,
            'disgust': 30
        }
        component_scores['emotion'] = emotion_values.get(emotion, 70)  # Default to neutral
        
        # 3. Eye state score
        if self.left_eye_state == "Open" and self.right_eye_state == "Open":
            component_scores['eye_state'] = 100  # Both eyes open
        elif self.left_eye_state == "Blinking" and self.right_eye_state == "Blinking":
            component_scores['eye_state'] = 90   # Normal blinking
        elif (self.left_eye_state == "Open" and self.right_eye_state == "Blinking") or \
             (self.left_eye_state == "Blinking" and self.right_eye_state == "Open"):
            component_scores['eye_state'] = 85   # One eye blinking
        elif (self.left_eye_state == "Open" and self.right_eye_state == "Closed") or \
             (self.left_eye_state == "Closed" and self.right_eye_state == "Open"):
            component_scores['eye_state'] = 60   # One eye closed
        else:  # Both eyes closed
            component_scores['eye_state'] = 20
        
        # 4. Head pose score
        # Calculate head pose score based on yaw and pitch
        # Perfect: Looking straight ahead (yaw ≈ 0, pitch ≈ 0)
        yaw_score = max(0, 100 - abs(yaw) * 2)  # Penalize turning head left/right
        pitch_score = max(0, 100 - abs(pitch) * 3)  # Penalize looking up/down
        component_scores['head_pose'] = (yaw_score + pitch_score) / 2
        
        # 5. Gaze score
        if gaze_vector is not None:
            gaze_x, gaze_y, gaze_z = gaze_vector
            # Perfect gaze: Looking straight ahead (x≈0, y≈0, z≈1)
            gaze_deviation = np.sqrt(gaze_x**2 + gaze_y**2)  # How far from center
            component_scores['gaze'] = max(0, 100 - gaze_deviation * 100)
        else:
            component_scores['gaze'] = 70  # Default if gaze not available
        
        # 6. Posture score
        # Convert posture_score (0-1) to 0-100 scale
        component_scores['posture'] = posture_score * 100
        
        # 7. Gesture score
        # Gestures can indicate engagement
        if gesture_state == "Hand Raised":
            component_scores['gesture'] = 100  # Actively participating
        elif gesture_state == "Gesturing":
            component_scores['gesture'] = 90   # Animated/engaged
        else:
            component_scores['gesture'] = 70   # Neutral
        
        # Calculate weighted sum
        weighted_score = 0
        for component, score in component_scores.items():
            weighted_score += score * (weights[component] / 100)
        
        # Store the previous raw score before updating
        previous_raw_score = self.raw_engagement_score
        
        # Update raw score (with smoothing to avoid jumps)
        self.raw_engagement_score = 0.7 * self.raw_engagement_score + 0.3 * weighted_score
        
        # Ensure raw score stays within bounds
        self.raw_engagement_score = max(0, min(100, self.raw_engagement_score))
        
        # Enhanced temporal analysis - track multiple time windows
        self.short_term_scores.append(self.raw_engagement_score)
        self.medium_term_scores.append(self.raw_engagement_score)
        self.long_term_scores.append(self.raw_engagement_score)
        
        # Apply temporal smoothing using moving average (short-term for UI)
        self.score_history.append(self.raw_engagement_score)
        if len(self.score_history) > self.smoothing_window:
            self.score_history.pop(0)
        
        # Calculate smoothed score as the average of recent scores
        self.engagement_score = sum(self.score_history) / len(self.score_history)
        
        # Analyze engagement trends
        self._analyze_engagement_trends()
        
        # Store component scores for potential training data
        if hasattr(self, 'component_history'):
            self.component_history.append(component_scores.copy())
        else:
            self.component_history = [component_scores.copy()]
            
        # Limit history size
        if len(self.component_history) > 100:
            self.component_history.pop(0)
        
        # Log significant changes and component scores for debugging
        score_change = self.engagement_score - previous_raw_score
        if abs(score_change) > 5:
            print(f"Score change: {score_change:.1f}, Raw: {self.raw_engagement_score:.1f}, Smoothed: {self.engagement_score:.1f}")
            # Uncomment for detailed component breakdown
            # print(f"Components: {component_scores}")
            
        return self.engagement_score
                
    def _adjust_weights(self, weights, component_to_boost, boost_amount):
        """Dynamically adjust weights while maintaining sum of 100"""
        # Create a copy of weights to modify
        adjusted_weights = weights.copy()
        
        # Calculate how much to reduce other weights
        original_weight = adjusted_weights[component_to_boost]
        target_weight = min(50, original_weight + boost_amount)  # Cap at 50%
        weight_increase = target_weight - original_weight
        
        if weight_increase <= 0:
            return adjusted_weights  # No adjustment needed
        
        # Distribute weight reduction proportionally among other components
        total_other_weights = sum(w for c, w in adjusted_weights.items() if c != component_to_boost)
        reduction_factor = weight_increase / total_other_weights
        
        for component in adjusted_weights:
            if component != component_to_boost:
                # Reduce proportionally but ensure no weight goes below 1%
                adjusted_weights[component] = max(1, adjusted_weights[component] * (1 - reduction_factor))
        
        # Set the boosted component weight
        adjusted_weights[component_to_boost] = target_weight
        
        # Normalize to ensure sum is exactly 100
        total = sum(adjusted_weights.values())
        for component in adjusted_weights:
            adjusted_weights[component] = adjusted_weights[component] / total * 100
            
        return adjusted_weights
    
    def _analyze_engagement_trends(self):
        """Analyze engagement trends across different time windows"""
        if len(self.medium_term_scores) < 30:  # Need sufficient data
            return
            
        # Calculate trend over medium term (1 minute)
        recent_avg = sum(list(self.medium_term_scores)[-10:]) / 10
        earlier_avg = sum(list(self.medium_term_scores)[-30:-20]) / 10
        
        # Determine trend direction
        diff = recent_avg - earlier_avg
        prev_direction = self.trend_direction
        
        if diff > 5:
            self.trend_direction = "increasing"
        elif diff < -5:
            self.trend_direction = "decreasing"
        else:
            self.trend_direction = "stable"
            
        # Update trend duration
        if self.trend_direction == prev_direction:
            self.trend_duration += 1
        else:
            self.trend_duration = 1
            
        # Long-term analysis (5 minutes)
        if len(self.long_term_scores) >= 300:
            long_term_avg = sum(self.long_term_scores) / len(self.long_term_scores)
            # Could trigger alerts or interventions for persistent low engagement
            if long_term_avg < 40 and self.trend_direction != "increasing":
                # This would be a good place to trigger an intervention
                # e.g., suggest a break or change of activity
                pass
    
    def save_training_sample(self, ground_truth_score):
        """Save current component scores as training data with teacher-provided ground truth"""
        if hasattr(self, 'component_history') and len(self.component_history) > 0:
            # Get the most recent component scores
            latest_scores = self.component_history[-1]
            # Add to weight optimizer training data
            self.weight_optimizer.add_training_sample(latest_scores, ground_truth_score)
            return True
        return False
    
    def train_weight_model(self):
        """Train the weight optimization model with collected data"""
        return self.weight_optimizer.train_model()
    
    def set_context(self, context):
        """Set the current classroom context"""
        self.context = context
        print(f"Context set to: {context}")
        # Get the weights for this context
        weights = self.weight_optimizer.get_optimized_weights(context)
        print(f"Using weights: {weights}")
        return weights
    
    def process_frame(self, frame):
        # Detect faces
        faces = self.detect_faces(frame)
        
        # If no faces detected, decrease engagement score
        if not faces:
            self.face_absent_frames += 1
            if self.face_absent_frames > 3:  # If face absent for more than 3 frames
                self.engagement_score -= 5  # Decrease engagement score faster
                self.engagement_score = max(0, self.engagement_score)  # Ensure score doesn't go below 0
            return frame
        
        # Reset face absent counter if face is detected
        self.face_absent_frames = 0
        
        # Process the largest face (assuming it's the user)
        largest_face = max(faces, key=lambda bbox: (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]))
        
        # Draw bounding box around face
        x_min, y_min, x_max, y_max = largest_face
        cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
        
        # Detect emotion
        emotion = self.analyze_emotion(frame, largest_face)
        
        # Detect head pose
        head_pose = self.analyze_head_pose(frame, largest_face)
        yaw, pitch, roll = head_pose
        
        # Detect eye state
        left_eye_open, right_eye_open = self.detect_eye_state(frame, largest_face)
        eye_state = (left_eye_open, right_eye_open)
        
        # Estimate gaze direction
        gaze_vector = self.estimate_gaze(frame, largest_face, head_pose)
        
        # Detect posture and gestures if MediaPipe is available
        posture_data = None
        if hasattr(self, 'detect_posture'):
            try:
                posture_data = self.detect_posture(frame)
            except Exception as e:
                print(f"Error detecting posture: {e}")
        
        # Calculate engagement score with all available parameters
        self.calculate_engagement(emotion, head_pose, eye_state, gaze_vector, posture_data)
        
        # Display results on frame
        # Format text for display
        emotion_text = f"Emotion: {emotion}"
        head_pose_text = f"Head Pose: Yaw={yaw:.1f}, Pitch={pitch:.1f}, Roll={roll:.1f}"
        
        # Convert boolean to text for eye state
        left_eye_status = "Open" if left_eye_open else "Closed"
        right_eye_status = "Open" if right_eye_open else "Closed"
        eye_text = f"Eyes: L:{left_eye_status} R:{right_eye_status}"
        
        # Format gaze text
        gaze_text = "Gaze: N/A"
        if gaze_vector is not None:
            gaze_x, gaze_y, gaze_z = gaze_vector
            gaze_text = f"Gaze: X={gaze_x:.2f}, Y={gaze_y:.2f}, Z={gaze_z:.2f}"
            
            # Visualize gaze direction
            face_center_x = (x_min + x_max) // 2
            face_center_y = (y_min + y_max) // 2
            
            # Scale the gaze vector for visualization
            scale = 100
            gaze_end_x = face_center_x + int(gaze_x * scale)
            gaze_end_y = face_center_y - int(gaze_y * scale)  # Negative because y is inverted in image coordinates
            
            # Draw gaze direction line
            cv2.line(frame, (face_center_x, face_center_y), (gaze_end_x, gaze_end_y), (255, 0, 255), 2)
            cv2.circle(frame, (gaze_end_x, gaze_end_y), 5, (255, 0, 255), -1)
        
        # Draw text on frame
        cv2.putText(frame, emotion_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        cv2.putText(frame, head_pose_text, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        cv2.putText(frame, eye_text, (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        cv2.putText(frame, gaze_text, (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        
        # Display engagement scores
        score_text = f"Engagement: {int(self.engagement_score)}%"
        cv2.putText(frame, score_text, (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        
        # Display component scores if available
        if hasattr(self, 'posture_score') and self.posture_score is not None:
            posture_text = f"Posture: {int(self.posture_score * 100)}%"
            cv2.putText(frame, posture_text, (10, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        
        if hasattr(self, 'gesture_state') and self.gesture_state != "None":
            gesture_text = f"Gesture: {self.gesture_state}"
            cv2.putText(frame, gesture_text, (10, 210), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        
        # Display raw score for comparison
        raw_score_text = f"Raw Score: {int(self.raw_engagement_score)}%"
        cv2.putText(frame, raw_score_text, (frame.shape[1] - 200, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        
        # Draw engagement meter
        meter_width = 150
        meter_height = 20
        meter_x = 10
        meter_y = 200
        
        # Draw background rectangle
        cv2.rectangle(frame, (meter_x, meter_y), (meter_x + meter_width, meter_y + meter_height), (100, 100, 100), -1)
        
        # Draw filled rectangle based on smoothed engagement score
        filled_width = int(meter_width * self.engagement_score / 100)
        
        # Color based on engagement level (red for low, yellow for medium, green for high)
        if self.engagement_score < 30:
            color = (0, 0, 255)  # Red
        elif self.engagement_score < 70:
            color = (0, 255, 255)  # Yellow
        else:
            color = (0, 255, 0)  # Green
            
        cv2.rectangle(frame, (meter_x, meter_y), (meter_x + filled_width, meter_y + meter_height), color, -1)
        
        # Draw a marker for the raw score position on the meter
        raw_position = int(meter_width * self.raw_engagement_score / 100)
        cv2.line(frame, 
                (meter_x + raw_position, meter_y - 5), 
                (meter_x + raw_position, meter_y + meter_height + 5), 
                (255, 255, 255), 2)
        
        return frame


def main():
    print("DEBUG: Starting main function")
    # Define available contexts
    contexts = ["lecture", "interactive", "exam", "group_work"]
    current_context_idx = 0
    
    print("DEBUG: Initializing webcam")
    # Simplified webcam initialization
    try:
        # Try the simplest approach first
        print("Trying simple webcam initialization...")
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("Failed to open webcam with simple initialization")
            print("Checking available cameras...")
            # Check if any cameras are available
            for i in range(3):  # Try first 3 camera indices
                print(f"Trying camera index {i}...")
                test_cap = cv2.VideoCapture(i)
                if test_cap.isOpened():
                    print(f"Camera index {i} is available")
                    ret, frame = test_cap.read()
                    if ret:
                        print(f"Successfully read frame from camera {i}")
                        cap = test_cap
                        webcam_opened = True
                        break
                    else:
                        print(f"Failed to read frame from camera {i}")
                        test_cap.release()
                else:
                    print(f"Camera index {i} is not available")
        else:
            print("Webcam opened with simple initialization")
            webcam_opened = True
    except Exception as e:
        print(f"Error during webcam initialization: {e}")
        import traceback
        traceback.print_exc()
        webcam_opened = False
    
    if not webcam_opened:
        print("Error: Could not open webcam with any backend.")
        return
    
    print("DEBUG: About to initialize EngagementAnalyzer")
    try:
        # Check if required model files exist
        required_models = [
            "face-detection-adas-0001/FP32/face-detection-adas-0001.xml",
            "emotions-recognition-retail-0003/FP32/emotions-recognition-retail-0003.xml",
            "head-pose-estimation-adas-0001/FP32/head-pose-estimation-adas-0001.xml"
        ]
        
        base_dir = "c:/Users/rkgup/OneDrive/Desktop/corementis/backend"
        missing_models = []
        
        for model in required_models:
            model_path = os.path.join(base_dir, model)
            if not os.path.exists(model_path):
                missing_models.append(model)
        
        if missing_models:
            print("ERROR: The following required model files are missing:")
            for model in missing_models:
                print(f"  - {model}")
            print("\nRunning simplified webcam display instead...")
            
            # Run simplified webcam display
            while True:
                ret, frame = cap.read()
                if not ret:
                    print("Failed to read frame")
                    break
                    
                cv2.putText(frame, "Missing required models", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                cv2.putText(frame, "Running in simplified mode", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                
                cv2.imshow('Engagement Analysis (Simplified)', frame)
                
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    break
            
            cap.release()
            cv2.destroyAllWindows()
            return
        
        # Initialize analyzer if all models are present
        analyzer = EngagementAnalyzer(context="lecture")
        print("DEBUG: EngagementAnalyzer initialized successfully")
    except Exception as e:
        print(f"ERROR: Failed to initialize EngagementAnalyzer: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Check if we have any saved weight optimization data
    if os.path.exists(os.path.join(analyzer.base_dir, "weight_optimization_model.pkl")):
        print("Loading saved weight optimization model...")
        analyzer.weight_optimizer.load_model(os.path.join(analyzer.base_dir, "weight_optimization_model.pkl"))
    
    # Training mode flag
    training_mode = False
    collected_samples = 0
    
    print("\nClassroom Engagement Analyzer with Dynamic Weight Optimization")
    print("--------------------------------------------------------------")
    print("Press 'c' to cycle through contexts: lecture, interactive, exam, group_work")
    print("Press 't' to toggle training mode (collect ground truth samples)")
    print("In training mode, use number keys 1-9 to rate engagement (10-90%) or 0 for 100%")
    print("Press 'm' to train the weight optimization model (requires collected samples)")
    print("Press 's' to save the trained model and weights")
    print("Press 'q' to quit")
    
    # Counter for consecutive frame failures
    frame_failure_count = 0
    max_failures = 5  # Maximum consecutive failures before exiting
    
    while True:
        # Read frame from webcam
        ret, frame = cap.read()
        
        # Handle frame capture failure
        if not ret or frame is None or frame.size == 0:
            frame_failure_count += 1
            print(f"Warning: Failed to capture frame ({frame_failure_count}/{max_failures}).")
            
        # Process frame and get engagement score
        try:
            print("DEBUG: Processing frame")
            processed_frame = analyzer.process_frame(frame)
            print("DEBUG: Frame processed successfully")
        except Exception as e:
            print(f"ERROR: Failed to process frame: {e}")
            import traceback
            traceback.print_exc()
            continue
        
        # Add training mode indicator
        if training_mode:
            cv2.putText(processed_frame, f"TRAINING MODE: {collected_samples} samples", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        # Add context indicator
        cv2.putText(processed_frame, f"Context: {contexts[current_context_idx]}", 
                   (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
        
        # Add trend indicator if available
        if hasattr(analyzer, 'trend_direction') and analyzer.trend_direction != "stable":
            color = (0, 255, 0) if analyzer.trend_direction == "increasing" else (0, 0, 255)
            cv2.putText(processed_frame, f"Trend: {analyzer.trend_direction} ({analyzer.trend_duration})", 
                       (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
        # Display the processed frame
        cv2.imshow('Engagement Analysis', processed_frame)
        
        # Handle key presses
        key = cv2.waitKey(1) & 0xFF
        
        if key == ord('q'):  # Quit
            break
        elif key == ord('c'):  # Cycle through contexts
            current_context_idx = (current_context_idx + 1) % len(contexts)
            analyzer.set_context(contexts[current_context_idx])
        elif key == ord('t'):  # Toggle training mode
            training_mode = not training_mode
            print(f"Training mode {'enabled' if training_mode else 'disabled'}")
        elif key == ord('m'):  # Train model
            success = analyzer.train_weight_model()
            if success:
                print("Weight optimization model trained successfully!")
                print(f"Optimized weights: {analyzer.weight_optimizer.get_optimized_weights()}")
            else:
                print("Not enough training samples to train the model.")
        elif key == ord('s'):  # Save model
            analyzer.weight_optimizer.save_model(os.path.join(analyzer.base_dir, "weight_optimization_model.pkl"))
            analyzer.weight_optimizer.save_context_weights(os.path.join(analyzer.base_dir, "context_weights.json"))
            print("Model and context weights saved successfully!")
        elif training_mode and key >= ord('0') and key <= ord('9'):  # Rate engagement
            # Convert key press to engagement score (0-9 for 0-90%, with 0 representing 100%)
            ground_truth = (key - ord('0')) * 10
            if ground_truth == 0:
                ground_truth = 100
                
            success = analyzer.save_training_sample(ground_truth)
            if success:
                collected_samples += 1
                print(f"Saved training sample with ground truth score: {ground_truth}%")
            
    # Release resources
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
