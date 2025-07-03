import React, { useState } from 'react';

const AssignmentsContent = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showNewAssignmentForm, setShowNewAssignmentForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    course: '',
    description: '',
    dueDate: '',
    points: ''
  });

  // Sample courses for dropdown
  const courses = [
    { id: 1, title: 'Introduction to Artificial Intelligence' },
    { id: 2, title: 'Advanced Machine Learning' },
    { id: 3, title: 'Neural Networks and Deep Learning' }
  ];

  // Sample assignments data
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'AI Ethics Case Study',
      course: 'Introduction to Artificial Intelligence',
      dueDate: '2025-07-10',
      submissions: 18,
      totalStudents: 28,
      status: 'active',
      points: 100
    },
    {
      id: 2,
      title: 'Neural Network Implementation',
      course: 'Advanced Machine Learning',
      dueDate: '2025-07-15',
      submissions: 15,
      totalStudents: 22,
      status: 'active',
      points: 150
    },
    {
      id: 3,
      title: 'Final Project Proposal',
      course: 'Neural Networks and Deep Learning',
      dueDate: '2025-07-20',
      submissions: 20,
      totalStudents: 25,
      status: 'active',
      points: 200
    },
    {
      id: 4,
      title: 'Search Algorithms Quiz',
      course: 'Introduction to Artificial Intelligence',
      dueDate: '2025-06-30',
      submissions: 26,
      totalStudents: 28,
      status: 'past',
      points: 50
    },
    {
      id: 5,
      title: 'Reinforcement Learning Lab',
      course: 'Advanced Machine Learning',
      dueDate: '2025-06-28',
      submissions: 21,
      totalStudents: 22,
      status: 'past',
      points: 75
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment({
      ...newAssignment,
      [name]: value
    });
  };

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    const newAssignmentObj = {
      id: assignments.length + 1,
      title: newAssignment.title,
      course: newAssignment.course,
      dueDate: newAssignment.dueDate,
      submissions: 0,
      totalStudents: 25, // Default value
      status: 'active',
      points: parseInt(newAssignment.points)
    };
    
    setAssignments([...assignments, newAssignmentObj]);
    setNewAssignment({
      title: '',
      course: '',
      description: '',
      dueDate: '',
      points: ''
    });
    setShowNewAssignmentForm(false);
  };

  // Filter assignments based on active tab
  const filteredAssignments = assignments.filter(assignment => {
    if (activeTab === 'all') return true;
    return assignment.status === activeTab;
  });

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-intel-dark-blue">Assignments</h1>
          <p className="text-intel-gray mt-1">Create, grade, and manage student assignments</p>
        </div>
        <button
          onClick={() => setShowNewAssignmentForm(true)}
          className="bg-intel-blue hover:bg-intel-dark-blue text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <span className="mr-2">+</span> Create Assignment
        </button>
      </div>

      {/* New assignment form */}
      {showNewAssignmentForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-intel-blue">
          <h2 className="text-xl font-semibold text-intel-dark-blue mb-4">Create New Assignment</h2>
          <form onSubmit={handleCreateAssignment}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="title">
                  Assignment Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newAssignment.title}
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
                  value={newAssignment.course}
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newAssignment.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="dueDate">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={newAssignment.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-intel-gray mb-1" htmlFor="points">
                  Points
                </label>
                <input
                  type="number"
                  id="points"
                  name="points"
                  value={newAssignment.points}
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
                onClick={() => setShowNewAssignmentForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-intel-gray hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-intel-blue text-white rounded-md hover:bg-intel-dark-blue transition-colors"
              >
                Create Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs for filtering */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'all' ? 'border-intel-blue text-intel-blue' : 'border-transparent text-intel-gray hover:text-intel-dark-blue hover:border-gray-300'}`}
          >
            All Assignments
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'active' ? 'border-intel-blue text-intel-blue' : 'border-transparent text-intel-gray hover:text-intel-dark-blue hover:border-gray-300'}`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'past' ? 'border-intel-blue text-intel-blue' : 'border-transparent text-intel-gray hover:text-intel-dark-blue hover:border-gray-300'}`}
          >
            Past
          </button>
        </nav>
      </div>

      {/* Assignments table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-intel-gray uppercase tracking-wider">
                  Assignment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-intel-gray uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-intel-gray uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-intel-gray uppercase tracking-wider">
                  Submissions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-intel-gray uppercase tracking-wider">
                  Points
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-intel-gray uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-intel-dark-blue">{assignment.title}</div>
                    <div className="text-sm text-intel-gray">
                      {assignment.status === 'active' ? 
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span> :
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Past</span>
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-intel-gray">
                    {assignment.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-intel-gray">
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-intel-gray">{assignment.submissions}/{assignment.totalStudents}</div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-intel-blue rounded-full h-2" 
                        style={{ width: `${(assignment.submissions / assignment.totalStudents) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-intel-gray">
                    {assignment.points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-intel-blue hover:text-intel-dark-blue mr-3">
                      {assignment.submissions > 0 ? 'Grade' : 'Edit'}
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsContent;
