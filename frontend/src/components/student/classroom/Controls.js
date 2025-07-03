import React from 'react';

const Controls = ({ 
  isMicOn, 
  toggleMic, 
  isCameraOn, 
  toggleCamera, 
  isScreenSharing, 
  toggleScreenShare, 
  isChatOpen, 
  toggleChat, 
  isParticipantsOpen, 
  toggleParticipants, 
  isEngagementPanelOpen, 
  toggleEngagementPanel, 
  isHandRaised, 
  toggleHandRaise, 
  leaveClass 
}) => {
  return (
    <div className="bg-gray-800 py-4 px-6 flex justify-center items-center space-x-4">
      {/* Microphone control */}
      <button 
        onClick={toggleMic}
        className={`p-3 rounded-full ${isMicOn ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'} relative group`}
        title={isMicOn ? 'Turn off microphone' : 'Turn on microphone'}
      >
        <i className={`fas ${isMicOn ? 'fa-microphone' : 'fa-microphone-slash'} text-white`}></i>
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {isMicOn ? 'Microphone On' : 'Microphone Off'}
        </span>
      </button>
      
      {/* Camera control */}
      <button 
        onClick={toggleCamera}
        className={`p-3 rounded-full ${isCameraOn ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'} relative group`}
        title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
      >
        <i className={`fas ${isCameraOn ? 'fa-video' : 'fa-video-slash'} text-white`}></i>
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {isCameraOn ? 'Camera On' : 'Camera Off'}
        </span>
      </button>
      
      {/* Screen sharing control */}
      <button 
        onClick={toggleScreenShare}
        className={`p-3 rounded-full ${isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} relative group`}
        title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
      >
        <i className="fas fa-desktop text-white"></i>
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
        </span>
      </button>
      
      {/* Hand raise control */}
      <button 
        onClick={toggleHandRaise}
        className={`p-3 rounded-full ${isHandRaised ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'} relative group`}
        title={isHandRaised ? 'Lower hand' : 'Raise hand'}
      >
        <i className="fas fa-hand-paper text-white"></i>
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
        </span>
      </button>
      
      {/* Chat toggle */}
      <button 
        onClick={toggleChat}
        className={`p-3 rounded-full ${isChatOpen ? 'bg-intel-blue hover:bg-intel-dark-blue' : 'bg-gray-600 hover:bg-gray-700'} relative group`}
        title="Toggle chat"
      >
        <i className="fas fa-comment-alt text-white"></i>
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat
        </span>
      </button>
      
      {/* Participants toggle */}
      <button 
        onClick={toggleParticipants}
        className={`p-3 rounded-full ${isParticipantsOpen ? 'bg-intel-blue hover:bg-intel-dark-blue' : 'bg-gray-600 hover:bg-gray-700'} relative group`}
        title="Toggle participants list"
      >
        <i className="fas fa-users text-white"></i>
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Participants
        </span>
      </button>
      
      {/* Engagement analysis toggle - more prominent */}
      <button 
        onClick={toggleEngagementPanel}
        className={`p-3 rounded-full ${isEngagementPanelOpen ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-500 hover:bg-blue-600'} relative group border-2 ${isEngagementPanelOpen ? 'border-white' : 'border-blue-300'}`}
        title="Toggle engagement analysis"
      >
        <i className="fas fa-chart-line text-white"></i>
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-bold">
          Engagement Analysis
        </span>
      </button>
    </div>
  );
};

export default Controls;
