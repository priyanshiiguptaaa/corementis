import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Bell, 
  Download, 
  Filter, 
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
  Users,
  AlertCircle,
  CheckCircle,
  Settings,
  Bookmark,
  MessageSquare
} from 'lucide-react';

const ScheduleContent = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  // Sample schedule data with enhanced information
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM', '3:30 PM'];

  const schedule = [
    { 
      id: 1,
      day: 'Monday', 
      time: '10:30 AM', 
      course: 'Computer Vision', 
      instructor: 'Dr. S. Chen',
      room: 'Room 301', 
      color: 'bg-blue-600',
      type: 'lecture',
      duration: '90m',
      meetingLink: 'https://meet.google.com/cv-class',
      materials: ['Slides', 'Assignment 3'],
      attendance: 'mandatory',
      status: 'scheduled'
    },
    { 
      id: 2,
      day: 'Monday', 
      time: '2:00 PM', 
      course: 'Data Visualization Lab', 
      instructor: 'Prof. M. Johnson',
      room: 'Lab 2', 
      color: 'bg-green-600',
      type: 'lab',
      duration: '120m',
      meetingLink: 'https://meet.google.com/dv-lab',
      materials: ['Lab Manual', 'Dataset'],
      attendance: 'mandatory',
      status: 'scheduled'
    },
    { 
      id: 3,
      day: 'Tuesday', 
      time: '9:00 AM', 
      course: 'Deep Learning', 
      instructor: 'Dr. A. Rodriguez',
      room: 'Room 405', 
      color: 'bg-purple-600',
      type: 'lecture',
      duration: '90m',
      meetingLink: 'https://meet.google.com/dl-class',
      materials: ['Neural Networks PDF'],
      attendance: 'mandatory',
      status: 'scheduled'
    },
    { 
      id: 4,
      day: 'Wednesday', 
      time: '12:00 PM', 
      course: 'Machine Learning', 
      instructor: 'Dr. L. Wang',
      room: 'Room 201', 
      color: 'bg-indigo-600',
      type: 'lecture',
      duration: '90m',
      meetingLink: 'https://meet.google.com/ml-class',
      materials: ['ML Textbook Ch. 5'],
      attendance: 'mandatory',
      status: 'scheduled'
    },
    { 
      id: 5,
      day: 'Thursday', 
      time: '3:30 PM', 
      course: 'Computer Vision Lab', 
      instructor: 'Dr. S. Chen',
      room: 'Lab 3', 
      color: 'bg-blue-600',
      type: 'lab',
      duration: '120m',
      meetingLink: 'https://meet.google.com/cv-lab',
      materials: ['OpenCV Tutorial'],
      attendance: 'mandatory',
      status: 'scheduled'
    },
    { 
      id: 6,
      day: 'Friday', 
      time: '10:30 AM', 
      course: 'AI Ethics Seminar', 
      instructor: 'Prof. D. Kim',
      room: 'Room 405', 
      color: 'bg-orange-600',
      type: 'seminar',
      duration: '60m',
      meetingLink: 'https://meet.google.com/ai-ethics',
      materials: ['Ethics Paper'],
      attendance: 'optional',
      status: 'scheduled'
    },
  ];

  // Assignments and deadlines
  const assignments = [
    { id: 1, course: 'Computer Vision', title: 'Object Detection Project', due: '2025-07-05', priority: 'high' },
    { id: 2, course: 'Deep Learning', title: 'Neural Network Implementation', due: '2025-07-07', priority: 'medium' },
    { id: 3, course: 'Machine Learning', title: 'Classification Report', due: '2025-07-10', priority: 'low' },
  ];

  const getClassForTimeSlot = (day, time) => {
    return schedule.find(item => item.day === day && item.time === time);
  };

  const getFilteredSchedule = () => {
    let filtered = schedule;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const joinClass = (classInfo) => {
    window.open(classInfo.meetingLink, '_blank');
  };

  const downloadSchedule = () => {
    const scheduleData = JSON.stringify(schedule, null, 2);
    const blob = new Blob([scheduleData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-schedule.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const syncWithGoogleCalendar = () => {
    alert('Syncing with Google Calendar... This would integrate with Google Calendar API in a real application.');
  };

  const toggleNotification = (classId) => {
    setNotifications(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (currentWeek * 7));
    
    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return {
        day,
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' })
      };
    });
  };

  const weekDates = getWeekDates();

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Weekly Schedule</h1>
              <p className="text-sm text-gray-600">Academic Calendar</p>
            </div>
            
            {/* Week Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentWeek(prev => prev - 1)}
                className="p-1 rounded border border-gray-300 hover:bg-gray-50 transition duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium px-3">
                Week {currentWeek === 0 ? 'Current' : currentWeek > 0 ? `+${currentWeek}` : currentWeek}
              </span>
              <button
                onClick={() => setCurrentWeek(prev => prev + 1)}
                className="p-1 rounded border border-gray-300 hover:bg-gray-50 transition duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
              />
            </div>
            
            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="lecture">Lectures</option>
              <option value="lab">Labs</option>
              <option value="seminar">Seminars</option>
            </select>

            {/* Action Buttons */}
            <button
              onClick={syncWithGoogleCalendar}
              className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 text-sm rounded hover:bg-blue-700 transition duration-200"
            >
              <Calendar className="w-3 h-3" />
              Sync
            </button>
            
            <button
              onClick={downloadSchedule}
              className="flex items-center gap-1 bg-gray-600 text-white px-2 py-1 text-sm rounded hover:bg-gray-700 transition duration-200"
            >
              <Download className="w-3 h-3" />
              Export
            </button>

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 text-sm rounded hover:bg-green-700 transition duration-200"
            >
              <BookOpen className="w-3 h-3" />
              {showSidebar ? 'Hide' : 'Show'} Info
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Schedule Table */}
        <div className={`${showSidebar ? 'flex-1' : 'w-full'} flex flex-col bg-white`}>
          <div className="flex-1 overflow-auto">
            <table className="w-full h-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Time
                  </th>
                  {weekDates.map(({ day, date, month }) => (
                    <th key={day} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center">
                        <span className="text-xs">{day.substring(0, 3)}</span>
                        <span className="text-lg font-bold text-gray-900">{date}</span>
                        <span className="text-xs text-gray-400">{month}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {timeSlots.map(time => (
                  <tr key={time} className="h-24">
                    <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 bg-gray-50 border-r border-gray-200">
                      <div className="flex flex-col items-center">
                        <Clock className="w-3 h-3 text-gray-400 mb-1" />
                        <span className="text-xs">{time}</span>
                      </div>
                    </td>
                    {days.map(day => {
                      const classInfo = getClassForTimeSlot(day, time);
                      const isFiltered = classInfo && getFilteredSchedule().includes(classInfo);
                      
                      return (
                        <td key={`${day}-${time}`} className="px-1 py-1 relative">
                          {classInfo && isFiltered && (
                            <div className={`${classInfo.color} text-white p-2 rounded-md shadow-sm hover:shadow-md transition duration-200 cursor-pointer h-20 flex flex-col justify-between text-xs`}>
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-xs leading-tight truncate">{classInfo.course}</h4>
                                  <p className="text-xs opacity-90 truncate">{classInfo.instructor}</p>
                                </div>
                                <button
                                  onClick={() => toggleNotification(classInfo.id)}
                                  className="text-white hover:text-yellow-200 transition duration-200 ml-1"
                                >
                                  <Bell className={`w-3 h-3 ${notifications.includes(classInfo.id) ? 'fill-current' : ''}`} />
                                </button>
                              </div>
                              
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-2 h-2" />
                                  <span className="truncate">{classInfo.room}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-2 h-2" />
                                  <span>{classInfo.duration}</span>
                                </div>
                              </div>

                              <div className="flex gap-1 mt-1">
                                <button
                                  onClick={() => joinClass(classInfo)}
                                  className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs py-1 px-1 rounded transition duration-200 flex items-center justify-center gap-1"
                                >
                                  <Video className="w-2 h-2" />
                                  <span className="hidden sm:inline">Join</span>
                                </button>
                                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs py-1 px-1 rounded transition duration-200">
                                  <BookOpen className="w-2 h-2" />
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Today's Classes */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Today's Classes
                </h3>
                <div className="space-y-2">
                  {schedule.filter(item => item.day === 'Monday').slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                      <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.course}</p>
                        <p className="text-gray-500">{item.time} • {item.room}</p>
                      </div>
                      <button
                        onClick={() => joinClass(item)}
                        className="text-blue-600 hover:text-blue-800 transition duration-200"
                      >
                        <Video className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Upcoming Assignments
                </h3>
                <div className="space-y-2">
                  {assignments.slice(0, 3).map(assignment => (
                    <div key={assignment.id} className="p-2 border border-gray-200 rounded text-xs">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium truncate">{assignment.title}</h4>
                        <span className={`text-xs px-1 py-0.5 rounded-full ${
                          assignment.priority === 'high' ? 'bg-red-100 text-red-800' :
                          assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {assignment.priority}
                        </span>
                      </div>
                      <p className="text-gray-500 mb-1">{assignment.course}</p>
                      <p className="text-gray-600">Due: {new Date(assignment.due).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Actions</h3>
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-50 rounded text-xs transition duration-200">
                    <Plus className="w-3 h-3 text-gray-400" />
                    <span>Add Personal Event</span>
                  </button>
                  <button className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-50 rounded text-xs transition duration-200">
                    <Bookmark className="w-3 h-3 text-gray-400" />
                    <span>Saved Resources</span>
                  </button>
                  <button className="w-full flex items-center gap-2 p-2 text-left hover:bg-gray-50 rounded text-xs transition duration-200">
                    <MessageSquare className="w-3 h-3 text-gray-400" />
                    <span>Study Groups</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleContent;