import React, { useState } from 'react';

const CoursesContent = () => {
  // State for selected course and active view
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeView, setActiveView] = useState('overview'); // overview, materials, lectures, announcements, assignments, forum
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedForumTopic, setSelectedForumTopic] = useState(null);
  const [showAssignmentDetails, setShowAssignmentDetails] = useState(null);
  
  // Assignment-specific states
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [assignmentSort, setAssignmentSort] = useState('dueDate');
  const [assignmentSortDirection, setAssignmentSortDirection] = useState('asc');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submissionComment, setSubmissionComment] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(null); // null, 'submitting', 'success', 'error'
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [assignmentSearchQuery, setAssignmentSearchQuery] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Sample courses data
  const courses = [
    { id: 1, name: 'Computer Vision', instructor: 'Dr. Smith', progress: 75, color: 'bg-intel-blue', description: 'Learn about computer vision techniques, image processing, and object detection using OpenVINO models.', credits: 3, duration: '12 weeks', enrolled: 156, rating: 4.8 },
    { id: 2, name: 'Machine Learning Fundamentals', instructor: 'Prof. Johnson', progress: 60, color: 'bg-intel-dark-blue', description: 'An introduction to machine learning concepts, algorithms, and practical applications.', credits: 4, duration: '14 weeks', enrolled: 203, rating: 4.6 },
    { id: 3, name: 'Deep Learning', instructor: 'Dr. Williams', progress: 40, color: 'bg-intel-light-blue', description: 'Advanced neural network architectures, training techniques, and applications.', credits: 3, duration: '10 weeks', enrolled: 89, rating: 4.9 },
    { id: 4, name: 'Data Visualization', instructor: 'Prof. Davis', progress: 90, color: 'bg-green-600', description: 'Techniques and tools for effective data visualization and communication.', credits: 2, duration: '8 weeks', enrolled: 145, rating: 4.5 },
  ];
  
  // Sample data for course details
  const courseMaterials = [
    { id: 1, title: 'Introduction to Computer Vision', type: 'PDF', size: '2.4 MB', uploadDate: '2023-09-01', downloadCount: 145 },
    { id: 2, title: 'Image Processing Techniques', type: 'PDF', size: '3.1 MB', uploadDate: '2023-09-08', downloadCount: 132 },
    { id: 3, title: 'Object Detection with OpenVINO', type: 'PDF', size: '4.5 MB', uploadDate: '2023-09-15', downloadCount: 98 },
    { id: 4, title: 'Course Syllabus', type: 'DOCX', size: '1.2 MB', uploadDate: '2023-08-25', downloadCount: 156 },
    { id: 5, title: 'Practice Dataset', type: 'ZIP', size: '156 MB', uploadDate: '2023-09-10', downloadCount: 87 },
    { id: 6, title: 'Lab Instructions', type: 'PDF', size: '1.8 MB', uploadDate: '2023-09-12', downloadCount: 124 },
  ];

  const courseLectures = [
    { id: 1, title: 'Lecture 1: Introduction to Computer Vision', duration: '45:20', date: '2023-09-01', views: 142, status: 'watched' },
    { id: 2, title: 'Lecture 2: Image Processing Fundamentals', duration: '50:15', date: '2023-09-08', views: 138, status: 'watching' },
    { id: 3, title: 'Lecture 3: Feature Detection and Matching', duration: '48:30', date: '2023-09-15', views: 95, status: 'unwatched' },
    { id: 4, title: 'Lecture 4: Object Detection Basics', duration: '52:10', date: '2023-09-22', views: 76, status: 'unwatched' },
    { id: 5, title: 'Lecture 5: Deep Learning for Vision', duration: '55:45', date: '2023-09-29', views: 45, status: 'unwatched' },
  ];

  const courseAssignments = [
    { id: 1, title: 'Assignment 1: Image Filtering', dueDate: '2023-09-15', status: 'Submitted', grade: '92/100', weight: 15, description: 'Implement various image filtering techniques using OpenCV.' },
    { id: 2, title: 'Assignment 2: Edge Detection', dueDate: '2023-09-22', status: 'In Progress', grade: null, weight: 20, description: 'Apply edge detection algorithms to identify object boundaries.' },
    { id: 3, title: 'Assignment 3: Feature Extraction', dueDate: '2023-09-29', status: 'Not Started', grade: null, weight: 25, description: 'Extract and match features using SIFT and ORB descriptors.' },
    { id: 4, title: 'Final Project Proposal', dueDate: '2023-10-06', status: 'Not Started', grade: null, weight: 40, description: 'Propose a computer vision project using real-world datasets.' },
  ];

  const courseAnnouncements = [
    { id: 1, title: 'Welcome to Computer Vision!', date: '2023-08-25', content: 'Welcome to the course! Please review the syllabus and join our first live session this Friday. Make sure to set up your development environment using the provided installation guide.', priority: 'high', author: 'Dr. Smith' },
    { id: 2, title: 'Assignment 1 Posted', date: '2023-09-01', content: 'The first assignment has been posted. It focuses on image filtering techniques. Due date is September 15th. Please start early as it requires setting up OpenCV.', priority: 'medium', author: 'Dr. Smith' },
    { id: 3, title: 'Office Hours Change', date: '2023-09-10', content: 'Office hours will be moved to Thursdays 2-4pm starting next week. Virtual office hours are also available via Zoom.', priority: 'low', author: 'TA - Jessica' },
    { id: 4, title: 'Midterm Exam Information', date: '2023-09-18', content: 'The midterm exam will cover lectures 1-5 and will be held on October 13th. Study guide will be posted next week.', priority: 'high', author: 'Dr. Smith' },
  ];

  const courseForumTopics = [
    { id: 1, title: 'Question about Gaussian Filters', author: 'Alex Johnson', date: '2023-09-05', replies: 3, lastActivity: '2023-09-06', status: 'resolved', category: 'Technical' },
    { id: 2, title: 'Error in Assignment 1 code', author: 'Maria Garcia', date: '2023-09-08', replies: 5, lastActivity: '2023-09-09', status: 'open', category: 'Assignment Help' },
    { id: 3, title: 'OpenVINO installation issues', author: 'James Wilson', date: '2023-09-12', replies: 7, lastActivity: '2023-09-14', status: 'resolved', category: 'Technical' },
    { id: 4, title: 'Additional resources for feature detection?', author: 'Sarah Miller', date: '2023-09-16', replies: 2, lastActivity: '2023-09-16', status: 'open', category: 'General' },
    { id: 5, title: 'Study group for midterm?', author: 'Michael Brown', date: '2023-09-18', replies: 8, lastActivity: '2023-09-19', status: 'active', category: 'Study Group' },
  ];

  // Function to go back to course list
  const backToCourseList = () => {
    setSelectedCourse(null);
    setActiveView('overview');
    setSelectedLecture(null);
    setSelectedForumTopic(null);
    setShowAssignmentDetails(null);
  };

  // Function to handle button clicks in course card
  const handleCourseAction = (courseId, action) => {
    setSelectedCourse(courseId);
    setActiveView(action);
    setSelectedLecture(null);
    setSelectedForumTopic(null);
    setShowAssignmentDetails(null);
  };
  
  // Function to get status color for assignments
  const getStatusColor = (status) => {
    switch(status) {
      case 'Submitted': return 'text-green-600';
      case 'In Progress': return 'text-yellow-600';
      case 'Not Started': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Function to get lecture status indicator
  const getLectureStatusIcon = (status) => {
    switch(status) {
      case 'watched': return '✅';
      case 'watching': return '⏸️';
      case 'unwatched': return '⭕';
      default: return '⭕';
    }
  };

  // Function to get priority color for announcements
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Function to get forum status color
  const getForumStatusColor = (status) => {
    switch(status) {
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'open': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Render navigation tabs
  const renderNavigationTabs = () => {
    const tabs = [
      { key: 'overview', label: 'Overview' },
      { key: 'materials', label: 'Materials' },
      { key: 'lectures', label: 'Lectures' },
      { key: 'assignments', label: 'Assignments' },
      { key: 'announcements', label: 'Announcements' },
      { key: 'forum', label: 'Q&A Forum' },
    ];

    return (
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeView === tab.key
                  ? 'border-intel-blue text-intel-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    );
  };

  // Render course overview
  const renderCourseOverview = () => {
    const course = courses.find(c => c.id === selectedCourse);
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-intel-blue to-intel-dark-blue text-white p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-2">{course.name}</h3>
          <p className="text-intel-light-gray mb-4">{course.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-intel-light-gray">Instructor</p>
              <p className="font-semibold">{course.instructor}</p>
            </div>
            <div>
              <p className="text-sm text-intel-light-gray">Duration</p>
              <p className="font-semibold">{course.duration}</p>
            </div>
            <div>
              <p className="text-sm text-intel-light-gray">Credits</p>
              <p className="font-semibold">{course.credits} Credits</p>
            </div>
            <div>
              <p className="text-sm text-intel-light-gray">Rating</p>
              <p className="font-semibold">⭐ {course.rating}/5.0</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-intel-dark-blue mb-3">Course Progress</h4>
            <div className="mb-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-intel-blue h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-right mt-1">{course.progress}% complete</p>
            </div>
            <p className="text-sm text-gray-600">Keep up the great work! You're making excellent progress.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-intel-dark-blue mb-3">Quick Stats</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Lectures:</span>
                <span className="font-semibold">{courseLectures.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Assignments:</span>
                <span className="font-semibold">{courseAssignments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Students Enrolled:</span>
                <span className="font-semibold">{course.enrolled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Materials Available:</span>
                <span className="font-semibold">{courseMaterials.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-intel-dark-blue mb-3">Recent Activity</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">New lecture available: Feature Detection and Matching</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Assignment 1 submitted successfully</p>
                <p className="text-xs text-gray-500">5 days ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">New announcement from Dr. Smith</p>
                <p className="text-xs text-gray-500">1 week ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render course materials
  const renderCourseMaterials = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-intel-dark-blue">Course Materials</h3>
          <button className="bg-intel-blue hover:bg-intel-dark-blue text-white px-4 py-2 rounded transition duration-200">
            📁 Upload Material
          </button>
        </div>
        
        <div className="grid gap-4">
          {courseMaterials.map(material => (
            <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-intel-light-blue rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-intel-dark-blue">
                      {material.type}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-intel-dark-blue">{material.title}</h4>
                    <p className="text-sm text-gray-600">
                      Size: {material.size} | Uploaded: {material.uploadDate} | Downloads: {material.downloadCount}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-intel-blue hover:text-intel-dark-blue transition duration-200">
                    👁️ Preview
                  </button>
                  <button className="text-intel-blue hover:text-intel-dark-blue transition duration-200">
                    📥 Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render course lectures
  const renderCourseLectures = () => {
    if (selectedLecture) {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSelectedLecture(null)}
              className="text-intel-blue hover:text-intel-dark-blue transition duration-200"
            >
              ← Back to Lectures
            </button>
            <h3 className="text-xl font-semibold text-intel-dark-blue">
              {courseLectures.find(l => l.id === selectedLecture)?.title}
            </h3>
          </div>
          
          <div className="bg-black rounded-lg p-8 text-center">
            <div className="text-white text-6xl mb-4">▶️</div>
            <p className="text-white text-lg">Video Player Placeholder</p>
            <p className="text-gray-300 mt-2">
              Duration: {courseLectures.find(l => l.id === selectedLecture)?.duration}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-intel-dark-blue mb-2">Lecture Notes</h4>
                <p className="text-gray-600">
                  This lecture covers the fundamental concepts of feature detection and matching in computer vision. 
                  We'll explore various algorithms including SIFT, SURF, and ORB descriptors.
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-intel-dark-blue mb-2">Timestamps</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <span>Introduction to Feature Detection</span>
                    <span className="text-intel-blue">00:00</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <span>SIFT Algorithm Overview</span>
                    <span className="text-intel-blue">05:20</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <span>Practical Implementation</span>
                    <span className="text-intel-blue">15:45</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <span>Q&A Session</span>
                    <span className="text-intel-blue">35:10</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-intel-dark-blue mb-2">Resources</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-intel-blue">
                    📄 Lecture Slides
                  </button>
                  <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-intel-blue">
                    💻 Code Examples
                  </button>
                  <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-intel-blue">
                    📚 Additional Readings
                  </button>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-intel-dark-blue mb-2">Playback Speed</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-2 text-sm border border-gray-300 rounded hover:bg-gray-50">0.75x</button>
                  <button className="p-2 text-sm border border-gray-300 rounded hover:bg-gray-50 bg-intel-light-blue">1.0x</button>
                  <button className="p-2 text-sm border border-gray-300 rounded hover:bg-gray-50">1.25x</button>
                  <button className="p-2 text-sm border border-gray-300 rounded hover:bg-gray-50">1.5x</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-intel-dark-blue">Recorded Lectures</h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Filter by Status
            </button>
            <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Sort by Date
            </button>
          </div>
        </div>
        
        <div className="grid gap-4">
          {courseLectures.map(lecture => (
            <div key={lecture.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-intel-dark-blue rounded-lg flex items-center justify-center text-white text-xl">
                    ▶️
                  </div>
                  <div>
                    <h4 className="font-semibold text-intel-dark-blue flex items-center space-x-2">
                      <span>{lecture.title}</span>
                      <span className="text-lg">{getLectureStatusIcon(lecture.status)}</span>
                    </h4>
                    <p className="text-sm text-gray-600">
                      Duration: {lecture.duration} | Date: {lecture.date} | Views: {lecture.views}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setSelectedLecture(lecture.id)}
                    className="bg-intel-blue hover:bg-intel-dark-blue text-white px-4 py-2 rounded transition duration-200"
                  >
                    Watch Now
                  </button>
                  <button className="text-intel-blue hover:text-intel-dark-blue transition duration-200">
                    📥 Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render assignments
  const renderAssignments = () => {
    if (showAssignmentDetails) {
      const assignment = courseAssignments.find(a => a.id === showAssignmentDetails);
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowAssignmentDetails(null)}
              className="text-intel-blue hover:text-intel-dark-blue transition duration-200"
            >
              ← Back to Assignments
            </button>
            <h3 className="text-xl font-semibold text-intel-dark-blue">{assignment.title}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-intel-dark-blue mb-3">Assignment Description</h4>
                <p className="text-gray-700 mb-4">{assignment.description}</p>
                
                <div className="space-y-3">
                  <h5 className="font-medium text-intel-dark-blue">Requirements:</h5>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Implement at least 3 different filtering techniques</li>
                    <li>Include proper error handling and validation</li>
                    <li>Provide documentation and comments</li>
                    <li>Submit both source code and results</li>
                  </ul>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <h5 className="font-medium text-yellow-800">Submission Guidelines:</h5>
                  <p className="text-yellow-700 text-sm mt-1">
                    Submit your work as a ZIP file containing all code files, results, and a README.md file.
                    Make sure to test your code thoroughly before submission.
                  </p>
                </div>
              </div>
              
              {assignment.status === 'Submitted' && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-intel-dark-blue mb-3">Submission Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted on:</span>
                      <span className="font-medium">September 14, 2023</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">File size:</span>
                      <span className="font-medium">2.3 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium">✅ Graded</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grade:</span>
                      <span className="text-green-600 font-bold text-lg">{assignment.grade}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <h5 className="font-medium text-green-800">Instructor Feedback:</h5>
                    <p className="text-green-700 text-sm mt-1">
                      Excellent work! Your implementation of the Gaussian and median filters was particularly impressive. 
                      The documentation was clear and comprehensive. Minor suggestion: consider optimizing the edge cases handling.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-intel-dark-blue mb-3">Assignment Info</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">{assignment.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium">{assignment.weight}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-intel-dark-blue mb-3">Resources</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-intel-blue">
                    📄 Assignment Template
                  </button>
                  <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-intel-blue">
                    💻 Starter Code
                  </button>
                  <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-intel-blue">
                    📊 Sample Data
                  </button>
                  <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-intel-blue">
                    📚 Reference Materials
                  </button>
                </div>
              </div>
              
              {assignment.status !== 'Submitted' && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-intel-dark-blue mb-3">Submit Assignment</h4>
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="text-gray-400 text-4xl mb-2">📁</div>
                      <p className="text-gray-600">Drag and drop your files here</p>
                      <p className="text-sm text-gray-500">or click to browse</p>
                    </div>
                    <button className="w-full bg-intel-blue hover:bg-intel-dark-blue text-white py-2 rounded transition duration-200">
                      Submit Assignment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-intel-dark-blue">Assignments</h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Filter by Status
            </button>
            <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Sort by Due Date
            </button>
          </div>
        </div>
        
        <div className="grid gap-4">
          {courseAssignments.map(assignment => (
            <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-intel-light-blue rounded-lg flex items-center justify-center">
                    <span className="text-intel-dark-blue font-bold text-lg">📝</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-intel-dark-blue">{assignment.title}</h4>
                    <p className="text-sm text-gray-600">
                      Due: {assignment.dueDate} | Weight: {assignment.weight}% | 
                      Status: <span className={getStatusColor(assignment.status)}>{assignment.status}</span>
                      {assignment.grade && <span className="ml-2 font-medium">Grade: {assignment.grade}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowAssignmentDetails(assignment.id)}
                    className="bg-intel-blue hover:bg-intel-dark-blue text-white px-4 py-2 rounded transition duration-200"
                  >
                    View Details
                  </button>
                  {assignment.status !== 'Submitted' && (
                    <button className="border border-intel-blue text-intel-blue hover:bg-intel-blue hover:text-white px-4 py-2 rounded transition duration-200">
                      Submit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render announcements
  const renderAnnouncements = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-intel-dark-blue">Course Announcements</h3>
          <button className="bg-intel-blue hover:bg-intel-dark-blue text-white px-4 py-2 rounded transition duration-200">
            📢 New Announcement
          </button>
        </div>
        
        <div className="space-y-4">
          {courseAnnouncements.map(announcement => (
            <div key={announcement.id} className={`border-l-4 p-4 rounded-lg shadow-sm ${getPriorityColor(announcement.priority)}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-intel-dark-blue">{announcement.title}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    announcement.priority === 'high' ? 'bg-red-100 text-red-700' :
                    announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {announcement.priority.toUpperCase()}
                  </span>
                  <span>{announcement.date}</span>
                </div>
              </div>
              <p className="text-gray-700 mb-2">{announcement.content}</p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">By: {announcement.author}</p>
                <div className="flex space-x-2">
                  <button className="text-intel-blue hover:text-intel-dark-blue text-sm transition duration-200">
                    👍 Like
                  </button>
                  <button className="text-intel-blue hover:text-intel-dark-blue text-sm transition duration-200">
                    💬 Comment
                  </button>
                  <button className="text-intel-blue hover:text-intel-dark-blue text-sm transition duration-200">
                    📌 Pin
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render forum
  const renderForum = () => {
    if (selectedForumTopic) {
      const topic = courseForumTopics.find(t => t.id === selectedForumTopic);
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSelectedForumTopic(null)}
              className="text-intel-blue hover:text-intel-dark-blue transition duration-200"
            >
              ← Back to Forum
            </button>
            <h3 className="text-xl font-semibold text-intel-dark-blue">{topic.title}</h3>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-intel-blue rounded-full flex items-center justify-center text-white font-semibold">
                  {topic.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-intel-dark-blue">{topic.author}</p>
                  <p className="text-sm text-gray-500">{topic.date}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getForumStatusColor(topic.status)}`}>
                {topic.status}
              </span>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700">
                I'm having trouble understanding how Gaussian filters work in practice. 
                Could someone explain the relationship between sigma values and the filter kernel size? 
                I've read the documentation but I'm still confused about how to choose the right parameters.
              </p>
            </div>
            
            <div className="flex space-x-4 text-sm text-gray-500">
              <span>👍 5 likes</span>
              <span>💬 {topic.replies} replies</span>
              <span>📁 {topic.category}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-intel-dark-blue">Replies ({topic.replies})</h4>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  DS
                </div>
                <div>
                  <p className="font-semibold text-intel-dark-blue">Dr. Smith</p>
                  <p className="text-sm text-gray-500">2 days ago</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                Great question! The sigma value controls the standard deviation of the Gaussian distribution. 
                A larger sigma creates a wider, more blurred effect. Generally, the kernel size should be about 6*sigma + 1 
                to capture most of the Gaussian curve.
              </p>
              <div className="flex space-x-4 text-sm text-gray-500">
                <button className="text-intel-blue hover:text-intel-dark-blue">👍 3</button>
                <button className="text-intel-blue hover:text-intel-dark-blue">💬 Reply</button>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  JW
                </div>
                <div>
                  <p className="font-semibold text-intel-dark-blue">Jessica Wilson (TA)</p>
                  <p className="text-sm text-gray-500">1 day ago</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                To add to Dr. Smith's explanation, here's a practical tip: start with sigma=1 for light smoothing, 
                sigma=2-3 for moderate smoothing, and sigma=5+ for heavy smoothing. 
                Always visualize your results to see the effect!
              </p>
              <div className="flex space-x-4 text-sm text-gray-500">
                <button className="text-intel-blue hover:text-intel-dark-blue">👍 2</button>
                <button className="text-intel-blue hover:text-intel-dark-blue">💬 Reply</button>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-intel-dark-blue mb-3">Add Reply</h4>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows="4"
              placeholder="Type your reply here..."
            ></textarea>
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-2">
                <button className="text-gray-500 hover:text-gray-700">📎 Attach</button>
                <button className="text-gray-500 hover:text-gray-700">💻 Code</button>
                <button className="text-gray-500 hover:text-gray-700">🖼️ Image</button>
              </div>
              <button className="bg-intel-blue hover:bg-intel-dark-blue text-white px-4 py-2 rounded transition duration-200">
                Post Reply
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-intel-dark-blue">Q&A Forum</h3>
          <button className="bg-intel-blue hover:bg-intel-dark-blue text-white px-4 py-2 rounded transition duration-200">
            ❓ Ask Question
          </button>
        </div>
        
        <div className="flex space-x-4 mb-4">
          <select className="px-3 py-2 border border-gray-300 rounded">
            <option>All Categories</option>
            <option>Technical</option>
            <option>Assignment Help</option>
            <option>General</option>
            <option>Study Group</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded">
            <option>All Status</option>
            <option>Open</option>
            <option>Resolved</option>
            <option>Active</option>
          </select>
          <input 
            type="text" 
            placeholder="Search discussions..." 
            className="flex-1 px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        
        <div className="grid gap-4">
          {courseForumTopics.map(topic => (
            <div key={topic.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-intel-blue rounded-full flex items-center justify-center text-white font-semibold">
                    {topic.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-intel-dark-blue hover:text-intel-blue cursor-pointer"
                        onClick={() => setSelectedForumTopic(topic.id)}>
                      {topic.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      by {topic.author} on {topic.date}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>💬 {topic.replies} replies</span>
                      <span>🕐 Last activity: {topic.lastActivity}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getForumStatusColor(topic.status)}`}>
                        {topic.status}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {topic.category}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedForumTopic(topic.id)}
                  className="text-intel-blue hover:text-intel-dark-blue transition duration-200"
                >
                  View →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render course content based on active view
  const renderCourseContent = () => {
    switch(activeView) {
      case 'overview':
        return renderCourseOverview();
      case 'materials':
        return renderCourseMaterials();
      case 'lectures':
        return renderCourseLectures();
      case 'assignments':
        return renderAssignments();
      case 'announcements':
        return renderAnnouncements();
      case 'forum':
        return renderForum();
      default:
        return renderCourseOverview();
    }
  };

  // Render course list view
  const renderCourseList = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-intel-dark-blue">My Courses</h2>
            <p className="text-intel-dark-gray">
              Access your course materials, recorded lectures, and assignments.
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              🔍 Search Courses
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
              📊 View Progress
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div 
                className={`h-32 ${course.color} flex items-center justify-center cursor-pointer relative`}
                onClick={() => handleCourseAction(course.id, 'overview')}
              >
                <h3 className="text-xl font-bold text-white text-center px-4">{course.name}</h3>
                <div className="absolute top-2 right-2 bg-white bg-opacity-20 px-2 py-1 rounded text-white text-xs">
                  ⭐ {course.rating}
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <p className="text-intel-gray text-sm">👨‍🏫 {course.instructor}</p>
                  <p className="text-intel-gray text-sm">⏱️ {course.duration} • 📚 {course.credits} Credits</p>
                  <p className="text-intel-gray text-sm">👥 {course.enrolled} students enrolled</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-semibold">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-intel-blue h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button 
                    className="bg-intel-light-gray hover:bg-gray-300 text-intel-dark-blue py-2 px-3 rounded text-sm transition duration-200 flex items-center justify-center space-x-1"
                    onClick={() => handleCourseAction(course.id, 'materials')}
                  >
                    <span>📚</span><span>Materials</span>
                  </button>
                  <button 
                    className="bg-intel-light-gray hover:bg-gray-300 text-intel-dark-blue py-2 px-3 rounded text-sm transition duration-200 flex items-center justify-center space-x-1"
                    onClick={() => handleCourseAction(course.id, 'lectures')}
                  >
                    <span>🎥</span><span>Lectures</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button 
                    className="bg-intel-light-gray hover:bg-gray-300 text-intel-dark-blue py-2 px-3 rounded text-sm transition duration-200 flex items-center justify-center space-x-1"
                    onClick={() => handleCourseAction(course.id, 'announcements')}
                  >
                    <span>📢</span><span>News</span>
                  </button>
                  <button 
                    className="bg-intel-light-gray hover:bg-gray-300 text-intel-dark-blue py-2 px-3 rounded text-sm transition duration-200 flex items-center justify-center space-x-1"
                    onClick={() => handleCourseAction(course.id, 'assignments')}
                  >
                    <span>📝</span><span>Tasks</span>
                  </button>
                </div>
                
                <button 
                  className="w-full bg-intel-blue hover:bg-intel-dark-blue text-white py-2 rounded transition duration-200 flex items-center justify-center space-x-2"
                  onClick={() => handleCourseAction(course.id, 'forum')}
                >
                  <span>💬</span><span>Q&A Forum</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {selectedCourse === null ? (
        // Show course list when no course is selected
        renderCourseList()
      ) : (
        // Show course detail view when a course is selected
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={backToCourseList}
              className="mr-4 bg-intel-light-gray hover:bg-gray-300 text-intel-dark-blue p-2 rounded-full transition duration-200 flex items-center justify-center w-10 h-10"
            >
              ←
            </button>
            <div>
              <h2 className="text-2xl font-bold text-intel-dark-blue">
                {courses.find(c => c.id === selectedCourse)?.name}
              </h2>
              <p className="text-gray-600">
                {courses.find(c => c.id === selectedCourse)?.instructor}
              </p>
            </div>
          </div>
          
          {renderNavigationTabs()}
          {renderCourseContent()}
        </div>
      )}
    </div>
  );
};

export default CoursesContent;