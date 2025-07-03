import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    // In a real app, you would send this data to your backend API
    // For now, we'll just simulate a successful registration
    localStorage.setItem('user', JSON.stringify({
      name,
      email
    }));
    
    // Redirect to dashboard after successful signup
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-intel-light-gray">
      {/* Left side - Intel branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-intel-dark-blue flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">CoreMentis</h1>
          <h2 className="text-2xl font-semibold mb-4">Join Our Platform</h2>
          <p className="text-lg mb-8">
            Experience the power of Intel's OpenVINO technology with our engagement analysis platform.
            Create your account to get started with real-time engagement monitoring.
          </p>
          <div className="border-t border-white/30 pt-8">
            <p className="text-sm opacity-80">
              Our advanced AI models analyze facial expressions, gaze direction, and head pose
              to provide comprehensive engagement metrics for your applications.
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Signup form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-intel-dark-blue mb-2">Create Account</h2>
            <p className="text-intel-gray">Sign up to get started with CoreMentis</p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-intel-dark-gray mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                required
              />
            </div>
            
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
              <label htmlFor="password" className="block text-sm font-medium text-intel-dark-gray mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                required
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-intel-dark-gray mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-intel-blue"
                required
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-intel-blue hover:bg-intel-dark-blue text-white py-2 px-4 rounded-md transition duration-300"
              >
                Create Account
              </button>
            </div>
          </form>
          
          <div className="text-center mt-8">
            <p className="text-intel-gray">
              Already have an account?{' '}
              <Link to="/login" className="text-intel-blue hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
