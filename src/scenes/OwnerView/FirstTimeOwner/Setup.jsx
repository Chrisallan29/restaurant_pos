import React from 'react';
import { Box, Button, Grid, Typography} from '@mui/material';
import { Icon } from '@mui/material';
import { Link } from 'react-router-dom';
import { useEffect, useState} from 'react';
import {getDocs, collection, where, query, doc, getDoc, } from 'firebase/firestore';
import {db} from "../../LoginForm/config"
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { getAuth } from "firebase/auth";

const Setup = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [menuExists, setMenuExists] = useState(false);
  const [tablesExist, setTablesExist] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const checkDataExists = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
  
        if (user) {
          const userDocRef = doc(db, 'menu-items', user.uid);
          try {
            const docSnap = await getDoc(userDocRef);
            setMenuExists(docSnap.exists());
          } catch (error) {
            console.error("Error checking for menu items:", error);
          }
          //console.log("menu exists", menuExists);

  
          const tablesQuerySnapshot = await getDocs(
            query(collection(db, 'profile-info'), where('uID', '==', user.uid)));
          tablesQuerySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.numTables) {
              setTablesExist(true);
            }
          });
  
          const profileQuerySnapshot = await getDocs(
            query(collection(db, 'profile-info'), where('uID', '==', user.uid)));
            profileQuerySnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.rest_name) {
                setProfileExists(true);
              }
            })
          //setProfileExists(!profileQuerySnapshot.empty);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    checkDataExists();
  }, [user]); // Ensure user is listed as a dependency
  
  const allConfigured = menuExists && tablesExist && profileExists;
  
    return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      {allConfigured ? (
        <Box sx={{ p: 2, textAlign: 'center', height: "80%", width: "400px" }}>
          <Button
            component={Link}
            to="/owner-dashboard"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <DashboardIcon sx={{ fontSize: '5rem' }}/>
            <Typography variant="h2" sx={{ mt: 1 }}>Continue to Owner Dashboard</Typography>
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ p: 2, textAlign: 'justify', height: "80%", width: "400px" }}>
            <Button
              component={Link}
              to="/configure-menu"
              variant="contained"
              color={menuExists ? "success" : "primary"}
              fullWidth
              size="large"
              sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <MenuBookIcon sx={{ fontSize: '5rem' }} />
              <Typography variant="h3" sx={{ mt: 1 }}>{menuExists ? "Menu Configured!" : "Begin Setting Up Menu"}</Typography>
            </Button>
          </Box>

          <Box sx={{ p: 2, textAlign: 'justify', height: "80%", width: "400px" }}>
            <Button
              component={Link}
              to="/configure-tables"
              variant="contained"
              color={tablesExist ? "success" : "secondary"}
              fullWidth
              size="large"
              sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <TableRestaurantIcon sx={{ fontSize: '5rem' }} />
              <Typography variant="h3" sx={{ mt: 1 }}>{tablesExist ? "Tables Configured!" : "Begin Setting Up Tables"}</Typography>
            </Button>
          </Box>

          <Box sx={{ p: 2, textAlign: 'justify', height: "80%", width: "400px" }}>
            <Button
              component={Link}
              to="/configure-profile"
              variant="contained"
              color={profileExists ? "success" : "neutral"}
              fullWidth
              size="large"
              sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <ManageAccountsIcon sx={{ fontSize: '5rem' }} />
              <Typography variant="h3" sx={{ mt: 1 }}>{profileExists ? "Profile Configured!" : "Begin Profile Setup"}</Typography>
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}



export default Setup