import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 border-t dark:border-gray-700 text-white py-4 ">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Invoice Reminder. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;