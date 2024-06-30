import React, { useEffect, useState } from "react";
import { Box, useTheme, Button, Grid, Typography, TextField, Snackbar} from "@mui/material";
import { tokens } from '../../../theme';
import { colorModeContext } from '../../../theme';
import { useContext } from 'react';
import { db } from '../../LoginForm/config'; 
import { collection, getDocs, query, where, updateDoc, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const TableSetup = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(colorModeContext);
  const [numTables, setNumTables] = useState(0);
  const [numTakeaway, setNumTakeaway] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [numTablesAdjusted, setNumTablesAdjusted] = useState(false);
  const [numTakeawayAdjusted, setNumTakeawayAdjusted] = useState(false);
  const history = useNavigate();

  const fetchTables = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && user.uid) {
        const q = query(collection(db, 'profile-info'), where('uID', '==', user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const profileData = querySnapshot.docs[0].data();
          setNumTables(profileData.numTables || 0);
        }
      } else {
        console.error("No user signed in or user UID not available.");
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleTableIncrement = () => {
    setNumTables(numTables + 1);
  };

  const handleTableDecrement = () => {
    if (numTables > 0) {
      setNumTables(numTables - 1);
    }
  };

  const handleTakeawayIncrement = () => {
    setNumTakeaway(numTakeaway + 1);
  };

  const handleTakeawayDecrement = () => {
    if (numTakeaway > 0) {
      setNumTakeaway(numTakeaway - 1);
    }
  };

  const handleTableSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && user.uid) {
        const q = query(collection(db, 'profile-info'), where('uID', '==', user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          await updateDoc(docRef, {
            numTables,
          });
          console.log('Document updated with numTables:', numTables);
          setAlertMessage(`Number of tables updated to ${numTables}!`);
          setNumTablesAdjusted(true);
        } else {
          console.error('No document found with the specified UID.');
          
          // Add new document with initial values
          const docRef = await addDoc(collection(db, 'profile-info'), {
            uID: user.uid,
            numTables: numTables,
            rest_name: null,
            numTakeaway: null,
          });
          console.log('New document added with uID:', user.uid);
          setAlertMessage(`Number of tables updated to ${numTables}!`);
          setNumTablesAdjusted(true);
        }
      } else {
        console.error("No user signed in or user UID not available.");
      }
    } catch (error) {
      console.error('Error updating numTables:', error);
    }
  };

  const handleTakeawaySubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && user.uid) {
        const q = query(collection(db, 'profile-info'), where('uID', '==', user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          await updateDoc(docRef, {
            numTakeaway,
          });
          console.log('Document updated with numTakeaway:', numTakeaway);
          setAlertMessage(`Number of Takeaway tables updated to ${numTakeaway}!`);
          setNumTakeawayAdjusted(true);
        } else {
          console.error('No document found with the specified UID.');
          
          // Add new document with initial values
          const docRef = await addDoc(collection(db, 'profile-info'), {
            uID: user.uid,
            numTables: null,
            rest_name: null,
            numTakeaway: numTakeaway,
          });
          console.log('New document added with uID:', user.uid);
          setAlertMessage(`Number of Takeaway tables updated to ${numTakeaway}!`);
          setNumTakeawayAdjusted(true);
        }
      } else {
        console.error("No user signed in or user UID not available.");
      }
    } catch (error) {
      console.error('Error updating numTakeaway:', error);
    }
  };

  const handleCloseAlert = () => {
    setAlertMessage(null); // Clear alert message
  };

  const handleCategoryClick = (category) => {
    if (selectedCategory !== category) {
        setSelectedCategory(category);
        setNumTablesAdjusted(false); // Reset adjustment flags
        setNumTakeawayAdjusted(false); // Reset adjustment flags
      } else {
        setSelectedCategory(''); // Deselect category if clicked again
      }
      fetchTables();
    };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  const getRandomPastelColor = () => {
    const colorCategory = Object.keys(colors)[Math.floor(Math.random() * Object.keys(colors).length)];
    const shade = '300'; // Adjust shade as needed for pastel effect
    return colors[colorCategory][shade];
  };

  const getRandomDarkPastelColor = () => {
    const colorCategory = Object.keys(colors)[Math.floor(Math.random() * Object.keys(colors).length)];
    const shade = '700'; // Adjust shade as needed for darker effect
    return colors[colorCategory][shade];
  };

  return (
    <>
        <Snackbar
        open={!!alertMessage}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        message={alertMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      <Grid container spacing={2} justifyContent="flex-start">
        <Grid item xs={12} sm={6} md={4} ml={4}>
          <Button
            fullWidth
            sx={{
              padding: 0,
              textTransform: 'none',
              backgroundColor: theme.palette.mode === 'dark' ? getRandomDarkPastelColor() : getRandomPastelColor(),
              height: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              borderRadius: 5,
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
              padding: 2,
              position: 'relative',
            }}
            onClick={() => handleCategoryClick('Dine-In')}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.2rem',
                color: theme.palette.mode === 'dark' ? "white" : "dark-grey",
                mb: 1
              }}
            >
              Configure Dine-In Tables
            </Typography>
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            fullWidth
            sx={{
              padding: 0,
              textTransform: 'none',
              backgroundColor: theme.palette.mode === 'dark' ? getRandomDarkPastelColor() : getRandomPastelColor(),
              height: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              borderRadius: 5,
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
              padding: 2,
              position: 'relative',
            }}
            onClick={() => handleCategoryClick('Takeaway')}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.2rem',
                color: theme.palette.mode === 'dark' ? "white" : "dark-grey",
                mb: 1
              }}
            >
              Configure Takeaway Tables
            </Typography>
          </Button>
        </Grid>
      </Grid>
    {/* Third Button: Done */}
    <Grid container justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
            <Button
            variant="contained"
            color="primary"
            onClick={() => history("/first-setup")} // Ensure you have the history object available
            sx={{
                textTransform: 'none',
                mt: 2, // Adjust margin top as needed
            }}
            >
            Done
            </Button>
        </Grid>
    </Grid>

      {selectedCategory === "Dine-In" && !numTablesAdjusted && (
        <Box sx={{ flex: 1, p: 2 }}>
          <Typography variant="h3" mb={2}>Set Number of Dine-In Tables</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={handleTableDecrement} disabled={numTables <= 0}>
              <RemoveIcon/>
            </IconButton>
            <TextField
              value={numTables}
              inputProps={{ style: { textAlign: 'center', fontSize: "h4" } }}
              sx={{ mx: 2, width: 60 }}
            />
            <IconButton onClick={handleTableIncrement}>
              <AddIcon />
            </IconButton>
          </Box>
          <Button variant="contained" color="primary" onClick={handleTableSubmit}>
            Submit
          </Button>
        </Box>
      )}

      {selectedCategory === "Takeaway" && !numTakeawayAdjusted && (
        <Box sx={{ flex: 1, p: 2 }}>
          <Typography variant="h3" mb={2}>Set Number of Takeaway Tables</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={handleTakeawayDecrement} disabled={numTakeaway<= 0}>
              <RemoveIcon/>
            </IconButton>
            <TextField
              value={numTakeaway}
              inputProps={{ style: { textAlign: 'center', fontSize: "h4" } }}
              sx={{ mx: 2, width: 60 }}
            />
            <IconButton onClick={handleTakeawayIncrement}>
              <AddIcon />
            </IconButton>
          </Box>
          <Button variant="contained" color="primary" onClick={handleTakeawaySubmit}>
            Submit
          </Button>
        </Box>
      )}
    </>
  );
};

export default TableSetup;
