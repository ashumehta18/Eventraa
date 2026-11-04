import React from "react";
import { Link } from "react-router-dom";
import "./../style.css";

const blogPosts = [
  {
    id: 1,
    title: "10 Tips for Hosting a Successful Event",
    date: "August 25, 2025",
    author: "Eventra Team",
    image: "https://www.entrepreneurshipinabox.com/wp-content/uploads/10-Essential-Tips-for-Successful-Event-Planning.webp",
    excerpt: "Planning an event can be overwhelming, but with the right approach you can ensure success. Here are our top 10 tips to make your event unforgettable.",
  },
  {
    id: 2,
    title: "Why Venue Selection is the Key to Your Event",
    date: "August 20, 2025",
    author: "Eventra Team",
    image: "https://d12m9erqbesehq.cloudfront.net/wp-content/uploads/sites/2/2024/01/05091011/Blog-Banner-Event-Venue-Checklist.jpg",
    excerpt: "The venue sets the tone for your event. Learn how to choose the perfect space that aligns with your vision and audience.",
  },
  {
    id: 3,
    title: "The Future of Event Technology in 2025",
    date: "August 10, 2025",
    author: "Eventra Team",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-Vm8LFjStxtClzKFwYfQ2wtR5Liz5jk_ZvQ&s",
    excerpt: "From AI-driven scheduling to immersive AR experiences, discover the cutting-edge event tech trends shaping 2025.",
  }
];

function Blog() {
  return (
    <div className="blog-page">
      <h1 className="blog-title">📖 Eventra Blog</h1>
      <p className="blog-subtitle">Insights, tips, and trends from the world of events</p>
      
      <div className="blog-container">
        {blogPosts.map((post) => (
          <div key={post.id} className="blog-card">
            <img src={post.image} alt={post.title} className="blog-image" />
            <div className="blog-content">
              <h2>{post.title}</h2>
              <p className="blog-meta">By {post.author} | {post.date}</p>
              <p>{post.excerpt}</p>
              <Link to={`/blog/${post.id}`} className="read-more">Read More →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Blog;

