import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Demo accounts with roles
  const demoAccounts = [
    { email: 'teacher@corementis.com', password: 'teacher123', name: 'Demo Teacher', role: 'teacher' },
    { email: 'student@corementis.com', password: 'student123', name: 'Demo Student', role: 'student' },
    { email: 'admin@corementis.com', password: 'admin123', name: 'Admin User', role: 'teacher' },
    { email: 'test@corementis.com', password: 'test123', name: 'Test Student', role: 'student' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Check if the credentials match any demo account
    const user = demoAccounts.find(account => 
      account.email === email && account.password === password
    );
    
    if (user) {
      // Store user info in localStorage (in a real app, you'd store a token)
      localStorage.setItem('user', JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role // Store the role from the demo account
      }));
      
      // Redirect based on role
      if (user.role === 'student') {
        navigate('/student');
      } else {
        navigate('/dashboard');
      }
    } else {
      // For non-demo accounts, use the selected role
      if (email && password.length >= 6) {
        localStorage.setItem('user', JSON.stringify({
          email,
          name: email.split('@')[0],
          role: role // Store the selected role
        }));
        
        // Redirect based on selected role
        if (role === 'student') {
          navigate('/student');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Invalid email or password');
      }
    }
  };

  const handleDemoLogin = (demoAccount) => {
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    setRole(demoAccount.role);
  };

  return (
    <div className="flex min-h-screen bg-intel-light-gray">
      {/* Left side - Intel branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-intel-blue flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">CoreMentis</h1>
          <h2 className="text-2xl font-semibold mb-4">Engagement Analyzer</h2>
          <p className="text-lg mb-8">
            Advanced engagement analysis powered by Intel's OpenVINO technology.
            Monitor and improve user engagement through real-time facial and emotion detection.
          </p>
          <div className="border-t border-white/30 pt-8">
            <p className="text-sm opacity-80">
              Powered by Intel® OpenVINO™ models for face detection, emotion recognition, 
              gaze estimation, and facial landmarks detection.
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-intel-dark-blue mb-2">Welcome Back</h2>
            <p className="text-intel-gray">Please sign in to continue</p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-intel-dark-gray mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-intel-dark-gray">
                  Password
                </label>
                <a href="#" className="text-sm text-intel-blue hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                required
              />
            </div>
            
            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-intel-dark-gray mb-2">
                Login as
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === 'student'}
                    onChange={() => setRole('student')}
                    className="mr-2"
                  />
                  <span>Student</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={role === 'teacher'}
                    onChange={() => setRole('teacher')}
                    className="mr-2"
                  />
                  <span>Teacher</span>
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-intel-blue hover:bg-intel-dark-blue text-white py-2 px-4 rounded-md transition duration-300"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-8">
            <p className="text-center text-intel-gray mb-4">Or use demo accounts</p>
            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoLogin(account)}
                  className="bg-intel-light-gray border border-intel-gray text-intel-dark-gray py-2 px-4 rounded-md hover:bg-gray-200 transition duration-300"
                >
                  {account.name} ({account.role}) - {account.email}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-intel-gray">
              Don't have an account?{' '}
              <Link to="/signup" className="text-intel-blue hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
