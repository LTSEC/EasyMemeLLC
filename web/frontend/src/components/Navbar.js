// src/components/Navbar.js
import React, { useState } from "react";
import "./Navbar.css"; // CSS file for styling

const Navbar = ({ onSignInClick }) => {
  const [isSignedIn, setIsSignedIn] = useState(false); // Manage signed-in state
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <nav className="navbar">
      {/* Logo Button */}
      <div className="navbar-logo">
        <button
          onClick={() => (window.location.href = "/")}
          className="logo-button"
        >
          <img
            src="/logo192.png" // Fetching logo from public folder
            alt="Logo"
            className="logo"
          />
        </button>
      </div>

      {/* Navbar Buttons */}
      <div className="navbar-buttons">
        {isSignedIn && (
          <button className="create-button">Create</button>
        )}

        {isSignedIn ? (
          <>
            {/* Notifications Button */}
            <button className="icon-button notifications-button">🔔</button>

            {/* User Dropdown */}
            <div className="user-dropdown">
              <button
                className="icon-button user-icon"
                onClick={toggleDropdown}
              >
                👤
              </button>
              {dropdownVisible && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <img
                      src="https://via.placeholder.com/40"
                      alt="User"
                      className="dropdown-avatar"
                    />
                    <p className="dropdown-username">Username</p>
                  </div>
                  <hr />
                  <ul className="dropdown-options">
                    <li onClick={() => alert("View profile clicked")}>
                      View Profile
                    </li>
                    <li onClick={() => alert("Settings clicked")}>
                      Settings
                    </li>
                    <li onClick={() => setIsSignedIn(false)}>
                      Sign Out
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Sign In Button for Unauthenticated Users */
          <button
            className="sign-in-button"
            onClick={onSignInClick} // Trigger Sign In Modal
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
