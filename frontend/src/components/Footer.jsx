import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 border-t dark:border-gray-700 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          {/* Left Section - Brand and Copyright */}
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium">
              <span className="font-mono text-blue-400">invdues-reminder</span>
            </div>
            <div className="hidden md:block text-gray-400">|</div>
            <div className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} All rights reserved.
            </div>
          </div>

          {/* Center Section - Quick Links */}
          <div className="flex items-center space-x-6 text-xs">
            <Link to="/features" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
              Features
            </Link>
            <Link to="/pricing" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
              Pricing
            </Link>
            <a 
              href="https://sudhanshu-tiwari.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
            >
              Support
            </a>
          </div>

          {/* Right Section - Status and Social */}
          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-400">
              Made with ❤️ for businesses
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;