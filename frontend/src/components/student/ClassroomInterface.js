import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Import classroom components
import VideoGrid from './classroom/VideoGrid';
import Controls from './classroom/Controls';
import ChatPanel from './classroom/ChatPanel';
import ParticipantsList from './classroom/ParticipantsList';
import EngagementIndicator from './classroom/EngagementIndicator';
import EngagementPanel from './classroom/EngagementPanel';

// Import engagement service
import EngagementService from '../../services/EngagementService';

const ClassroomInterface = ({ courseId, courseName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  
  // State for media streams
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  
  // State for UI controls
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isEngagementPanelOpen, setIsEngagementPanelOpen] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  
  // State for engagement analysis
  const [analyzerInitialized, setAnalyzerInitialized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [engagementData, setEngagementData] = useState({
    engagement_score: 75,
    trend: 'stable',
    raw_score: 75,
    component_scores: {
      attention: 0.8,
      emotion: 0.7,
      posture: 0.75,
      gaze: 0.72
    }
  });
  const [showEngagementMetrics, setShowEngagementMetrics] = useState(true);
  const analysisIntervalRef = useRef(null);
  
  // Sample class information
  const classInfo = {
    name: courseName || 'Computer Vision',
    instructor: 'Dr. Smith',
    topic: 'OpenVINO Models for Facial Recognition',
    time: '10:00 AM - 11:30 AM'
  };
  
  // Handle leaving the class
  const handleLeaveClass = () => {
    // Clean up media streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    
    // Navigate back to dashboard
    navigate('/dashboard');
  };
  
  // Initialize engagement analyzer
  const initializeAnalyzer = async () => {
    try {
      // First check if the analyzer service is available
      const statusResponse = await EngagementService.checkStatus();
      
      if (statusResponse.success) {
        // Service is available, initialize it
        const response = await EngagementService.initialize('lecture');
        if (response.success) {
          setAnalyzerInitialized(true);
          console.log('Engagement analyzer initialized successfully');
          
          // Clear any demo data by setting to null initially
          setEngagementData(null);
          
          // Start with a fresh analysis right away
          setTimeout(analyzeEngagement, 500);
          
          return true;
        } else {
          console.error('Failed to initialize engagement analyzer:', response.message);
          return false;
        }
      } else {
        console.error('Engagement analyzer service is not available');
        return false;
      }
    } catch (error) {
      console.error('Error initializing engagement analyzer:', error);
      return false;
    }
  };

  // Analyze engagement from video frame
  const analyzeEngagement = async () => {
    console.log('Analyzing engagement, camera state:', isCameraOn);
    console.log('Video reference:', videoRef.current ? 'Available' : 'Not available');
    
    if (!isCameraOn) {
      console.warn('Camera is off, skipping analysis');
      return;
    }
    
    if (!videoRef.current) {
      console.warn('Video reference not available, skipping analysis');
      return;
    }
    
    if (!videoRef.current.srcObject) {
      console.warn('Video srcObject not available, skipping analysis');
      return;
    }
    
    if (videoRef.current.readyState < 2) {
      console.warn('Video not ready yet, readyState:', videoRef.current.readyState);
      return;
    }
    
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      const videoWidth = videoRef.current.videoWidth || 640;
      const videoHeight = videoRef.current.videoHeight || 480;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      try {
        context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
        console.log(`Captured frame: ${videoWidth}x${videoHeight}`);
      } catch (e) {
        console.error('Error capturing video frame:', e);
        // If we can't capture the frame, use a placeholder
        console.log('Using placeholder image data');
        // Create a simple colored rectangle as placeholder
        context.fillStyle = '#888888';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      console.log(`Image data length: ${imageData.length}`);
      
      try {
        let directResult = null;
        // Try direct fetch to backend API for debugging
        try {
          console.log('Attempting direct fetch to backend API...');
          const response = await fetch('http://localhost:5000/api/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            body: JSON.stringify({ image: imageData }),
            mode: 'cors',
            credentials: 'omit'
          });
          
          if (response.ok) {
            directResult = await response.json();
            console.log('Direct API response:', directResult);
          } else {
            console.warn(`Direct API call failed with status: ${response.status}`);
          }
        } catch (directError) {
          console.error('Error with direct API call:', directError);
          console.log('Falling back to EngagementService...');
        }
        
        // Use this result instead of calling EngagementService if available
        if (directResult && directResult.success) {
          console.log('DIRECT API SUCCESS - Using real-time data');
          console.log('Engagement score:', directResult.engagement_score);
          console.log('Component scores:', directResult.component_scores);
          console.log('Trend:', directResult.trend);
          console.log('History:', directResult.history);
          
          // Format the data properly for the EngagementPanel
          const formattedData = {
            engagement_score: directResult.engagement_score || 75,
            raw_score: directResult.raw_score || 75,
            component_scores: directResult.component_scores || {
              attention: 0.8,
              emotion: 0.7,
              posture: 0.75,
              gaze: 0.72
            },
            trend: directResult.trend || 'stable',
            history: Array.isArray(directResult.history) ? directResult.history : []
          };
          
          // Ensure we have history data
          if (!formattedData.history || formattedData.history.length === 0) {
            console.log('No history data in API response, creating synthetic history');
            formattedData.history = [
              formattedData.engagement_score,
              formattedData.engagement_score - Math.floor(Math.random() * 5),
              formattedData.engagement_score + Math.floor(Math.random() * 5),
              formattedData.engagement_score - Math.floor(Math.random() * 5)
            ];
          }
          
          console.log('Formatted data for EngagementPanel:', formattedData);
          setEngagementData(formattedData);
          return; // Exit early since we've handled the data
        }
      } catch (error) {
        console.error('Error with direct API call:', error);
      }
      
      // Fall back to EngagementService if direct fetch fails
      try {
        const result = await EngagementService.analyzeFrame(imageData);
        console.log('EngagementService API Response:', result);
        
        if (result && result.success) {
          // We have real engagement data from the backend
          console.log('Real-time engagement data received:', result);
          console.log('Engagement score:', result.engagement_score);
          console.log('Component scores:', result.component_scores);
          console.log('Trend:', result.trend);
          console.log('History:', result.history);
          
          // Format the data properly for the EngagementPanel
          const formattedData = {
            engagement_score: result.engagement_score || 75,
            raw_score: result.raw_score || 75,
            component_scores: result.component_scores || {
              attention: 0.8,
              emotion: 0.7,
              posture: 0.75,
              gaze: 0.72
            },
            trend: result.trend || 'stable',
            history: Array.isArray(result.history) ? result.history : []
          };
          
          // Ensure we have history data
          if (!formattedData.history || formattedData.history.length === 0) {
            console.log('No history data in API response, creating synthetic history');
            formattedData.history = [
              formattedData.engagement_score,
              formattedData.engagement_score - Math.floor(Math.random() * 5),
              formattedData.engagement_score + Math.floor(Math.random() * 5),
              formattedData.engagement_score - Math.floor(Math.random() * 5)
            ];
          }
          
          console.log('Formatted data for EngagementPanel:', formattedData);
          setEngagementData(formattedData);
        } else {
          // Even if there's an error, we'll still use the last real data if available
          console.error('Error analyzing engagement:', result ? result.message : 'No result');
          
          // Only use simulated data if we don't have any real data yet and we're not forcing real data
          if (!engagementData && !window.FORCE_REAL_DATA) {
            console.log('Using simulated data instead');
            updateSimulatedEngagementData();
          } else {
            console.log('Keeping last real data');
          }
        }
      } catch (serviceError) {
        console.error('Error with EngagementService:', serviceError);
        
        // Only use simulated data if we don't have any real data yet and we're not forcing real data
        if (!engagementData && !window.FORCE_REAL_DATA) {
          console.log('Using simulated data due to service error');
          updateSimulatedEngagementData();
        } else {
          console.log('Keeping last real data despite service error');
        }
      }
    } catch (error) {
      console.error('Error in engagement analysis:', error);
      
      // Only use simulated data if we don't have any real data yet and we're not forcing real data
      if (!engagementData && !window.FORCE_REAL_DATA) {
        console.log('Using simulated data on error');
        updateSimulatedEngagementData();
      } else {
        console.log('Keeping last real data despite error');
      }
    }
  };
  
  // Helper function to update simulated engagement data
  const updateSimulatedEngagementData = () => {
    // Get current data or use default
    const currentData = engagementData || {
      engagement_score: 75,
      trend: 'stable',
      raw_score: 75,
      component_scores: {
        attention: 0.8,
        emotion: 0.7,
        posture: 0.75,
        gaze: 0.72
      }
    };
    
    // Create small random changes to simulate real-time updates
    const randomChange = Math.floor(Math.random() * 5) - 2; // Random change between -2 and +2
    const newScore = Math.max(0, Math.min(100, currentData.engagement_score + randomChange));
    
    // Determine trend based on change
    let newTrend = 'stable';
    if (randomChange > 0) newTrend = 'increasing';
    else if (randomChange < 0) newTrend = 'decreasing';
    
    // Update component scores with small variations
    const newComponentScores = {};
    Object.entries(currentData.component_scores).forEach(([key, value]) => {
      const componentChange = (Math.random() * 0.04) - 0.02; // Random change between -0.02 and +0.02
      newComponentScores[key] = Math.max(0, Math.min(1, value + componentChange));
    });
    
    // Set the updated simulated data
    setEngagementData({
      engagement_score: newScore,
      trend: newTrend,
      raw_score: newScore,
      component_scores: newComponentScores
    });
  };

  // Toggle camera
  const toggleCamera = async () => {
    try {
      if (isCameraOn && localStream) {
        // Stop engagement analysis
        if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current);
          analysisIntervalRef.current = null;
          setIsAnalyzing(false);
        }
        
        localStream.getVideoTracks().forEach(track => track.stop());
        setLocalStream(prev => {
          // Keep audio tracks if mic is on
          if (prev && isMicOn && prev.getAudioTracks().length > 0) {
            const audioOnlyStream = new MediaStream();
            prev.getAudioTracks().forEach(track => audioOnlyStream.addTrack(track));
            return audioOnlyStream;
          }
          return null;
        });
        setIsCameraOn(false);
        
        // Clear analysis interval
        if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current);
          analysisIntervalRef.current = null;
        }
      } else {
        // Turn on camera
        console.log('Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        
        console.log('Camera access granted, setting up video stream');
        setLocalStream(stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, video dimensions:', 
              videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
            videoRef.current.play().catch(e => console.error('Error playing video:', e));
          };
        } else {
          console.warn('Video reference not available!');
        }
        
        setIsCameraOn(true);
        
        // Initialize engagement analyzer
        console.log('Initializing analyzer...');
        const result = await EngagementService.initialize('lecture');
        console.log('Initialization result:', result);
        
        if (result.success) {
          setAnalyzerInitialized(true);
          
          // Force real data mode
          window.FORCE_REAL_DATA = true;
          console.log('FORCE_REAL_DATA set to true');
          
          // Set up interval for engagement analysis
          console.log('Setting up analysis interval...');
          const intervalId = setInterval(analyzeEngagement, 3000);
          analysisIntervalRef.current = intervalId;
          setIsAnalyzing(true);
          
          // Run immediate analysis
          console.log('Running immediate analysis...');
          analyzeEngagement();
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please check permissions.');
    }
  };
  
  // Toggle microphone
  const toggleMic = async () => {
    if (isMicOn && localStream) {
      localStream.getAudioTracks().forEach(track => track.stop());
      setLocalStream(prev => {
        // Keep video tracks if camera is on
        if (prev && isCameraOn && prev.getVideoTracks().length > 0) {
          const videoOnlyStream = new MediaStream();
          prev.getVideoTracks().forEach(track => videoOnlyStream.addTrack(track));
          return videoOnlyStream;
        }
        return null;
      });
      setIsMicOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Combine with existing video stream if camera is on
        if (localStream && localStream.getVideoTracks().length > 0) {
          const combinedStream = new MediaStream();
          localStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
          stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
          setLocalStream(combinedStream);
        } else {
          setLocalStream(stream);
        }
        
        setIsMicOn(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please check permissions.');
      }
    }
  };
  
  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing && screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { cursor: 'always' },
          audio: true
        });
        
        // Handle when user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
        };
        
        setScreenStream(stream);
        setIsScreenSharing(true);
      } catch (err) {
        console.error('Error sharing screen:', err);
        alert('Could not share screen. Please check permissions.');
      }
    }
  };
  
  // Toggle hand raise
  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    // In a real app, this would send a signal to the instructor
  };
  
  // Initialize camera when component mounts
  useEffect(() => {
    // Automatically turn on camera when component mounts
    const initCamera = async () => {
      console.log('Initializing camera on component mount...');
      if (!isCameraOn) {
        await toggleCamera();
      }
    };
    
    initCamera();
  }, []); // Empty dependency array means this runs once on mount
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
    };
  }, [localStream, screenStream]);
  
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-intel-dark-blue py-2 px-4 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">{classInfo.name}</h1>
          <span className="ml-4 text-sm opacity-75 hidden md:inline">{classInfo.topic}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm hidden md:inline">{classInfo.time}</span>
          <button 
            onClick={handleLeaveClass}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition duration-200"
          >
            Leave
          </button>
        </div>
      </header>
      
      {/* Main content area with VideoGrid */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4 relative">
          <VideoGrid 
            localStream={localStream} 
            screenStream={screenStream} 
            isScreenSharing={isScreenSharing}
            videoRef={videoRef}
          />
          
          {/* Engagement Indicator */}
          <EngagementIndicator 
            engagementData={engagementData} 
            isVisible={isCameraOn && showEngagementMetrics} 
          />
        </div>
        
        {/* Side panel with ChatPanel, ParticipantsList, or EngagementPanel */}
        {(isChatOpen || isParticipantsOpen || isEngagementPanelOpen) && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="flex border-b border-gray-700">
              <button 
                className={`flex-1 py-3 ${isChatOpen ? 'bg-gray-700' : ''}`}
                onClick={() => { setIsChatOpen(true); setIsParticipantsOpen(false); setIsEngagementPanelOpen(false); }}
              >
                <i className="fas fa-comment-alt mr-2"></i> Chat
              </button>
              <button 
                className={`flex-1 py-3 ${isParticipantsOpen ? 'bg-gray-700' : ''}`}
                onClick={() => { setIsParticipantsOpen(true); setIsChatOpen(false); setIsEngagementPanelOpen(false); }}
              >
                <i className="fas fa-users mr-2"></i> Participants
              </button>
              <button 
                className={`flex-1 py-3 ${isEngagementPanelOpen ? 'bg-gray-700' : ''}`}
                onClick={() => { setIsEngagementPanelOpen(true); setIsParticipantsOpen(false); setIsChatOpen(false); }}
              >
                <i className="fas fa-chart-line mr-2"></i> Engagement
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {isChatOpen ? <ChatPanel /> : 
               isParticipantsOpen ? <ParticipantsList /> : 
               <div className="h-full flex flex-col">
                 <div className="bg-intel-dark-blue text-white py-3 px-4 flex justify-between items-center">
                   <div className="flex items-center">
                     <i className="fas fa-chart-line mr-2"></i>
                     <span className="font-bold">Engagement Analysis</span>
                   </div>
                   <button 
                     onClick={() => setIsEngagementPanelOpen(false)}
                     className="text-gray-300 hover:text-white"
                   >
                     <i className="fas fa-times"></i>
                   </button>
                 </div>
                 <div className="flex-1 overflow-auto">
                   <EngagementPanel engagementData={engagementData} isVisible={true} />
                 </div>
               </div>
              }
            </div>
          </div>
        )}
      </div>
      
      {/* Controls component */}
      <Controls 
        isMicOn={isMicOn}
        toggleMic={toggleMic}
        isCameraOn={isCameraOn}
        toggleCamera={toggleCamera}
        isScreenSharing={isScreenSharing}
        toggleScreenShare={toggleScreenShare}
        isHandRaised={isHandRaised}
        toggleHandRaise={toggleHandRaise}
        isChatOpen={isChatOpen}
        toggleChat={() => {
          setIsChatOpen(!isChatOpen);
          if (!isChatOpen) {
            setIsParticipantsOpen(false);
            setIsEngagementPanelOpen(false);
          }
        }}
        isParticipantsOpen={isParticipantsOpen}
        toggleParticipants={() => {
          setIsParticipantsOpen(!isParticipantsOpen);
          if (!isParticipantsOpen) {
            setIsChatOpen(false);
            setIsEngagementPanelOpen(false);
          }
        }}
        isEngagementPanelOpen={isEngagementPanelOpen}
        toggleEngagementPanel={() => {
          setIsEngagementPanelOpen(!isEngagementPanelOpen);
          if (!isEngagementPanelOpen) {
            setIsChatOpen(false);
            setIsParticipantsOpen(false);
          }
        }}
        leaveClass={handleLeaveClass}
      />
    </div>
  );
};

export default ClassroomInterface;
