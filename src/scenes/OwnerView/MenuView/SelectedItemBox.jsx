import React, { useContext, useState } from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { colorModeContext, tokens} from '../../../theme';


const SelectedItemBox = ({ item, onQuantityChange, onRemoveItem }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode)
  const colorMode = useContext(colorModeContext);

    const handleIncrease = () => {
      onQuantityChange(item.itemName, item.itemPrice, 1);
    };
  
    const handleDecrease = () => {
      if (item.quantity > 1) {
        onQuantityChange(item.itemName, item.itemPrice, -1);
      } else {
        onRemoveItem(item.itemName, item.itemPrice);
      }
    };
  

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        padding: '10px',
        border: '1px solid black',
        justifyContent: 'space-between',
        backgroundColor: theme.palette.mode === 'dark' ? '#0F67B1' : '#FFACAC',
      }}
    >
      <Typography variant="h5" sx={{ flex: 1 }}>
        <IconButton onClick={handleDecrease} size="small">
          <RemoveIcon />
        </IconButton>
        {item.quantity} x {item.itemName}
        <IconButton onClick={handleIncrease} size="small">
          <AddIcon />
        </IconButton>
      </Typography>
      <Typography variant="h5">${item.itemPrice}</Typography>
    </Box>
  );
};

export default SelectedItemBox;
