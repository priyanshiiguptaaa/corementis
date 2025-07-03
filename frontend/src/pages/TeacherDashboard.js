import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';

// Import components
import TeacherNavbar from '../components/teacher/TeacherNavbar';
import DashboardContent from '../components/teacher/DashboardContent';
import CoursesContent from '../components/teacher/CoursesContent';
import ScheduleContent from '../components/teacher/ScheduleContent';
import AssignmentsContent from '../components/teacher/AssignmentsContent';
import PerformanceContent from '../components/teacher/PerformanceContent';
import DiscussionsContent from '../components/teacher/DiscussionsContent';
import AnnouncementsContent from '../components/teacher/AnnouncementsContent';
import ResourcesContent from '../components/teacher/ResourcesContent';
import SettingsContent from '../components/teacher/SettingsContent';
import ClassroomInterface from '../components/teacher/ClassroomInterface';

const TeacherDashboard = ({ user, onLogout }) => {
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
      case 'performance':
        return <PerformanceContent />;
      case 'discussions':
        return <DiscussionsContent />;
      case 'announcements':
        return <AnnouncementsContent />;
      case 'resources':
        return <ResourcesContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  // Function to start a classroom session
  const startClassroom = (courseId, courseName) => {
    navigate(`/teacher/classroom/${courseId}`, { state: { courseName } });
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
        isTeacher={true}
      />
    );
  }
  
  // Otherwise render the dashboard
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-intel-light-gray">
      {/* Teacher Navbar Component */}
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar - only visible on mobile */}
        {isMobile && (
          <div className="bg-white border-b p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-intel-dark-blue">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
            <button
              onClick={() => setIsNavCollapsed(!isNavCollapsed)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              ☰
            </button>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
