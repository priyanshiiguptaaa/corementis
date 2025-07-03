import React, { useState } from 'react';

const ScheduleContent = () => {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  
  // Sample schedule data
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      title: 'Introduction to Neural Networks',
      course: 'Neural Networks and Deep Learning',
      date: '2025-07-05',
      startTime: '10:00',
      endTime: '11:30',
      meetingLink: 'https://meet.corementis.edu/neural-networks',
      description: 'Introduction to basic concepts of neural networks and their applications'
    },
    {
      id: 2,
      title: 'Machine Learning Algorithms',
      course: 'Advanced Machine Learning',
      date: '2025-07-06',
      startTime: '14:00',
      endTime: '15:30',
      meetingLink: 'https://meet.corementis.edu/ml-algorithms',
      description: 'Overview of supervised and unsupervised learning algorithms'
    },
    {
      id: 3,
      title: 'AI Ethics Discussion',
      course: 'Introduction to Artificial Intelligence',
      date: '2025-07-08',
      startTime: '11:00',
      endTime: '12:30',
      meetingLink: 'https://meet.corementis.edu/ai-ethics',
      description: 'Discussion on ethical considerations in AI development and deployment'
    },
    {
      id: 4,
      title: 'Deep Learning Project Review',
      course: 'Neural Networks and Deep Learning',
      date: '2025-07-10',
      startTime: '15:00',
      endTime: '16:30',
      meetingLink: 'https://meet.corementis.edu/dl-review',
      description: 'Review session for ongoing deep learning projects'
    },
    {
      id: 5,
      title: 'Reinforcement Learning Lab',
      course: 'Advanced Machine Learning',
      date: '2025-07-12',
      startTime: '09:00',
      endTime: '11:00',
      meetingLink: 'https://meet.corementis.edu/rl-lab',
      description: 'Hands-on lab session on reinforcement learning algorithms'
    }
  ]);

  // Sample courses for dropdown
  const courses = [
    { id: 1, title: 'Introduction to Artificial Intelligence' },
    { id: 2, title: 'Advanced Machine Learning' },
    { id: 3, title: 'Neural Networks and Deep Learning' }
  ];

  const [scheduleData, setScheduleData] = useState({
    title: '',
    course: '',
    date: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleData({
      ...scheduleData,
      [name]: value
    });
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to a server
    const newSchedule = {
      id: schedules.length + 1,
      ...scheduleData
    };
    
    setSchedules([...schedules, newSchedule]);
    setScheduleData({
      title: '',
      course: '',
      date: '',
      startTime: '',
      endTime: '',
      meetingLink: '',
      description: ''
    });
    setShowScheduleForm(false);
  };

  // Get current date and week dates
  const today = new Date();
  const currentWeekDates = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get the first day of the week (Sunday)
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());
  
  // Generate dates for the current week
  for (let i = 0; i < 7; i++) {
    const date = new Date(firstDayOfWeek);
    date.setDate(firstDayOfWeek.getDate() + i);
    currentWeekDates.push({
      date: date,
      dateString: date.toISOString().split('T')[0],
      dayName: dayNames[i],
      isToday: date.toDateString() === today.toDateString()
    });
  }

  // Filter schedules for the current week
  const weekSchedules = schedules.filter(schedule => {
    return currentWeekDates.some(day => day.dateString === schedule.date);
  });

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Get schedule color based on course
  const getScheduleColor = (course) => {
    switch(course) {
      case 'Introduction to Artificial Intelligence':
        return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'Advanced Machine Learning':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'Neural Networks and Deep Learning':
        return 'bg-purple-100 border-purple-400 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-intel-dark-blue">Class Schedule</h1>
          <p className="text-intel-gray mt-1">Manage your upcoming live classes and sessions</p>
        </div>
        <button
          onClick={() => setShowScheduleForm(true)}
          className="bg-intel-blue hover:bg-intel-dark-blue text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <span className="mr-2">📅</span> Schedule Class
        </button>
      </div>

      {/* Schedule form */}
      {showScheduleForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-intel-blue">
          <h2 className="text-xl font-semibold text-intel-dark-blue mb-4">Schedule New Class</h2>
          <form onSubmit={handleScheduleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="title">
                  Class Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={scheduleData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="course">
                  Course
                </label>
                <select
                  id="course"
                  name="course"
                  value={scheduleData.course}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.title}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="date">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={scheduleData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="startTime">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={scheduleData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="endTime">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={scheduleData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="meetingLink">
                  Meeting Link
                </label>
                <input
                  type="url"
                  id="meetingLink"
                  name="meetingLink"
                  value={scheduleData.meetingLink}
                  onChange={handleInputChange}
                  placeholder="https://"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={scheduleData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  required
                ></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowScheduleForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-intel-gray hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-intel-blue text-white rounded-md hover:bg-intel-dark-blue transition-colors"
              >
                Schedule Class
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View mode toggle */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded-md ${viewMode === 'week' ? 'bg-intel-blue text-white' : 'bg-gray-100 text-intel-gray hover:bg-gray-200'}`}
          >
            Week View
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded-md ${viewMode === 'month' ? 'bg-intel-blue text-white' : 'bg-gray-100 text-intel-gray hover:bg-gray-200'}`}
          >
            Month View
          </button>
        </div>
        <div className="text-intel-dark-blue font-medium">
          {`${currentWeekDates[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${currentWeekDates[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
        </div>
      </div>

      {/* Week view calendar */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200">
            {currentWeekDates.map((day) => (
              <div 
                key={day.dateString} 
                className={`py-2 px-1 text-center ${day.isToday ? 'bg-blue-50' : ''}`}
              >
                <div className="text-sm font-medium text-intel-gray">{day.dayName}</div>
                <div className={`text-lg font-semibold ${day.isToday ? 'text-intel-blue' : 'text-intel-dark-blue'}`}>
                  {day.date.getDate()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 p-2 min-h-[400px]">
            {currentWeekDates.map((day) => {
              // Get schedules for this day
              const daySchedules = schedules.filter(schedule => schedule.date === day.dateString);
              
              return (
                <div key={day.dateString} className={`p-1 min-h-full ${day.isToday ? 'bg-blue-50' : ''}`}>
                  {daySchedules.length > 0 ? (
                    <div className="space-y-2">
                      {daySchedules.map(schedule => (
                        <div 
                          key={schedule.id}
                          className={`p-2 rounded-md border-l-4 ${getScheduleColor(schedule.course)} cursor-pointer hover:shadow-md transition-shadow`}
                        >
                          <div className="font-medium truncate">{schedule.title}</div>
                          <div className="text-xs">
                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-intel-gray">
                      <span>No classes</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month view placeholder */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-intel-gray">Month view calendar will be implemented in the next phase.</p>
        </div>
      )}

      {/* Upcoming classes list */}
      <div>
        <h2 className="text-xl font-semibold text-intel-dark-blue mb-4">Upcoming Classes</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {weekSchedules.length > 0 ? (
              weekSchedules.map((schedule) => (
                <li key={schedule.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 text-2xl mr-4">📚</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-intel-dark-blue">{schedule.title}</h3>
                        <div className="ml-2 flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScheduleColor(schedule.course)}`}>
                            {schedule.course.split(' ').slice(0, 2).join(' ')}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-intel-gray">{schedule.description}</p>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <span className="mr-2">🗓️</span>
                          <span className="text-intel-gray">
                            {new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, 
                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                          </span>
                        </div>
                        <div>
                          <a 
                            href={schedule.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-intel-blue hover:text-intel-dark-blue flex items-center"
                          >
                            <span className="mr-1">🔗</span> Join Meeting
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      <button className="text-intel-blue hover:text-intel-dark-blue" title="Edit">
                        <span className="text-lg">✏️</span>
                      </button>
                      <button className="text-red-600 hover:text-red-900" title="Delete">
                        <span className="text-lg">🗑️</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-8 text-center text-intel-gray">
                <p>No upcoming classes scheduled for this week.</p>
                <button 
                  onClick={() => setShowScheduleForm(true)} 
                  className="mt-2 text-intel-blue hover:underline"
                >
                  Schedule a new class
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScheduleContent;
