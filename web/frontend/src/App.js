import React, { useState } from "react";
import Navbar from "./components/Navbar";
import MemeGrid from "./components/MemeGrid";
import SignInModal from "./components/SignInModal";
import memes from "./data/memes";

function App() {
  const [isSignInVisible, setIsSignInVisible] = useState(false);

  const toggleSignIn = () => {
    setIsSignInVisible(!isSignInVisible);
  };

  return (
    <div className="App">
      {/* Navbar */}
      <Navbar onSignInClick={toggleSignIn} />

      {/* Main Content */}
      <div className="main-content">
        <MemeGrid memes={memes} />
      </div>

      {/* Sign In Modal */}
      {isSignInVisible && <SignInModal onClose={toggleSignIn} />}
    </div>
  );
}

export default App;
