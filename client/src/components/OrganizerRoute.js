import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function OrganizerRoute({ children }) {
  const { auth } = useAuth();

  // ⏳ Prevent redirect until auth is loaded
  if (auth === null) {
    return <h2>⏳ Checking permissions...</h2>;
  }

  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  if (auth.user.role !== "organizer") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default OrganizerRoute;
