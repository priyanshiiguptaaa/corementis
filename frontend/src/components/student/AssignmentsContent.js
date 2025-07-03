import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, FileText, Plus, Download, Search, Filter, BookOpen, Bell, Star, Edit2, Trash2, Eye, Upload } from 'lucide-react';

const AssignmentsContent = () => {
  // Enhanced assignments data with more realistic features
  const [assignmentsData, setAssignmentsData] = useState([
    { 
      id: 1, 
      title: 'Computer Vision Project', 
      course: 'Computer Vision', 
      instructor: 'Dr. Sarah Chen',
      dueDate: '2025-07-15', 
      submittedDate: null,
      status: 'pending', 
      priority: 'high',
      description: 'Implement object detection using YOLO algorithm',
      submissionType: 'file',
      maxScore: 100,
      weight: 20,
      submissions: 0,
      maxSubmissions: 3,
      fileTypes: ['.py', '.ipynb', '.pdf'],
      estimatedTime: '8-10 hours',
      category: 'Project',
      isStarred: true,
      hasRubric: true,
      lateSubmissionAllowed: true,
      latePenalty: 10
    },
    { 
      id: 2, 
      title: 'ML Quiz - Supervised Learning', 
      course: 'Machine Learning', 
      instructor: 'Prof. Michael Rodriguez',
      dueDate: '2025-07-18', 
      submittedDate: null,
      status: 'pending', 
      priority: 'medium',
      description: 'Online quiz covering decision trees, SVM, and ensemble methods',
      submissionType: 'online',
      maxScore: 50,
      weight: 10,
      submissions: 0,
      maxSubmissions: 1,
      estimatedTime: '45 minutes',
      category: 'Quiz',
      isStarred: false,
      hasRubric: false,
      lateSubmissionAllowed: false,
      latePenalty: 0
    },
    { 
      id: 3, 
      title: 'Data Visualization Report', 
      course: 'Data Visualization', 
      instructor: 'Dr. Emily Watson',
      dueDate: '2025-07-20', 
      submittedDate: null,
      status: 'pending', 
      priority: 'medium',
      description: 'Create interactive dashboards using D3.js and Tableau',
      submissionType: 'file',
      maxScore: 75,
      weight: 15,
      submissions: 1,
      maxSubmissions: 2,
      fileTypes: ['.html', '.js', '.pdf'],
      estimatedTime: '6-8 hours',
      category: 'Report',
      isStarred: false,
      hasRubric: true,
      lateSubmissionAllowed: true,
      latePenalty: 5
    },
    { 
      id: 4, 
      title: 'Neural Networks Lab', 
      course: 'Deep Learning', 
      instructor: 'Dr. James Liu',
      dueDate: '2025-07-10', 
      submittedDate: '2025-07-09',
      status: 'completed', 
      priority: 'high',
      description: 'Implement and train a CNN for image classification',
      submissionType: 'file',
      maxScore: 100,
      weight: 25,
      submissions: 1,
      maxSubmissions: 1,
      fileTypes: ['.py', '.ipynb'],
      estimatedTime: '4-6 hours',
      category: 'Lab',
      isStarred: false,
      hasRubric: true,
      score: 92,
      feedback: 'Excellent implementation! Consider adding data augmentation techniques.',
      lateSubmissionAllowed: false,
      latePenalty: 0
    },
    { 
      id: 5, 
      title: 'Research Paper Review', 
      course: 'Computer Vision', 
      instructor: 'Dr. Sarah Chen',
      dueDate: '2025-07-05', 
      submittedDate: '2025-07-04',
      status: 'completed', 
      priority: 'low',
      description: 'Critical analysis of recent CVPR paper on attention mechanisms',
      submissionType: 'text',
      maxScore: 25,
      weight: 5,
      submissions: 1,
      maxSubmissions: 1,
      estimatedTime: '2-3 hours',
      category: 'Review',
      isStarred: false,
      hasRubric: false,
      score: 23,
      feedback: 'Good analysis, but could benefit from more critical evaluation.',
      lateSubmissionAllowed: true,
      latePenalty: 2
    },
    { 
      id: 6, 
      title: 'Group Presentation', 
      course: 'Machine Learning', 
      instructor: 'Prof. Michael Rodriguez',
      dueDate: '2025-07-25', 
      submittedDate: null,
      status: 'pending', 
      priority: 'high',
      description: 'Present findings on ensemble learning methods',
      submissionType: 'presentation',
      maxScore: 100,
      weight: 20,
      submissions: 0,
      maxSubmissions: 1,
      estimatedTime: '10-12 hours',
      category: 'Presentation',
      isStarred: true,
      hasRubric: true,
      lateSubmissionAllowed: false,
      latePenalty: 0
    },
    { 
      id: 7, 
      title: 'Advanced Algorithms Homework', 
      course: 'Algorithms', 
      instructor: 'Dr. Alice Johnson',
      dueDate: '2025-07-08', 
      submittedDate: null,
      status: 'overdue', 
      priority: 'high',
      description: 'Solve dynamic programming and graph theory problems',
      submissionType: 'file',
      maxScore: 50,
      weight: 15,
      submissions: 0,
      maxSubmissions: 2,
      fileTypes: ['.pdf', '.tex'],
      estimatedTime: '4-5 hours',
      category: 'Homework',
      isStarred: false,
      hasRubric: true,
      lateSubmissionAllowed: true,
      latePenalty: 15
    }
  ]);

  // Filter and search states
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('table'); // table or card
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Get unique values for filters
  const courses = [...new Set(assignmentsData.map(item => item.course))];
  const categories = [...new Set(assignmentsData.map(item => item.category))];

  // Check for overdue assignments on load
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setAssignmentsData(prev => prev.map(assignment => ({
      ...assignment,
      status: assignment.status === 'pending' && assignment.dueDate < today ? 'overdue' : assignment.status
    })));
  }, []);

  // Apply filters and search
  const filteredAssignments = assignmentsData
    .filter(assignment => {
      const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
      const matchesCourse = courseFilter === 'all' || assignment.course === courseFilter;
      const matchesPriority = priorityFilter === 'all' || assignment.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || assignment.category === categoryFilter;
      const matchesSearch = searchTerm === '' || 
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesCourse && matchesPriority && matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'dueDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Get days until due
  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Status badge styling
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'submitted': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Priority badge styling
  const getPriorityBadgeClass = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Toggle star
  const toggleStar = (id) => {
    setAssignmentsData(prev => prev.map(assignment => 
      assignment.id === id ? { ...assignment, isStarred: !assignment.isStarred } : assignment
    ));
  };

  // Handle submission
  const handleSubmission = () => {
    if (selectedAssignment) {
      setAssignmentsData(prev => prev.map(assignment => 
        assignment.id === selectedAssignment.id 
          ? { 
              ...assignment, 
              submissions: assignment.submissions + 1,
              status: assignment.submissions + 1 >= assignment.maxSubmissions ? 'submitted' : 'pending',
              submittedDate: new Date().toISOString().split('T')[0]
            }
          : assignment
      ));
      setShowSubmissionModal(false);
      setSubmissionText('');
      setSelectedFiles([]);
    }
  };

  // Get statistics
  const getStats = () => {
    const total = assignmentsData.length;
    const completed = assignmentsData.filter(a => a.status === 'completed').length;
    const pending = assignmentsData.filter(a => a.status === 'pending').length;
    const overdue = assignmentsData.filter(a => a.status === 'overdue').length;
    const avgScore = assignmentsData.filter(a => a.score).reduce((sum, a) => sum + a.score, 0) / assignmentsData.filter(a => a.score).length || 0;

    return { total, completed, pending, overdue, avgScore };
  };

  const stats = getStats();

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header with Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Assignment Dashboard</h1>
            <p className="text-gray-600 mt-2">Track and manage all your assignments across courses</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-red-600 font-medium">Overdue</p>
                <p className="text-2xl font-bold text-red-900">{stats.overdue}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg Score</p>
                <p className="text-2xl font-bold text-purple-900">{stats.avgScore.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments, courses, or instructors..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="table">Table View</option>
              <option value="card">Card View</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                  <option value="submitted">Submitted</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                >
                  <option value="all">All Courses</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="dueDate">Due Date</option>
                  <option value="title">Title</option>
                  <option value="course">Course</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assignments Display */}
      <div className="bg-white rounded-lg shadow-md">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment) => {
                  const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                  const isUrgent = daysUntilDue <= 2 && assignment.status === 'pending';
                  
                  return (
                    <tr key={assignment.id} className={`hover:bg-gray-50 ${isUrgent ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleStar(assignment.id)}
                            className="mr-2"
                          >
                            <Star className={`h-4 w-4 ${assignment.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                          </button>
                          <div>
                            <div className="font-medium text-gray-900">{assignment.title}</div>
                            <div className="text-sm text-gray-500">{assignment.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{assignment.course}</div>
                          <div className="text-sm text-gray-500">{assignment.instructor}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900">{assignment.dueDate}</div>
                          <div className={`text-xs ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 2 ? 'text-yellow-600' : 'text-gray-500'}`}>
                            {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : 
                             daysUntilDue === 0 ? 'Due today' : 
                             `${daysUntilDue} days left`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(assignment.status)}`}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityBadgeClass(assignment.priority)}`}>
                          {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {assignment.score ? `${assignment.score}/${assignment.maxScore}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedAssignment(assignment)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {assignment.status === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setShowSubmissionModal(true);
                              }}
                              className="text-green-600 hover:text-green-800"
                              title="Submit"
                            >
                              <Upload className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredAssignments.map((assignment) => {
              const daysUntilDue = getDaysUntilDue(assignment.dueDate);
              const isUrgent = daysUntilDue <= 2 && assignment.status === 'pending';
              
              return (
                <div key={assignment.id} className={`border rounded-lg p-6 ${isUrgent ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'} hover:shadow-md transition-shadow`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <button
                          onClick={() => toggleStar(assignment.id)}
                          className="mr-2"
                        >
                          <Star className={`h-4 w-4 ${assignment.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                        </button>
                        <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{assignment.course}</p>
                      <p className="text-xs text-gray-500">{assignment.instructor}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(assignment.status)}`}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityBadgeClass(assignment.priority)}`}>
                        {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{assignment.dueDate}</span>
                    </div>
                    <div className={`${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 2 ? 'text-yellow-600' : 'text-gray-500'}`}>
                      {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : 
                       daysUntilDue === 0 ? 'Due today' : 
                       `${daysUntilDue} days left`}
                    </div>
                  </div>
                  
                  {assignment.score && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Score:</span>
                        <span className="font-medium">{assignment.score}/{assignment.maxScore}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                    {assignment.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowSubmissionModal(true);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Assignment Details Modal */}
      {selectedAssignment && !showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedAssignment.title}</h2>
                  <p className="text-gray-600">{selectedAssignment.course} • {selectedAssignment.instructor}</p>
                </div>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Assignment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Due Date:</span>
                        <span className="font-medium">{selectedAssignment.dueDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium">{selectedAssignment.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Max Score:</span>
                        <span className="font-medium">{selectedAssignment.maxScore} points</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Weight:</span>
                        <span className="font-medium">{selectedAssignment.weight}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Estimated Time:</span>
                        <span className="font-medium">{selectedAssignment.estimatedTime}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Submission Info</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type:</span>
                        <span className="font-medium capitalize">{selectedAssignment.submissionType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Attempts:</span>
                        <span className="font-medium">{selectedAssignment.submissions}/{selectedAssignment.maxSubmissions}</span>
                      </div>
                      {selectedAssignment.fileTypes && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">File Types:</span>
                          <span className="font-medium">{selectedAssignment.fileTypes.join(', ')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Late Submission:</span>
                        <span className="font-medium">{selectedAssignment.lateSubmissionAllowed ? `Yes (-${selectedAssignment.latePenalty}%)` : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Status</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusBadgeClass(selectedAssignment.status)}`}>
                        {selectedAssignment.status.charAt(0).toUpperCase() + selectedAssignment.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getPriorityBadgeClass(selectedAssignment.priority)}`}>
                        {selectedAssignment.priority.charAt(0).toUpperCase() + selectedAssignment.priority.slice(1)} Priority
                      </span>
                      {selectedAssignment.hasRubric && (
                        <span className="px-3 py-1 text-sm font-semibold rounded-full border bg-blue-100 text-blue-800 border-blue-200">
                          Has Rubric
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedAssignment.score && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Grade</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          {selectedAssignment.score}/{selectedAssignment.maxScore}
                        </div>
                        <div className="text-sm text-gray-600">
                          {((selectedAssignment.score / selectedAssignment.maxScore) * 100).toFixed(1)}%
                        </div>
                        {selectedAssignment.feedback && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">{selectedAssignment.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedAssignment.submittedDate && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Submission Date</h3>
                      <p className="text-sm text-gray-600">{selectedAssignment.submittedDate}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{selectedAssignment.description}</p>
              </div>

              <div className="flex justify-end space-x-3">
                {selectedAssignment.hasRubric && (
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    View Rubric
                  </button>
                )}
                {selectedAssignment.status === 'pending' && (
                  <button
                    onClick={() => setShowSubmissionModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Assignment
                  </button>
                )}
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {showSubmissionModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Assignment</h2>
                  <p className="text-gray-600">{selectedAssignment.title}</p>
                </div>
                <button
                  onClick={() => setShowSubmissionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Bell className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Submission Guidelines</span>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Submission Type: {selectedAssignment.submissionType}</li>
                    <li>• Attempts Remaining: {selectedAssignment.maxSubmissions - selectedAssignment.submissions}</li>
                    {selectedAssignment.fileTypes && (
                      <li>• Accepted File Types: {selectedAssignment.fileTypes.join(', ')}</li>
                    )}
                    <li>• Due Date: {selectedAssignment.dueDate}</li>
                  </ul>
                </div>
              </div>

              {selectedAssignment.submissionType === 'text' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Submission
                  </label>
                  <textarea
                    rows={8}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your submission text here..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                  />
                </div>
              )}

              {selectedAssignment.submissionType === 'file' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Files
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                    <p className="text-sm text-gray-500">
                      Accepted formats: {selectedAssignment.fileTypes?.join(', ')}
                    </p>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept={selectedAssignment.fileTypes?.join(',')}
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                    />
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Selected Files:</h4>
                      <ul className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <li key={index} className="flex items-center justify-between bg-gray-50 rounded p-2">
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <button
                              onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {selectedAssignment.submissionType === 'online' && (
                <div className="mb-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="font-medium text-yellow-900">Online Quiz</span>
                    </div>
                    <p className="text-sm text-yellow-800">
                      This is an online quiz. Click "Start Quiz" to begin. You will have one attempt.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSubmissionModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmission}
                  disabled={
                    (selectedAssignment.submissionType === 'text' && !submissionText.trim()) ||
                    (selectedAssignment.submissionType === 'file' && selectedFiles.length === 0)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {selectedAssignment.submissionType === 'online' ? 'Start Quiz' : 'Submit Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsContent;