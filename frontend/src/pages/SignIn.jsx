import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginWithEmailMutation } from '../features/apiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/authSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import GoogleIcon from '../assets/google-icon.svg';


const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginWithEmail, { isLoading, error }] = useLoginWithEmailMutation();
  const dispatch = useDispatch();

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await loginWithEmail({ email, password }).unwrap();
      console.log('Login successful:', response);

      // Dispatch action to set credentials in Redux store
      dispatch(
        setCredentials({
          user: response.foundUser, // Assuming the response contains user info
          accessToken: response.accessToken,
        })
      );

      // Redirect the user to the dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const navigate = useNavigate();

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

  const handleGoogleSignIn = () => {
    // Redirect to the backend's Google OAuth route
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`; // Replace with your backend URL
  };

  // Import the colored Google icon SVG

  return (
    <div className="flex flex-col items-center justify-center flex-grow bg-gray-100 px-4">
      <h1 className="text-3xl font-bold mb-6">Sign In</h1>
      <form
        onSubmit={handleEmailSignIn}
        className="bg-white border border-lime-300 shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm"
      >
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-6 relative">
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-9 hover:cursor-pointer text-gray-400 hover:text-gray-500"
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 hover:cursor-pointer text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error.data?.message}</p>}
        </div>
      </form>
      <div className="flex flex-col items-center">
        <p className="text-gray-900 font-bold text-lg mb-4">Or</p>
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center gap-2 border border-lime-300 hover:border-lime-400 hover:shadow-lg hover:cursor-pointer text-gray-700 font-semibold py-2 px-4 rounded shadow-md focus:shadow-outline"
        >
          Sign in with
          <span className="w-5 h-5 flex items-center">
            <img src={GoogleIcon} alt="Google" className="w-5 h-5" />
          </span>
        </button>
      </div>
    </div>
  );
};

export default SignIn;