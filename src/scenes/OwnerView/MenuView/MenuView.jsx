import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { Box, useTheme, Typography, Grid, CircularProgress, Button } from "@mui/material";
import { tokens } from '../../../theme';
import { colorModeContext } from '../../../theme';
import { useContext } from 'react';
import { db } from '../../LoginForm/config';
import { collection, getDocs, query, doc, getDoc, where, writeBatch } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { grey, pink } from "@mui/material/colors";
import { useNavigate, useLocation } from 'react-router-dom';
import handleOrder from './handleOrder'; // Adjust the path to where your handleOrder class is located
import SelectedItemBox from "./SelectedItemBox";
import OrderedItemBox from "./OrderedItemBox";
import PaymentView from "./PaymentView";
import ScrollableMenuButton from "./ScrollableMenuButton";
import styled from 'styled-components';

const MenuView = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(colorModeContext);
  const [menuItems, setMenuItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [maxHeight, setMaxHeight] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeOrders, setActiveOrders] = useState([]);
  const [showPaymentView, setShowPaymentView] = useState(false);
  const buttonRefs = useRef([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get the current location
  const pathParts = location.pathname.split('/');
  const tableIndex = pathParts[pathParts.length - 1];
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Calculate max height of buttons after the component mounts or menuItems changes
    if (buttonRefs.current.length > 0) {
      const heights = buttonRefs.current.map(ref => ref?.offsetHeight || 0);
      const max = Math.max(...heights);
      setMaxHeight(max);
      setReady(true)
    }
  }, [menuItems, user, location]);

  // Fetch existing menu items from Firestore on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (user) {  
          if (tableIndex) {
            // Fetch menu items
            const menuItemsQuery = query(collection(db, "menu-items", user.uid, "catNames"));
            const menuSnapshot = await getDocs(menuItemsQuery);
            const categories = menuSnapshot.docs.map(doc => doc.id);
  
            const categorizedItems = {};
            for (const category of categories) {
              const catRef = doc(db, "menu-items", user.uid, "catNames", category);
              const catSnap = await getDoc(catRef);
              const items = catSnap.exists() ? catSnap.data().items : [];
              categorizedItems[category] = items;
            }
  
            setMenuItems(categorizedItems);
  
            // Fetch pending or waiting-for-payment orders
            const ordersQuery = query(
              collection(db, 'table-orders'),
              where('tableId', '==', `table-${tableIndex}`),
              where('status', 'in', ['pending', 'waiting-for-payment'])
            );
            const ordersSnapshot = await getDocs(ordersQuery);
            const orders = ordersSnapshot.docs.map(doc => doc.data());
            
            setActiveOrders(orders);
            console.log("Active Orders", activeOrders)
            console.log("TableIndex", tableIndex)
          } else {
            console.error("No tableIndex found in path.");
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchOrders();
  }, [user, location.pathname]);



  const handleItemClick = (category, item) => {
    console.log('Clicked item:', item);
    const updatedItem = { ...item, category, quantity: 1 };
  
    setSelectedItems(prevItems => {
      const updatedItems = [...prevItems];
      const itemIndex = updatedItems.findIndex(i => 
        i.itemName === item.itemName && i.itemPrice === item.itemPrice
      );
  
      if (itemIndex > -1) {
        updatedItems[itemIndex].quantity += 1;
        console.log(`Incrementing quantity of ${item.itemName} to ${updatedItems[itemIndex].quantity}`);
      } else {
        updatedItems.push(updatedItem);
        console.log(`Adding new item ${item.itemName}`);
      }
  
      console.log('Updated selectedItems:', updatedItems);
      console.log("Active Orders", activeOrders)
      return updatedItems;
    });
  };
  


  const handleQuantityChange = (itemName, itemPrice, delta) => {
    setSelectedItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.itemName === itemName && item.itemPrice === itemPrice
          ? { ...item, quantity: item.quantity + delta }
          : item
      );
  
      // Remove items with quantity <= 0
      return updatedItems.filter(item => item.quantity > 0);
    });
  };

  const handleRemoveItem = (itemName, itemPrice) => {
    setSelectedItems(prevItems => 
      prevItems.filter(item => 
        !(item.itemName === itemName && item.itemPrice === itemPrice)
      )
    );
  };
  

  const handleProceedToOrder = async () => {
    if (selectedItems.length === 0) {
      setErrorMessage("No items in cart");
      return;
    }
  
    if (!tableIndex) {
      console.error("No tableIndex found in path.");
      setErrorMessage("Unable to determine table index");
      return;
    }
  
    try {
      console.log("tablei", tableIndex);
      console.log("select", selectedItems);
      console.log("active Or", activeOrders);
      await handleOrder.submitOrder(selectedItems, tableIndex, navigate, activeOrders);
      navigate('/owner-dashboard'); // Adjust to your desired route after order submission
    } catch (error) {
      console.error("Error processing order:", error);
    }
  };

  const handleUpdateItem = async (item, updatedQuantity, tableIndex) => {
    try {
      await handleOrder.updateOrderItems(item, updatedQuantity, tableIndex);
      // Optionally update local state to reflect the changes
      // setActiveOrders(prevOrders => 
      //   prevOrders.map(order => 
      //     order.tableId === `table-${tableIndex}` 
      //       ? { ...order, items: updateItemQuantities(order.items, item, updatedQuantity) } 
      //       : order
      //   )
      // );
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };
  
  const updateItemQuantities = (items, updatedItem, updatedQuantity) => {
    return items.map(item => 
      item.itemName === updatedItem.itemName && item.itemPrice === updatedItem.itemPrice 
        ? { ...item, quantity: updatedQuantity } 
        : item
    );
  };

  const handleProceedToPayment = () => {
    navigate(`/table/${tableIndex}/payment`);
  };
  
  

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="first div" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <>
        <div>
          <Button
            variant="contained"
            color="inherit"
            sx={{
              marginLeft: '20px',
              padding: 3, // Increase padding
              borderRadius: 3,
              marginBottom: '20px',
              minWidth: '150px', // Set minimum width
              minHeight: '60px',  // Set minimum height
              fontSize: '20px',
              fontWeight: 'bold'
            }}
            onClick={() => navigate('/owner-dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
        <div style={{ display: 'flex', flex: 1 }}>
          <div style={{ flex: '0 0 70%' }}>
            <Grid container spacing={2} sx={{ margin: '20px', flexGrow: 1 }}>
              {Object.keys(menuItems).length > 0 ? (
                Object.entries(menuItems).map(([category, items]) => (
                  <React.Fragment key={category}>
                    <Typography variant="h3" xs={4} sx={{ fontWeight: 'bold', marginTop: '10px' }}>
                      {category}
                    </Typography>
                    <Grid container spacing={2}>
                      {items.map((item, index) => {
                        const refKey = `${category}-${index}`;
                        return (
                          <Grid item key={refKey} sx={{ marginRight: '10px' }}>
                            <Button
                              ref={(el) => (buttonRefs.current[refKey] = el)}
                              fullWidth
                              sx={{
                                padding: 3,
                                textTransform: 'none',
                                backgroundColor: theme.palette.mode === 'dark' ? '#0F67B1' : '#FFACAC',
                                height: 250,
                                width: 210,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                borderRadius: 2,
                                boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
                                overflowY: 'auto',
                                  '&::-webkit-scrollbar': {
                                    display: 'none'
                                  },
                                  '-ms-overflow-style': 'none', /* Internet Explorer and Edge */
                                  'scrollbar-width': 'none' /* Firefox */
                              }}
                              onClick={() => handleItemClick(category, item)}
                            >
                              <Typography variant="h4" 
                                sx={{
                                  fontWeight:'bold',
                                  color: theme.palette.mode === 'dark' ? "white" : "dark-grey",
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}>
                                {item.itemName}
                              </Typography>

                              <Typography sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 6,
                                WebkitBoxOrient: 'vertical',
                                overflowY: 'scroll',
                                  '&::-webkit-scrollbar': {
                                    display: 'none'
                                  },
                                '-ms-overflow-style': 'none', /* Internet Explorer and Edge */
                                'scrollbar-width': 'none', /* Firefox */
                                color: theme.palette.mode === 'dark' ? "white" : "dark-grey" }}>
                                {item.itemDesc}
                              </Typography>

                              <Typography sx={{
                                fontWeight:'bold',
                                color: theme.palette.mode === 'dark' ? "white" : "dark-grey",
                                display: '-webkit-box',
                                WebkitLineClamp: 2, 
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'clip',
                                fontSize: '1rem'}}>
                                ${item.itemPrice}
                              </Typography>
                            </Button>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </React.Fragment>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                  <Typography variant="h3" align="center">
                    No Menu Items Added. Click here to add menu items
                  </Typography>
                </Box>
              )}
            </Grid>
          </div>
          <div style={{ flex: '1', backgroundColor: 'transparent' }}>
            <div style={{ marginBottom: '20px' }}>
              {showPaymentView ? (
                <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <PaymentView
                    selectedItems={selectedItems}
                    onClose={() => setShowPaymentView(false)}
                  />
                </Box>
              ) : (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '10px', p: 2 }}>Order Summary</Typography>
                  {selectedItems.length > 0 || activeOrders.length > 0 ? (
                    <>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', p: 2 }}>Placed Orders</Typography>
                      {activeOrders.flatMap((order, orderIndex) =>
                        order.items.map((item, itemIndex) => (
                          <OrderedItemBox
                            key={`${item.itemName}-${item.itemPrice}-${orderIndex}`}
                            item={item}
                            onUpdateItem={(updatedItem, updatedQuantity) => handleUpdateItem(updatedItem, updatedQuantity, tableIndex)}
                            onRemoveItem={handleRemoveItem}
                            tableIndex={tableIndex}
                          />
                        ))
                      )}
                      <Typography variant="h5" sx={{ fontWeight: 'bold', p: 2 }}>Additional Orders</Typography>
                      {selectedItems.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          {selectedItems.map((item, index) => (
                            <SelectedItemBox
                              key={`${item.itemName}-${item.itemPrice}-${index}`}
                              item={item}
                              onQuantityChange={handleQuantityChange}
                              onRemoveItem={handleRemoveItem}
                            />
                          ))}
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography sx={{ p: 2 }}>No items selected.</Typography>
                  )}
                  {(selectedItems.length > 0 || activeOrders.length > 0) && (
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ margin: '20px' }}
                      onClick={handleProceedToOrder}
                    >
                      Proceed to Order
                    </Button>
                  )}
                  {(selectedItems.length > 0 || activeOrders.length > 0) && (
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ margin: '20px' }}
                      onClick={handleProceedToPayment}
                    >
                      Proceed to Payment
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </>
    </div>
  );
}

export default MenuView;
