import React, { useState } from 'react';

const PerformanceContent = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Sample courses
  const courses = [
    { id: 1, title: 'Introduction to Artificial Intelligence' },
    { id: 2, title: 'Advanced Machine Learning' },
    { id: 3, title: 'Neural Networks and Deep Learning' }
  ];

  // Sample students data
  const students = [
    {
      id: 1,
      name: 'Alex Johnson',
      email: 'alex.j@corementis.edu',
      avatar: '👨‍🎓',
      courses: [1, 2],
      progress: {
        1: { completed: 85, score: 92, lastActive: '2025-06-30' },
        2: { completed: 65, score: 78, lastActive: '2025-07-01' }
      }
    },
    {
      id: 2,
      name: 'Samantha Lee',
      email: 'samantha.l@corementis.edu',
      avatar: '👩‍🎓',
      courses: [1, 3],
      progress: {
        1: { completed: 92, score: 95, lastActive: '2025-07-01' },
        3: { completed: 78, score: 88, lastActive: '2025-06-29' }
      }
    },
    {
      id: 3,
      name: 'Michael Chen',
      email: 'michael.c@corementis.edu',
      avatar: '👨‍🎓',
      courses: [2, 3],
      progress: {
        2: { completed: 45, score: 72, lastActive: '2025-06-28' },
        3: { completed: 60, score: 75, lastActive: '2025-06-30' }
      }
    },
    {
      id: 4,
      name: 'Jessica Taylor',
      email: 'jessica.t@corementis.edu',
      avatar: '👩‍🎓',
      courses: [1, 2, 3],
      progress: {
        1: { completed: 75, score: 85, lastActive: '2025-06-29' },
        2: { completed: 50, score: 68, lastActive: '2025-06-25' },
        3: { completed: 30, score: 65, lastActive: '2025-07-01' }
      }
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david.w@corementis.edu',
      avatar: '👨‍🎓',
      courses: [1, 3],
      progress: {
        1: { completed: 100, score: 98, lastActive: '2025-06-27' },
        3: { completed: 85, score: 90, lastActive: '2025-06-30' }
      }
    }
  ];

  // Sample assignments data
  const assignments = [
    {
      id: 1,
      title: 'AI Fundamentals Quiz',
      courseId: 1,
      dueDate: '2025-06-25',
      maxScore: 100,
      averageScore: 88,
      completionRate: 95
    },
    {
      id: 2,
      title: 'Neural Network Implementation',
      courseId: 3,
      dueDate: '2025-06-28',
      maxScore: 100,
      averageScore: 82,
      completionRate: 85
    },
    {
      id: 3,
      title: 'Machine Learning Models Comparison',
      courseId: 2,
      dueDate: '2025-06-30',
      maxScore: 100,
      averageScore: 75,
      completionRate: 70
    },
    {
      id: 4,
      title: 'AI Ethics Case Study',
      courseId: 1,
      dueDate: '2025-07-05',
      maxScore: 100,
      averageScore: 0, // Not yet graded
      completionRate: 40
    },
    {
      id: 5,
      title: 'Deep Learning Project',
      courseId: 3,
      dueDate: '2025-07-10',
      maxScore: 100,
      averageScore: 0, // Not yet graded
      completionRate: 25
    }
  ];

  // Filter students based on selected course
  const filteredStudents = students.filter(student => {
    if (selectedCourse === 'all') return true;
    return student.courses.includes(parseInt(selectedCourse));
  });

  // Filter assignments based on selected course
  const filteredAssignments = assignments.filter(assignment => {
    if (selectedCourse === 'all') return true;
    return assignment.courseId === parseInt(selectedCourse);
  });

  // Calculate course statistics
  const getCourseStats = (courseId) => {
    const courseStudents = students.filter(student => student.courses.includes(courseId));
    
    if (courseStudents.length === 0) return { avgProgress: 0, avgScore: 0, activeStudents: 0 };
    
    const totalProgress = courseStudents.reduce((sum, student) => sum + (student.progress[courseId]?.completed || 0), 0);
    const totalScore = courseStudents.reduce((sum, student) => sum + (student.progress[courseId]?.score || 0), 0);
    
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const activeStudents = courseStudents.filter(student => {
      const lastActive = student.progress[courseId]?.lastActive;
      if (!lastActive) return false;
      return new Date(lastActive) >= sevenDaysAgo;
    }).length;
    
    return {
      avgProgress: Math.round(totalProgress / courseStudents.length),
      avgScore: Math.round(totalScore / courseStudents.length),
      activeStudents
    };
  };

  // Helper functions
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Unknown Course';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get progress bar color based on value
  const getProgressColor = (value) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 80) return 'bg-blue-500';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Helper function to determine assignment status
  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (assignment.completionRate === 100 && assignment.averageScore > 0) {
      return 'Graded';
    } else if (assignment.completionRate === 100) {
      return 'Submitted';
    } else if (dueDate < now) {
      return 'Past Due';
    } else if (dueDate - now < 1000 * 60 * 60 * 24 * 3) { // 3 days
      return 'Due Soon';
    } else {
      return 'Active';
    }
  };

  // Helper function to determine assignment status class for styling
  const getAssignmentStatusClass = (assignment) => {
    const status = getAssignmentStatus(assignment);
    
    switch (status) {
      case 'Graded':
        return 'bg-green-100 text-green-800';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'Past Due':
        return 'bg-red-100 text-red-800';
      case 'Due Soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'Active':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-intel-dark-blue">Student Performance</h1>
        <p className="text-intel-gray mt-1">Track and analyze student progress across your courses</p>
      </div>

      {/* Navigation tabs and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'overview' ? 'bg-white shadow-sm text-intel-blue' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'students' ? 'bg-white shadow-sm text-intel-blue' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'assignments' ? 'bg-white shadow-sm text-intel-blue' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            Assignments
          </button>
        </div>
        
        <div className="flex items-center">
          <label htmlFor="courseFilter" className="mr-2 text-intel-gray">Filter by course:</label>
          <select
            id="courseFilter"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-intel-blue focus:border-transparent"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Conditional rendering based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Students Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-intel-gray text-sm font-medium">Total Students</p>
                  <h3 className="text-3xl font-bold mt-1">{filteredStudents.length}</h3>
                </div>
                <span className="text-3xl">👨‍🎓</span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-intel-gray">
                  <span className="font-medium">{students.filter(student => {
                    if (selectedCourse === 'all') {
                      return Object.values(student.progress).some(p => {
                        return new Date(p.lastActive) >= new Date(new Date().setDate(new Date().getDate() - 7));
                      });
                    } else {
                      const progress = student.progress[selectedCourse];
                      return progress && new Date(progress.lastActive) >= new Date(new Date().setDate(new Date().getDate() - 7));
                    }
                  }).length}</span> active this week
                </p>
              </div>
            </div>
            
            {/* Average Score Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-intel-gray text-sm font-medium">Average Score</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {selectedCourse === 'all' ? 
                      Math.round(students.flatMap(s => Object.entries(s.progress).map(([_, p]) => p.score)).reduce((sum, score) => sum + score, 0) / 
                      students.flatMap(s => Object.entries(s.progress)).length) : 
                      getCourseStats(parseInt(selectedCourse)).avgScore
                    }%
                  </h3>
                </div>
                <span className="text-3xl">📊</span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`${getProgressColor(selectedCourse === 'all' ? 
                      Math.round(students.flatMap(s => Object.entries(s.progress).map(([_, p]) => p.score)).reduce((sum, score) => sum + score, 0) / 
                      students.flatMap(s => Object.entries(s.progress)).length) : 
                      getCourseStats(parseInt(selectedCourse)).avgScore)} h-2.5 rounded-full`}
                    style={{ width: `${selectedCourse === 'all' ? 
                      Math.round(students.flatMap(s => Object.entries(s.progress).map(([_, p]) => p.score)).reduce((sum, score) => sum + score, 0) / 
                      students.flatMap(s => Object.entries(s.progress)).length) : 
                      getCourseStats(parseInt(selectedCourse)).avgScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Course Completion Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-intel-gray text-sm font-medium">Course Completion</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {selectedCourse === 'all' ? 
                      Math.round(students.flatMap(s => Object.entries(s.progress).map(([_, p]) => p.completed)).reduce((sum, completed) => sum + completed, 0) / 
                      students.flatMap(s => Object.entries(s.progress)).length) : 
                      getCourseStats(parseInt(selectedCourse)).avgProgress
                    }%
                  </h3>
                </div>
                <span className="text-3xl">🎯</span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`${getProgressColor(selectedCourse === 'all' ? 
                      Math.round(students.flatMap(s => Object.entries(s.progress).map(([_, p]) => p.completed)).reduce((sum, completed) => sum + completed, 0) / 
                      students.flatMap(s => Object.entries(s.progress)).length) : 
                      getCourseStats(parseInt(selectedCourse)).avgProgress)} h-2.5 rounded-full`}
                    style={{ width: `${selectedCourse === 'all' ? 
                      Math.round(students.flatMap(s => Object.entries(s.progress).map(([_, p]) => p.completed)).reduce((sum, completed) => sum + completed, 0) / 
                      students.flatMap(s => Object.entries(s.progress)).length) : 
                      getCourseStats(parseInt(selectedCourse)).avgProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Course Performance Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-intel-dark-blue">Course Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Students</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map(course => {
                    const stats = getCourseStats(course.id);
                    return (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {students.filter(s => s.courses.includes(course.id)).length}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${getScoreColor(stats.avgScore)}`}>
                            {stats.avgScore}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                            <div 
                              className={`${getProgressColor(stats.avgProgress)} h-2 rounded-full`}
                              style={{ width: `${stats.avgProgress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{stats.avgProgress}% completed</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {stats.activeStudents} of {students.filter(s => s.courses.includes(course.id)).length}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-intel-dark-blue">Students</h3>
            <p className="text-sm text-intel-gray mt-1">
              {selectedCourse === 'all' ? 'All students across all courses' : `Students enrolled in ${getCourseName(parseInt(selectedCourse))}`}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Courses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map(student => {
                  // Calculate average score and progress across all courses
                  const studentCourses = student.courses;
                  const relevantCourses = selectedCourse === 'all' ? studentCourses : studentCourses.filter(c => c === parseInt(selectedCourse));
                  
                  const totalScore = relevantCourses.reduce((sum, courseId) => sum + (student.progress[courseId]?.score || 0), 0);
                  const totalProgress = relevantCourses.reduce((sum, courseId) => sum + (student.progress[courseId]?.completed || 0), 0);
                  
                  const avgScore = Math.round(totalScore / relevantCourses.length);
                  const avgProgress = Math.round(totalProgress / relevantCourses.length);
                  
                  // Find most recent activity date
                  const lastActiveDates = relevantCourses
                    .map(courseId => student.progress[courseId]?.lastActive)
                    .filter(Boolean)
                    .map(date => new Date(date));
                  
                  const mostRecentDate = lastActiveDates.length > 0 
                    ? new Date(Math.max(...lastActiveDates.map(date => date.getTime())))
                    : null;
                    
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-intel-blue/10 flex items-center justify-center">
                            <span className="text-lg">{student.avatar}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-xs text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {studentCourses.map(courseId => (
                            <span 
                              key={courseId} 
                              className={`inline-block px-2 py-1 rounded-full text-xs mr-1 mb-1 ${selectedCourse === courseId.toString() ? 'bg-intel-blue text-white' : 'bg-gray-100'}`}
                            >
                              {getCourseName(courseId).split(' ').slice(0, 2).join(' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getScoreColor(avgScore)}`}>
                          {avgScore}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                          <div 
                            className={`${getProgressColor(avgProgress)} h-2 rounded-full`}
                            style={{ width: `${avgProgress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{avgProgress}% completed</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {mostRecentDate ? formatDate(mostRecentDate) : 'Never'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => {
                            setSelectedStudent(student);
                            setActiveTab('student-detail');
                          }}
                          className="text-intel-blue hover:text-intel-dark-blue"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-intel-dark-blue">Assignments</h3>
            <p className="text-sm text-intel-gray mt-1">
              {selectedCourse === 'all' ? 'All assignments across all courses' : `Assignments for ${getCourseName(parseInt(selectedCourse))}`}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map(assignment => {
                  const isPastDue = new Date(assignment.dueDate) < new Date();
                  const isGraded = assignment.averageScore > 0;
                  
                  return (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{getCourseName(assignment.courseId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(assignment.dueDate)}</div>
                        <div className="text-xs text-gray-400">
                          {isPastDue ? 'Past due' : `Due in ${Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                          <div 
                            className={`${getProgressColor(assignment.completionRate)} h-2 rounded-full`}
                            style={{ width: `${assignment.completionRate}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{assignment.completionRate}% submitted</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isGraded ? (
                          <div className={`text-sm font-medium ${getScoreColor(assignment.averageScore)}`}>
                            {assignment.averageScore}%
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">Not graded</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getAssignmentStatusClass(assignment)}`}>
                          {getAssignmentStatus(assignment)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'student-detail' && selectedStudent && (
        <div className="space-y-6">
          {/* Student Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-intel-blue/10 flex items-center justify-center">
                  <span className="text-3xl">{selectedStudent.avatar}</span>
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h2>
                  <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('students')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to Students
              </button>
            </div>
          </div>
          
          {/* Student Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Enrolled Courses */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900">Enrolled Courses</h3>
              <p className="text-3xl font-bold mt-2">{selectedStudent.courses.length}</p>
              <div className="mt-4 space-y-2">
                {selectedStudent.courses.map(courseId => (
                  <div key={courseId} className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{getCourseName(courseId)}</span>
                    <span className={`text-sm font-medium ${getScoreColor(selectedStudent.progress[courseId]?.score || 0)}`}>
                      {selectedStudent.progress[courseId]?.score || 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Average Score */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900">Average Score</h3>
              <p className="text-3xl font-bold mt-2">
                {Math.round(
                  Object.values(selectedStudent.progress).reduce((sum, p) => sum + p.score, 0) / 
                  Object.values(selectedStudent.progress).length
                )}%
              </p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`${getProgressColor(
                    Math.round(
                      Object.values(selectedStudent.progress).reduce((sum, p) => sum + p.score, 0) / 
                      Object.values(selectedStudent.progress).length
                    )
                  )} h-2.5 rounded-full`}
                  style={{ width: `${Math.round(
                    Object.values(selectedStudent.progress).reduce((sum, p) => sum + p.score, 0) / 
                    Object.values(selectedStudent.progress).length
                  )}%` }}
                ></div>
              </div>
            </div>
            
            {/* Course Completion */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900">Course Completion</h3>
              <p className="text-3xl font-bold mt-2">
                {Math.round(
                  Object.values(selectedStudent.progress).reduce((sum, p) => sum + p.completed, 0) / 
                  Object.values(selectedStudent.progress).length
                )}%
              </p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`${getProgressColor(
                    Math.round(
                      Object.values(selectedStudent.progress).reduce((sum, p) => sum + p.completed, 0) / 
                      Object.values(selectedStudent.progress).length
                    )
                  )} h-2.5 rounded-full`}
                  style={{ width: `${Math.round(
                    Object.values(selectedStudent.progress).reduce((sum, p) => sum + p.completed, 0) / 
                    Object.values(selectedStudent.progress).length
                  )}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Student Assignments */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-intel-dark-blue">Assignments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments
                    .filter(a => selectedStudent.courses.includes(a.courseId))
                    .map(assignment => {
                      const studentSubmission = {
                        submitted: Math.random() > 0.3,
                        score: Math.floor(Math.random() * 41) + 60,
                        submittedDate: new Date(new Date(assignment.dueDate).getTime() - Math.random() * 1000 * 60 * 60 * 24 * 5)
                      };
                      
                      const isPastDue = new Date(assignment.dueDate) < new Date();
                      
                      return (
                        <tr key={assignment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{getCourseName(assignment.courseId)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(assignment.dueDate)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              studentSubmission.submitted 
                                ? 'bg-green-100 text-green-800' 
                                : isPastDue 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {studentSubmission.submitted 
                                ? 'Submitted' 
                                : isPastDue 
                                  ? 'Missing' 
                                  : 'Pending'}
                            </span>
                            {studentSubmission.submitted && (
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(studentSubmission.submittedDate)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {studentSubmission.submitted ? (
                              <div className={`text-sm font-medium ${getScoreColor(studentSubmission.score)}`}>
                                {studentSubmission.score}%
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">-</div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceContent;
