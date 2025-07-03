import React, { useState, useMemo } from 'react';
import { Search, MessageSquare, Plus, Filter, Clock, User, BookOpen, CheckCircle, AlertCircle, Star, ThumbsUp, Eye, Send, X, Edit3, Trash2 } from 'lucide-react';

const DiscussionsContent = () => {
  // Enhanced discussions data with more fields
  const [discussionsData, setDiscussionsData] = useState([
    { 
      id: 1, 
      title: 'Question about OpenVINO models optimization for edge devices', 
      course: 'Computer Vision',
      author: 'John Smith',
      date: '2024-07-10',
      replies: 3,
      resolved: false,
      views: 45,
      likes: 8,
      tags: ['OpenVINO', 'Edge Computing', 'Optimization'],
      priority: 'high',
      lastActivity: '2024-07-10 14:30'
    },
    { 
      id: 2, 
      title: 'Help with engagement analyzer implementation using Intel tools', 
      course: 'Deep Learning',
      author: 'Emily Johnson',
      date: '2024-07-09',
      replies: 5,
      resolved: true,
      views: 78,
      likes: 15,
      tags: ['Engagement Analysis', 'Intel AI', 'Implementation'],
      priority: 'medium',
      lastActivity: '2024-07-09 16:45'
    },
    { 
      id: 3, 
      title: 'Facial landmarks detection accuracy improvements with Intel OpenVINO', 
      course: 'Computer Vision',
      author: 'Michael Brown',
      date: '2024-07-08',
      replies: 2,
      resolved: false,
      views: 32,
      likes: 6,
      tags: ['Facial Recognition', 'Landmarks', 'Accuracy'],
      priority: 'low',
      lastActivity: '2024-07-08 11:20'
    },
    { 
      id: 4, 
      title: 'Gaze estimation model parameters tuning for better performance', 
      course: 'Machine Learning',
      author: 'Sarah Davis',
      date: '2024-07-07',
      replies: 4,
      resolved: true,
      views: 56,
      likes: 12,
      tags: ['Gaze Estimation', 'Model Tuning', 'Performance'],
      priority: 'high',
      lastActivity: '2024-07-07 09:15'
    },
    { 
      id: 5, 
      title: 'Emotions recognition model training with Intel hardware acceleration', 
      course: 'Deep Learning',
      author: 'Alex Wilson',
      date: '2024-07-06',
      replies: 1,
      resolved: false,
      views: 23,
      likes: 4,
      tags: ['Emotion Recognition', 'Training', 'Hardware Acceleration'],
      priority: 'medium',
      lastActivity: '2024-07-06 13:00'
    },
  ]);
  
  // Enhanced private messages
  const [privateMessages, setPrivateMessages] = useState([
    {
      id: 1,
      from: 'Dr. Smith',
      course: 'Computer Vision',
      subject: 'Project Submission Feedback',
      preview: 'About your recent project submission using Intel OpenVINO toolkit...',
      content: 'Your implementation shows good understanding of the OpenVINO optimization pipeline. However, I noticed some areas where performance could be improved...',
      date: '2024-07-10',
      unread: true,
      starred: false,
      priority: 'high'
    },
    {
      id: 2,
      from: 'Prof. Johnson',
      course: 'Machine Learning',
      subject: 'Engagement Analysis Review',
      preview: 'Feedback on your engagement analysis implementation...',
      content: 'Great work on the engagement analysis project. The use of Intel AI tools was particularly impressive...',
      date: '2024-07-08',
      unread: false,
      starred: true,
      priority: 'medium'
    },
    {
      id: 3,
      from: 'Dr. Williams',
      course: 'Deep Learning',
      subject: 'OpenVINO Workshop Invitation',
      preview: 'Regarding your question about OpenVINO optimization...',
      content: 'Based on your recent questions, I think you would benefit from our advanced OpenVINO workshop...',
      date: '2024-07-05',
      unread: false,
      starred: false,
      priority: 'low'
    }
  ]);
  
  // State management
  const [activeTab, setActiveTab] = useState('forum');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ title: '', course: '', content: '', tags: '' });
  const [newMessage, setNewMessage] = useState({ to: '', subject: '', content: '' });

  // Get unique courses
  const courses = [...new Set(discussionsData.map(d => d.course))];
  
  // Filter and sort discussions
  const filteredDiscussions = useMemo(() => {
    let filtered = discussionsData.filter(discussion => {
      const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           discussion.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCourse = selectedCourse === 'all' || discussion.course === selectedCourse;
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'resolved' && discussion.resolved) ||
                           (selectedStatus === 'open' && !discussion.resolved);
      
      return matchesSearch && matchesCourse && matchesStatus;
    });
    
    // Sort discussions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'replies':
          return b.replies - a.replies;
        case 'views':
          return b.views - a.views;
        case 'likes':
          return b.likes - a.likes;
        case 'lastActivity':
        default:
          return new Date(b.lastActivity) - new Date(a.lastActivity);
      }
    });
    
    return filtered;
  }, [discussionsData, searchTerm, selectedCourse, selectedStatus, sortBy]);

  // Handle functions
  const handleLikeDiscussion = (id) => {
    setDiscussionsData(prev => prev.map(d => 
      d.id === id ? { ...d, likes: d.likes + 1 } : d
    ));
  };

  const handleNewQuestion = () => {
    if (newQuestion.title && newQuestion.course && newQuestion.content) {
      const question = {
        id: Date.now(),
        title: newQuestion.title,
        course: newQuestion.course,
        author: 'Current User',
        date: new Date().toISOString().split('T')[0],
        replies: 0,
        resolved: false,
        views: 0,
        likes: 0,
        tags: newQuestion.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        priority: 'medium',
        lastActivity: new Date().toISOString()
      };
      
      setDiscussionsData(prev => [question, ...prev]);
      setNewQuestion({ title: '', course: '', content: '', tags: '' });
      setShowNewQuestionModal(false);
    }
  };

  const handleStarMessage = (id) => {
    setPrivateMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, starred: !msg.starred } : msg
    ));
  };

  const handleMarkAsRead = (id) => {
    setPrivateMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, unread: false } : msg
    ));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">Discussions & Doubts</h2>
          </div>
          <div className="text-sm text-gray-500">
            Intel AI Learning Platform
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'forum' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('forum')}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Q&A Forum</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {discussionsData.length}
              </span>
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'private' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('private')}
            >
              <User className="h-4 w-4" />
              <span>Private Messages</span>
              {privateMessages.some(msg => msg.unread) && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {privateMessages.filter(msg => msg.unread).length} New
                </span>
              )}
            </button>
          </nav>
        </div>
        
        {/* Forum Content */}
        {activeTab === 'forum' && (
          <div>
            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search discussions, tags, or topics..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="all">All Courses</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
                
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                </select>
                
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="lastActivity">Recent Activity</option>
                  <option value="date">Date Created</option>
                  <option value="replies">Most Replies</option>
                  <option value="views">Most Viewed</option>
                  <option value="likes">Most Liked</option>
                </select>
                
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
                  onClick={() => setShowNewQuestionModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span>New Question</span>
                </button>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Total Questions</p>
                    <p className="text-2xl font-bold text-blue-900">{discussionsData.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">Resolved</p>
                    <p className="text-2xl font-bold text-green-900">
                      {discussionsData.filter(d => d.resolved).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-600">Open</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {discussionsData.filter(d => !d.resolved).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center">
                  <ThumbsUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Total Likes</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {discussionsData.reduce((sum, d) => sum + d.likes, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Discussions List */}
            <div className="space-y-4">
              {filteredDiscussions.map((discussion) => (
                <div 
                  key={discussion.id} 
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                          {discussion.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(discussion.priority)}`}>
                          {discussion.priority}
                        </span>
                        {discussion.resolved && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {discussion.course}
                        </span>
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {discussion.author}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {discussion.date}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {discussion.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{discussion.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{discussion.replies}</span>
                      </div>
                      <button 
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                        onClick={() => handleLikeDiscussion(discussion.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{discussion.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Private Messages Content */}
        {activeTab === 'private' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Instructor Messages</h3>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
                onClick={() => setShowMessageModal(true)}
              >
                <Plus className="h-4 w-4" />
                <span>New Message</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {privateMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    message.unread 
                      ? 'border-blue-300 bg-blue-50 hover:bg-blue-100' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedMessage(message);
                    handleMarkAsRead(message.id);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{message.from}</h4>
                        {message.unread && (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">{message.course}</p>
                      <p className="font-medium text-gray-900 mb-2">{message.subject}</p>
                      <p className="text-gray-700">{message.preview}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        className={`p-1 rounded hover:bg-gray-200 ${message.starred ? 'text-yellow-500' : 'text-gray-400'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStarMessage(message.id);
                        }}
                      >
                        <Star className={`h-4 w-4 ${message.starred ? 'fill-current' : ''}`} />
                      </button>
                      <span className="text-sm text-gray-500">{message.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Question Modal */}
      {showNewQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Ask a New Question</h3>
              <button 
                onClick={() => setShowNewQuestionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What's your question about?"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newQuestion.course}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, course: e.target.value }))}
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., OpenVINO, Machine Learning, Intel AI"
                  value={newQuestion.tags}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Details</label>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your question in detail..."
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowNewQuestionModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleNewQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Post Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{selectedMessage.subject}</h3>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">From: {selectedMessage.from}</span>
                  <span className="text-sm text-gray-500">({selectedMessage.course})</span>
                </div>
                <span className="text-sm text-gray-500">{selectedMessage.date}</span>
              </div>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Send className="h-4 w-4" />
                <span>Reply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionsContent;