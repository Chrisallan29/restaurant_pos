import React, { useEffect, useState } from "react";
import { Box, useTheme, Button, Grid, Typography, Drawer, TextField, MenuItem, Select, InputLabel, FormControl, CircularProgress } from "@mui/material";
import { tokens } from '../../../theme';
import { colorModeContext } from '../../../theme';
import { useContext } from 'react';
import { db } from '../../LoginForm/config';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, setDoc} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import {firestore}  from 'firebase/firestore'
import { arrayUnion } from "firebase/firestore";



const MenuSetup = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(colorModeContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formType, setFormType] = useState('');
  const [categoryTitle, setCategoryTitle] = useState('');
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [itemImage, setItemImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const history = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch existing menu categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        console.log("useeffect", user);
  
        if (user) {
          const q = query(collection(db, `menu-items/${user.uid}/catNames`));
          const querySnapshot = await getDocs(q);
  
          // Extract document IDs (names) from query snapshot
          const categoriesList = querySnapshot.docs.map(doc => doc.id);  // Use doc.id directly for title
          setCategories(categoriesList);
        } else {
          console.error("No user signed in.");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false); 
      }
    };
  
    fetchCategories();
  }, [user, categoryTitle]);
  

  // Function to generate random pastel color from tokens
  const getRandomPastelColor = () => {
    const colorCategory = Object.keys(colors)[Math.floor(Math.random() * Object.keys(colors).length)];
    const shade = '300'; // Adjust shade as needed for pastel effect
    return colors[colorCategory][shade];
  };

  // Function to generate random darker pastel color from tokens
  const getRandomDarkPastelColor = () => {
    const colorCategory = Object.keys(colors)[Math.floor(Math.random() * Object.keys(colors).length)];
    const shade = '700'; // Adjust shade as needed for darker effect
    return colors[colorCategory][shade];
  };

  const handleDrawerOpen = (type) => {
    setFormType(type);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleCategoryImageChange = (e) => {
    setCategoryImage(e.target.files[0]);
  };

  const handleItemImageChange = (e) => {
    setItemImage(e.target.files[0]);
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    console.log("in");
    setLoading(true);
    console.log(user);
    if (user) {
      try {
        // Construct the document reference
        const userDocRef = doc(db, "menu-items", user.uid);
        const catNamesColRef = collection(userDocRef, "catNames");
    
        // Check if the user document exists before updating
        const userDocSnap = await getDoc(userDocRef);
        const userDocExists = userDocSnap.exists();
        console.log("Document exists:", userDocExists);
    
        if (!userDocSnap.exists()) {
          const userIdDoc =  await setDoc(userDocRef, {userId: user.uid});
        }

        const catNamesColDocRef =  doc(catNamesColRef, categoryTitle);
        await setDoc(catNamesColDocRef,{items: []});

    
        console.log("Menu Category added!");
        setCategoryTitle(categoryTitle)
        setAlertMessage(`${categoryTitle} submitted!`);
        setCategoryTitle('');
        handleDrawerClose();
      } catch (error) {
        console.error("Error adding menu item: ", error);
      } finally {
        setLoading(false);
      }
  }};

  const handleSubmitItem = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const newItem = [{
        itemName: itemTitle,
        itemPrice,
        itemDesc: itemDescription,
        itemImageUrl: itemImage ? itemImage.name : null
      }];
  
      // Construct the document reference
      const userDocRef = doc(db, "menu-items", user.uid);
      const catNamesColRef = collection(userDocRef, 'catNames');
      const catNameDocRef = doc(catNamesColRef, selectedCategory);
  
      // Get the current items array (if any)
      const docSnap = await getDoc(catNameDocRef);
      const existingItems = docSnap.exists() ? docSnap.data().items : [];  // Check if data exists
  
      const updatedItems = [...existingItems, ...newItem];  // Combine existing and new items
  
      await updateDoc(catNameDocRef, {
        items: updatedItems
      });
  
      console.log("Menu item added!");
      setAlertMessage(`${itemTitle} submitted!`);
      setItemTitle('');
      setItemDescription('');
      setItemPrice('');
      setItemImage(null);
      setSelectedCategory('');
      handleDrawerClose();
    } catch (error) {
      console.error("Error adding menu item: ", error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleCloseAlert = () => {
    setAlertMessage(null); // Clear alert message
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
        {/* First Button: Add Menu Category */}
        <Grid item xs={12} sm={6} md={4} ml={4}>
          <Button
            fullWidth
            sx={{
              padding: 0, // Remove default button padding
              textTransform: 'none', // Disable text transformation
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
            onClick={() => handleDrawerOpen('category')}
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
              Add Menu Category
            </Typography>
          </Button>
        </Grid>

        {/* Second Button: Add Menu Item */}
        <Grid item xs={12} sm={6} md={4}>
          <Button
            fullWidth
            sx={{
              padding: 0, // Remove default button padding
              textTransform: 'none', // Disable text transformation
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
            onClick={() => handleDrawerOpen('item')}
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
              Add Menu Item
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

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        sx={{ width: '300px' }}
      >
        <Box
          sx={{
            width: 300,
            padding: 2,
          }}
        >
          {formType === 'category' && (
            <form onSubmit={handleSubmitCategory}>
              <Typography variant="h6" mb={2}>Add Menu Category</Typography>
              <TextField
                fullWidth
                label="Category Image"
                type="file"
                InputLabelProps={{ shrink: true }}
                onChange={handleCategoryImageChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Category Title"
                value={categoryTitle}
                onChange={(e) => setCategoryTitle(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" color="primary" type="submit" fullWidth>Submit</Button>
            </form>
          )}
          {formType === 'item' && (
            <form onSubmit={handleSubmitItem}>
              <Typography variant="h6" mb={2}>Add Menu Item</Typography>
              <TextField
                fullWidth
                label="Item Image"
                type="file"
                InputLabelProps={{ shrink: true }}
                onChange={handleItemImageChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Item Title"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Item Description"
                multiline
                rows={4}
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Item Price"
                type="number"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      No categories available
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              <Button variant="contained" color="primary" type="submit" fullWidth>Submit</Button>
            </form>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default MenuSetup;
