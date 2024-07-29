import { db } from '../../LoginForm/config'; // Adjust the path to where your config is located
import { addDoc, collection, updateDoc, doc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

class handleOrder {

  static async submitOrder(items, tableIndex, navigate, activeOrders) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("No user signed in.");
      navigate("/");
      return;
    }

    if (!items || items.length === 0) {
      console.error("No items provided for order.");
      return;
    }

    const itemMap = new Map();
    items.forEach(item => {
      const key = `${item.itemName}-${item.category}-${item.itemPrice}`;
      if (itemMap.has(key)) {
        itemMap.get(key).quantity += item.quantity || 1;
      } else {
        itemMap.set(key, {
          itemName: item.itemName,
          category: item.category,
          quantity: item.quantity || 1,
          status: "pending",
          itemPrice: item.itemPrice
        });
      }
    });
    
    const orderData = {
      restaurantId: user.uid,
      tableId: `table-${tableIndex}`,
      orderTime: new Date().toISOString(),
      status: "pending",
      items: Array.from(itemMap.values()), // Convert map values to array
    };

    try {
      // Check if there are any existing orders with 'pending' or 'waiting-for-payment' status for the table
      const orderQuery = query(
        collection(db, "table-orders"),
        where("tableId", "==", `table-${tableIndex}`),
        where("status", "in", ["pending", "waiting-for-payment"])
      );
      const querySnapshot = await getDocs(orderQuery);
      
      if (querySnapshot.empty) {
        // If no existing orders, create a new one
        await addDoc(collection(db, "table-orders"), orderData);
        console.log("Order submitted:", orderData);
      } else {
        // If existing orders are found, update them
        const batch = writeBatch(db);
        querySnapshot.docs.forEach(doc => {
          const orderRef = doc.ref;
          const existingItems = doc.data().items || new Map(); // Ensure it's a Map
          const updatedItems = handleOrder.addOrderItems(existingItems, Array.from(itemMap.values()));
          batch.update(orderRef, { items: updatedItems });
        });
        await batch.commit();
        console.log("Orders updated:", orderData);
      }
    } catch (error) {
      console.error("Error submitting order:", error);
    }
  }

static async updateOrderQuantity(item, updatedQuantity, tableIndex) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("No user signed in.");
    return;
  }

  if (updatedQuantity < 0) {
    console.error("Invalid quantity. Must be 0 or positive.");
    return;
  }

  try {
    // Fetch existing order
    const orderQuery = query(
      collection(db, "table-orders"),
      where("tableId", "==", `table-${tableIndex}`),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(orderQuery);

    const batch = writeBatch(db);

    querySnapshot.docs.forEach(doc => {
      const orderRef = doc.ref;
      const existingItems = doc.data().items || [];

      // Debugging information
      console.log("Type of existingItems:", typeof existingItems);
      console.log("Contents of existingItems:", existingItems);

      // Convert existingItems to an array if necessary
      const itemsArray = Array.isArray(existingItems) ? existingItems : Object.values(existingItems);
      console.log(itemsArray, "items")

      // Make sure this function exists
      if (typeof handleOrder.updateOrderItems !== 'function') {
        console.error("handleOrder.updateOrderItems is not a function");
        return;
      }
      
      const updatedItems = handleOrder.updateOrderItems(itemsArray, [item]);

      if (updatedItems.length === 0) {
        // If no items remain, update the order status to 'cancelled'
        batch.update(orderRef, { items: updatedItems, status: 'cancelled' });
      } else {
        // Otherwise, just update the items
        batch.update(orderRef, { items: updatedItems });
      }
    });

    await batch.commit();
    console.log("Order quantities updated:", item);
  } catch (error) {
    console.error("Error updating item quantity:", error);
  }
}

static updateOrderItems(existingItems, newItems) {
  const itemMap = new Map();
  const existingItemsArray = Array.isArray(existingItems) ? existingItems : Object.values(existingItems);

  existingItemsArray.forEach(item => {
    const key = `${item.itemName}-${item.category}-${item.itemPrice}`;
    itemMap.set(key, { ...item });
  });

  const newItemsArray = Array.isArray(newItems) ? newItems : Object.values(newItems);
  newItemsArray.forEach(item => {
    const key = `${item.itemName}-${item.category}-${item.itemPrice}`;
    if (item.quantity > 0) {
      if (itemMap.has(key)) {
        itemMap.get(key).quantity = item.quantity;
      } else {
        itemMap.set(key, item);
      }
    } else {
      // If quantity is 0, remove the item
      itemMap.delete(key);
    }
  });

  // Filter out items with quantity 0
  return Array.from(itemMap.values()).filter(item => item.quantity > 0);
}

static addOrderItems(existingItems, newItems) {
  const itemMap = new Map();

  const existingItemsArray = Array.isArray(existingItems) ? existingItems : Object.values(existingItems);
  
  existingItemsArray.forEach(item => {
    const key = `${item.itemName}-${item.category}-${item.itemPrice}`;
    itemMap.set(key, { ...item });
  });

  newItems.forEach(item => {
    const key = `${item.itemName}-${item.category}-${item.itemPrice}`;
    if (item.quantity > 0) {
      if (itemMap.has(key)) {
        itemMap.get(key).quantity += item.quantity;
      } else {
        itemMap.set(key, item);
      }
    }
  });

  return Array.from(itemMap.values());
}






}

export default handleOrder;
