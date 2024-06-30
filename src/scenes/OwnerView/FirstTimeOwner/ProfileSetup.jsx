import React, { useState } from "react";
import { Box, Typography, TextField, Button, CircularProgress, Snackbar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from '../../../theme';
import { colorModeContext } from '../../../theme';
import { useContext } from 'react';
import { db } from '../../LoginForm/config';
import { updateDoc, doc, getDocs, query, where, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ProfileSetup = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(colorModeContext);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;
  const history = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        const userId = user.uid;
        // Query for the document based on the user's uid
        const q = query(collection(db, "profile-info"), where("uID", "==", userId));
        const querySnapshot = await getDocs(q);

        // Assuming there's only one document per user, you can directly update it
        querySnapshot.forEach(async (doc) => {
          const currentData = doc.data(); // Get current document data
          console.log(currentData.numTables);
          await updateDoc(doc.ref, {
            rest_name: restaurantName,
          });
        });

        // Update UI or state after successful update
        setAlertMessage(`Restaurant name updated to ${restaurantName}!`);
        setRestaurantName('');
        history("/first-setup");
      } else {
        console.error("No user signed in.");
      }
    } catch (error) {
      console.error("Error updating restaurant name:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlertMessage(null); // Clear alert message
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Snackbar
        open={!!alertMessage}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        message={alertMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      <Box sx={{ width: 400, p: 2, boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: 5, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="h5" mb={3}>Update Restaurant Name</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Restaurant Name"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!restaurantName || loading}
            sx={{ textTransform: 'none' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default ProfileSetup;
