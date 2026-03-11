import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ role: allowedRole, children }) => {
  const { user, role } = useSelector((state) => state.auth);

  // Redirect if user not logged in or role doesn't match
  if (!user || role !== allowedRole) {
    return <Navigate to={`/${allowedRole}/login`} replace />;
  }

  // Render layout (Admin, Teacher, Student, etc.)
  return children;
};

export default ProtectedRoute;
