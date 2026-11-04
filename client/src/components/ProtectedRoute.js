import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { auth } = useAuth();

  if (auth === null) {
    return <h2>⏳ Checking authentication...</h2>;
  }

  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
