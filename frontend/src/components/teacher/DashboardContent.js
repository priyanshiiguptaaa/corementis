import React from 'react';

const DashboardContent = () => {
  // Sample data for the dashboard
  const upcomingClasses = [
    { id: 1, title: 'Introduction to AI', time: '10:00 AM', date: 'Today', students: 28 },
    { id: 2, title: 'Advanced Machine Learning', time: '2:30 PM', date: 'Tomorrow', students: 22 },
    { id: 3, title: 'Neural Networks', time: '11:15 AM', date: 'Jul 5', students: 25 }
  ];

  const pendingAssignments = [
    { id: 1, title: 'AI Ethics Case Study', submissions: 18, total: 28, course: 'Introduction to AI' },
    { id: 2, title: 'Neural Network Implementation', submissions: 15, total: 22, course: 'Advanced ML' },
    { id: 3, title: 'Final Project Proposal', submissions: 20, total: 25, course: 'Neural Networks' }
  ];

  const recentDiscussions = [
    { id: 1, title: 'Question about backpropagation', student: 'Alex Chen', time: '2 hours ago', replies: 3 },
    { id: 2, title: 'Dataset for final project', student: 'Sarah Johnson', time: '5 hours ago', replies: 7 },
    { id: 3, title: 'Error in assignment 3', student: 'Michael Brown', time: 'Yesterday', replies: 2 }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-intel-dark-blue">Welcome to your Teaching Assistant Hub</h1>
        <p className="text-intel-gray mt-2">
          Manage your courses, track student performance, and enhance your teaching experience with CoreMentis.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-4xl text-intel-blue mb-2">3</div>
          <div className="text-sm text-intel-gray">Active Courses</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-4xl text-intel-blue mb-2">75</div>
          <div className="text-sm text-intel-gray">Total Students</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-4xl text-intel-blue mb-2">12</div>
          <div className="text-sm text-intel-gray">Pending Assignments</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-4xl text-intel-blue mb-2">5</div>
          <div className="text-sm text-intel-gray">Upcoming Classes</div>
        </div>
      </div>

      {/* Upcoming classes */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-intel-dark-blue mb-4">Upcoming Classes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-intel-gray uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-intel-gray uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-intel-gray uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-intel-gray uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-intel-gray uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingClasses.map((classItem) => (
                <tr key={classItem.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-intel-dark-blue">{classItem.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-intel-gray">{classItem.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-intel-gray">{classItem.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-intel-gray">{classItem.students}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="bg-intel-blue text-white px-3 py-1 rounded hover:bg-intel-dark-blue transition-colors">
                      Start Class
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two column layout for assignments and discussions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending assignments */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-intel-dark-blue mb-4">Pending Assignments</h2>
          <div className="space-y-4">
            {pendingAssignments.map((assignment) => (
              <div key={assignment.id} className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-medium text-intel-dark-blue">{assignment.title}</h3>
                  <p className="text-sm text-intel-gray">{assignment.course}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-intel-blue">
                    {assignment.submissions}/{assignment.total} Submissions
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-intel-blue rounded-full h-2" 
                      style={{ width: `${(assignment.submissions / assignment.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            <button className="text-intel-blue hover:underline text-sm font-medium mt-2">
              View All Assignments
            </button>
          </div>
        </div>

        {/* Recent discussions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-intel-dark-blue mb-4">Recent Discussions</h2>
          <div className="space-y-4">
            {recentDiscussions.map((discussion) => (
              <div key={discussion.id} className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-medium text-intel-dark-blue">{discussion.title}</h3>
                  <p className="text-sm text-intel-gray">By {discussion.student}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-intel-blue">
                    {discussion.replies} Replies
                  </div>
                  <div className="text-xs text-intel-gray">{discussion.time}</div>
                </div>
              </div>
            ))}
            <button className="text-intel-blue hover:underline text-sm font-medium mt-2">
              View All Discussions
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-intel-dark-blue mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-intel-light-gray transition-colors flex flex-col items-center justify-center text-center">
            <span className="text-2xl mb-2">📝</span>
            <span className="text-sm font-medium text-intel-dark-blue">Create Assignment</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-intel-light-gray transition-colors flex flex-col items-center justify-center text-center">
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm font-medium text-intel-dark-blue">View Analytics</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-intel-light-gray transition-colors flex flex-col items-center justify-center text-center">
            <span className="text-2xl mb-2">📅</span>
            <span className="text-sm font-medium text-intel-dark-blue">Schedule Class</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-intel-light-gray transition-colors flex flex-col items-center justify-center text-center">
            <span className="text-2xl mb-2">📢</span>
            <span className="text-sm font-medium text-intel-dark-blue">Make Announcement</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
