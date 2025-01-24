import React, { useState } from "react";
import "./CreateMemeModal.css";
import CONFIG from "../config";

const CreateMemeModal = ({ onClose }) => {
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // For preview
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [alignment, setAlignment] = useState("bottom");
  const [fontSize, setFontSize] = useState(24); // State to control text size

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // Store the file for uploading
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result); // For preview
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!image || !title || !text) {
      alert("Please fill out all fields!");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user")); // Assuming user ID is stored in localStorage
    if (!user) {
      alert("You must be signed in to create a meme!");
      return;
    }

    // Prepare FormData for image upload
    const formData = new FormData();
    formData.append("user", user.id);
    formData.append("title", title);
    formData.append("text", text);
    formData.append("alignment", alignment);
    formData.append("font_size", fontSize);
    formData.append("image", image);

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}/create_meme`, {
        method: "POST",
        body: formData, // FormData handles headers automatically
      });

      const data = await response.json();
      if (response.ok) {
        alert("Meme created successfully!");
        setTitle("");
        setText("");
        setImage(null);
        setPreviewImage(null);
        onClose(); // Close the modal
      } else {
        alert(data.error || "An error occurred while creating the meme.");
      }
    } catch (error) {
      console.error("Error creating meme:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ✖
        </button>
        <h2>Create Meme</h2>

        <div className="form-group">
          <label htmlFor="title">Post Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your meme"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Upload Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageUpload}
            required
          />
        </div>

        {previewImage && (
          <div className="meme-preview">
            <img src={previewImage} alt="Meme Preview" className="preview-image" />
            <div
              className={`meme-text ${alignment}`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {text.toUpperCase()}
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="text">Text</label>
          <input
            type="text"
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter meme text"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fontSize">Text Size</label>
          <input
            type="range"
            id="fontSize"
            min="16"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="alignment">Text Alignment</label>
          <select
            id="alignment"
            value={alignment}
            onChange={(e) => setAlignment(e.target.value)}
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>

        <button className="submit-button" onClick={handleSubmit}>
          Submit Meme
        </button>
      </div>
    </div>
  );
};

export default CreateMemeModal;
