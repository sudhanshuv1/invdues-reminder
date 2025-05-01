import React, { useState, useEffect } from 'react';
import { useSignUpMutation, useLoginWithEmailMutation } from '../features/apiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signUp, {isLoading : isSigningUp, error : signUpError}] = useSignUpMutation();
  const [loginWithEmail, {isLoading : isLoggingIn, error : logInError}] = useLoginWithEmailMutation();
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
    window.location.href = 'https://invdues-backend.onrender.com/auth/google'; // Replace with your backend URL
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
    <div className="flex flex-col items-center justify-center flex-grow bg-gray-100 px-4">
      <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
      <form
        onSubmit={handleEmailSignUp}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm"
      >
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4 relative">
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
            className="bg-blue-500 hover:cursor-pointer hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isSigningUp || isLoggingIn}
          >
            {isSigningUp ? 'Signing up...' : isLoggingIn? 'Logging In...' : 'Sign Up'}
          </button>
          {(signUpError || logInError) && <p className="text-red-500 text-sm mt-2">{error.data?.message}</p>}
        </div>
      </form>
      <div className="flex flex-col items-center">
        <p className="text-gray-600 mb-4">Or sign up with</p>
        <button
          onClick={handleGoogleSignUp}
          className="bg-red-500 hover:cursor-pointer hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign Up with Google
        </button>
      </div>
    </div>
  );
};

export default SignUp;