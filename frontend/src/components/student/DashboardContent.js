import React, { useState, useEffect } from 'react';
import { Clock, Calendar, BookOpen, TrendingUp, Bell, Award, ChevronRight, Play, Users, FileText, Star, Target, BookmarkCheck, AlertCircle } from 'lucide-react';

const DashboardContent = () => {
  const navigate = (path, options = {}) => {
    console.log(`Navigating to: ${path}`, options);
    alert(`Navigation to: ${path}`);
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickActions = [
    { icon: BookOpen, label: 'Browse Courses', color: 'bg-blue-500', onClick: () => navigate('/student/courses') },
    { icon: FileText, label: 'Assignments', color: 'bg-green-500', onClick: () => navigate('/student/assignments') },
    { icon: Users, label: 'Study Groups', color: 'bg-purple-500', onClick: () => navigate('/student/groups') },
    { icon: Award, label: 'Achievements', color: 'bg-yellow-500', onClick: () => navigate('/student/achievements') }
  ];

  const todaysClasses = [
    {
      name: 'Computer Vision',
      time: '10:00 AM - 11:30 AM',
      status: 'Live',
      students: 23,
      color: 'bg-blue-500'
    },
    {
      name: 'Machine Learning',
      time: '2:00 PM - 3:30 PM',
      status: 'Upcoming',
      students: 28,
      color: 'bg-indigo-500'
    },
    {
      name: 'Data Structures',
      time: '4:00 PM - 5:30 PM',
      status: 'Upcoming',
      students: 31,
      color: 'bg-purple-500'
    }
  ];

  const upcomingDeadlines = [
    {
      title: 'Computer Vision Project',
      subject: 'CV',
      dueDate: 'Due Tomorrow',
      priority: 'Urgent',
      color: 'bg-red-500'
    },
    {
      title: 'ML Quiz',
      subject: 'ML',
      dueDate: 'Due in 3 days',
      priority: 'Medium',
      color: 'bg-yellow-500'
    },
    {
      title: 'Data Analysis Report',
      subject: 'DS',
      dueDate: 'Due in 5 days',
      priority: 'Low',
      color: 'bg-green-500'
    }
  ];

  const progressStats = [
    { label: 'Attendance', value: '92%', color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Average Grade', value: 'A-', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Assignments', value: '12/15', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { label: 'Course Progress', value: '78%', color: 'text-orange-600', bgColor: 'bg-orange-100' }
  ];

  const recentAnnouncements = [
    {
      title: 'Schedule Change',
      content: 'Machine Learning class moved to 3:00 PM tomorrow',
      time: '2 hours ago',
      type: 'info'
    },
    {
      title: 'New Assignment Posted',
      content: 'Computer Vision Project guidelines are now available',
      time: '1 day ago',
      type: 'assignment'
    },
    {
      title: 'Exam Reminder',
      content: 'Mid-term exams start next week. Review schedule posted.',
      time: '2 days ago',
      type: 'exam'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="w-full bg-white rounded-2xl shadow-xl p-6 lg:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">{greeting}, Student!</h1>
              <p className="text-blue-100 flex items-center gap-3 text-lg">
                <Clock className="w-5 h-5" />
                {formatTime(currentTime)} • {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-300 hover:scale-105"
              >
                <Bell className="w-7 h-7" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-medium">
                  3
                </span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 lg:w-96 bg-white rounded-xl shadow-2xl z-20 text-gray-800 border">
                  <div className="p-5 border-b bg-gray-50 rounded-t-xl">
                    <h3 className="font-bold text-lg">Recent Notifications</h3>
                  </div>
                  <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
                    <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium">Assignment Due Soon</p>
                        <p className="text-sm text-gray-600 mt-1">Computer Vision Project - 1 day left</p>
                        <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium">Class Starting Soon</p>
                        <p className="text-sm text-gray-600 mt-1">Machine Learning in 30 minutes</p>
                        <p className="text-xs text-gray-400 mt-1">Just now</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium">Grade Posted</p>
                        <p className="text-sm text-gray-600 mt-1">ML Quiz - 95% (A)</p>
                        <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="bg-white rounded-xl shadow-lg p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group border hover:border-blue-200"
            >
              <div className={`${action.color} w-14 h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto`}>
                <action.icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <p className="font-semibold text-gray-800 text-base lg:text-lg">{action.label}</p>
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column - Classes and Deadlines */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Classes */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  Today's Classes
                </h2>
              </div>
              <div className="space-y-4">
                {todaysClasses.map((cls, index) => (
                  <div key={index} className="flex items-center justify-between p-4 lg:p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`${cls.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{cls.name}</h3>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {cls.time}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Users className="w-4 h-4" />
                          {cls.students} students online
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        cls.status === 'Live' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cls.status}
                      </span>
                      <button className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Join Class
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  Upcoming Deadlines
                </h2>
              </div>
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-4 lg:p-5 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`${deadline.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">{deadline.subject}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{deadline.title}</h3>
                        <p className="text-gray-600">{deadline.dueDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        deadline.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                        deadline.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {deadline.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Progress and Announcements */}
          <div className="space-y-6">
            
            {/* Progress Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Progress
                </h2>
              </div>
              <div className="space-y-4">
                {progressStats.map((stat, index) => (
                  <div key={index} className={`${stat.bgColor} p-4 rounded-xl`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{stat.label}</span>
                      <span className={`font-bold text-xl ${stat.color}`}>{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <Bell className="w-6 h-6 text-orange-600" />
                  Announcements
                </h2>
              </div>
              <div className="space-y-4">
                {recentAnnouncements.map((announcement, index) => (
                  <div key={index} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                    <h3 className="font-semibold text-gray-800 mb-1">{announcement.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{announcement.content}</p>
                    <p className="text-xs text-gray-500">{announcement.time}</p>
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

export default DashboardContent;