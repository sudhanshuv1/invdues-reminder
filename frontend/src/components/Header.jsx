import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

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

  // Helper function to check if a link is active
  const isActiveLink = (path) => {
    console.log('Checking active link for:', path, 'Current pathname:', location.pathname); // Debug log
    
    if (path === '/') {
      // Home link is active only on exact root path
      return location.pathname === '/';
    }
    // Other links are active if current path starts with the link path
    return location.pathname.startsWith(path);
  };

  return (
    <header className="text-gray-900 font-sans dark:text-gray-300 bg-gradient-to-r from-cyan-300 to-fuchsia-300 dark:from-cyan-800 dark:to-fuchsia-800 shadow-md transition-colors duration-200">
      <nav className="container mx-auto px-16 py-4 flex shadow-md justify-between items-center">
        
        <div className="text-3xl font-bold">
          <Link to="/" className="flex items-center">
            invdues-reminder
          </Link>
        </div>

        
        <div className="hidden md:flex space-x-6 text-lg">
          <Link to="/" className={`hover:font-bold relative group ${isActiveLink('/') ? 'font-bold' : ''}`}>
            home
            <span className={`absolute left-0 top-7 w-full h-0.5 bg-gray-900 dark:bg-gray-100 transition-transform origin-left ${
              isActiveLink('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}></span>
          </Link>
          <Link to="/features" className={`hover:font-bold relative group ${isActiveLink('/features') ? 'font-bold' : ''}`}>
            features
            <span className={`absolute left-0 top-7 w-full h-0.5 bg-gray-900 dark:bg-gray-100 transition-transform origin-left ${
              isActiveLink('/features') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}></span>
          </Link>
          <Link to="/pricing" className={`hover:font-bold relative group ${isActiveLink('/pricing') ? 'font-bold' : ''}`}>
            pricing
            <span className={`absolute left-0 top-7 w-full h-0.5 bg-gray-900 dark:bg-gray-100 transition-transform origin-left ${
              isActiveLink('/pricing') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}></span>
          </Link>
          <Link
            to="https://sudhanshu-tiwari.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:font-bold relative group"
          >
            contact
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
                  <div className="absolute z-50 right-0 mt-3 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden">
                    {/* User Info Section */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {user?.displayName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {user?.displayName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">My Profile</span>
                      </Link>
                      
                      <Link
                        to="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 4h4" />
                        </svg>
                        <span className="font-medium">Dashboard</span>
                      </Link>
                      
                      <Link
                        to="/dashboard/mail-settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">Email Settings</span>
                      </Link>
                    </div>
                    
                    {/* Logout Section */}
                    <div className="border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 group"
                        disabled={isLoading}
                      >
                        <svg className="w-4 h-4 mr-3 text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">
                          {isLoading ? 'Logging out...' : 'Sign Out'}
                        </span>
                        {isLoading && (
                          <div className="ml-auto">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          </div>
                        )}
                      </button>
                    </div>
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