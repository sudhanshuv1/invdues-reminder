import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation } from '../features/apiSlice';
import { selectCurrentUser, selectIsAuthenticated } from '../features/authSlice';
import { logout as logoutAction } from '../features/authSlice';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const [logout] = useLogoutMutation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      
      dispatch(logoutAction());
      
      setIsDropdownOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="bg-white text-gray-900 shadow-lg">
      <nav className="container mx-auto px-4 py-4 flex shadow-md justify-between items-center">
        
        <div className="text-3xl font-bold">
          <Link to="/" className="flex items-center">
            InvDues Reminder
          </Link>
        </div>

        
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

        
        <div className="hidden md:flex space-x-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/signin"
                className="px-4 py-2 hover:cursor-pointer bg-white text-blue-600 rounded-md hover:bg-gray-100"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 hover:cursor-pointer bg-yellow-400 text-blue-600 rounded-md hover:bg-yellow-300"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="relative">
              
              <div
                className="w-10 h-10 bg-blue-500 hover:bg-blue-600 border-gray-600 shadow-md border-1 text-white rounded-full flex items-center justify-center font-bold text-lg cursor-pointer"
                title={user.name}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </div>

              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                  <button
                    onClick={handleLogout}
                    className="block w-full hover:cursor-pointer text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;