import React from "react";
import "./../style.css";

function Features() {
  return (
    <section className="features-section">
      <h2 className="section-title">Why Choose Eventra?</h2>
      <p className="section-subtitle">
        The complete platform for discovering, creating, and managing amazing events
      </p>

      <div className="features-container">
        <div className="feature-card">
          <div className="feature-icon">✨</div>
          <h3>Discover Amazing Events</h3>
          <p>
            Find events that match your interests with our smart search and
            personalized recommendations.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h3>Easy Event Creation</h3>
          <p>
            Create and manage your events with our intuitive tools and
            comprehensive venue booking system.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">👥</div>
          <h3>Connect & Engage</h3>
          <p>
            Join a community of event lovers and create lasting memories with
            like-minded people.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Features;
