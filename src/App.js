import Topbar from "./scenes/global/Topbar";
import ODashboard from "./scenes/OwnerView/Odashboard";
import LoginForm from "./scenes/LoginForm/LoginForm";
import Setup from "./scenes/OwnerView/FirstTimeOwner/Setup"
import { Component } from "react";
import { colorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth,db } from './scenes/LoginForm/config';
import { doc, getDoc } from 'firebase/firestore';
import MenuSetup from "./scenes/OwnerView/FirstTimeOwner/MenuSetup";
import TableSetup from "./scenes/OwnerView/FirstTimeOwner/TableSetup";
import ProfileSetup from "./scenes/OwnerView/FirstTimeOwner/ProfileSetup";
import Chatbot from "./scenes/Chatbot/Chatbot";
import MenuView from "./scenes/OwnerView/MenuView";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotLoggedIn from "./scenes/global/NotLoggedIn";
import KitchenTopbar from "./scenes/global/KitchenTopbar";




function App() {

  const[theme, colorMode] = useMode();
  const[user,setUser] = useState(null);
  const[isFetching, setisFetching] = useState(true);
  const[isFirstLogin, setIsFirstLogin] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(db, "users-info", user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setIsFirstLogin(userData.isFirstLogin); // Assuming isFirstLogin is a field in your Firestore document
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        setisFetching(false);
      } else {
        setUser(null);
        setisFetching(false);
      }
    });
    return () => unsubscribe();
  }, []);

if (isFetching) {
      return <h2>Loading...</h2>;
}

  return (
    <colorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <div className="content">
            <Routes>
              <Route index path="/" element={<LoginForm />} />
              <Route path="/signin-error" element={<NotLoggedIn/>}/>
              <Route path="/owner-dashboard" element={
                <ProtectedRoute user={user}>
                  <>
                    <Topbar/>
                    <ODashboard/>
                  </>
              </ProtectedRoute>}/>

              <Route path="/table/:tableId" element={
                  <ProtectedRoute user={user}>
                    <Topbar/> 
                    <MenuView />
                  </ProtectedRoute>
                } />

              <Route index path="/first-setup" element={
                <ProtectedRoute user={user}>
                  <>
                    <Topbar/>
                    <Setup/>
                  </>
              </ProtectedRoute>}/>
              <Route index path="/configure-menu" element={
                <ProtectedRoute user={user}> 
                  <>
                    <Topbar/>
                    <MenuSetup/>
                  </>
              </ProtectedRoute>}/>
              <Route index path="/configure-tables" element={
                <ProtectedRoute user={user}>
                  <>
                    <Topbar/>
                    <TableSetup/>
                  </>
              </ProtectedRoute>}/>
              <Route index path="/configure-profile" element={
                <ProtectedRoute user={user}> 
                  <>
                    <Topbar/>
                    <ProfileSetup/>
                  </>
              </ProtectedRoute>}/>
              <Route path="/kitchen-view" element={
                <ProtectedRoute user={user}>
                  <>
                    <KitchenTopbar/>
                  </>
              </ProtectedRoute>}/>
              <Route index path="/configure-tables" element={
                <ProtectedRoute user={user}>
                  <>
                    <Topbar/>
                    <TableSetup/>
                  </>
              </ProtectedRoute>}/>
              <Route index path="/chatbot" element={<Chatbot></Chatbot>}/>
              {/* Add more routes here for other pages if needed */}
            </Routes>
          </div>
        </div>
      </ThemeProvider>
    </colorModeContext.Provider>
  );
}

export default App;
