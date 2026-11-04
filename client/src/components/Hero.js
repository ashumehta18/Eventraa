import React from "react";
import { Link } from "react-router-dom";
import "./../style.css";

function Hero() {
  return (
    <section className="hero">
      <p className="hero-tag">✨ Discover Amazing Events ✨</p>
      <h1 className="hero-title">
        Find Your Next <span>Amazing Experience</span>
      </h1>
      <p className="hero-subtitle">
        From concerts to conferences, workshops to festivals — discover, create, 
        and book incredible events that inspire and connect.
      </p>

      {/* Search Bar */}
      <div className="search-bar">
        <input type="text" placeholder="🔍 What are you looking for?" />
        <input type="date" />
        <input type="text" placeholder="📍 City or venue" />
        <button className="btn search-btn">Search Events</button>
      </div>

      {/* Buttons below search */}
      <div className="hero-buttons">
        <Link to="/explore" className="btn-outline">🎫 Explore Events</Link>
        <Link to="/create-event" className="btn-outline">➕ Create Event</Link>
      </div>
    </section>
  );
}

export default Hero;


// src/components/Hero.js
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./../style.css";

// function Hero() {
//   const navigate = useNavigate();
//   const [filters, setFilters] = useState({
//     keyword: "",
//     date: "",
//     city: "",
//   });

//   const handleChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   const handleSearch = () => {
//     const query = new URLSearchParams();

//     if (filters.keyword) query.append("keyword", filters.keyword);
//     if (filters.date) query.append("date", filters.date);
//     if (filters.city) query.append("city", filters.city);

//     navigate(`/explore?${query.toString()}`);
//   };

//   return (
//     <section className="hero fade-slide-in">
//       <p className="hero-tag">✨ Discover Amazing Events ✨</p>
//       <h1 className="hero-title">
//         Find Your Next <span>Amazing Experience</span>
//       </h1>
//       <p className="hero-subtitle">
//         From concerts to conferences, workshops to festivals — discover, create,
//         and book incredible events that inspire and connect.
//       </p>

//       {/* 🔍 Search Bar */}
//       <div className="search-bar">
//         <input
//           type="text"
//           name="keyword"
//           placeholder="🔍 What are you looking for?"
//           value={filters.keyword}
//           onChange={handleChange}
//         />
//         <input
//           type="date"
//           name="date"
//           value={filters.date}
//           onChange={handleChange}
//         />
//         <input
//           type="text"
//           name="city"
//           placeholder="📍 City or venue"
//           value={filters.city}
//           onChange={handleChange}
//         />
//         <button className="btn search-btn" onClick={handleSearch}>
//           Search Events
//         </button>
//       </div>

//       {/* Buttons below search */}
//       <div className="hero-buttons">
//         <button
//           className="btn-outline"
//           onClick={() => navigate("/explore")}
//         >
//           🎫 Explore Events
//         </button>
//         <button
//           className="btn-outline"
//           onClick={() => navigate("/create-event")}
//         >
//           ➕ Create Event
//         </button>
//       </div>
//     </section>
//   );
// }

// export default Hero;
