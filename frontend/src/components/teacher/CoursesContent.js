import React, { useState } from 'react';

const CoursesContent = () => {
  const [showNewCourseForm, setShowNewCourseForm] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    title: '',
    description: '',
    schedule: '',
    capacity: ''
  });

  // Sample courses data
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: 'Introduction to Artificial Intelligence',
      description: 'Foundational concepts in AI including search algorithms, knowledge representation, and machine learning.',
      students: 28,
      schedule: 'Mon, Wed 10:00-11:30 AM',
      progress: 65,
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 2,
      title: 'Advanced Machine Learning',
      description: 'Deep dive into neural networks, reinforcement learning, and advanced ML techniques.',
      students: 22,
      schedule: 'Tue, Thu 2:30-4:00 PM',
      progress: 40,
      image: 'https://images.unsplash.com/photo-1677442135136-760c813170d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 3,
      title: 'Neural Networks and Deep Learning',
      description: 'Comprehensive study of neural network architectures and deep learning frameworks.',
      students: 25,
      schedule: 'Wed, Fri 11:15-12:45 PM',
      progress: 30,
      image: 'https://images.unsplash.com/photo-1647166545674-ce28ce93bdca?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourseData({
      ...newCourseData,
      [name]: value
    });
  };

  const handleCreateCourse = (e) => {
    e.preventDefault();
    const newCourse = {
      id: courses.length + 1,
      title: newCourseData.title,
      description: newCourseData.description,
      students: 0,
      schedule: newCourseData.schedule,
      progress: 0,
      image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    };
    
    setCourses([...courses, newCourse]);
    setNewCourseData({
      title: '',
      description: '',
      schedule: '',
      capacity: ''
    });
    setShowNewCourseForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-intel-dark-blue">Manage Courses</h1>
          <p className="text-intel-gray mt-1">Create, edit and manage your course offerings</p>
        </div>
        <button
          onClick={() => setShowNewCourseForm(true)}
          className="bg-intel-blue hover:bg-intel-dark-blue text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <span className="mr-2">+</span> Create New Course
        </button>
      </div>

      {/* New course form */}
      {showNewCourseForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-intel-blue">
          <h2 className="text-xl font-semibold text-intel-dark-blue mb-4">Create New Course</h2>
          <form onSubmit={handleCreateCourse}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="title">
                  Course Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newCourseData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="schedule">
                  Schedule
                </label>
                <input
                  type="text"
                  id="schedule"
                  name="schedule"
                  value={newCourseData.schedule}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  placeholder="e.g. Mon, Wed 10:00-11:30 AM"
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
                  value={newCourseData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="capacity">
                  Maximum Capacity
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={newCourseData.capacity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewCourseForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-intel-gray hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-intel-blue text-white rounded-md hover:bg-intel-dark-blue transition-colors"
              >
                Create Course
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Course cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-40 overflow-hidden">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-intel-dark-blue">{course.title}</h3>
              <p className="text-intel-gray mt-2 line-clamp-2">{course.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-intel-gray">
                  <div className="flex items-center">
                    <span className="mr-1">👥</span> {course.students} Students
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="mr-1">🕒</span> {course.schedule}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-intel-blue">
                    {course.progress}% Complete
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-intel-blue rounded-full h-2" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button className="text-intel-blue hover:underline text-sm font-medium">
                  Edit Course
                </button>
                <button className="bg-intel-blue text-white px-3 py-1 rounded hover:bg-intel-dark-blue transition-colors">
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesContent;
