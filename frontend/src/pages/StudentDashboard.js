import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';

// Import components
import StudentNavbar from '../components/StudentNavbar';
import DashboardContent from '../components/student/DashboardContent';
import CoursesContent from '../components/student/CoursesContent';
import ScheduleContent from '../components/student/ScheduleContent';
import AssignmentsContent from '../components/student/AssignmentsContent';
import ProgressContent from '../components/student/ProgressContent';
import DiscussionsContent from '../components/student/DiscussionsContent';
import AnnouncementsContent from '../components/student/AnnouncementsContent';
import SettingsContent from '../components/student/SettingsContent';
import ClassroomInterface from '../components/student/ClassroomInterface';

const StudentDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [inClassroom, setInClassroom] = useState(false);
  
  // Check if we're in classroom view
  useEffect(() => {
    setInClassroom(location.pathname.includes('/classroom'));
  }, [location]);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsNavCollapsed(true);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render content based on active section
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
      case 'progress':
        return <ProgressContent />;
      case 'discussions':
        return <DiscussionsContent />;
      case 'announcements':
        return <AnnouncementsContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  // Function to join a classroom
  const joinClassroom = (courseId, courseName) => {
    navigate(`/student/classroom/${courseId}`, { state: { courseName } });
  };

  // If we're in classroom view, render the classroom interface
  if (inClassroom) {
    // Extract courseId from URL
    const courseId = location.pathname.split('/').pop();
    const courseName = location.state?.courseName || 'Class Session';
    
    return (
      <ClassroomInterface 
        courseId={courseId} 
        courseName={courseName} 
      />
    );
  }
  
  // Otherwise render the dashboard
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-intel-light-gray">
      {/* Student Navbar Component */}
      <StudentNavbar 
        user={user} 
        onLogout={onLogout}
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isMobile={isMobile}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop header */}
        <header className="bg-white shadow-sm p-4 hidden md:flex justify-between items-center">
          <h1 className="text-xl font-bold text-intel-dark-blue">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
          <div>
            <button
              onClick={onLogout}
              className="bg-intel-blue hover:bg-intel-dark-blue text-white px-4 py-2 rounded transition duration-200"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Overlay for mobile when nav is open */}
          {!isNavCollapsed && isMobile && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-0"
              onClick={() => setIsNavCollapsed(true)}
              aria-hidden="true"
            ></div>
          )}
          
          {/* Dynamic content based on active section */}
          <Routes>
            <Route path="/" element={renderContent()} />
            <Route path="/*" element={renderContent()} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
