import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation } from '../features/apiSlice';
import { selectCurrentUser, selectIsAuthenticated } from '../features/authSlice';
import { logout as logoutAction } from '../features/authSlice';
import { toggleTheme, selectCurrentTheme } from '../features/themeSlice';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const [logout, {isLoading}] = useLogoutMutation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentTheme = useSelector(selectCurrentTheme);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Apply theme on component mount and theme change
  useEffect(() => {
    console.log('Header - Current theme:', currentTheme); // Debug log
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme]);

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

  const handleThemeToggle = () => {
    console.log('Theme toggle clicked! Current theme:', currentTheme); // Debug log
    dispatch(toggleTheme());
  };

  return (
    <header className="text-gray-900 dark:text-gray-300 bg-gradient-to-r from-cyan-300 to-fuchsia-300 dark:from-cyan-800 dark:to-fuchsia-800 shadow-md transition-colors duration-200">
      <nav className="container mx-auto px-4 py-4 flex shadow-md justify-between items-center">
        
        <div className="text-3xl font-bold">
          <Link to="/" className="flex items-center">
            InvDues Reminder
          </Link>
        </div>

        
        <div className="hidden md:flex space-x-6 text-lg">
          <Link to="/" className="hover:font-bold relative group">
            Home
            <span className="absolute left-0 top-7 w-full h-0.5 bg-gray-900 dark:bg-gray-100 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          <Link to="/features" className="hover:font-bold relative group">
            Features
            <span className="absolute left-0 top-7 w-full h-0.5 bg-gray-900 dark:bg-gray-100 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          <Link to="/pricing" className="hover:font-bold relative group">
            Pricing
            <span className="absolute left-0 top-7 w-full h-0.5 bg-gray-900 dark:bg-gray-100 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          <Link to="/contact" className="hover:font-bold relative group">
            Contact
            <span className="absolute left-0 top-7 w-full h-0.5 bg-gray-900 dark:bg-gray-100 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
        </div>

        
        <div className="hidden md:flex space-x-4 items-center">
          {!isAuthenticated ? (
            <>
              <Link
                to="/signin"
                className="px-4 py-2 hover:cursor-pointer bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 hover:cursor-pointer bg-yellow-400 dark:bg-yellow-500 text-blue-600 dark:text-gray-900 rounded-md hover:bg-yellow-300 dark:hover:bg-yellow-400 transition-colors duration-200"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              {/* Theme Toggle Button */}
              <button
                onClick={handleThemeToggle}
                className="w-10 h-10 bg-gray-200 shadow-md border border-lime-300 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center transition-colors duration-200"
                title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
              >
                {currentTheme === 'light' ? (
                  // Moon icon for light mode (clicking will switch to dark)
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                ) : (
                  // Sun icon for dark mode (clicking will switch to light)
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                )}
              </button>

              {/* User Avatar and Dropdown */}
              <div className="relative">
                <div
                  className="w-10 h-10 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 border-gray-600 shadow-md border-1 text-white rounded-full flex items-center justify-center font-bold text-lg cursor-pointer transition-colors duration-200"
                  title={user?.displayName}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  {user?.displayName?.charAt(0).toUpperCase()}
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-50 right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                    <button
                      onClick={handleLogout}
                      className="block w-full hover:cursor-pointer text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;