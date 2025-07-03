import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, User, BookOpen, AlertCircle, Bell, BellOff, Eye, EyeOff, ChevronLeft, ChevronRight, Download, Star, StarOff } from 'lucide-react';

const AnnouncementsContent = () => {
  // Sample announcements data with additional fields
  const [announcements] = useState([
    {
      id: 1,
      title: 'Schedule Change for Deep Learning',
      content: 'The Deep Learning class scheduled for Wednesday has been moved to Friday at the same time due to a conflict with a faculty meeting. Please update your calendars accordingly.',
      date: '2023-07-10',
      author: 'Dr. Williams',
      course: 'Deep Learning',
      important: true,
      read: false,
      starred: false,
      category: 'schedule',
      tags: ['schedule-change', 'deep-learning']
    },
    {
      id: 2,
      title: 'New Computer Vision Resources Available',
      content: 'New resources on OpenVINO models and facial recognition have been added to the course materials. Please review them before the next class. The resources include practical examples and code samples.',
      date: '2023-07-09',
      author: 'Dr. Smith',
      course: 'Computer Vision',
      important: false,
      read: true,
      starred: true,
      category: 'resources',
      tags: ['resources', 'openvino', 'computer-vision']
    },
    {
      id: 3,
      title: 'Engagement Analyzer Project Deadline Extended',
      content: 'The deadline for the Engagement Analyzer project has been extended by one week to allow for more testing with the OpenVINO models. New deadline is July 20th.',
      date: '2023-07-08',
      author: 'Prof. Johnson',
      course: 'Machine Learning',
      important: true,
      read: false,
      starred: false,
      category: 'assignment',
      tags: ['deadline', 'project', 'machine-learning']
    },
    {
      id: 4,
      title: 'System Maintenance',
      content: 'The learning platform will be undergoing maintenance this Saturday from 2 AM to 6 AM. During this time, the system will be unavailable. Please plan accordingly.',
      date: '2023-07-07',
      author: 'IT Department',
      course: 'System',
      important: true,
      read: true,
      starred: false,
      category: 'system',
      tags: ['maintenance', 'system']
    },
    {
      id: 5,
      title: 'Guest Lecture on Intel Neural Compute Stick',
      content: 'We will have a guest lecture on using the Intel Neural Compute Stick for edge AI applications next Monday. Attendance is highly recommended for all Computer Vision students.',
      date: '2023-07-06',
      author: 'Dr. Smith',
      course: 'Computer Vision',
      important: false,
      read: true,
      starred: true,
      category: 'event',
      tags: ['guest-lecture', 'neural-compute-stick', 'edge-ai']
    },
    {
      id: 6,
      title: 'Assignment Submission Guidelines Updated',
      content: 'Please note the updated submission guidelines for all assignments. All code must be properly documented and include unit tests where applicable.',
      date: '2023-07-05',
      author: 'Prof. Johnson',
      course: 'Machine Learning',
      important: false,
      read: false,
      starred: false,
      category: 'assignment',
      tags: ['guidelines', 'submission']
    },
    {
      id: 7,
      title: 'Office Hours Extended',
      content: 'Office hours for this week have been extended to accommodate student questions before the midterm exam. Additional hours: Thursday 3-5 PM.',
      date: '2023-07-04',
      author: 'Dr. Williams',
      course: 'Deep Learning',
      important: false,
      read: true,
      starred: false,
      category: 'office-hours',
      tags: ['office-hours', 'exam-prep']
    }
  ]);

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [announcementStates, setAnnouncementStates] = useState(
    announcements.reduce((acc, ann) => ({
      ...acc,
      [ann.id]: { read: ann.read, starred: ann.starred }
    }), {})
  );

  const itemsPerPage = 5;

  // Toggle functions
  const toggleRead = (id) => {
    setAnnouncementStates(prev => ({
      ...prev,
      [id]: { ...prev[id], read: !prev[id].read }
    }));
  };

  const toggleStar = (id) => {
    setAnnouncementStates(prev => ({
      ...prev,
      [id]: { ...prev[id], starred: !prev[id].starred }
    }));
  };

  const markAllAsRead = () => {
    setAnnouncementStates(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        updated[id] = { ...updated[id], read: true };
      });
      return updated;
    });
  };

  // Filtered and sorted announcements
  const filteredAnnouncements = useMemo(() => {
    let filtered = announcements.map(ann => ({
      ...ann,
      read: announcementStates[ann.id]?.read ?? ann.read,
      starred: announcementStates[ann.id]?.starred ?? ann.starred
    }));

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ann =>
        ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Course filter
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(ann => ann.course.toLowerCase().includes(selectedCourse.toLowerCase()));
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ann => ann.category === selectedCategory);
    }

    // Show unread only
    if (showUnreadOnly) {
      filtered = filtered.filter(ann => !ann.read);
    }

    // Show starred only
    if (showStarredOnly) {
      filtered = filtered.filter(ann => ann.starred);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'course':
          return a.course.localeCompare(b.course);
        case 'importance':
          return b.important - a.important;
        default:
          return 0;
      }
    });

    return filtered;
  }, [announcements, searchTerm, selectedCourse, selectedCategory, sortBy, showUnreadOnly, showStarredOnly, announcementStates]);

  // Pagination
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAnnouncements = filteredAnnouncements.slice(startIndex, startIndex + itemsPerPage);

  // Stats
  const unreadCount = filteredAnnouncements.filter(ann => !ann.read).length;
  const importantCount = filteredAnnouncements.filter(ann => ann.important).length;
  const starredCount = filteredAnnouncements.filter(ann => ann.starred).length;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'schedule': 'bg-blue-100 text-blue-800',
      'resources': 'bg-green-100 text-green-800',
      'assignment': 'bg-purple-100 text-purple-800',
      'system': 'bg-red-100 text-red-800',
      'event': 'bg-yellow-100 text-yellow-800',
      'office-hours': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Announcements</h2>
            <p className="text-gray-600">
              Stay updated with important course information and system notifications.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllAsRead}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Mark All Read
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-900">{filteredAnnouncements.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm text-red-600 font-medium">Unread</p>
                <p className="text-2xl font-bold text-red-900">{unreadCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-yellow-600 font-medium">Important</p>
                <p className="text-2xl font-bold text-yellow-900">{importantCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600 font-medium">Starred</p>
                <p className="text-2xl font-bold text-green-900">{starredCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Course Filter */}
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Courses</option>
              <option value="computer vision">Computer Vision</option>
              <option value="machine learning">Machine Learning</option>
              <option value="deep learning">Deep Learning</option>
              <option value="system">System</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="schedule">Schedule</option>
              <option value="resources">Resources</option>
              <option value="assignment">Assignment</option>
              <option value="system">System</option>
              <option value="event">Event</option>
              <option value="office-hours">Office Hours</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="author">Author A-Z</option>
              <option value="course">Course A-Z</option>
              <option value="importance">Important First</option>
            </select>

            {/* Toggle Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  showUnreadOnly
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <BellOff className="w-4 h-4 mr-1" />
                Unread Only
              </button>
              <button
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  showStarredOnly
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Star className="w-4 h-4 mr-1" />
                Starred Only
              </button>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {paginatedAnnouncements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No announcements found matching your criteria.</p>
            </div>
          ) : (
            paginatedAnnouncements.map(announcement => (
              <div 
                key={announcement.id} 
                className={`border-l-4 ${
                  announcement.important ? 'border-red-500' : 'border-blue-500'
                } bg-white p-4 shadow rounded-r-lg hover:bg-gray-50 transition-colors ${
                  !announcement.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className={`text-lg font-medium ${
                        !announcement.read ? 'text-blue-900 font-semibold' : 'text-gray-900'
                      }`}>
                        {announcement.title}
                      </h3>
                      {!announcement.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      {announcement.starred && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(announcement.date)}
                      </span>
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {announcement.course}
                      </span>
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {announcement.author}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      {announcement.important && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                          Important
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(announcement.category)}`}>
                        {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">
                      {announcement.content}
                    </p>

                    {announcement.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {announcement.tags.map(tag => (
                          <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => toggleRead(announcement.id)}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {announcement.read ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {announcement.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      onClick={() => toggleStar(announcement.id)}
                      className="flex items-center text-sm text-yellow-600 hover:text-yellow-800 transition-colors"
                    >
                      {announcement.starred ? <StarOff className="w-4 h-4 mr-1" /> : <Star className="w-4 h-4 mr-1" />}
                      {announcement.starred ? 'Remove Star' : 'Add Star'}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {announcement.id}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredAnnouncements.length)}</span> of{' '}
                  <span className="font-medium">{filteredAnnouncements.length}</span> announcements
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        i + 1 === currentPage
                          ? 'bg-blue-600 text-white focus:z-20 focus:outline-offset-0'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsContent;