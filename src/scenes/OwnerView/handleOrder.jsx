import { db } from '../LoginForm/config'; // Adjust the path to where your config is located
import { addDoc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

class handleOrder {
  static async submitOrder(item, index, category) {
    const navigate = useNavigate();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("No user signed in.");
      navigate("/");
    }

    const orderData = {
      restaurantId: user.uid,
      tableId: `table-${index}`, // Adjust this as needed
      orderTime: new Date().toISOString(),
      status: "pending",
      items: [
        {
          itemId: item.id, // Assuming item has an id field
          name: item.itemName,
          category: category,
          quantity: 1, // Set default quantity if needed
          status: "pending",
        },
      ],
    };

    try {
      await addDoc(collection(db, "table-orders"), orderData);
      console.log("Order submitted:", orderData);
    } catch (error) {
      console.error("Error submitting order:", error);
    }
  }
}

export default handleOrder;
