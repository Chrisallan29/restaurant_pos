import React from 'react';
import { useNavigate } from 'react-router-dom';

// Choose one of the following imports based on your authentication provider:

// Firebase Authentication
import { signOut } from 'firebase/auth';
import { auth } from './config';
import './Private.css';

// Auth0 Authentication (replace with your Auth0 configuration)
// import { useAuth0 } from '@auth0/auth0-react';
// const { logout } = useAuth0();

const Private = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Sign out the user using your authentication provider's method
      if (typeof signOut === 'function') { // Check for Firebase
        await signOut(auth); // Replace 'auth' with your Firebase instance
      } else {
        // Example for Auth0 (replace with your specific logout logic)
        // logout({ returnTo: window.location.origin });
      }
      console.log("Logged Out!");
      navigate('/'); // Replace '/login' with your actual login page path
    } catch (err) {
      console.error("Logout Error:", err);
      // Handle logout errors gracefully (e.g., display error message)
    }
  };


  
  return (
    <section>
      <h2>Private page</h2>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </section>
  );
};

export default Private;
