import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // If user doesn't have the required role, redirect to home or unauthorized page
    // For now, let's redirect to login or show an alert/message? 
    // Redirecting to login might be confusing if they are already logged in but just wrong role.
    // Maybe just return null or a message.
    // But usually redirection is safer.
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
