// src/components/MemeGrid.js
import React from "react";
import "./MemeGrid.css";

const MemeGrid = ({ memes }) => {
  return (
    <div className="meme-grid">
      {memes.map((meme) => (
        <div className="meme-card" key={meme.id}>
          {/* Meme Image */}
          <div className="meme-thumbnail">
            <img src={meme.image} alt={meme.title} className="meme-image" />
          </div>

          {/* Meme Info */}
          <div className="meme-info">
            <div className="meme-header">
              <img
                src={meme.creatorPfp}
                alt={`${meme.creatorUsername} profile`}
                className="creator-pfp"
              />
              <p className="meme-title">{meme.title}</p>
            </div>
            <div className="meme-meta">
              <p className="creator-username">{meme.creatorUsername}</p>
              <p className="meme-stats">
                {meme.views} views • {meme.publishedTime}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemeGrid;
