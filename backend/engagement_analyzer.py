import cv2
import numpy as np
import mediapipe as mp
import time
import math
from scipy.spatial.distance import euclidean
from typing import Tuple, Dict, List, Any, Deque, Optional
from collections import deque
from datetime import datetime
import warnings
import logging
import sys
import json
import os

# Configure logging to handle Unicode properly
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

warnings.filterwarnings('ignore')

# Constants
LEFT_EYE_EAR_LANDMARKS = [33, 160, 158, 133, 153, 144]
RIGHT_EYE_EAR_LANDMARKS = [362, 385, 387, 263, 373, 380]
HEAD_POSE_POINTS = {
    'nose_tip': 1,
    'chin': 152,
    'left_eye_corner': 226,
    'right_eye_corner': 446,
    'left_mouth': 57,
    'right_mouth': 287
}

# 3D Model points for head pose estimation
MODEL_POINTS = np.array([
    (0.0, 0.0, 0.0),             # Nose tip
    (0.0, -330.0, -65.0),        # Chin
    (-225.0, 170.0, -135.0),     # Left eye corner
    (225.0, 170.0, -135.0),      # Right eye corner
    (-150.0, -150.0, -125.0),    # Left mouth corner
    (150.0, -150.0, -125.0)      # Right mouth corner
], dtype="double")

class LightingAnalyzer:
    """Enhanced lighting analysis with adaptive thresholds"""
    def __init__(self):
        self.brightness_history: Deque[float] = deque(maxlen=30)
        self.contrast_history: Deque[float] = deque(maxlen=30)
        self.exposure_history: Deque[float] = deque(maxlen=30)

    def analyze_lighting(self, frame: np.ndarray) -> Dict[str, Any]:
        """Analyze lighting conditions with improved image processing"""
        try:
            # Convert to LAB color space for better brightness analysis
            lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
            l_channel = lab[:,:,0]
            
            brightness = np.mean(l_channel)
            contrast = np.std(l_channel)
            
            # Calculate exposure using histogram
            hist = cv2.calcHist([l_channel], [0], None, [256], [0, 256])
            exposure = np.sum(hist[240:]) / np.sum(hist)  # Ratio of bright pixels
            
            self.brightness_history.append(brightness)
            self.contrast_history.append(contrast)
            self.exposure_history.append(exposure)
            
            # EMA smoothing
            avg_brightness = np.mean(self.brightness_history)
            avg_contrast = np.mean(self.contrast_history)
            avg_exposure = np.mean(self.exposure_history)
            
            # Dynamic thresholds with improved logic
            if avg_brightness < 40:
                quality = "Poor (Too Dark)"
                recommendation = "Add more lighting"
                color = (0, 0, 255)  # Red
                score = 0.2
            elif avg_brightness > 200:
                quality = "Poor (Too Bright)"
                recommendation = "Reduce lighting"
                color = (0, 0, 255)  # Red
                score = 0.3
            elif avg_contrast < 20:
                quality = "Low Contrast"
                recommendation = "Adjust lighting position"
                color = (0, 165, 255)  # Orange
                score = 0.5
            elif avg_exposure > 0.05:  # Too much overexposure
                quality = "Overexposed"
                recommendation = "Reduce lighting intensity"
                color = (0, 100, 255)  # Dark orange
                score = 0.4
            else:
                quality = "Good"
                recommendation = "Optimal conditions"
                color = (0, 255, 0)  # Green
                score = 1.0
                
            return {
                'brightness': round(avg_brightness, 2),
                'contrast': round(avg_contrast, 2),
                'exposure': round(avg_exposure, 3),
                'quality': quality,
                'recommendation': recommendation,
                'color': color,
                'score': score
            }
        except Exception as e:
            logging.error(f"Lighting analysis error: {e}", exc_info=True)
            return {
                'brightness': 0,
                'contrast': 0,
                'exposure': 0,
                'quality': "Unknown",
                'recommendation': "Check camera",
                'color': (0, 0, 0),
                'score': 0
            }

