import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignUpMutation, useLoginWithEmailMutation } from '../features/apiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/authSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import GoogleIcon from '../assets/google-icon.svg';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signUp, { isLoading: isSigningUp, error: signUpError }] = useSignUpMutation();
  const [loginWithEmail, { isLoading: isLoggingIn, error: logInError }] = useLoginWithEmailMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    try {
      // Sign up the user
      const signUpResponse = await signUp({ displayName: name, email, password }).unwrap();
      console.log('User signed up successfully:', signUpResponse);

      // Automatically sign in the user
      const loginResponse = await loginWithEmail({ email, password }).unwrap();
      console.log('User logged in successfully:', loginResponse);

      // Save credentials in Redux and localStorage
      dispatch(
        setCredentials({
          user: loginResponse.foundUser, // Assuming the response contains user info
          accessToken: loginResponse.accessToken,
        })
      );
      localStorage.setItem('accessToken', loginResponse.accessToken);
      localStorage.setItem('user', JSON.stringify(loginResponse.foundUser));

      // Redirect to the dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Sign up or login failed:', err);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`; // Replace with your backend URL
  };

  useEffect(() => {
    // Check if the URL contains an accessToken query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const name = urlParams.get('name');

    if (accessToken && name) {
      // Save the access token in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify({ displayName: name }));
      // Redirect to the dashboard
      dispatch(
        setCredentials({
          user: { displayName: name }, 
          accessToken: accessToken,
        })
      );
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="relative flex flex-col items-center justify-center flex-grow bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 transition-colors duration-200">
      {/* Professional Invoice-themed Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-indigo-100/30 to-purple-100/40 dark:from-blue-900/20 dark:via-indigo-900/15 dark:to-purple-900/20"></div>
        
        {/* Invoice Document Elements */}
        <div className="absolute top-10 left-10 w-48 h-64 bg-white/10 dark:bg-white/5 rounded-lg border border-white/20 dark:border-white/10 backdrop-blur-sm rotate-12 shadow-xl">
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
        
        <div className="absolute top-20 right-16 w-40 h-56 bg-white/10 dark:bg-white/5 rounded-lg border border-white/20 dark:border-white/10 backdrop-blur-sm -rotate-6 shadow-xl">
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
        
        <div className="absolute bottom-16 left-20 w-44 h-60 bg-white/10 dark:bg-white/5 rounded-lg border border-white/20 dark:border-white/10 backdrop-blur-sm rotate-6 shadow-xl">
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

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white font-serif tracking-wide">
          Sign up to <span className='font-mono text-blue-600 dark:text-blue-400 font-semibold'>invdues-reminder</span>
        </h1>
        <form
          onSubmit={handleEmailSignUp}
          className="bg-white dark:bg-gray-800 border border-lime-100 shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 w-full max-w-sm backdrop-blur-sm"
        >
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 font-sans"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="shadow appearance-none border dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 font-sans"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 font-sans"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="shadow appearance-none border dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 font-sans"
              required
            />
          </div>
          <div className="mb-6 relative">
            <label
              htmlFor="password"
              className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 font-sans"
            >
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="shadow appearance-none border dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 font-sans"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-9 hover:cursor-pointer text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:cursor-pointer text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform hover:scale-105 transition-all duration-200 shadow-lg font-sans"
              disabled={isSigningUp || isLoggingIn}
            >
              {isSigningUp ? 'Signing up...' : isLoggingIn ? 'Logging in...' : 'Sign Up'}
            </button>
            {(signUpError || logInError) && (
              <p className="text-red-500 text-sm mt-2 font-sans">
                {signUpError?.data?.message || logInError?.data?.message}
              </p>
            )}
          </div>
        </form>
        <div className="flex flex-col items-center">
          <p className="text-gray-900 dark:text-gray-100 font-medium text-lg mb-4 font-sans">Or</p>
          <button
            onClick={handleGoogleSignUp}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 shadow-md border border-lime-100 hover:shadow-lime-300 hover:cursor-pointer text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded shadow-md transform hover:scale-105 transition-all duration-200 font-sans"
          >
            Sign up with
            <span className="w-5 h-5 flex items-center">
              <img src={GoogleIcon} alt="Google" className="w-5 h-5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;