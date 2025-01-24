import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./ProfilePage.css";
import "../theme.css";
import CONFIG from "../config";

const ProfilePage = () => {
  const location = useLocation();
  const userId = location.state?.userId; // Read userId from location state
  const [userInfo, setUserInfo] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (!userId) {
      console.error("User ID is undefined.");
      return;
    }

    // Fetch user info
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/user/${userId}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setUserInfo(data.user);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    // Fetch user posts
    const fetchUserPosts = async () => {
      try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/posts/${userId}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setUserPosts(data.posts);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    };

    fetchUserInfo();
    fetchUserPosts();
  }, [userId]);

  if (!userId) {
    return <p>Error: User ID is undefined.</p>;
  }

  if (!userInfo) {
    return <p>Loading...</p>;
  }

  return (
    <div className="body">
      <div className="profile-page">
        {/* Profile Banner */}
        <div className="profile-banner">
          <img
            src="/default_banner.png"
            alt="Banner"
            className="banner-image"
          />
        </div>

        {/* User Info Section */}
        <div className="profile-info-container">
          <img
            src={"/default_pfp.svg"}
            alt="User Icon"
            className="profile-icon"
          />
          <div className="profile-text">
            <h1 className="profile-name">{userInfo.username}</h1>
            <p className="profile-subscribers">
              {userInfo.subscriber_count} subscribers
            </p>
          </div>
        </div>

        {/* User Posts */}
        <div className="profile-posts">
          <h2 className="posts-header">Posts</h2>
          <div className="posts-grid">
            {userPosts.map((post) => (
              <div className="post-card" key={post.id}>
                <img
                  src={`${CONFIG.BACKEND_URL}${post.image_url}`} // Use the image URL from the post data
                  alt={post.title}
                  className="post-image"
                />
                <h3 className="post-title">{post.title}</h3>
                <p className="post-details">
                  {post.likes} likes • {post.views} views
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