class AdvancedBlinkDetector:
    """Improved blink detection with adaptive thresholds"""
    def __init__(self):
        self.ear_threshold = 0.21
        self.consec_frames = 2
        self.blink_counter = 0
        self.blink_total = 0
        self.start_time = time.time()  # Fixed: Initialize start_time
        self.blink_start_time = None
        self.blink_durations: Deque[float] = deque(maxlen=20)
        self.ear_history: Deque[float] = deque(maxlen=10)
        self.drowsy_threshold = 0.18
        self.drowsy_frames = 0
        self.drowsy_threshold_frames = 20
        self.last_blink_time = time.time()
        self.blink_rate_window = 60  # seconds

    def calculate_ear(self, eye_landmarks: List[Tuple[float, float]]) -> float:
        """Calculate Eye Aspect Ratio with better stability"""
        try:
            # Vertical distances
            A = euclidean(eye_landmarks[1], eye_landmarks[5])
            B = euclidean(eye_landmarks[2], eye_landmarks[4])
            # Horizontal distance
            C = euclidean(eye_landmarks[0], eye_landmarks[3])
            return (A + B) / (2.0 * C + 1e-6)  # Prevent division by zero
        except Exception as e:
            logging.warning(f"EAR calculation failed: {e}")
            return 0.25  # Default EAR

    def detect_blink(self, landmarks: np.ndarray) -> Dict[str, Any]:
        """Enhanced blink detection with temporal smoothing"""
        try:
            left_eye_points = [landmarks[i] for i in LEFT_EYE_EAR_LANDMARKS]
            right_eye_points = [landmarks[i] for i in RIGHT_EYE_EAR_LANDMARKS]
            
            left_ear = self.calculate_ear(left_eye_points)
            right_ear = self.calculate_ear(right_eye_points)
            ear = (left_ear + right_ear) / 2.0
            
            # Temporal smoothing
            self.ear_history.append(ear)
            smoothed_ear = np.mean(self.ear_history)
            
            # Blink detection
            blink_detected = False
            current_time = time.time()
            
            if smoothed_ear < self.ear_threshold:
                self.blink_counter += 1
                if self.blink_start_time is None:
                    self.blink_start_time = current_time
            else:
                if self.blink_counter >= self.consec_frames:
                    blink_detected = True
                    self.blink_total += 1
                    self.last_blink_time = current_time
                    
                    if self.blink_start_time is not None:
                        duration = current_time - self.blink_start_time
                        self.blink_durations.append(duration)
                
                self.blink_counter = 0
                self.blink_start_time = None
            
            # Drowsiness detection
            if smoothed_ear < self.drowsy_threshold:
                self.drowsy_frames += 1
            else:
                self.drowsy_frames = 0
            
            # Calculate blink rate (blinks per minute)
            elapsed_time = current_time - self.start_time
            blink_rate = (self.blink_total / max(elapsed_time / 60, 1/60)) if elapsed_time > 1 else 0
            
            avg_duration = np.mean(self.blink_durations) if self.blink_durations else 0
            
            # Engagement score based on blink patterns
            normal_blink_rate = 12  # Normal blinks per minute
            blink_score = max(0, 1 - abs(blink_rate - normal_blink_rate) / normal_blink_rate)
            
            return {
                'ear': round(smoothed_ear, 3),
                'blink_detected': blink_detected,
                'blink_total': self.blink_total,
                'blink_rate': round(blink_rate, 2),
                'avg_blink_duration': round(avg_duration, 3),
                'is_drowsy': self.drowsy_frames > self.drowsy_threshold_frames,
                'drowsy_frames': self.drowsy_frames,
                'blink_score': round(blink_score, 3),
                'time_since_last_blink': round(current_time - self.last_blink_time, 1)
            }
        except Exception as e:
            logging.error(f"Blink detection error: {e}", exc_info=True)
            return {
                'ear': 0.25,
                'blink_detected': False,
                'blink_total': 0,
                'blink_rate': 0,
                'avg_blink_duration': 0,
                'is_drowsy': False,
                'drowsy_frames': 0,
                'blink_score': 0,
                'time_since_last_blink': 0
            }

