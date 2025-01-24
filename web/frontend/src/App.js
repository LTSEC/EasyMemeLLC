import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import MemeGrid from "./components/MemeGrid";
import SignInModal from "./components/SignInModal";
import ProfilePage from "./components/ProfilePage";
import PostPage from "./components/PostPage";
import memes from "./data/memes";
import './theme.css';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignInVisible, setIsSignInVisible] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsSignedIn(true);
      } catch (error) {
        console.error("Failed to parse saved user data:", error);
      }
    }
  }, []);

  const toggleSignIn = () => {
    setIsSignInVisible(!isSignInVisible);
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setUser(null);
    localStorage.removeItem("user");
  };

  const handleUserSignIn = (userData) => {
    if (!userData.id) {
      console.error("Sign-in response missing user ID.");
      return;
    }
    setUser(userData);
    setIsSignedIn(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <Router>
      <div className="App">
        {/* Navbar */}
        <Navbar
          isSignedIn={isSignedIn}
          user={user}
          onSignOut={handleSignOut}
          onSignInClick={toggleSignIn}
        />

        {/* Routes */}
        <Routes>
          {/* Home Page */}
          <Route
            path="/"
            element={
              <div className="main-content">
                <MemeGrid memes={memes} />
              </div>
            }
          />

          {/* Profile Page */}
          <Route path="/profile" element={<ProfilePage userId={user?.id} />} />
          <Route path="/post/:postId" element={<PostPage />} />
        </Routes>

        {/* Sign In Modal */}
        {isSignInVisible && (
          <SignInModal onClose={toggleSignIn} onSignIn={handleUserSignIn} />
        )}
      </div>
    </Router>
  );
}

export default App;