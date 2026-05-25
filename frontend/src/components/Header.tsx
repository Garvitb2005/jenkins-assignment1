import React from 'react';
import { BookOpen, Menu, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-800">ClassPlus</span>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-600 hover:text-blue-600">Home</a>

            {/* Courses dropdown */}
            <div className="relative group">
              <button className="text-gray-600 hover:text-blue-600">
                Features
              </button>
              {/* Dropdown menu will show on hover */}
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-500 delay-75">
                <a href="/classes" className="block px-4 py-2 text-gray-600 hover:bg-blue-100">Courses</a>
                <a href="/viewAssignment" className="block px-4 py-2 text-gray-600 hover:bg-blue-100">Assignments</a>
              </div>
            </div>

            <a href="/about" className="text-gray-600 hover:text-blue-600">About</a>
            <a href="/contact" className="text-gray-600 hover:text-blue-600">Contact</a>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600">Hello, {user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a 
                  href="/register" 
                  className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Register
                </a>
                <span className="text-gray-300">|</span>
                <a 
                  href="/login" 
                  className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Login
                </a>
              </div>
            )}

            {/* Mobile Menu */}
            <button className="md:hidden">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
