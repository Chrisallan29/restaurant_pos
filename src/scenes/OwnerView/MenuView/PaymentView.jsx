import React, { useState, useEffect, useContext } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { tokens } from '../../../theme';
import { colorModeContext } from '../../../theme';
import { db } from '../../LoginForm/config';
import { collection, getDocs, query, where, writeBatch, doc } from "firebase/firestore";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { useAuth } from '../../../AuthContext';


const TAX_RATE = 0.07;
const SERVICE_CHARGE_RATE = 0.10; // 10% service charge
const DISCOUNT_RATE = 0.05; // Optional 5% discount

function ccyFormat(num) {
  return `${num.toFixed(2)}`;
}

function priceRow(qty, unit) {
  return qty * unit;
}

function createRow(itemName, quantity, unit) {
  const price = priceRow(quantity, unit);
  return { itemName, quantity, unit, price };
}

function subtotal(items) {
  return items.map(({ price }) => price).reduce((sum, i) => sum + i, 0);
}

export default function PaymentView() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(colorModeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const tableIndex = location.pathname.split('/')[2]
  const { currentUser } = useAuth(); // Assuming useAuth provides the current user
  const [rows, setRows] = useState([]);
  const [invoiceSubtotal, setInvoiceSubtotal] = useState(0);
  const [invoiceTaxes, setInvoiceTaxes] = useState(0);
  const [invoiceServiceCharge, setInvoiceServiceCharge] = useState(0);
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser || !tableIndex) {
        console.error("Current user or table ID is not defined");
        setLoading(false);
        return;
      }
  
      console.log("Fetching orders for tableId:", tableIndex);
      console.log(typeof tableIndex);
      console.log("Current User ID:", currentUser.uid);
  
      try {
        const querySnapshot = await getDocs(query(
          collection(db, 'table-orders'),
          where('status', 'in', ['waiting-for-payment']),
          where('tableId', '==', `table-${tableIndex}`), 
          where('restaurantId', '==', currentUser.uid)
        ));
  
        const fetchedRows = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.items) {
            data.items.forEach(item => {
              // Convert itemPrice to a number
              const itemPrice = parseFloat(item.itemPrice);
              // Add the item to rows
              fetchedRows.push(createRow(item.itemName, item.quantity, itemPrice));
            });
          } else {
            console.warn("No items found in document:", doc.id);
          }
        });

        console.log("Fetched Rows", fetchedRows);
  
        const subtotalAmount = subtotal(fetchedRows);
        const taxes = TAX_RATE * subtotalAmount;
        const serviceCharge = SERVICE_CHARGE_RATE * subtotalAmount;
        const discount = DISCOUNT_RATE * subtotalAmount;
        const totalAmount = subtotalAmount + taxes + serviceCharge - discount;
  
        setRows(fetchedRows);
        setInvoiceSubtotal(subtotalAmount);
        setInvoiceTaxes(taxes);
        setInvoiceServiceCharge(serviceCharge);
        setInvoiceDiscount(discount);
        setInvoiceTotal(totalAmount);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchOrders();
  }, [tableIndex, currentUser]);
  

  const handlePayment = async () => {
    try {
      const querySnapshot = await getDocs(query(
        collection(db, 'table-orders'),
        where('status', 'in', ['waiting-for-payment']),
        where('tableId', '==', `table-${tableIndex}`),
        where('restaurantId', '==', currentUser.uid)
      ));
  
      const batch = writeBatch(db);
      querySnapshot.forEach(docSnapshot => {
        const docRef = doc(db, 'table-orders', docSnapshot.id);
        batch.update(docRef, {
          status: 'completed',
          paymentTime: new Date().toISOString()
        });
      });
  
      await batch.commit();
      console.log('Orders updated successfully');
  
      // Proceed to payment page
      console.log('Proceed to payment');
      navigate('/owner-dashboard'); // Navigate to payment page or handle payment process here
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  };
  

  const onClose = () => {
    // Navigate back to menu
    navigate(-1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#001f3f', // Dark blue background
        padding: 4,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff', marginBottom: 2 }}>
        Payment Summary
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 2,
          marginBottom: 1,
          backgroundColor: '#003366', // Slightly lighter blue header
          borderRadius: 1,
          color: '#ffffff',
        }}
      >
        <Typography variant="body1" sx={{ flex: 1, textAlign: 'center' }}>Item Name</Typography>
        <Typography variant="body1" sx={{ flex: 1, textAlign: 'center' }}>Item Quantity</Typography>
        <Typography variant="body1" sx={{ flex: 1, textAlign: 'center' }}>Item Price</Typography>
        <Typography variant="body1" sx={{ flex: 1, textAlign: 'right' }}>Total Price</Typography>
      </Box>
      {rows.map((row, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 2,
            marginBottom: 1,
            backgroundColor: '#fff',
            borderRadius: 1,
          }}
        >
          <Typography variant="body1" sx={{ flex: 1, textAlign: 'center', color: '#000000' }}>{row.itemName}</Typography>
          <Typography variant="body1" sx={{ flex: 1, textAlign: 'center', color: '#000000' }}>{row.quantity}</Typography>
          <Typography variant="body1" sx={{ flex: 1, textAlign: 'center', color: '#000000' }}>{ccyFormat(row.unit)}</Typography>
          <Typography variant="body1" sx={{ flex: 1, textAlign: 'right', color: '#000000' }}>{ccyFormat(row.price)}</Typography>
        </Box>
      ))}
    <Box
    sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '33%', // Adjust width to 1/3 of the screen
        marginLeft: 'auto', // Align to the right
        padding: 2,
        backgroundColor: '#003366',
        borderRadius: 1,
        color: '#ffffff',
    }}
    >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
        <Typography variant="h5" sx={{ textAlign: 'left' }}>Subtotal:</Typography>
        <Typography variant="h5" sx={{ textAlign: 'right' }}>{`$${ccyFormat(invoiceSubtotal)}`}</Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
        <Typography variant="h5" sx={{ textAlign: 'left' }}>Tax ({Math.round(TAX_RATE * 100, 2)}%):</Typography>
        <Typography variant="h5" sx={{ textAlign: 'right' }}>{ccyFormat(invoiceTaxes)}</Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
        <Typography variant="h5" sx={{ textAlign: 'left' }}>Service Charge ({SERVICE_CHARGE_RATE * 100}%):</Typography>
        <Typography variant="h5" sx={{ textAlign: 'right' }}>{ccyFormat(invoiceServiceCharge)}</Typography>
    </Box>
    {invoiceDiscount > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
        <Typography variant="h5" sx={{ textAlign: 'left' }}>Discount ({DISCOUNT_RATE * 100}%):</Typography>
        <Typography variant="h5" sx={{ textAlign: 'right' }}>{ccyFormat(invoiceDiscount)}</Typography>
        </Box>
    )}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
        <Typography variant="h4" sx={{ textAlign: 'left' }}>Total:</Typography>
        <Typography variant="h4" sx={{ textAlign: 'right' }}>{`$${ccyFormat(invoiceTotal)}`}</Typography>
    </Box>
    </Box>
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 'auto', alignSelf: 'center' }}
        onClick={handlePayment}
      >
        Proceed to Payment
      </Button>
      <Button
        variant="contained"
        color="secondary"
        sx={{ marginTop: 2, alignSelf: 'center' }}
        onClick={onClose}
      >
        Back to Menu
      </Button>
    </Box>
  );
}
