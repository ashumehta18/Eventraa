import React from "react";
import { useParams, Link } from "react-router-dom";
import "./../style.css";

const blogPosts = [
  {
    id: 1,
    title: "10 Tips for Hosting a Successful Event",
    date: "August 25, 2025",
    author: "Eventra Team",
    image: "https://www.entrepreneurshipinabox.com/wp-content/uploads/10-Essential-Tips-for-Successful-Event-Planning.webp",
    fullContent: "Planning an event can be overwhelming, but with the right approach you can ensure success. Here are our top 10 tips to make your event unforgettable. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras a arcu vel odio finibus fringilla. Fusce at efficitur orci. Maecenas sed mauris id nulla dignissim tincidunt a ac dui. Donec ac tortor eget erat hendrerit tristique.",
  },
  {
    id: 2,
    title: "Why Venue Selection is the Key to Your Event",
    date: "August 20, 2025",
    author: "Eventra Team",
    image: "https://d12m9erqbesehq.cloudfront.net/wp-content/uploads/sites/2/2024/01/05091011/Blog-Banner-Event-Venue-Checklist.jpg",
    fullContent: "The venue sets the tone for your event. Learn how to choose the perfect space that aligns with your vision and audience. Proin vel justo non justo tincidunt ultrices. Duis vel neque id enim lacinia tempus. Sed non ex ac massa feugiat dictum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nullam at nunc ut nulla ultrices tincidunt.",
  },
  {
    id: 3,
    title: "The Future of Event Technology in 2025",
    date: "August 10, 2025",
    author: "Eventra Team",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-Vm8LFjStxtClzKFwYfQ2wtR5Liz5jk_ZvQ&s",
    fullContent: "From AI-driven scheduling to immersive AR experiences, discover the cutting-edge event tech trends shaping 2025. Fusce scelerisque velit at est malesuada, a dapibus leo gravida. Sed eu sem id sapien feugiat bibendum eu eu nunc. Nam ac risus a ipsum cursus facilisis. Aliquam in elit a eros malesuada tristique in eu ex.",
  },
];

function BlogPost() {
  const { postId } = useParams();
  const post = blogPosts.find((p) => p.id === parseInt(postId));

  if (!post) {
    return <div className="blog-page">Post not found!</div>;
  }

  return (
    <div className="blog-page blog-detail">
      <Link to="/blog" className="back-link">← Back to all posts</Link>
      <img src={post.image} alt={post.title} className="detail-image" />
      <div className="detail-content">
        <h1>{post.title}</h1>
        <p className="detail-meta">By {post.author} | {post.date}</p>
        <p className="detail-text">{post.fullContent}</p>
      </div>
    </div>
  );
}

export default BlogPost;
