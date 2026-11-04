// src/pages/Signup.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../config/api";
import { useAuth } from "../context/AuthContext";
import "./../style.css";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user", // default role
  });

  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ use AuthContext

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    try {
      const res = await API.post("/auth/register", {
  name: form.name,
  email: form.email,
  password: form.password,
  role: form.role,
});

      // ✅ Auto-login after signup (fix: pass token, user separately)
      login(res.data.token, res.data.user);

      alert("🎉 Signup successful! Welcome to Eventra.");
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed. Try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Your Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="auth-input"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="auth-input"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="auth-input"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="auth-input"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          {/* ✅ Role selection */}
          <label className="auth-label">Register as:</label>
          <select
            name="role"
            className="auth-input"
            value={form.role}
            onChange={handleChange}
          >
            <option value="user">Normal User</option>
            <option value="organizer">Organizer</option>
          </select>

          <button type="submit" className="auth-btn">
            Sign Up
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
