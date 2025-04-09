import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col flex-grow items-center justify-center h-full bg-gray-100 px-4">
      <h1 className="text-4xl font-bold mb-4 text-center">
        Welcome to Invoice Reminder
      </h1>
      <p className="text-lg text-gray-600 text-center mb-6">
        Manage your invoices and follow-ups effortlessly.
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Link
          to="/signin"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
        >
          Sign In
        </Link>
        <Link
          to="/signup"
          className="px-6 py-3 bg-yellow-400 text-blue-600 rounded-md hover:bg-yellow-300 text-center"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Home;