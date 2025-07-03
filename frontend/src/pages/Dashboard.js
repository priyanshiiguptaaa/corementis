import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';

// Teacher dashboard components
import TeacherNavbar from '../components/teacher/TeacherNavbar';
import DashboardContent from '../components/teacher/DashboardContent';
import CoursesContent from '../components/teacher/CoursesContent';
import ScheduleContent from '../components/teacher/ScheduleContent';
import AssignmentsContent from '../components/teacher/AssignmentsContent';
import PerformanceContent from '../components/teacher/PerformanceContent';
import ResourcesContent from '../components/teacher/ResourcesContent';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  // Render appropriate dashboard based on user role
  if (user.role === 'teacher') {
    return <TeacherDashboard user={user} onLogout={handleLogout} />;
  } else {
    return <StudentDashboard user={user} onLogout={handleLogout} />;
  }
};

// Teacher Dashboard Component
const TeacherDashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize to detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsNavCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render the appropriate content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'courses':
        return <CoursesContent />;
      case 'schedule':
        return <ScheduleContent />;
      case 'assignments':
        return <AssignmentsContent />;
      case 'performance':
        return <PerformanceContent />;
      case 'resources':
        return <ResourcesContent />;
      case 'discussions':
      case 'announcements':
      case 'settings':
        return (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-intel-dark-blue mb-4">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h2>
            <p className="text-intel-gray">This section is coming soon.</p>
          </div>
        );
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-intel-light-gray">
      {/* Navigation sidebar */}
      <TeacherNavbar
        user={user}
        onLogout={onLogout}
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isMobile={isMobile}
      />
      
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );

};



export default Dashboard;
