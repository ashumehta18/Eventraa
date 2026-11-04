// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext"; 
import "./../style.css";

function Navbar() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth(); 

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Left: Logo */}
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img src="/logo.ico" alt="Eventra Logo" className="logo-img" />
          <span className="logo-text">Eventra</span>
        </Link>
      </div>

      {/* Center: Navigation Links */}
      <div className="nav-center">
        <Link to="/explore">Explore</Link>

        <Link to="/goodies">Goodies</Link>

        {/* ✅ Only organizers see Create Event and Venues */}
        {auth?.user?.role === "organizer" && (
          <>
            <Link to="/create-event">Create Event</Link>
            <Link to="/venues">Venues</Link>
          </>
        )}

        <Link to="/blog">Blog</Link>
        <Link to="/support">Support</Link>
      </div>

      {/* Right: Auth Buttons */}
      <div className="nav-right">
        {auth?.user ? (
          <>
            <Link to="/my-reviews" className="nav-link">
              Reviews
            </Link>
            <Link to="/profile">
              {auth.user.photo && auth.user.photo.trim() !== "" ? (
                <img
                  src={auth.user.photo}
                  alt="Profile"
                  className="nav-profile-icon"
                />
              ) : (
                <FaUserCircle className="nav-profile-icon" />
              )}
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-btn">
              Login
            </Link>
            <Link to="/signup">
              <button className="signup-btn">Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
