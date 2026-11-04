import React from "react";
import { Link } from "react-router-dom";
import "./../style.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Left Section */}
        <div className="footer-col">
          <h2 className="footer-logo">
            <img src="/logo.ico" alt="Eventra Logo" className="footer-logo-img" /> Eventra
          </h2>
          <p>
            Discover, create, and book amazing events. <br />
            Your gateway to unforgettable experiences.
          </p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/explore">Explore Events</Link></li>
            <li><Link to="/create-event">Create Event</Link></li>
            <li><Link to="/venues">Find Venues</Link></li>
            <li><Link to="/support">Support</Link></li>
          </ul>
        </div>

        {/* Support Info */}
        <div className="footer-col">
          <h3>Support</h3>
          <p>📧 ashu.2005.mehta@gmail.com</p>
          <p>📞 +91 70821-00038</p>
        </div>

        {/* Newsletter */}
        <div className="footer-col">
          <h3>Stay Updated</h3>
          <p>Get the latest events and exclusive offers delivered to your inbox.</p>
          <form className="newsletter">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 Eventra. All rights reserved. Built with ❤️ for amazing events.</p>
      </div>
    </footer>
  );
}

export default Footer;
