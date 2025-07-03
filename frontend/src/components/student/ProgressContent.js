import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Award, BookOpen, Clock, Target, AlertCircle, CheckCircle, BarChart3, Users, Star, Download } from 'lucide-react';

const ProgressContent = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('semester');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Enhanced course data with more detailed information
  const courses = [
    { 
      id: 1, 
      name: 'Computer Vision', 
      code: 'CS 4670',
      instructor: 'Dr. Sarah Chen',
      grade: 'A', 
      attendance: 95, 
      engagement: 88, 
      assignments: { completed: 8, total: 10 },
      quizzes: { completed: 5, total: 6, averageScore: 89 },
      projects: { completed: 2, total: 3, averageScore: 92 },
      upcomingDeadlines: [
        { type: 'Assignment', name: 'Object Detection Project', due: '2025-07-10', priority: 'high' },
        { type: 'Quiz', name: 'Neural Networks Quiz', due: '2025-07-08', priority: 'medium' }
      ],
      recentGrades: [95, 88, 92, 87, 90],
      studyTime: 45, // hours this month
      credits: 3,
      progress: 75,
      strengths: ['Image Processing', 'Feature Detection'],
      improvements: ['Deep Learning Models']
    },
    { 
      id: 2, 
      name: 'Machine Learning', 
      code: 'CS 4780',
      instructor: 'Prof. Michael Zhang',
      grade: 'A-', 
      attendance: 90, 
      engagement: 85, 
      assignments: { completed: 7, total: 8 },
      quizzes: { completed: 4, total: 5, averageScore: 85 },
      projects: { completed: 1, total: 2, averageScore: 88 },
      upcomingDeadlines: [
        { type: 'Project', name: 'Regression Analysis', due: '2025-07-15', priority: 'high' }
      ],
      recentGrades: [88, 85, 90, 82, 87],
      studyTime: 38,
      credits: 4,
      progress: 68,
      strengths: ['Supervised Learning', 'Data Preprocessing'],
      improvements: ['Unsupervised Learning', 'Model Optimization']
    },
    { 
      id: 3, 
      name: 'Deep Learning', 
      code: 'CS 5787',
      instructor: 'Dr. Lisa Park',
      grade: 'B+', 
      attendance: 85, 
      engagement: 78, 
      assignments: { completed: 5, total: 7 },
      quizzes: { completed: 3, total: 4, averageScore: 78 },
      projects: { completed: 1, total: 2, averageScore: 82 },
      upcomingDeadlines: [
        { type: 'Assignment', name: 'CNN Implementation', due: '2025-07-12', priority: 'high' },
        { type: 'Assignment', name: 'RNN Analysis', due: '2025-07-20', priority: 'medium' }
      ],
      recentGrades: [82, 75, 88, 79, 84],
      studyTime: 52,
      credits: 3,
      progress: 58,
      strengths: ['Neural Network Architecture'],
      improvements: ['Optimization Techniques', 'Advanced Models']
    },
    { 
      id: 4, 
      name: 'Data Visualization', 
      code: 'INFO 3300',
      instructor: 'Prof. Amanda Rodriguez',
      grade: 'A', 
      attendance: 92, 
      engagement: 90, 
      assignments: { completed: 6, total: 6 },
      quizzes: { completed: 4, total: 4, averageScore: 94 },
      projects: { completed: 2, total: 2, averageScore: 96 },
      upcomingDeadlines: [],
      recentGrades: [96, 94, 98, 92, 95],
      studyTime: 28,
      credits: 3,
      progress: 95,
      strengths: ['D3.js', 'Interactive Design', 'Statistical Graphics'],
      improvements: []
    },
  ];

  // Calculate enhanced overall stats
  const overallStats = {
    averageGrade: 'A-',
    gpa: 3.7,
    totalCredits: courses.reduce((sum, course) => sum + course.credits, 0),
    averageAttendance: courses.reduce((sum, course) => sum + course.attendance, 0) / courses.length,
    averageEngagement: courses.reduce((sum, course) => sum + course.engagement, 0) / courses.length,
    assignmentsCompleted: courses.reduce((sum, course) => sum + course.assignments.completed, 0),
    totalAssignments: courses.reduce((sum, course) => sum + course.assignments.total, 0),
    totalStudyTime: courses.reduce((sum, course) => sum + course.studyTime, 0),
    upcomingDeadlines: courses.reduce((sum, course) => sum + course.upcomingDeadlines.length, 0),
    overallProgress: courses.reduce((sum, course) => sum + course.progress, 0) / courses.length
  };

  // Learning analytics data
  const learningAnalytics = {
    peakStudyHours: [14, 15, 16, 19, 20], // 2-4 PM and 7-8 PM
    weakSubjects: courses.filter(course => course.grade.includes('B') || course.grade.includes('C')),
    strongSubjects: courses.filter(course => course.grade.includes('A')),
    studyStreakDays: 12,
    averageSessionLength: 2.5 // hours
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">Academic Dashboard</h1>
              <p className="text-gray-600">Powered by Intel OpenVINO & CoreMentis Analytics</p>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <select 
                value={selectedTimeRange} 
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="semester">This Semester</option>
                <option value="year">This Year</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Current GPA</p>
                <p className="text-3xl font-bold text-blue-900">{overallStats.gpa}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-green-600 mt-2">↑ 0.2 from last semester</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Attendance</p>
                <p className="text-3xl font-bold text-blue-900">{overallStats.averageAttendance.toFixed(1)}%</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-green-600 mt-2">Excellent attendance</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Study Time</p>
                <p className="text-3xl font-bold text-blue-900">{overallStats.totalStudyTime}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 mt-2">This month</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Assignments</p>
                <p className="text-3xl font-bold text-blue-900">
                  {overallStats.assignmentsCompleted}/{overallStats.totalAssignments}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-blue-600 mt-2">{Math.round((overallStats.assignmentsCompleted/overallStats.totalAssignments)*100)}% complete</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Deadlines</p>
                <p className="text-3xl font-bold text-blue-900">{overallStats.upcomingDeadlines}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-orange-600 mt-2">Upcoming this week</p>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Upcoming Deadlines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.flatMap(course => 
              course.upcomingDeadlines.map(deadline => (
                <div key={`${course.id}-${deadline.name}`} className={`p-4 rounded-lg border ${getPriorityColor(deadline.priority)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{deadline.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-white border">
                      {deadline.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{course.name}</p>
                  <p className="text-xs font-medium">Due: {new Date(deadline.due).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-blue-900">Course Progress</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowDetailedView(!showDetailedView)}
                className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                {showDetailedView ? 'Simple View' : 'Detailed View'}
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            {courses.map(course => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.code} • {course.instructor}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${getGradeColor(course.grade)}`}>{course.grade}</span>
                    <p className="text-sm text-gray-600">{course.credits} credits</p>
                  </div>
                </div>
                
                {/* Progress indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Attendance</span>
                      <span>{course.attendance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${course.attendance}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Assignments</span>
                      <span>{course.assignments.completed}/{course.assignments.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(course.assignments.completed / course.assignments.total) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Detailed view */}
                {showDetailedView && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">Performance Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Quiz Average:</span>
                            <span className="font-medium">{course.quizzes.averageScore}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Project Average:</span>
                            <span className="font-medium">{course.projects.averageScore}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Study Time:</span>
                            <span className="font-medium">{course.studyTime}h this month</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Engagement:</span>
                            <span className="font-medium">{course.engagement}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">Strengths & Areas for Improvement</h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-green-700 font-medium mb-1">Strengths:</p>
                            <div className="flex flex-wrap gap-1">
                              {course.strengths.map((strength, index) => (
                                <span key={index} className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                  {strength}
                                </span>
                              ))}
                            </div>
                          </div>
                          {course.improvements.length > 0 && (
                            <div>
                              <p className="text-xs text-orange-700 font-medium mb-1">Focus Areas:</p>
                              <div className="flex flex-wrap gap-1">
                                {course.improvements.map((improvement, index) => (
                                  <span key={index} className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                                    {improvement}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Intel OpenVINO Engagement Analytics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            AI-Powered Engagement Analytics
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
            <p className="text-blue-800 mb-4 font-medium">
              Powered by Intel OpenVINO™ AI models through CoreMentis platform
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-blue-900 mb-1">Attention Level</h3>
                <p className="text-2xl font-bold text-blue-600">85%</p>
                <p className="text-xs text-gray-600">Gaze & facial analysis</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-blue-900 mb-1">Participation</h3>
                <p className="text-2xl font-bold text-blue-600">78%</p>
                <p className="text-xs text-gray-600">Interaction frequency</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-blue-900 mb-1">Emotional State</h3>
                <p className="text-2xl font-bold text-green-600">Positive</p>
                <p className="text-xs text-gray-600">Expression analysis</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-blue-900 mb-1">Focus Score</h3>
                <p className="text-2xl font-bold text-blue-600">82%</p>
                <p className="text-xs text-gray-600">Cognitive load analysis</p>
              </div>
            </div>
          </div>
          
          {/* Learning insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">Study Patterns</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Peak study hours:</span>
                  <span className="font-medium">2-4 PM, 7-8 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Study streak:</span>
                  <span className="font-medium">{learningAnalytics.studyStreakDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. session length:</span>
                  <span className="font-medium">{learningAnalytics.averageSessionLength}h</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">Recommendations</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Schedule Deep Learning study sessions during peak hours (2-4 PM)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Focus on optimization techniques to improve ML performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Maintain current study streak with consistent daily sessions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trends
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Strongest Areas</h3>
              <div className="space-y-2">
                {learningAnalytics.strongSubjects.map(course => (
                  <div key={course.id} className="flex items-center justify-between">
                    <span className="text-sm">{course.name}</span>
                    <span className={`text-sm font-medium ${getGradeColor(course.grade)}`}>
                      {course.grade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">Growth Opportunities</h3>
              <div className="space-y-2">
                {learningAnalytics.weakSubjects.map(course => (
                  <div key={course.id} className="flex items-center justify-between">
                    <span className="text-sm">{course.name}</span>
                    <span className={`text-sm font-medium ${getGradeColor(course.grade)}`}>
                      {course.grade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressContent;