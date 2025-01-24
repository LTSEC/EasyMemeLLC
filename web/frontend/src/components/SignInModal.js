import React, { useState } from "react";
import "./SignInModal.css";
import CONFIG from "../config";

const SignInModal = ({ onClose, onSignIn }) => {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    birthday: "",
    password: "",
    identifier: "", // For sign-in
  });
  const [message, setMessage] = useState(""); // For success/error messages

  const toggleCreateAccount = () => {
    setIsCreatingAccount(!isCreatingAccount);
    setMessage(""); // Clear any previous messages
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isCreatingAccount ? "/create_user" : "/sign_in";
    const payload = isCreatingAccount
      ? {
          username: formData.username,
          email: formData.email,
          birthday: formData.birthday,
          password: formData.password,
        }
      : {
          identifier: formData.identifier,
          password: formData.password,
        };

    try {
      const response = await fetch(`${CONFIG.BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(result.message || "Success!");
        if (isCreatingAccount) {
          // Automatically sign in after account creation
          onSignIn(result.user);
        } else {
          // Update global state after successful sign-in
          onSignIn(result.user);
          onClose(); // Close modal after sign-in
        }
      } else {
        setMessage(result.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Close Button */}
        <button className="close-button" onClick={onClose}>
          ✖
        </button>

        {isCreatingAccount ? (
          <div className="create-account-screen">
            <h2>Create Account</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="birthday">Birthday</label>
                <input
                  type="date"
                  id="birthday"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" className="submit-button">
                Create Account
              </button>
            </form>
            <p className="switch-text">
              Already have an account?{" "}
              <button
                type="button"
                onClick={toggleCreateAccount}
                className="switch-button"
              >
                Sign In
              </button>
            </p>
          </div>
        ) : (
          <div className="sign-in-screen">
            <h2>Sign In</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="identifier">Username or Email</label>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="Enter your username or email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" className="submit-button">
                Sign In
              </button>
            </form>
            <p className="switch-text">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={toggleCreateAccount}
                className="switch-button"
              >
                Create Account
              </button>
            </p>
          </div>
        )}
        {message && <p className="message-text">{message}</p>}
      </div>
    </div>
  );
};

export default SignInModal;
