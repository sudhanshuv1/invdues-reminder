import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/authSlice';

const Home = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="relative flex flex-col items-center justify-center flex-grow bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 transition-colors duration-200">
      {/* Professional Invoice-themed Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-indigo-100/30 to-purple-100/40 dark:from-blue-900/20 dark:via-indigo-900/15 dark:to-purple-900/20"></div>
        
        {/* Invoice Document Elements */}
        <div className="absolute top-10 left-10 w-48 h-64 bg-white/10 dark:bg-white/5 rounded-lg border border-white/20 dark:border-white/10 backdrop-blur-sm rotate-12 shadow-sm">
          <div className="p-4 space-y-2">
            <div className="h-3 bg-blue-300/30 dark:bg-blue-600/30 rounded w-3/4"></div>
            <div className="h-2 bg-gray-300/30 dark:bg-gray-600/30 rounded w-1/2"></div>
            <div className="h-2 bg-gray-300/30 dark:bg-gray-600/30 rounded w-2/3"></div>
            <div className="mt-4 space-y-1">
              <div className="h-2 bg-green-300/30 dark:bg-green-600/30 rounded w-full"></div>
              <div className="h-2 bg-green-300/30 dark:bg-green-600/30 rounded w-4/5"></div>
              <div className="h-2 bg-green-300/30 dark:bg-green-600/30 rounded w-3/4"></div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-20 right-16 w-40 h-56 bg-white/10 dark:bg-white/5 rounded-lg border border-white/20 dark:border-white/10 backdrop-blur-sm -rotate-6 shadow-md">
          <div className="p-3 space-y-2">
            <div className="h-2 bg-purple-300/30 dark:bg-purple-600/30 rounded w-full"></div>
            <div className="h-2 bg-gray-300/30 dark:bg-gray-600/30 rounded w-3/4"></div>
            <div className="h-2 bg-gray-300/30 dark:bg-gray-600/30 rounded w-1/2"></div>
            <div className="mt-3 space-y-1">
              <div className="h-2 bg-yellow-300/30 dark:bg-yellow-600/30 rounded w-full"></div>
              <div className="h-2 bg-yellow-300/30 dark:bg-yellow-600/30 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-16 left-20 w-44 h-60 bg-white/10 dark:bg-white/5 rounded-lg border border-white/20 dark:border-white/10 backdrop-blur-sm rotate-6 shadow-sm">
          <div className="p-4 space-y-2">
            <div className="h-3 bg-indigo-300/30 dark:bg-indigo-600/30 rounded w-2/3"></div>
            <div className="h-2 bg-gray-300/30 dark:bg-gray-600/30 rounded w-full"></div>
            <div className="h-2 bg-gray-300/30 dark:bg-gray-600/30 rounded w-3/4"></div>
            <div className="mt-4 space-y-1">
              <div className="h-2 bg-red-300/30 dark:bg-red-600/30 rounded w-full"></div>
              <div className="h-2 bg-red-300/30 dark:bg-red-600/30 rounded w-4/5"></div>
              <div className="h-2 bg-red-300/30 dark:bg-red-600/30 rounded w-2/3"></div>
            </div>
          </div>
        </div>
        
        {/* Floating Invoice Icons */}
        <div className="absolute top-32 right-32 w-12 h-12 bg-blue-500/20 dark:bg-blue-400/20 rounded-full flex items-center justify-center animate-float">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <div className="absolute bottom-32 right-20 w-10 h-10 bg-green-500/20 dark:bg-green-400/20 rounded-full flex items-center justify-center animate-float animation-delay-1000">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        
        <div className="absolute top-1/2 left-16 w-8 h-8 bg-purple-500/20 dark:bg-purple-400/20 rounded-full flex items-center justify-center animate-float animation-delay-2000">
          <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div className="absolute bottom-40 left-1/3 w-11 h-11 bg-indigo-500/20 dark:bg-indigo-400/20 rounded-full flex items-center justify-center animate-float animation-delay-3000">
          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        {/* Geometric Patterns */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 border border-blue-300/20 dark:border-blue-600/20 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 border border-purple-300/20 dark:border-purple-600/20 rounded-full animate-spin-slow animation-delay-4000"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.5) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
        
        {/* Professional Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10 dark:from-gray-900/20 dark:via-transparent dark:to-gray-900/10"></div>
      </div>
      {/* Hero Section - Reduced padding */}
      <div className="flex-grow z-10 flex items-center justify-center py-2">
        <div className="px-16 mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 text-center lg:text-left">
            {/* Main Heading - Reduced margins */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-sm font-medium mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Lightning Fast Reminders
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Never Miss a Payment
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-2">
                  Again
                </span>
              </h1>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 mb-6">
                Automate your invoice reminders and get paid faster with our intelligent reminder system.
                <span className="block mt-1 text-blue-600 dark:text-blue-400 font-semibold">
                  Professional invoice management solution
                </span>
              </p>
            </div>

            {/* Key Features Grid - Reduced spacing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="group bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  Automated Reminders
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Set up once and let the system handle all your payment reminders automatically
                </p>
              </div>

              <div className="group bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  Smart Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Track payment patterns and optimize your collection strategy with insights
                </p>
              </div>

              <div className="group bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  Custom Templates
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Personalize your reminder emails with custom templates and branding
                </p>
              </div>
            </div>

            {/* Trust Indicators - Reduced spacing */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </div>

          {/* Right Column - CTA Card - Reduced padding */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden">
              {/* Decorative gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10"></div>
              
              {/* Decorative dots - smaller */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-10"></div>
              <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full opacity-10"></div>
              
              <div className="relative">
                <div className="text-center mb-5">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Ready to Get Started?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Join modern businesses streamlining their invoice management
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Link
                    to="/signup"
                    className="px-3 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-1 text-sm"
                  >
                    Get Started
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  
                  <Link
                    to="/signin"
                    className="px-3 py-2.5 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-1 text-sm"
                  >
                    Sign In
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </Link>
                </div>

                {/* Quick Stats - Reduced spacing */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">100%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">24/7</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Monitoring</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">5min</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Setup</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;