import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/authSlice';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to sign-in page with return URL
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;