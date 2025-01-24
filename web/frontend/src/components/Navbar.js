import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateMemeModal from "./CreateMemeModal"; // Import the modal component
import "./Navbar.css"; // CSS file for styling

const Navbar = ({ isSignedIn, user, onSignOut, onSignInClick }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isCreateMemeVisible, setIsCreateMemeVisible] = useState(false); // State to control modal visibility
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleViewProfile = () => {
    toggleDropdown();
    if (user?.id) {
      navigate("/profile", { state: { userId: user.id } }); // Pass userId through state
    } else {
      console.error("User ID is undefined.");
    }
  };

  const openCreateMemeModal = () => {
    setIsCreateMemeVisible(true);
  };

  const closeCreateMemeModal = () => {
    setIsCreateMemeVisible(false);
  };

  return (
    <>
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
            <button className="create-button" onClick={openCreateMemeModal}>
              + Create
            </button>
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
                  <img
                    src="/default_pfp.svg"
                    alt="UserIcon"
                    className="user-icon-image"
                  />
                </button>
                {dropdownVisible && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <img
                        src="/default_pfp.svg"
                        alt="User"
                        className="dropdown-avatar"
                      />
                      <p className="dropdown-username">
                        {user?.username || "User"}
                      </p>
                    </div>
                    <hr />
                    <ul className="dropdown-options">
                      <li onClick={handleViewProfile}>View Profile</li>
                      <li onClick={() => alert("Settings clicked")}>Settings</li>
                      <li onClick={onSignOut}>Sign Out</li>
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

      {/* Create Meme Modal */}
      {isCreateMemeVisible && <CreateMemeModal onClose={closeCreateMemeModal} />}
    </>
  );
};

export default Navbar;
