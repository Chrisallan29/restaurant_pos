import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, IconButton, Input, useTheme} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import handleOrder from './handleOrder'; // Adjust the path as needed
import { colorModeContext, tokens } from '../../../theme';

const OrderedItemBox = ({ item, onUpdateItem, onRemoveItem, tableIndex }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode)
  const colorMode = useContext(colorModeContext);

  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]); // Only update if item.quantity changes
  
 
  // Effect to remove the item if quantity is 0
  useEffect(() => {
    if (quantity === 0) {
      // Avoid calling onRemoveItem if it causes a loop
      if (item.quantity !== 0) {
        onRemoveItem(item); // Call the parent callback to remove the item
      }
    }
  }, [quantity, item, onRemoveItem]); // Ensure dependencies are stable

  const handleEditClick = () => setIsEditing(!isEditing);

  const handleQuantityChange = (delta) => {
    // Only update the quantity, ensuring it doesn't go below 0
    setQuantity(prevQuantity => Math.max(prevQuantity + delta, 0));
  };

  const handleConfirm = async () => {
    if (quantity >= 0) {
      try {
        // Only update the quantity without adding new items
        await handleOrder.updateOrderQuantity(
          { ...item, quantity },
          quantity,
          tableIndex
        );
        setIsEditing(false);
      } catch (error) {
        console.error("Error confirming quantity change:", error);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, border: '1px solid #ccc', borderRadius: '4px',
        backgroundColor: theme.palette.mode === 'dark' ? '#0F67B1' : '#FFACAC'
    }}>
      <Typography variant="h5" sx={{ flex: 1 }}>
        {isEditing ? (
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            sx={{
              width: '25px',
              '& input': {
                textAlign: 'left',
                padding: '4px 0',
                '-moz-appearance': 'textfield',
                '&::-webkit-inner-spin-button': { display: 'none' },
                '&::-webkit-outer-spin-button': { display: 'none' }
              }
            }}
            inputProps={{ min: 0 }}
          />
        ) : (
          quantity
        )} x {item.itemName} ${item.itemPrice}
      </Typography>
      {isEditing ? (
        <>
          <IconButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 0}><RemoveIcon /></IconButton>
          <IconButton onClick={() => handleQuantityChange(1)}><AddIcon /></IconButton>
          <IconButton onClick={handleConfirm}><CheckIcon /></IconButton>
        </>
      ) : (
        <IconButton onClick={handleEditClick}><EditIcon /></IconButton>
      )}
    </Box>
  );
};

export default OrderedItemBox;
