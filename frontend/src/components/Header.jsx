import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white text-gray-900 shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link to="/" className="flex items-center">
            Invoice Reminder
          </Link>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <button
            className="text-white focus:outline-none"
            id="menu-toggle"
            aria-label="Toggle navigation"
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>

        {/* Navbar Links */}
        <div className="hidden md:flex space-x-6 text-lg">
          <Link
            to="/"
            className="hover:font-bold relative group"
          >
            Home
            <span className="absolute left-0 top-7 w-full h-0.5 bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          <Link
            to="/features"
            className="hover:font-bold relative group"
          >
            Features
            <span className="absolute left-0 top-7 w-full h-0.5 bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          <Link
            to="/pricing"
            className="hover:font-bold relative group"
          >
            Pricing
            <span className="absolute left-0 top-7 w-full h-0.5 bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          <Link
            to="/contact"
            className="hover:font-bold relative group"
          >
            Contact
            <span className="absolute left-0 top-7 w-full h-0.5 bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex space-x-4">
          <Link
            to="/signin"
            className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 bg-yellow-400 text-blue-600 rounded-md hover:bg-yellow-300"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="md:hidden hidden" id="mobile-menu">
        <div className="px-4 py-2 space-y-2">
          <Link to="/" className="block hover:text-gray-200">
            Home
          </Link>
          <Link to="/features" className="block hover:text-gray-200">
            Features
          </Link>
          <Link to="/pricing" className="block hover:text-gray-200">
            Pricing
          </Link>
          <Link to="/contact" className="block hover:text-gray-200">
            Contact
          </Link>
          <Link
            to="/signin"
            className="block px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="block px-4 py-2 bg-yellow-400 text-blue-600 rounded-md hover:bg-yellow-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;