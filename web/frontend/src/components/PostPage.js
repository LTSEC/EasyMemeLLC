import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./PostPage.css";
import CONFIG from "../config";

const PostPage = () => {
  const { postId } = useParams(); // Get post ID from the URL
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPost = async () => {
    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/post/${postId}`);
      if (!response.ok) throw new Error("Failed to fetch post.");
      const data = await response.json();
      setPost(data.post);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/post/${postId}/like`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to like the post.");
      setPost((prevPost) => ({ ...prevPost, likes: prevPost.likes + 1 }));
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  if (isLoading) return <p>Loading post...</p>;
  if (error) return <p>{error}</p>;
  if (!post) return <p>No post found.</p>;

  return (
    <div className="post-page">
      {/* Post Image */}
      <div className="post-image-container">
        <img src={post.image_url} alt={post.title} className="post-image" />
      </div>

      {/* Post Details */}
      <div className="post-details">
        <h1 className="post-title">{post.title}</h1>
        <p className="post-creator">By: {post.creator_username}</p>
        <p className="post-stats">{post.views} views • {post.likes} likes</p>
        <button className="like-button" onClick={handleLike}>
          Like ❤️
        </button>
      </div>
    </div>
  );
};

export default PostPage;
