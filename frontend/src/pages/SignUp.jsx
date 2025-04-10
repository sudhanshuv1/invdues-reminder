import React, { useState } from 'react';
import { useSignUpMutation } from '../features/apiSlice';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUp, { isLoading, error }] = useSignUpMutation();

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await signUp({ displayName: name, email, password }).unwrap();
      console.log('User signed up successfully:', response);

      // Redirect the user to the dashboard or login page
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Sign up failed:', err);
    }
  };

  const handleGoogleSignUp = () => {
    // Redirect to the backend's Google OAuth endpoint
    const backendUrl = 'http://localhost:5000/auth/google'; // Replace with your backend URL
    console.log('Redirecting to:', backendUrl);
    window.location.href = backendUrl;
  };

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
            Sign Up
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error.data?.message}</p>}
        </div>
      </form>
      <div className="flex flex-col items-center">
        <p className="text-gray-600 mb-4">Or sign up with</p>
        <button
          onClick={handleGoogleSignUp}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign Up with Google
        </button>
      </div>
    </div>
  );
};

export default SignUp;