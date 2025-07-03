import React from 'react';

const StudentNavbar = ({ 
  user, 
  onLogout, 
  isNavCollapsed, 
  setIsNavCollapsed, 
  activeSection, 
  setActiveSection, 
  isMobile 
}) => {
  // Navigation items with icons
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'courses', label: 'My Courses', icon: '📚' },
    { id: 'schedule', label: 'Schedule', icon: '📆' },
    { id: 'assignments', label: 'Assignments', icon: '📝' },
    { id: 'progress', label: 'Progress', icon: '📊' },
    { id: 'discussions', label: 'Discussions', icon: '💬' },
    { id: 'announcements', label: 'Announcements', icon: '🔔' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <>
      {/* Mobile header with menu toggle */}
      <div className="md:hidden bg-intel-dark-blue text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">CoreMentis</h1>
        <button 
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          className="p-1 rounded focus:outline-none focus:ring"
          aria-label="Toggle navigation"
        >
          {isNavCollapsed ? '☰' : '✕'}
        </button>
      </div>

      {/* Sidebar navigation */}
      <div 
        className={`
          ${isNavCollapsed && isMobile ? 'hidden' : 'block'}
          ${isMobile ? 'absolute z-10 w-64 shadow-lg' : 'relative'}
          bg-intel-dark-blue text-white w-64 md:w-72 flex-shrink-0 transition-all duration-300
        `}
        style={{ height: isMobile ? 'calc(100vh - 64px)' : '100vh' }}
      >
        {/* Logo and brand - visible on desktop */}
        <div className="hidden md:flex items-center p-4 border-b border-intel-blue/30">
          <span className="text-2xl font-bold">CoreMentis</span>
        </div>

        {/* User profile */}
        <div className="p-4 border-b border-intel-blue/30 flex items-center">
          <div className="w-10 h-10 rounded-full bg-intel-blue flex items-center justify-center">
            <span className="text-lg font-bold">{user?.name?.charAt(0) || 'S'}</span>
          </div>
          <div className="ml-3">
            <p className="font-medium">{user?.name || 'Student'}</p>
            <p className="text-sm opacity-75">{user?.email}</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
          <ul className="py-2">
            {navItems.map((item) => (
              <li key={item.id} className="px-2">
                <button
                  onClick={() => {
                    setActiveSection(item.id);
                    if (isMobile) setIsNavCollapsed(true);
                  }}
                  className={`
                    w-full flex items-center p-3 rounded-md mb-1
                    ${activeSection === item.id ? 'bg-intel-blue text-white' : 'text-white/80 hover:bg-intel-blue/30'}
                    transition-colors duration-200
                  `}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
            <li className="px-2 mt-4">
              <button
                onClick={onLogout}
                className="w-full flex items-center p-3 rounded-md text-white/80 hover:bg-red-500/30 transition-colors duration-200"
              >
                <span className="mr-3 text-xl">🚪</span>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default StudentNavbar;
