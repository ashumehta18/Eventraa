import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
});

API.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("eventra_auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch (err) {
    // ignore malformed stored auth
  }
  return config;
});

export default API;