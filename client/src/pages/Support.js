// client/src/pages/Support.js
import React, { useState } from "react";
import axios from "axios";
import "./../style.css";

function Support() {
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "Select a category",
    subject: "",
    issue: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send data to backend
      await axios.post("/api/support", formData);

      // Show success message
      setIsSent(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        category: "Select a category",
        subject: "",
        issue: "",
      });

      // Hide message after 3 seconds
      setTimeout(() => setIsSent(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to submit support request.");
    }
  };

  return (
    <div className="support-page">
      {/* Header */}
      <section className="support-header">
        <h1>How Can We Help?</h1>
        <p>
          Get the support you need. Browse our FAQs, contact our team, or start
          a live chat.
        </p>
      </section>

      {/* Support Options */}
      <section className="support-options">
        <div className="support-card">
          <span className="icon">📧</span>
          <h3>Email Support</h3>
          <p>Get help via email</p>
          <p className="highlight">teamEventra4u@gmail.com</p>
          <small>Response within 24 hours</small>
        </div>

        <div className="support-card">
          <span className="icon">📞</span>
          <h3>Phone Support</h3>
          <p>Talk to our team</p>
          <p className="highlight">1234567890</p>
          <small>Mon-Fri, 9AM-6PM EST</small>
        </div>

        <div className="support-card">
          <span className="icon">💬</span>
          <h3>Live Chat</h3>
          <p>Instant help available</p>
          <button className="chat-btn">Start Chat</button>
        </div>
      </section>

      {/* FAQ + Contact Form */}
      <section className="faq-contact">
        {/* FAQ Section */}
        <div className="faq">
          <h2>Frequently Asked Questions</h2>
          <input type="text" placeholder="Search FAQs..." className="faq-search" />

          <div className="faq-item">
            <h4>How do I book an event ticket?</h4>
            <p>You can book tickets through the Explore Events section.</p>
          </div>

          <div className="faq-item">
            <h4>Can I cancel or refund my ticket?</h4>
            <p>Yes, refunds are available depending on organizer policies.</p>
          </div>

          <div className="faq-item">
            <h4>How do I create an event as an organizer?</h4>
            <p>Go to Create Event and follow the guided steps.</p>
          </div>
        </div>

        {/* Contact Us Form */}
        <div className="contact-form">
          <h2>Contact Us</h2>
          <form onSubmit={handleSubmit}>
            {isSent && (
              <div className="success-message">
                ✅ Your message has been sent successfully! We'll get back to you soon.
              </div>
            )}
            <input
              type="text"
              name="name"
              placeholder="Name *"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option>Select a category</option>
              <option>Ticket Issue</option>
              <option>Event Creation</option>
              <option>Payment</option>
              <option>Other</option>
            </select>
            <input
              type="text"
              name="subject"
              placeholder="Subject *"
              value={formData.subject}
              onChange={handleChange}
              required
            />
            <textarea
              name="issue"
              placeholder="Describe your issue..."
              rows="5"
              value={formData.issue}
              onChange={handleChange}
              required
            />
            <button type="submit" className="send-btn">
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Support;
