import React, { useRef, useEffect } from 'react';

const VideoGrid = ({ 
  localStream, 
  screenStream, 
  isScreenSharing, 
  participants,
  videoRef // Added videoRef for engagement analysis
}) => {
  // Always create local refs, but use the provided videoRef when connecting the stream
  const internalVideoRef = useRef(null);
  const screenShareRef = useRef(null);
  
  // Sample participants data if none provided
  const defaultParticipants = [
    { id: 1, name: 'Dr. Smith', role: 'Teacher', isPresenting: !isScreenSharing, hasCamera: true, hasMic: true },
    { id: 2, name: 'John Smith', role: 'Student', isPresenting: false, hasCamera: true, hasMic: true },
    { id: 3, name: 'Emily Johnson', role: 'Student', isPresenting: false, hasCamera: true, hasMic: false },
    { id: 4, name: 'Michael Brown', role: 'Student', isPresenting: false, hasCamera: false, hasMic: true },
    { id: 5, name: 'Sarah Davis', role: 'Student', isPresenting: false, hasCamera: true, hasMic: true },
  ];
  
  const displayParticipants = participants || defaultParticipants;
  
  // Connect local video stream to video element
  useEffect(() => {
    if (localStream) {
      // Connect to both the internal ref and the provided ref if available
      if (internalVideoRef.current) {
        internalVideoRef.current.srcObject = localStream;
        internalVideoRef.current.onloadedmetadata = () => {
          console.log('Internal video metadata loaded');
          internalVideoRef.current.play().catch(e => console.error('Error playing internal video:', e));
        };
      }
      
      // This is the critical part - make sure the external videoRef gets properly set up
      if (videoRef && videoRef.current) {
        console.log('Setting up external video reference');
        videoRef.current.srcObject = localStream;
        videoRef.current.onloadedmetadata = () => {
          console.log('External video metadata loaded, dimensions:', 
            videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
          videoRef.current.play().catch(e => console.error('Error playing external video:', e));
        };
      } else {
        console.warn('External video reference not available in VideoGrid');
      }
    }
  }, [localStream, videoRef]);
  
  // Connect screen share stream to video element
  useEffect(() => {
    if (screenShareRef.current && screenStream) {
      screenShareRef.current.srcObject = screenStream;
    }
  }, [screenStream]);
  
  // Find the main presenter (either screen share or teacher)
  const mainPresenter = isScreenSharing 
    ? { name: 'Screen Share', isScreenShare: true }
    : displayParticipants.find(p => p.isPresenting);
  
  return (
    <div className="flex flex-col h-full">
      {/* Main presentation area */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden mb-4 relative">
        {isScreenSharing ? (
          <>
            <video 
              ref={screenShareRef} 
              className="w-full h-full object-contain" 
              autoPlay 
              playsInline
            />
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
              Screen Share
            </div>
          </>
        ) : mainPresenter ? (
          <>
            <img 
              src={`https://i.pravatar.cc/1000?img=${mainPresenter.id || 1}`} 
              alt="Presenter" 
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
              {mainPresenter.name} (Presenting)
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400">No one is presenting</p>
          </div>
        )}
      </div>
      
      {/* Participants video grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 h-32">
        {/* Local video */}
        <div className="relative bg-gray-800 rounded overflow-hidden">
          {localStream ? (
            <video
              ref={internalVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <span className="text-2xl font-bold">You</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 px-2 py-1 text-xs flex justify-between items-center">
            <span>You</span>
            {!localStream?.getAudioTracks().some(track => track.enabled) && <span>🔇</span>}
          </div>
        </div>
        
        {/* Other participants */}
        {displayParticipants
          .filter(p => p.role !== 'Teacher' || !p.isPresenting) // Don't show teacher if they're the main presenter
          .slice(0, 4) // Limit to 4 other participants
          .map((participant) => (
            <div key={participant.id} className="relative bg-gray-800 rounded overflow-hidden">
              {participant.hasCamera ? (
                <img 
                  src={`https://i.pravatar.cc/150?img=${participant.id}`}
                  alt={participant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <span className="text-2xl font-bold">{participant.name.charAt(0)}</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 px-2 py-1 text-xs flex justify-between items-center">
                <span>{participant.name}</span>
                {!participant.hasMic && <span>🔇</span>}
              </div>
            </div>
          ))}
          
        {/* Show how many more participants there are if not all are displayed */}
        {displayParticipants.length > 5 && (
          <div className="relative bg-gray-800 rounded overflow-hidden flex items-center justify-center">
            <span className="text-lg font-bold">+{displayParticipants.length - 5} more</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGrid;
