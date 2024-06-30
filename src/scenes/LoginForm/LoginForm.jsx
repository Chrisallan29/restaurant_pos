import React, { useState } from 'react';
import './LoginForm.css';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { auth, db } from './config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import {doc, setDoc, getDoc, updateDoc} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useNavigate();
  const [error, setError] = useState(null); // State to manage error message

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      console.log("Account Created");
      await setDoc(doc(db, "users-info", user.uid), {
        email: user.email,
        uid: user.uid,
        isFirstLogin : true
      });
      history('/');
    } catch (err) {
      setError(err.message || 'An error occurred during registration.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login Successful!");

      const userDocRef = doc(db, "users-info", response.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const isFirstLogin = userData.isFirstLogin;
  
        if (isFirstLogin) {
          // Update isFirstLogin to false in Firestore
          await updateDoc(userDocRef, {
            isFirstLogin: false
          });
  
          // Navigate to first-setup page
          history('/first-setup');
        } else {
          // Navigate to dashboard page
          history('/owner-dashboard');
        }
      } else {
        setError('User data not found.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login.');
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/wrong-password':
        return 'Incorrect email or password.'; // Adjust message as needed
      case 'auth/user-not-found':
        return 'The email address is not associated with an account.'; // Adjust message as needed
      case 'auth/weak-password':
        return 'Please enter a stronger password.'; // Adjust message as needed
      case 'auth/email-already-in-use':
        return 'The email address is already in use.'; // Adjust message as needed
      case 'auth/network-request-failed':
        return 'A network error occurred. Please try again later.'; // Adjust message as needed
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'; // Adjust message as needed
      case 'auth/invalid-credential':
        return 'Invalid Credential.';
      default:
        return 'An error occurred. Please check your credentials and try again.'; // Generic message for unknown errors
        
    }
  };

  const handleReset = () => {
    // Implement password reset functionality
  };

  const [action, setAction] = useState('');

  const registerLink = () => {
    setAction((prevState) => prevState + ' active');
  };

  const loginLink = () => {
    setAction((prevState) => prevState.replace(' active', ''));
  };

  const PopupNotification = ({ error }) => {
    if (!error) return null; // Don't render if no error
  
    const errorMessage = getErrorMessage(error.code); // Get specific message
  
    return (
      <div className="popup-notification">
        <p>{errorMessage}</p>
        <button onClick={() => setError(null)}>Close</button>
      </div>
    );
  };





  

  return (
    <div class = "outer-wrapper">
            {error && <PopupNotification error={error} />} {/* Render popup if error exists */}

    <div className={`wrapper${action}`}>

      <div className='form-box login'>
        <form action="" className='login-form' onSubmit={handleLogin}>
          <h1>ShopEasy</h1>
          <h2>Login</h2>
          <div className="input-box">
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Email'
              required
            />
            <FaUser className='icon' />
          </div>
          <div className="input-box">
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Password'
              required
            />
            <FaLock className='icon' />
          </div>
          <div className="remember-forgot">
            <label><input type="checkbox" />Remember me</label>
            <a href="#" onClick={handleReset}>Forgot password?</a>
          </div>

          <button className='login-button' type="submit">Login</button>

          <div className='register-link'>
            <p>Don't have an account? <a href='#' onClick={registerLink}>Register</a></p>
          </div>
        </form>
      </div>




      <div className='form-box register'>
        <form action="" classname = 'signup-form' onSubmit={handleRegister}>
            <h1>ShopEasy</h1>
              <h2> Register </h2>
            <div className="input-box">
                <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder='Email' required />
                <FaEnvelope className='icon' />
            </div>

            <div className="input-box">
            <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder='Password' required />
                <FaLock className='icon' />
            </div>

            <div className="remember-forgot">
                    <label><input type = "checkbox" />I agree to the terms and conditions</label>
            </div>

            <button classname = 'register-button' type="submit">Register</button>

            <div className='register-link'>
                <p>Already have an account? <a href='#' onClick={loginLink}>Login</a></p>
            </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default LoginForm



/*            <div className="input-box">
<input type="text" placeholder='Username' required />
<FaUser className='icon' />
</div>
*/