class HeadPoseEstimator:
    """Head pose estimation for attention detection"""
    def __init__(self):
        self.focal_length = 1000  # Default focal length
        self.camera_center = None
        self.camera_matrix = None
        self.dist_coeffs = np.zeros((4, 1))
        self.pose_history = deque(maxlen=10)
        
    def initialize_camera(self, frame_shape):
        """Initialize camera parameters"""
        h, w = frame_shape[:2]
        self.camera_center = (w / 2, h / 2)
        self.camera_matrix = np.array([
            [self.focal_length, 0, self.camera_center[0]],
            [0, self.focal_length, self.camera_center[1]],
            [0, 0, 1]
        ], dtype="double")
    
    def estimate_pose(self, landmarks: np.ndarray, frame_shape) -> Dict[str, Any]:
        """Estimate head pose angles"""
        try:
            if self.camera_matrix is None:
                self.initialize_camera(frame_shape)
            
            h, w = frame_shape[:2]
            
            # Get 2D image points
            image_points = np.array([
                (landmarks[HEAD_POSE_POINTS['nose_tip']][0] * w, 
                 landmarks[HEAD_POSE_POINTS['nose_tip']][1] * h),
                (landmarks[HEAD_POSE_POINTS['chin']][0] * w, 
                 landmarks[HEAD_POSE_POINTS['chin']][1] * h),
                (landmarks[HEAD_POSE_POINTS['left_eye_corner']][0] * w, 
                 landmarks[HEAD_POSE_POINTS['left_eye_corner']][1] * h),
                (landmarks[HEAD_POSE_POINTS['right_eye_corner']][0] * w, 
                 landmarks[HEAD_POSE_POINTS['right_eye_corner']][1] * h),
                (landmarks[HEAD_POSE_POINTS['left_mouth']][0] * w, 
                 landmarks[HEAD_POSE_POINTS['left_mouth']][1] * h),
                (landmarks[HEAD_POSE_POINTS['right_mouth']][0] * w, 
                 landmarks[HEAD_POSE_POINTS['right_mouth']][1] * h)
            ], dtype="double")
            
            # Solve PnP
            success, rotation_vector, translation_vector = cv2.solvePnP(
                MODEL_POINTS, image_points, self.camera_matrix, self.dist_coeffs
            )
            
            if success:
                # Convert rotation vector to angles
                rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
                
                # Extract Euler angles
                yaw = math.atan2(rotation_matrix[1, 0], rotation_matrix[0, 0])
                pitch = math.atan2(-rotation_matrix[2, 0], 
                                 math.sqrt(rotation_matrix[2, 1]**2 + rotation_matrix[2, 2]**2))
                roll = math.atan2(rotation_matrix[2, 1], rotation_matrix[2, 2])
                
                # Convert to degrees
                yaw_deg = math.degrees(yaw)
                pitch_deg = math.degrees(pitch)
                roll_deg = math.degrees(roll)
                
                # Smooth the angles
                pose_data = {'yaw': yaw_deg, 'pitch': pitch_deg, 'roll': roll_deg}
                self.pose_history.append(pose_data)
                
                if len(self.pose_history) > 1:
                    avg_yaw = np.mean([p['yaw'] for p in self.pose_history])
                    avg_pitch = np.mean([p['pitch'] for p in self.pose_history])
                    avg_roll = np.mean([p['roll'] for p in self.pose_history])
                else:
                    avg_yaw, avg_pitch, avg_roll = yaw_deg, pitch_deg, roll_deg
                
                # Calculate attention score based on head pose
                attention_score = self._calculate_attention_score(avg_yaw, avg_pitch)
                
                return {
                    'yaw': round(avg_yaw, 2),
                    'pitch': round(avg_pitch, 2),
                    'roll': round(avg_roll, 2),
                    'attention_score': round(attention_score, 3),
                    'looking_forward': abs(avg_yaw) < 20 and abs(avg_pitch) < 15
                }
            else:
                return self._default_pose_result()
                
        except Exception as e:
            logging.error(f"Head pose estimation error: {e}", exc_info=True)
            return self._default_pose_result()
    
    def _calculate_attention_score(self, yaw, pitch):
        """Calculate attention score based on head pose"""
        # Ideal is looking straight ahead (yaw=0, pitch=0)
        yaw_penalty = abs(yaw) / 45.0  # Normalize to 45 degrees
        pitch_penalty = abs(pitch) / 30.0  # Normalize to 30 degrees
        
        total_penalty = min(yaw_penalty + pitch_penalty, 1.0)
        return max(0.0, 1.0 - total_penalty)
    
    def _default_pose_result(self):
        return {
            'yaw': 0,
            'pitch': 0,
            'roll': 0,
            'attention_score': 0,
            'looking_forward': False
        }

