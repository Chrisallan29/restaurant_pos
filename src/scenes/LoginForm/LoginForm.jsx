import React, { useState, useEffect } from 'react';
import './LoginForm.css';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import { auth, db } from './config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useNavigate();
  const [error, setError] = useState(null); // State to manage error message

  useEffect(() => {
    let timeoutId;

    if (error) {
      // Set a timeout to clear the error after 3 seconds
      timeoutId = setTimeout(() => {
        setError(null);
      }, 3000);
    }

    // Clean up the timeout if component unmounts or error changes
    return () => {
      clearTimeout(timeoutId);
    };
  }, [error]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      console.log('Account Created');
      await setDoc(doc(db, 'users-info', user.uid), {
        email: user.email,
        uid: user.uid,
        isFirstLogin: true,
      });
      history('/');
    } catch (err) {
      //console.log(err);
      setError(err); // Set error directly
      //console.log(error);

    }
  };

  const handleLogin = async (err) => {
    err.preventDefault();

    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login Successful!');

      const userDocRef = doc(db, 'users-info', response.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const isFirstLogin = userData.isFirstLogin;

        if (isFirstLogin) {
          // Update isFirstLogin to false in Firestore
          await updateDoc(userDocRef, {
            isFirstLogin: false,
          });

          // Navigate to first-setup page
          history('/first-setup');
        } else {
          // Navigate to dashboard page
          history('/owner-dashboard');
        }
      } else {
        
      }
    } catch (err) {
      //console.log(err);
      setError(err);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode.code) {
      case 'auth/user-not-found':
        return 'The email address is not associated with an account.';
      case 'auth/email-already-in-use':
        return 'The email address is already in use.';
      case 'auth/weak-password':
        return 'Please enter a stronger password. It must be at least 6 characters in length';
      case 'auth/network-request-failed':
        return 'A network error occurred. Please try again later.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/invalid-password':
        return 'The provided value for the password user property is invalid. It must be at least six characters.';
      case 'auth/invalid-credential':
        return 'Invalid Credentials. You may not have created an account or the entered password is incorrect';
      default:
        return 'An error occurred. Please check your credentials and try again.';
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
    const errorMessage = getErrorMessage(error);
    console.log(error);

    return (
      <div className="popup-notification">
        <p>{errorMessage}</p>
        <button onClick={() => setError(null)}>Close</button>
      </div>
    );
  };



  return (
    <div className="outer-wrapper">
      <PopupNotification error={error} data-testid='popup-notification' /> {/* Render popup if error exists */}

      <div className={`wrapper${action}`}>
        <div className='form-box login'>
          <form action="" className='login-form' onSubmit={handleLogin}>
            <h1>ShopEasy</h1>
            <h2>Login</h2>
            <div className="input-box">
              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Login Email'
                required
              />
              <FaUser className='icon' />
            </div>
            <div className="input-box">
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Login Password'
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
              <p>Don't have an account? <a href='#' onClick={registerLink}>Go to Register Page</a></p>
            </div>
          </form>
        </div>

        <div className='form-box register'>
          <form action="" className='signup-form' onSubmit={handleRegister}>
            <h1>ShopEasy</h1>
            <h2>Register</h2>
            <div className="input-box">
              <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder='Register Email' required />
              <FaEnvelope className='icon' />
            </div>

            <div className="input-box">
              <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder='Register Password' required />
              <FaLock className='icon' />
            </div>

            <div className="remember-forgot">
              <label><input type="checkbox" />I agree to the terms and conditions</label>
            </div>

            <button className='register-button' type="submit">Register</button>

            <div className='register-link'>
              <p>Already have an account? <a href='#' onClick={loginLink}>Go to Login Page</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
