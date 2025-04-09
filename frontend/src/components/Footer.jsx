import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Invoice Reminder. All rights reserved.
        </p>
        <p className="text-sm mt-2">
          <a href="/contact" className="hover:underline">
            Contact Us
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;