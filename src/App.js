import Topbar from "./scenes/global/Topbar";
import ODashboard from "./scenes/OwnerView/Odashboard";
import LoginForm from "./scenes/LoginForm/LoginForm";
import Setup from "./scenes/OwnerView/FirstTimeOwner/Setup"
import { colorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth,db } from './scenes/LoginForm/config';
import { doc, getDoc } from 'firebase/firestore';
import MenuSetup from "./scenes/OwnerView/FirstTimeOwner/MenuSetup";
import TableSetup from "./scenes/OwnerView/FirstTimeOwner/TableSetup";
import ProfileSetup from "./scenes/OwnerView/FirstTimeOwner/ProfileSetup";




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
              <Route path="/owner-dashboard" element={
              <>
                <Topbar/>
                <ODashboard/>
              </>}/>

              <Route index path="/first-setup" element={
              <>
                <Topbar/>
                <Setup/>
              </>}/>
              <Route index path="/configure-menu" element={
              <>
                <Topbar/>
                <MenuSetup/>
              </>}/>
              <Route index path="/configure-tables" element={
              <>
                <Topbar/>
                <TableSetup/>
              </>}/>
              <Route index path="/configure-profile" element={
              <>
                <Topbar/>
                <ProfileSetup/>
              </>}/>
              {/* Add more routes here for other pages if needed */}
            </Routes>
          </div>
        </div>
      </ThemeProvider>
    </colorModeContext.Provider>
  );
}

export default App;
