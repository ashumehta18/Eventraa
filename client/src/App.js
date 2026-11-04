// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import TrendingEvents from "./components/TrendingEvents";
import Features from "./components/Features";

// Pages
import Explore from "./pages/Explore";
import CreateEvent from "./pages/CreateEvent";
import CreateVenue from "./pages/CreateVenue"; // original
import CreateVenueNew from "./pages/CreateVenueNew"; // new form page
import EditVenue from "./pages/EditVenue"; // <-- newly added
import Venues from "./pages/Venues";
import Goodies from "./pages/Goodies";
import Blog from "./pages/Blog";
import Support from "./pages/Support";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EventDetails from "./pages/EventDetails";
import VenueDetails from "./pages/VenueDetails";
import BlogPost from "./pages/BlogPost";
import Profile from "./pages/Profile";
import MyReviews from "./pages/MyReviews";
import OrderConfirmation from "./pages/OrderConfirmation";

// Auth wrappers
import ProtectedRoute from "./components/ProtectedRoute";
import OrganizerRoute from "./components/OrganizerRoute";
import { AuthProvider } from "./context/AuthContext";

console.log("force rebuild 2026 fix");
// Home Page Layout
function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <TrendingEvents />
      <Features />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <ChatWidget />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/goodies" element={<Goodies />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/venues/:id" element={<VenueDetails />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:postId" element={<BlogPost />} />
          <Route path="/support" element={<Support />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reviews"
            element={
              <ProtectedRoute>
                <MyReviews />
              </ProtectedRoute>
            }
          />

          {/* Organizer-only Routes */}
          <Route
            path="/create-event"
            element={
              <OrganizerRoute>
                <CreateEvent />
              </OrganizerRoute>
            }
          />
          <Route
            path="/create-venue"
            element={
              <OrganizerRoute>
                <CreateVenue />
              </OrganizerRoute>
            }
          />
          <Route
            path="/venues/create"
            element={
              <OrganizerRoute>
                <CreateVenueNew />
              </OrganizerRoute>
            }
          />
          <Route
            path="/venues/edit/:id"  // <-- Added route for editing
            element={
              <OrganizerRoute>
                <EditVenue />
              </OrganizerRoute>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
