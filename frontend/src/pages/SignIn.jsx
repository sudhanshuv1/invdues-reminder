import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginWithEmailMutation } from '../features/apiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/authSlice';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleGoogleSignIn = () => {
    // Redirect to the backend's Google OAuth route
    window.location.href = 'http://localhost:5000/auth/google'; // Replace with your backend URL
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow bg-gray-100 px-4">
      <h1 className="text-3xl font-bold mb-6">Sign In</h1>
      <form
        onSubmit={handleEmailSignIn}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm"
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
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isLoading}
          >
            Sign In
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error.data?.message}</p>}
        </div>
      </form>
      <div className="flex flex-col items-center">
        <p className="text-gray-600 mb-4">Or sign in with</p>
        <button
          onClick={handleGoogleSignIn}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign In with Google
        </button>
      </div>
    </div>
  );
};

export default SignIn;