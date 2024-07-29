import React, { useState, useEffect } from 'react';
import { db } from '../../LoginForm/config'; // Assuming this is your Firestore connection
import { collection, getDocs, query, getDoc, where, updateDoc, doc} from "firebase/firestore";
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { useTheme, Button } from '@mui/material';
import { tokens } from '../../../theme';
import {useAuth} from '../../../AuthContext';

function KitchenView() {
  const theme = useTheme();
  const {currentUser} = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'table-orders'),
          where('restaurantId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );
        const querySnapshot = await getDocs(q);
        const orderData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          formattedTime: new Date(doc.data().orderTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
        setOrders(orderData);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const columns = [
    { field: 'tableId', headerName: 'Table Number', width: 150 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'itemName', headerName: 'Item Name', width: 200 },
    { field: 'quantity', headerName: 'Quantity', width: 100 },
    {
      field: 'formattedTime',
      headerName: 'Order Time',
      width: 120,
    },
    {
      field: 'actions',
      type: 'actions',
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Button variant="contained" color="error" size="small">Remove</Button>}
          label="Remove"
          onClick={() => handleRemoveItem(params.id, params.tableId)}
        />,
      ],
    },
  ];

  const rows = orders.flatMap((order) => {
    return order.items
      .filter(item => item.status === 'pending')
      .map((item, index) => ({
        id: `${order.id}-${index}`,
        tableId: order.tableId,
        category: item.category,
        itemName: item.itemName,
        quantity: item.quantity,
        formattedTime: order.formattedTime,
      }));
  });

  const handleRemoveItem = async (id, tableId) => {
    const [orderId, itemIndex] = id.split('-');
    const orderDocRef = doc(db, 'table-orders', orderId);
  
    try {
      // Update local state first
      setOrders((prevOrders) => {
        return prevOrders.map((order) => {
          if (order.id === orderId) {
            const updatedItems = order.items.map((item, index) => {
              if (index === Number(itemIndex)) {
                const updatedItem = { ...item };
                if (updatedItem.quantity > 1) {
                  // Decrease quantity of the item
                  updatedItem.quantity -= 1;
                } else {
                  // Remove item if quantity reaches 0
                  return null;
                }
                return updatedItem;
              }
              return item;
            }).filter(item => item !== null && item.status === 'pending'); // Remove nulls and keep only pending items
      
            return {
              ...order,
              items: updatedItems,
              status: updatedItems.length === 0 ? 'waiting-for-payment' : order.status
            };
          }
          return order;
        }).filter(order => order.items.length > 0); // Remove orders with no items
      });      
  
      // Perform the async database update
      const orderDoc = await getDoc(orderDocRef);
      if (orderDoc.exists()) {
        const orderData = orderDoc.data();
        let updatedItems = [...orderData.items];
        const itemToUpdate = updatedItems[Number(itemIndex)];
  
        const completedItemIndex = updatedItems.findIndex(
          (item) => item.itemName === itemToUpdate.itemName && item.status === 'completed'
        );
  
        if (itemToUpdate.quantity > 1) {
          updatedItems[Number(itemIndex)].quantity -= 1;
  
          if (completedItemIndex !== -1) {
            updatedItems[completedItemIndex].quantity += 1;
          } else {
            updatedItems.push({
              ...itemToUpdate,
              quantity: 1,
              status: 'completed',
            });
          }
        } else {
          updatedItems[Number(itemIndex)].quantity = 0;
          updatedItems[Number(itemIndex)].status = 'completed';
  
          if (completedItemIndex !== -1) {
            updatedItems[completedItemIndex].quantity += 1;
          } else {
            updatedItems.push({
              ...itemToUpdate,
              quantity: 1,
              status: 'completed',
            });
          }
        }
  
        updatedItems = updatedItems.filter(item => item.quantity > 0);
        const allCompleted = updatedItems.every(item => item.status === 'completed');
  
        await updateDoc(orderDocRef, {
          items: updatedItems,
          status: allCompleted ? 'waiting-for-payment' : orderData.status
        });
      } else {
        console.error('Order not found');
      }
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };
  
  
  

  
  
  
  
  // const handleRemoveItem = (id, tableId) => {
  //   // Assuming id is in the format of `${orderId}-${itemIndex}`
  //   const [orderId, itemIndex] = id.split('-');
 
  //   setOrders((prevOrders) => {
  //     return prevOrders.map((order) => {
  //       if (order.id === orderId) {
  //         return {
  //           ...order,
  //           items: order.items.map((item, index) => {
  //             if (index === Number(itemIndex)) {
  //               return {
  //                 ...item,
  //                 quantity: item.quantity - 1,
  //               };
  //             }
  //             return item;
  //           }).filter(item => item.quantity > 0),
  //         };
  //       }
  //       return order;
  //     });
  //   });
  //     //Code here

  // };
  

  return (
    <div style={{ display: 'auto', width: '70%', backgroundColor: 'transparent', margin: '20px' }}>
      <h2>Kitchen View</h2>
      <DataGrid
        rows={rows}
        columns={columns}

        //styling component below
        sx={{
          fontSize: '15px',
          borderColor: theme.palette.mode === 'dark' ? 'white' : 'darkblue',
          '& .MuiDataGrid-cell': {
            borderColor: theme.palette.mode === 'dark' ? 'white' : 'darkblue',
          },
          '& .MuiDataGrid-row': {
            '&:nth-child(even)': {
              backgroundColor: theme.palette.action.hover,
            },
          },
        }}
      />
    </div>
  );
}

export default KitchenView;
