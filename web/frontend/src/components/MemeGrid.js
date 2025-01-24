import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MemeGrid.css";
import CONFIG from "../config";

const MemeGrid = ({ isSignedIn, user }) => {
  const [memes, setMemes] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const fetchMemes = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const userId = isSignedIn && user ? user.id : null;
      const response = await fetch(
        `${CONFIG.BACKEND_URL}/get_memes?page=${page}&user_id=${userId || ""}`
      );
      console.log("Fetch Response Status:", response.status);
      const data = await response.json();
      console.log("Fetch Data:", data);

      if (response.ok) {
        setMemes(data.memes);
        setHasMore(data.memes.length === 50); // Check if there are more memes for the next page
      } else {
        console.error("Error in Response:", data.error);
      }
    } catch (error) {
      console.error("Error fetching memes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemes();
  }, [page]);

  const handleNextPage = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleBackPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`); // Navigate to the PostPage
  };

  return (
    <div className="meme-grid-container">
      <div className="meme-grid">
        {memes.map((meme) => (
          <div
            className="meme-card"
            key={meme.id}
            onClick={() => handlePostClick(meme.id)}
          >
            {/* Meme Image */}
            <div className="meme-thumbnail">
              <img src={meme.image_url} alt={meme.title} className="meme-image" />
            </div>

            {/* Meme Info */}
            <div className="meme-info">
              <div className="meme-header">
                <img
                  src={meme.creator_pfp || "/default_pfp.svg"}
                  alt={`${meme.creator_username} profile`}
                  className="creator-pfp"
                />
                <p className="meme-title">{meme.title}</p>
              </div>
              <div className="meme-meta">
                <p className="creator-username">{meme.creator_username}</p>
                <p className="meme-stats">
                  {meme.views} views • {meme.published_time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer for Page Number and Buttons */}
      <div className="pagination-footer">
        {page > 1 && (
          <button className="back-page-button" onClick={handleBackPage} disabled={isLoading}>
            {isLoading ? "Loading..." : "Back Page"}
          </button>
        )}
        <p className="page-number">Page {page}</p>
        {hasMore && (
          <button className="next-page-button" onClick={handleNextPage} disabled={isLoading}>
            {isLoading ? "Loading..." : "Next Page"}
          </button>
        )}
      </div>
    </div>
  );
};

export default MemeGrid;
