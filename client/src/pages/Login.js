// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// import axios from "axios";
import API from "../config/api";
import { useAuth } from "../context/AuthContext";
import "./../style.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth(); // from context

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
  email: form.email,
  password: form.password,
});

      // ✅ Pass token + user separately
      login(res.data.token, res.data.user);

      alert("✅ Login successful!");
      navigate("/");
    } catch (err) {
      console.error("❌ Login error:", err);
      alert("Invalid credentials.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to Eventra</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
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
          <button type="submit" className="auth-btn">
            Login
          </button>
        </form>
        <p className="auth-link">
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
