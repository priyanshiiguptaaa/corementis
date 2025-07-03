import React, { useState, useEffect, useRef } from 'react';

const ChatPanel = ({ initialMessages = [] }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Sample initial messages if none provided
  const sampleMessages = [
    { id: 1, sender: 'Dr. Smith', text: 'Welcome to today\'s class on OpenVINO models!', time: '10:01 AM', isInstructor: true },
    { id: 2, sender: 'Emily Johnson', text: 'Looking forward to learning about facial recognition.', time: '10:02 AM', isInstructor: false },
    { id: 3, sender: 'Michael Brown', text: 'Will we be using the gaze-estimation model today?', time: '10:03 AM', isInstructor: false },
    { id: 4, sender: 'Dr. Smith', text: 'Yes, we will cover gaze-estimation-adas-0002 in the second half of the class.', time: '10:04 AM', isInstructor: true },
  ];
  
  // Initialize with sample messages if no messages provided
  useEffect(() => {
    if (messages.length === 0 && initialMessages.length === 0) {
      setMessages(sampleMessages);
    }
  }, []);
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: messages.length + 1,
      sender: 'You', // Current user
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isInstructor: false
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <div className="flex items-baseline">
              <span className={`font-medium ${msg.isInstructor ? 'text-intel-blue' : msg.sender === 'You' ? 'text-green-400' : ''}`}>
                {msg.sender}
              </span>
              <span className="ml-2 text-xs text-gray-400">{msg.time}</span>
            </div>
            <p className="mt-1 text-sm">{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-700 p-4">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-l focus:outline-none"
          />
          <button 
            type="submit"
            className="bg-intel-blue hover:bg-intel-dark-blue px-4 py-2 rounded-r"
            disabled={!newMessage.trim()}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
