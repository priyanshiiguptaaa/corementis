import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import ChatbotButton from './components/student/ChatbotButton';

function App() {
  // Simple auth check - in a real app, this would check for a valid token
  const isAuthenticated = () => {
    return localStorage.getItem('user') !== null;
  };

  return (
    <Router>
      <div className="min-h-screen bg-intel-light-gray">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />} 
          />
          {/* Student routes */}
          <Route 
            path="/student" 
            element={isAuthenticated() ? <StudentDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/student/classroom/:courseId" 
            element={isAuthenticated() ? <StudentDashboard /> : <Navigate to="/login" />} 
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        {isAuthenticated() && <ChatbotButton />}
      </div>
    </Router>
  );
}

export default App;
