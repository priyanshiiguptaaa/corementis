import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faComments, 
  faRobot, 
  faTimes, 
  faUser, 
  faMicrophone, 
  faCamera,
  faSpinner,
  faTrash,
  faVolumeXmark,
  faPaperPlane,
  faStop,
  faSearch,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioMessage, setCurrentAudioMessage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isSearchingContent, setIsSearchingContent] = useState(false);
  const [educationalContent, setEducationalContent] = useState(null);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  // Generate a user ID or get from localStorage
  const getUserId = () => {
    let userId = localStorage.getItem('corementis_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('corementis_user_id', userId);
    }
    return userId;
  };
  
  // Initialize speech recognition
  useEffect(() => {
    // Initialize Web Speech API
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        sendMessage(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      setSpeechSupported(true);
    }
    
    // Check camera capabilities
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log('Camera API is supported');
    } else {
      console.error('Camera API is not supported in this browser');
      setError('Camera is not supported in your browser');
    }
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Initialize chatbot when first opened
  useEffect(() => {
    if (isOpen && !initialized) {
      initializeChatbot();
    }
  }, [isOpen, initialized]);
  
  const initializeChatbot = async () => {
    try {
      setIsLoading(true);
      console.log('Initializing chatbot...');
      const response = await fetch('http://localhost:5001/api/chatbot/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: getUserId(),
          course_context: 'Computer Vision and Machine Learning'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setInitialized(true);
        // If there's existing conversation, fetch it
        if (data.conversation_length > 1) {
          fetchHistory();
        } else {
          // Add welcome message
          setMessages([
            {
              role: 'assistant',
              content: 'Hello! I\'m your CoreMentis AI assistant. How can I help you with your studies today?'
            }
          ]);
        }
      } else {
        setError('Failed to initialize chatbot: ' + data.message);
      }
    } catch (err) {
      setError('Error connecting to chatbot service: ' + err.message);
      console.error('Error initializing chatbot:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchHistory = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/chatbot/history?user_id=${getUserId()}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.history);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };
  
  const toggleListening = () => {
    if (!speechSupported) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  
  const toggleCamera = async () => {
    console.log('Toggle camera called, current state:', isCameraActive);
    
    if (isCameraActive) {
      // Stop the camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
      setCapturedImage(null);
      console.log('Camera deactivated');
    } else {
      try {
        // First set camera active to render the video element
        setIsCameraActive(true);
        
        // Wait for the video element to be rendered
        setTimeout(async () => {
          try {
            // Start the camera
            setError(null);
            console.log('Requesting camera access...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 }
              } 
            });
            
            console.log('Camera access granted, setting up video stream');
            streamRef.current = stream;
            
            if (videoRef.current) {
              console.log('Video ref exists, setting srcObject');
              videoRef.current.srcObject = stream;
              videoRef.current.onloadedmetadata = () => {
                console.log('Video metadata loaded, dimensions:', 
                  videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
              };
            } else {
              console.error('Video ref does not exist');
              setError('Video element not found');
              setIsCameraActive(false);
            }
          } catch (err) {
            setError('Error accessing camera: ' + err.message);
            console.error('Error accessing camera:', err);
            setIsCameraActive(false);
          }
        }, 500); // Wait 500ms for the video element to be rendered
      } catch (err) {
        setError('Error setting up camera: ' + err.message);
        console.error('Error setting up camera:', err);
        setIsCameraActive(false);
      }
    }
  };
  
  const captureImage = () => {
    if (!isCameraActive || !videoRef.current || !canvasRef.current) {
      console.error('Cannot capture image: camera not active or refs not available');
      return;
    }
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      console.log('Video dimensions:', video.videoWidth, video.videoHeight);
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn('Video dimensions are zero, using fallback dimensions');
      }
      
      // Draw the current video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get the image as a data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      console.log('Image captured, data URL length:', imageDataUrl.length);
      setCapturedImage(imageDataUrl);
      
      // Stop the camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
    } catch (err) {
      console.error('Error capturing image:', err);
      setError('Error capturing image: ' + err.message);
    }
  };
  
  const processImage = async () => {
    if (!capturedImage) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Send the image to the backend for OCR
      const response = await fetch('http://localhost:5001/api/chatbot/image-to-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: capturedImage
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Set the extracted text in the input field
        setInputMessage(data.text);
        
        // Auto-send the extracted text
        sendMessage(data.text);
      } else {
        setError('Failed to extract text from image: ' + data.message);
      }
    } catch (err) {
      setError('Error processing image: ' + err.message);
      console.error('Error processing image:', err);
    } finally {
      setIsLoading(false);
      setCapturedImage(null);
    }
  };
  
  const sendMessage = async (voiceInput) => {
    const messageToSend = voiceInput || inputMessage.trim();
    if (!messageToSend) return;
    
    if (!voiceInput) {
      setInputMessage('');
    }
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5001/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: getUserId(),
          message: messageToSend
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add the response to messages with audio capability
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.message,
          hasAudio: true, // Flag to indicate this message can be converted to speech
          audioData: null // Will store audio data once generated
        }]);
      } else {
        setError('Failed to get response: ' + data.message);
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
      }
    } catch (err) {
      setError('Error sending message: ' + err.message);
      console.error('Error sending message:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearConversation = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/chatbot/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: getUserId(),
          course_context: 'Computer Vision and Machine Learning'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages([
          {
            role: 'assistant',
            content: 'Conversation history cleared. How can I help you today?'
          }
        ]);
      } else {
        setError('Failed to clear conversation: ' + data.message);
      }
    } catch (err) {
      setError('Error clearing conversation: ' + err.message);
      console.error('Error clearing conversation:', err);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const searchEducationalContent = async (topic) => {
    if (!topic) return;
    
    try {
      setIsSearchingContent(true);
      setError(null);
      
      const response = await fetch('http://localhost:5001/api/chatbot/search-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store the educational content
        setEducationalContent({
          topic: topic,
          images: data.images,
          videos: data.videos
        });
        
        // Add a message with the content
        let contentMessage = `📚 Educational resources for "${topic}":\n\n`;
        
        // Add images info
        contentMessage += `🖼️ ${data.images.length} images found\n\n`;
        
        // Add videos info
        if (data.videos.length > 0) {
          contentMessage += `🎬 Videos:\n`;
          data.videos.forEach((video, index) => {
            contentMessage += `${index + 1}. ${video.title}\n`;
          });
        } else {
          contentMessage += `No videos found.`;
        }
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: contentMessage,
          hasAudio: false,
          educationalContent: {
            topic: topic,
            images: data.images,
            videos: data.videos
          }
        }]);
      } else {
        setError('Failed to find educational content: ' + data.message);
      }
    } catch (err) {
      setError('Error searching for content: ' + err.message);
      console.error('Error searching for content:', err);
    } finally {
      setIsSearchingContent(false);
    }
  };
  
  const convertTextToSpeech = async (text, messageIndex) => {
    try {
      setIsPlayingAudio(true);
      setCurrentAudioMessage(messageIndex);
      setError(null);
      
      // Check if we already have audio data for this message
      if (messages[messageIndex].audioData) {
        playAudio(messages[messageIndex].audioData);
        return;
      }
      
      // First try to use the browser's built-in speech synthesis
      if ('speechSynthesis' in window) {
        console.log('Using browser speech synthesis');
        speakWithBrowserTTS(text);
        return;
      }
      
      // Fallback to backend TTS if browser TTS is not available
      // Use the same origin as the current page to avoid CORS issues
      const backendUrl = 'http://localhost:5001';
      
      console.log('Using backend TTS service:', `${backendUrl}/api/chatbot/text-to-speech`);
      
      const response = await fetch(`${backendUrl}/api/chatbot/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: getUserId(),
          text: text
        }),
        // Simplify CORS settings
        mode: 'cors'
      });
      
      if (!response.ok) {
        // Handle HTTP error status codes (like 503 Service Unavailable)
        if (response.status === 503) {
          throw new Error('Text-to-speech service is not available on this server');
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Store the audio data in the message
        const updatedMessages = [...messages];
        updatedMessages[messageIndex].audioData = data.audio;
        setMessages(updatedMessages);
        
        // Play the audio
        playAudio(data.audio);
      } else {
        // Handle application-level errors
        setError('Failed to convert text to speech: ' + (data.message || 'Unknown error'));
        setIsPlayingAudio(false);
        setCurrentAudioMessage(null);
      }
    } catch (err) {
      // Handle network errors and other exceptions
      setError('Error: ' + (err.message || 'Failed to connect to text-to-speech service'));
      console.error('Error converting text to speech:', err);
      setIsPlayingAudio(false);
      setCurrentAudioMessage(null);
      
      // Update the message to indicate TTS is not available
      const updatedMessages = [...messages];
      updatedMessages[messageIndex].ttsUnavailable = true;
      setMessages(updatedMessages);
    }
  };
  
  const playAudio = (audioBase64) => {
    const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
    
    audio.onended = () => {
      setIsPlayingAudio(false);
      setCurrentAudioMessage(null);
    };
    
    audio.onerror = (e) => {
      console.error('Error playing audio:', e);
      setError('Error playing audio');
      setIsPlayingAudio(false);
      setCurrentAudioMessage(null);
    };
    
    audio.play().catch(e => {
      console.error('Error playing audio:', e);
      setError('Error playing audio: ' + e.message);
      setIsPlayingAudio(false);
      setCurrentAudioMessage(null);
    });
  };
  
  // Stop audio playback
  const stopAudioPlayback = () => {
    // Cancel any ongoing speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // Reset audio state
    setIsPlayingAudio(false);
    setCurrentAudioMessage(null);
    console.log('Audio playback stopped');
  };
  
  // Use browser's built-in speech synthesis
  const speakWithBrowserTTS = (text) => {
    if (!('speechSynthesis' in window)) {
      setError('Browser speech synthesis not supported');
      setIsPlayingAudio(false);
      setCurrentAudioMessage(null);
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set properties
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Event handlers
    utterance.onend = () => {
      console.log('Browser TTS finished');
      setIsPlayingAudio(false);
      setCurrentAudioMessage(null);
    };
    
    utterance.onerror = (event) => {
      console.error('Browser TTS error:', event);
      setError('Error with speech synthesis: ' + event.error);
      setIsPlayingAudio(false);
      setCurrentAudioMessage(null);
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
    console.log('Browser TTS started');
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chatbot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-intel-blue hover:bg-intel-dark-blue text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Open AI Assistant"
      >
        <FontAwesomeIcon icon={faComments} size="lg" />
      </button>
      
      {/* Chatbot Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-intel-blue text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faRobot} className="mr-2" />
              <h3 className="font-medium">CoreMentis AI Assistant</h3>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={clearConversation}
                className="text-white hover:text-gray-200 transition-colors"
                title="Clear conversation"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
                title="Close chatbot"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
          
          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96 bg-gray-50">
            {messages.length === 0 && !isLoading ? (
              <div className="text-center text-gray-500 py-8">
                <FontAwesomeIcon icon={faRobot} size="2x" className="mb-2 text-intel-blue" />
                <p>Start a conversation with the AI assistant</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-3/4 rounded-lg p-3 ${msg.role === 'user' 
                        ? 'bg-intel-blue text-white rounded-br-none' 
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
                    >
                      <div className="flex items-center mb-1">
                        <FontAwesomeIcon 
                          icon={msg.role === 'user' ? faUser : faRobot} 
                          className="mr-2" 
                          size="xs"
                        />
                        <span className="text-xs font-semibold">
                          {msg.role === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      
                      {/* Display educational content if available */}
                      {msg.educationalContent && (
                        <div className="mt-3 border-t pt-2 border-gray-300">
                          {msg.educationalContent.images.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs font-semibold mb-1">Images:</div>
                              <div className="flex overflow-x-auto space-x-2 pb-2">
                                {msg.educationalContent.images.slice(0, 3).map((imgUrl, idx) => (
                                  <a 
                                    href={imgUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    key={idx}
                                    className="flex-shrink-0"
                                  >
                                    <img 
                                      src={imgUrl} 
                                      alt={`${msg.educationalContent.topic} ${idx+1}`} 
                                      className="h-20 w-20 object-cover rounded border border-gray-300" 
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/100x100?text=Image+Error';
                                      }}
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {msg.educationalContent.videos.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs font-semibold mb-1">Videos:</div>
                              <div className="text-xs">
                                {msg.educationalContent.videos.slice(0, 3).map((video, idx) => (
                                  <a 
                                    href={video.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    key={idx}
                                    className="block mb-1 text-blue-600 hover:underline"
                                  >
                                    {idx+1}. {video.title}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Audio playback button for assistant messages */}
                      {msg.role === 'assistant' && msg.hasAudio && !msg.ttsUnavailable && (
                        <div className="mt-2 flex space-x-2">
                          {isPlayingAudio && currentAudioMessage === index ? (
                            <>
                              <div className="text-xs px-2 py-1 rounded flex items-center bg-intel-dark-blue text-white">
                                <FontAwesomeIcon 
                                  icon={faSpinner}
                                  className="mr-1 animate-spin" 
                                />
                                Playing...
                              </div>
                              <button
                                onClick={stopAudioPlayback}
                                className="text-xs px-2 py-1 rounded flex items-center bg-red-500 hover:bg-red-600 text-white"
                                title="Stop playback"
                              >
                                <FontAwesomeIcon icon={faStop} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => convertTextToSpeech(msg.content, index)}
                              disabled={isPlayingAudio && currentAudioMessage !== index}
                              className="text-xs px-2 py-1 rounded flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700"
                            >
                              <FontAwesomeIcon icon={faMicrophone} className="mr-1" />
                              Listen
                            </button>
                          )}
                        </div>
                      )}
                      {/* Message for when TTS is unavailable */}
                      {msg.role === 'assistant' && msg.ttsUnavailable && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 italic">
                            <FontAwesomeIcon icon={faVolumeXmark} className="mr-1" />
                            Audio unavailable
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none p-3 max-w-3/4">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-800 p-2 text-xs">
              {error}
              <button 
                onClick={() => setError(null)} 
                className="ml-2 text-red-800 hover:text-red-900"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Camera view */}
          {isCameraActive && (
            <div className="relative border-t border-gray-200 p-2">
              <div className="bg-black rounded-lg" style={{ minHeight: '200px' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full rounded-lg"
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                  onLoadedData={() => console.log('Video loaded and ready')}
                />
              </div>
              <button
                className="absolute top-4 right-4 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none"
                onClick={captureImage}
              >
                <FontAwesomeIcon icon={faCamera} />
              </button>
            </div>
          )}
          
          {/* Captured image */}
          {capturedImage && (
            <div className="relative border-t border-gray-200 p-2">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full rounded-lg"
                style={{ maxHeight: '200px', objectFit: 'contain' }}
              />
              <div className="flex justify-center mt-2 space-x-2">
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
                  onClick={() => setCapturedImage(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
                  onClick={processImage}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Extract Text'}
                </button>
              </div>
            </div>
          )}
          
          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex items-center">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-intel-blue focus:border-transparent resize-none max-h-20"
                rows="1"
                disabled={isListening}
              />
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={`p-2 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <FontAwesomeIcon icon={faMicrophone} />
                  )}
                </button>
              )}
              <button
                onClick={toggleCamera}
                disabled={isLoading}
                className={`p-2 ${isCameraActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                title={isCameraActive ? 'Stop camera' : 'Capture image'}
              >
                <FontAwesomeIcon icon={faCamera} />
              </button>
              <button
                onClick={() => {
                  const lastMessage = messages[messages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    searchEducationalContent(lastMessage.content);
                  } else if (inputMessage.trim()) {
                    searchEducationalContent(inputMessage.trim());
                  }
                }}
                disabled={isLoading || isSearchingContent || (messages.length === 0 && !inputMessage.trim())}
                className={`p-2 ${isSearchingContent ? 'bg-yellow-500' : 'bg-green-600 hover:bg-green-700'} text-white`}
                title="Find educational content"
              >
                <FontAwesomeIcon icon={isSearchingContent ? faSpinner : faGraduationCap} className={isSearchingContent ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className={`bg-intel-blue text-white p-2 rounded-r-lg h-full ${(!inputMessage.trim() || isLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-intel-dark-blue'}`}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center">
              {speechSupported ? (
                <span>Type or {isListening ? 'speaking...' : 'click the microphone to speak'} • Powered by Groq LLM API</span>
              ) : (
                <span>Powered by Groq LLM API</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotButton;
