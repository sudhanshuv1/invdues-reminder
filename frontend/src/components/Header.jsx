import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../features/authSlice';

const Header = () => {

  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  console.log(user, isAuthenticated);

  return (
    <header className="bg-white text-gray-900 shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link to="/" className="flex items-center">
            InvDues Reminder
          </Link>
        </div>

        {/* Navbar Links */}
        <div className="hidden md:flex space-x-6 text-lg">
          <Link to="/" className="hover:font-bold relative group">
            Home
            <span className="absolute left-0 top-7 w-full h-0.5 bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          <Link to="/features" className="hover:font-bold relative group">
            Features
            <span className="absolute left-0 top-7 w-full h-0.5 bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          <Link to="/pricing" className="hover:font-bold relative group">
            Pricing
            <span className="absolute left-0 top-7 w-full h-0.5 bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          <Link to="/contact" className="hover:font-bold relative group">
            Contact
            <span className="absolute left-0 top-7 w-full h-0.5 bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
        </div>

        {/* Auth Buttons or Profile Avatar */}
        <div className="hidden md:flex space-x-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/signin"
                className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-yellow-400 text-blue-600 rounded-md hover:bg-yellow-300"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <div
                className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg"
                title={user.name}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;