class EngagementScorer:
    """Calculate overall engagement score"""
    def __init__(self):
        self.score_history = deque(maxlen=100)
        self.weights = {
            'lighting': 0.2,
            'blink': 0.3,
            'attention': 0.4,
            'stability': 0.1
        }
    
    def calculate_engagement(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall engagement score"""
        try:
            # Individual component scores
            lighting_score = metrics.get('lighting', {}).get('score', 0)
            blink_score = metrics.get('blink_score', 0)
            attention_score = metrics.get('attention_score', 0)
            
            # Stability score (penalize rapid changes)
            stability_score = 1.0
            if len(self.score_history) > 5:
                recent_scores = list(self.score_history)[-5:]
                stability_score = max(0, 1 - np.std(recent_scores) / 0.5)
            
            # Weighted combination
            overall_score = (
                self.weights['lighting'] * lighting_score +
                self.weights['blink'] * blink_score +
                self.weights['attention'] * attention_score +
                self.weights['stability'] * stability_score
            )
            
            self.score_history.append(overall_score)
            
            # Determine engagement level
            if overall_score > 0.8:
                level = "Highly Engaged"
                color = (0, 255, 0)  # Green
            elif overall_score > 0.6:
                level = "Engaged"
                color = (0, 200, 100)  # Light green
            elif overall_score > 0.4:
                level = "Partially Engaged"
                color = (0, 165, 255)  # Orange
            else:
                level = "Disengaged"
                color = (0, 0, 255)  # Red
            
            return {
                'overall_score': round(overall_score, 3),
                'level': level,
                'color': color,
                'component_scores': {
                    'lighting': round(lighting_score, 3),
                    'blink': round(blink_score, 3),
                    'attention': round(attention_score, 3),
                    'stability': round(stability_score, 3)
                }
            }
        except Exception as e:
            logging.error(f"Engagement scoring error: {e}", exc_info=True)
            return {
                'overall_score': 0,
                'level': "Unknown",
                'color': (0, 0, 0),
                'component_scores': {}
            }

class EngagementDetector:
    """Complete engagement detection system"""
    def __init__(self, use_camera: int = 0, save_data: bool = False):
        # Initialize camera
        self.cap = cv2.VideoCapture(use_camera)
        if not self.cap.isOpened():
            raise RuntimeError("Could not start video capture")
            
        # Set reasonable frame dimensions
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        # Initialize components
        self.lighting_analyzer = LightingAnalyzer()
        self.blink_detector = AdvancedBlinkDetector()
        self.head_pose_estimator = HeadPoseEstimator()
        self.engagement_scorer = EngagementScorer()
        
        # MediaPipe initialization
        self.mp_face_mesh = mp.solutions.face_mesh.FaceMesh(
            refine_landmarks=True,
            max_num_faces=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        
        # Settings
        self.show_metrics = True
        self.show_detailed_metrics = False
        self.paused = False
        self.save_data = save_data
        self.session_data = []
        
        # Performance tracking
        self.frame_count = 0
        self.fps_history = deque(maxlen=30)
        self.start_time = time.time()
        
        # Statistics
        self.session_stats = {
            'total_blinks': 0,
            'avg_engagement': 0,
            'max_engagement': 0,
            'min_engagement': 1,
            'drowsy_episodes': 0
        }
        
        logging.info("Enhanced engagement detector initialized successfully")
    
    def process_frame(self) -> Optional[Tuple[np.ndarray, Dict[str, Any]]]:
        """Process a single video frame"""
        try:
            ret, frame = self.cap.read()
            if not ret or frame is None:
                return None
            
            if self.paused:
                return frame, {}
            
            start_time = time.time()
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe
            results = self.mp_face_mesh.process(frame_rgb)
            
            metrics = {}
            
            # Always analyze lighting
            metrics['lighting'] = self.lighting_analyzer.analyze_lighting(frame)
            
            if results.multi_face_landmarks:
                landmarks = np.array([[lm.x, lm.y, lm.z] for lm in results.multi_face_landmarks[0].landmark])
                
                # Blink detection
                blink_metrics = self.blink_detector.detect_blink(landmarks)
                metrics.update(blink_metrics)
                
                # Head pose estimation
                pose_metrics = self.head_pose_estimator.estimate_pose(landmarks, frame.shape)
                metrics.update(pose_metrics)
                
                # Overall engagement score
                engagement_metrics = self.engagement_scorer.calculate_engagement(metrics)
                metrics.update(engagement_metrics)
                
                # Update session statistics
                self._update_session_stats(metrics)
                
            else:
                metrics['warnings'] = ["No face detected"]
                metrics['overall_score'] = 0
                metrics['level'] = "No Face"
                metrics['color'] = (0, 0, 255)
            
            # Calculate FPS
            self.frame_count += 1
            fps = 1.0 / (time.time() - start_time + 1e-6)
            self.fps_history.append(fps)
            metrics['fps'] = np.mean(self.fps_history)
            
            # Add visualizations
            self._add_visualizations(frame, metrics)
            
            # Save data if enabled
            if self.save_data:
                self._save_frame_data(metrics)
            
            return frame, metrics
        
        except Exception as e:
            logging.error(f"Frame processing failed: {e}", exc_info=True)
            return None

    def _update_session_stats(self, metrics: Dict[str, Any]):
        """Update session statistics"""
        try:
            engagement_score = metrics.get('overall_score', 0)
            
            self.session_stats['avg_engagement'] = (
                (self.session_stats['avg_engagement'] * (self.frame_count - 1) + engagement_score) 
                / self.frame_count
            )
            
            self.session_stats['max_engagement'] = max(
                self.session_stats['max_engagement'], engagement_score
            )
            
            self.session_stats['min_engagement'] = min(
                self.session_stats['min_engagement'], engagement_score
            )
            
            if metrics.get('blink_detected', False):
                self.session_stats['total_blinks'] = metrics.get('blink_total', 0)
            
            if metrics.get('is_drowsy', False):
                self.session_stats['drowsy_episodes'] += 1
                
        except Exception as e:
            logging.error(f"Stats update error: {e}")

    def _add_visualizations(self, frame: np.ndarray, metrics: Dict[str, Any]):
        """Add comprehensive visual feedback"""
        try:
            h, w = frame.shape[:2]
            
            # Main engagement indicator
            if 'overall_score' in metrics:
                score = metrics['overall_score']
                level = metrics.get('level', 'Unknown')
                color = metrics.get('color', (255, 255, 255))
                
                # Draw engagement bar
                bar_width = 300
                bar_height = 20
                bar_x = w - bar_width - 20
                bar_y = 20
                
                cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), 
                            (50, 50, 50), -1)
                cv2.rectangle(frame, (bar_x, bar_y), 
                            (bar_x + int(bar_width * score), bar_y + bar_height), color, -1)
                
                # Engagement text
                cv2.putText(frame, f"Engagement: {level} ({score:.2f})", 
                          (bar_x, bar_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            
            # Lighting indicator
            if 'lighting' in metrics:
                lighting = metrics['lighting']
                cv2.putText(frame, f"Lighting: {lighting['quality']}", 
                          (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, lighting['color'], 2)
                cv2.putText(frame, lighting['recommendation'], 
                          (10, 55), cv2.FONT_HERSHEY_SIMPLEX, 0.5, lighting['color'], 1)
            
            # Blink indicator
            if metrics.get('blink_detected', False):
                cv2.circle(frame, (50, 100), 20, (0, 0, 255), -1)
                cv2.putText(frame, "BLINK", (15, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            # Head pose indicator
            if 'yaw' in metrics:
                looking_forward = metrics.get('looking_forward', False)
                pose_color = (0, 255, 0) if looking_forward else (0, 165, 255)
                cv2.putText(frame, f"Head: {'Forward' if looking_forward else 'Turned'}", 
                          (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.6, pose_color, 2)
            
            # Drowsiness warning
            if metrics.get('is_drowsy', False):
                cv2.putText(frame, "DROWSY - WAKE UP!", (w//2 - 100, h//2), 
                          cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
            
            # Detailed metrics (toggle with 'd')
            if self.show_detailed_metrics:
                self._add_detailed_metrics(frame, metrics)
            
            # FPS counter
            fps = metrics.get('fps', 0)
            cv2.putText(frame, f"FPS: {fps:.1f}", (10, h - 60), 
                      cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
            
            # Session time
            session_time = time.time() - self.start_time
            cv2.putText(frame, f"Session: {int(session_time//60):02d}:{int(session_time%60):02d}", 
                      (10, h - 40), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
            
            # Controls help
            cv2.putText(frame, "Controls: Q-Quit, SPACE-Pause, D-Details, S-Save", 
                      (10, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)
            
        except Exception as e:
            logging.error(f"Visualization error: {e}")

    def _add_detailed_metrics(self, frame: np.ndarray, metrics: Dict[str, Any]):
        """Add detailed metrics overlay"""
        try:
            y_offset = 120
            x_offset = 10
            
            details = [
                f"EAR: {metrics.get('ear', 0):.3f}",
                f"Blinks: {metrics.get('blink_total', 0)}",
                f"Blink Rate: {metrics.get('blink_rate', 0):.1f}/min",
                f"Yaw: {metrics.get('yaw', 0):.1f}°",
                f"Pitch: {metrics.get('pitch', 0):.1f}°",
                f"Brightness: {metrics.get('lighting', {}).get('brightness', 0):.0f}",
                f"Contrast: {metrics.get('lighting', {}).get('contrast', 0):.0f}",
            ]
            
            for i, detail in enumerate(details):
                cv2.putText(frame, detail, (x_offset, y_offset + i * 20), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        except Exception as e:
            logging.error(f"Detailed metrics error: {e}")

    def _save_frame_data(self, metrics: Dict[str, Any]):
        """Save frame data for analysis"""
        try:
            frame_data = {
                'timestamp': time.time(),
                'frame_number': self.frame_count,
                'metrics': metrics
            }
            self.session_data.append(frame_data)
        except Exception as e:
            logging.error(f"Data saving error: {e}")

    def save_session_data(self):
        """Save session data to file"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"engagement_session_{timestamp}.json"
            
            session_summary = {
                'session_info': {
                    'start_time': self.start_time,
                    'end_time': time.time(),
                    'total_frames': self.frame_count,
                    'duration_seconds': time.time() - self.start_time
                },
                'statistics': self.session_stats,
                'frame_data': self.session_data
            }
            
            with open(filename, 'w') as f:
                json.dump(session_summary, f, indent=2)
            
            logging.info(f"Session data saved to {filename}")
        except Exception as e:
            logging.error(f"Session save error: {e}")

    def run(self):
        """Main processing loop with enhanced controls"""
        try:
            logging.info("Starting engagement detection. Press 'h' for help.")
            
            while True:
                frame_data = self.process_frame()
                if frame_data is None:
                    break
                
                frame, metrics = frame_data
                
                cv2.imshow('Enhanced Engagement Detector', frame)
                
                # Handle key presses
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q') or key == 27:  # ESC or Q
                    break
                elif key == ord(' '):  # Space to pause
                    self.paused = not self.paused
                    status = "Paused" if self.paused else "Running"
                    logging.info(f"Detection {status}")
                elif key == ord('d'):  # Toggle detailed metrics
                    self.show_detailed_metrics = not self.show_detailed_metrics
                elif key == ord('s'):  # Save session data
                    if self.save_data:
                        self.save_session_data()
                    else:
                        logging.info("Data saving not enabled")
                elif key == ord('r'):  # Reset statistics
                    self._reset_session_stats()
                    logging.info("Session statistics reset")
                elif key == ord('h'):  # Show help
                    self._show_help()
                elif key == ord('c'):  # Toggle camera settings
                    self._toggle_camera_settings()
                    
        except KeyboardInterrupt:
            logging.info("Interrupted by user")
        except Exception as e:
            logging.error(f"Runtime error: {e}", exc_info=True)
        finally:
            self.cleanup()

    def _reset_session_stats(self):
        """Reset session statistics"""
        self.session_stats = {
            'total_blinks': 0,
            'avg_engagement': 0,
            'max_engagement': 0,
            'min_engagement': 1,
            'drowsy_episodes': 0
        }
        self.blink_detector.blink_total = 0
        self.blink_detector.start_time = time.time()
        self.frame_count = 0
        self.start_time = time.time()

    def _show_help(self):
        """Display help information"""
        help_text = """
        Enhanced Engagement Detector Controls:
        
        Q/ESC - Quit application
        SPACE - Pause/Resume detection
        D - Toggle detailed metrics overlay
        S - Save session data (if enabled)
        R - Reset session statistics
        H - Show this help
        C - Toggle camera settings
        
        Features:
        - Real-time engagement scoring
        - Blink detection and drowsiness monitoring
        - Head pose estimation
        - Lighting quality analysis
        - Session statistics tracking
        """
        print(help_text)
        logging.info("Help displayed")

    def _toggle_camera_settings(self):
        """Toggle camera settings for different environments"""
        try:
            # Get current brightness
            current_brightness = self.cap.get(cv2.CAP_PROP_BRIGHTNESS)
            current_contrast = self.cap.get(cv2.CAP_PROP_CONTRAST)
            
            # Toggle between different presets
            if current_brightness < 0.5:
                # Switch to bright environment
                self.cap.set(cv2.CAP_PROP_BRIGHTNESS, 0.6)
                self.cap.set(cv2.CAP_PROP_CONTRAST, 0.5)
                logging.info("Camera settings: Bright environment")
            else:
                # Switch to normal environment
                self.cap.set(cv2.CAP_PROP_BRIGHTNESS, 0.4)
                self.cap.set(cv2.CAP_PROP_CONTRAST, 0.4)
                logging.info("Camera settings: Normal environment")
        except Exception as e:
            logging.warning(f"Camera settings adjustment failed: {e}")

    def get_session_summary(self) -> Dict[str, Any]:
        """Get comprehensive session summary"""
        try:
            duration = time.time() - self.start_time
            
            summary = {
                'session_duration': f"{int(duration//60):02d}:{int(duration%60):02d}",
                'total_frames': self.frame_count,
                'average_fps': np.mean(self.fps_history) if self.fps_history else 0,
                'statistics': self.session_stats.copy(),
                'performance': {
                    'frames_processed': self.frame_count,
                    'processing_rate': self.frame_count / duration if duration > 0 else 0
                }
            }
            
            # Add engagement analysis
            if hasattr(self.engagement_scorer, 'score_history') and self.engagement_scorer.score_history:
                scores = list(self.engagement_scorer.score_history)
                summary['engagement_analysis'] = {
                    'current_score': scores[-1] if scores else 0,
                    'average_score': np.mean(scores),
                    'score_trend': 'improving' if len(scores) > 10 and 
                                 np.mean(scores[-5:]) > np.mean(scores[-10:-5]) else 'stable'
                }
            
            return summary
        except Exception as e:
            logging.error(f"Session summary error: {e}")
            return {'error': str(e)}

    def cleanup(self):
        """Enhanced cleanup with session summary"""
        try:
            # Print session summary
            summary = self.get_session_summary()
            print("\n" + "="*50)
            print("SESSION SUMMARY")
            print("="*50)
            print(f"Duration: {summary.get('session_duration', 'Unknown')}")
            print(f"Total Frames: {summary.get('total_frames', 0)}")
            print(f"Average FPS: {summary.get('average_fps', 0):.1f}")
            print(f"Total Blinks: {summary['statistics'].get('total_blinks', 0)}")
            print(f"Average Engagement: {summary['statistics'].get('avg_engagement', 0):.3f}")
            print(f"Max Engagement: {summary['statistics'].get('max_engagement', 0):.3f}")
            print(f"Drowsy Episodes: {summary['statistics'].get('drowsy_episodes', 0)}")
            
            if 'engagement_analysis' in summary:
                print(f"Final Engagement Score: {summary['engagement_analysis'].get('current_score', 0):.3f}")
                print(f"Session Trend: {summary['engagement_analysis'].get('score_trend', 'Unknown')}")
            
            print("="*50)
            
            # Save final session data if enabled
            if self.save_data and self.session_data:
                self.save_session_data()
            
            # Release resources
            self.cap.release()
            if hasattr(self, 'mp_face_mesh'):
                self.mp_face_mesh.close()
            cv2.destroyAllWindows()
            
            logging.info("Enhanced cleanup completed successfully")
        except Exception as e:
            logging.error(f"Cleanup error: {e}")
            # Ensure resources are released even if summary fails
            try:
                self.cap.release()
                cv2.destroyAllWindows()
            except:
                pass

def main():
    """Main function with command line argument support"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Enhanced Engagement Detection System')
    parser.add_argument('--camera', type=int, default=0, help='Camera index (default: 0)')
    parser.add_argument('--save-data', action='store_true', help='Save session data to file')
    parser.add_argument('--log-level', choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'], 
                       default='INFO', help='Logging level')
    parser.add_argument('--no-gui', action='store_true', help='Run without GUI (data collection only)')
    
    args = parser.parse_args()
    
    # Set logging level
    logging.getLogger().setLevel(getattr(logging, args.log_level))
    
    try:
        # Check camera availability
        test_cap = cv2.VideoCapture(args.camera)
        if not test_cap.isOpened():
            logging.error(f"Camera {args.camera} not available")
            return
        test_cap.release()
        
        # Initialize detector
        detector = EngagementDetector(
            use_camera=args.camera,
            save_data=args.save_data
        )
        
        if args.no_gui:
            logging.info("Running in headless mode - data collection only")
            # Run for a specified duration or until interrupted
            try:
                start_time = time.time()
                while time.time() - start_time < 300:  # 5 minutes default
                    frame_data = detector.process_frame()
                    if frame_data is None:
                        break
                    time.sleep(0.033)  # ~30 FPS
            except KeyboardInterrupt:
                logging.info("Headless mode interrupted")
        else:
            detector.run()
            
    except Exception as e:
        logging.critical(f"Application failed to start: {e}", exc_info=True)
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
