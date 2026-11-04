import React from "react";
import "./../style.css";

const categories = [
  { icon: "🎵", name: "Concerts" },
  { icon: "💻", name: "Tech" },
  { icon: "⚽", name: "Sports" },
  { icon: "🎨", name: "Arts" },
  { icon: "🍽️", name: "Food" },
  { icon: "💼", name: "Business" },
  { icon: "🧘", name: "Health" },
  { icon: "📚", name: "Education" },
];

function Categories() {
  return (
    <section className="categories-section">
      <h2 className="section-title">Explore by Category</h2>
      <p className="section-subtitle">
        Find events that match your interests and passions
      </p>
      <div className="categories-grid">
        {categories.map((cat, index) => (
          <div key={index} className="category-card">
            <span className="category-icon">{cat.icon}</span>
            <h3>{cat.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;
