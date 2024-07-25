import React, { useState, useEffect, useRef } from "react";
import { Box, useTheme, Typography, Grid, CircularProgress, Button } from "@mui/material";
import { tokens } from '../../theme';
import { colorModeContext } from '../../theme';
import { useContext } from 'react';
import { db } from '../LoginForm/config';
import { collection, getDocs, query, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { grey, pink } from "@mui/material/colors";
import { useNavigate } from 'react-router-dom';

const MenuView = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(colorModeContext);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxHeight, setMaxHeight] = useState(0);
  const [listItems, setListItems] = useState([]);
  const handleAddItem = () => {
    setListItems([...listItems, `Content item ${listItems.length + 1}`]);
  };
  const buttonRefs = useRef([]);

  useEffect(() => {
    // Calculate max height of buttons after the component mounts or menuItems changes
    if (buttonRefs.current.length > 0) {
      const heights = buttonRefs.current.map(ref => ref?.offsetHeight || 0);
      const max = Math.max(...heights);
      setMaxHeight(max);
    }
  }, [menuItems]);

  const auth = getAuth();
  const user = auth.currentUser;
  const history = useNavigate();

  // Fetch existing menu items from Firestore on component mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        if (user) {
          const q = query(collection(db, "menu-items", user.uid, "catNames")); // Target all categories under user.uid
          const querySnapshot = await getDocs(q);
          const categories = querySnapshot.docs.map((doc) => doc.id); // Extract category names

          const categorizedItems = {};
          for (const category of categories) {
            const catRef = doc(db, "menu-items", user.uid, "catNames", category);
            const catSnap = await getDoc(catRef);
            const items = catSnap.exists() ? catSnap.data().items : [];
            categorizedItems[category] = items; // Store items by category
          }

          setMenuItems(categorizedItems);
        } else {
          console.error("No user signed in.");
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ backgroundColor: 'lightblue' }}>
        <Button    
          variant="contained"
          color="inherit"
          sx={{ 
            padding: 3, // Increase padding
            borderRadius: 3,
            marginBottom: '20px',
            minWidth: '150px', // Set minimum width
            minHeight: '60px',  // Set minimum height
            fontSize: '20px',
            fontWeight: 'bold'
          }}
          onClick={() => history('/configure-menu')}
          >
            Add more items
        </Button>

        <Button
          variant="contained"
          color="secondary"
          sx={{ 
            padding: 3, // Increase padding
            borderRadius: 3,
            marginBottom: '20px',
            marginLeft: '20px',
            minWidth: '150px', // Set minimum width
            minHeight: '60px',  // Set minimum height
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
          Begin Ordering
        </Button>
      </div>
      <div style={{ display: 'flex', flex: 1, backgroundColor: 'darkblue' }}>
        <div style={{ flex: '0 0 70%' }}>
          <Grid container spacing={2} sx={{ margin: '20px'}}>
            {Object.keys(menuItems).length > 0 ? (
              Object.entries(menuItems).map(([category, items]) => (
                <React.Fragment key={category}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', marginTop:'10px' }}>
                    {category}
                  </Typography>
                  <Grid container spacing={1}>
                    {items.map((item, index) => (
                      <Grid item xs={3.5} key={item.itemName} sx={{ display: 'flex', marginRight: '10px' }}>
                        <Button
                          ref={(el) => (buttonRefs.current[index] = el)}
                          fullWidth
                          sx={{
                            flex: 1,
                            padding: 3,
                            textTransform: 'none',
                            backgroundColor: theme.palette.mode === 'dark' ? grey[300] : pink[200],
                            height: maxHeight || 'auto',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            borderRadius: 2,
                            boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {item.itemName}
                          </Typography>

                          <Typography sx={{ color: theme.palette.mode === 'dark' ? "black" : "dark-grey" }}>
                            {item.itemDesc}
                          </Typography>
                          <Typography sx={{ fontWeight: 'bold', fontSize: '1rem', color: theme.palette.mode === 'dark' ? "black" : "dark-grey" }}>
                            ${item.itemPrice}
                          </Typography>
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </React.Fragment>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="h6" align="center">
                  No Menu Items Added. Click here to add menu items
                </Typography>
              </Box>
            )}
          </Grid>
        </div>
        <div style={{ flex: '1', backgroundColor: 'darkgrey' }}>Right Column
          <div style={{
            marginLeft: '20px',
            marginRight: '20px',
            height: '300px', /* Adjust height as needed */
            padding: '20px',
            overflowY: 'auto',
            border: '1px solid black', /* For visual clarity */
            borderBlockColor: 'lightpink'
            }}>
            {/* Your content here */}
            <p>Content item 1</p>
            <p>Content item 2</p>
            <text>More items scrollable</text>
            {/* ... more content items */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuView;
