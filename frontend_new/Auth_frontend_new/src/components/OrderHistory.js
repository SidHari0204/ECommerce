import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/order/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching order history:', error);
      }
    };

    fetchOrderHistory();
  }, []);

  return (
    <div className="container mt-5" style={{ paddingTop: '400px' }}>
      <h1 className="mb-4">Your Order History</h1>
      {orders.length === 0 ? (
        <p>No previous orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Order placed on {new Date(order.createdAt).toLocaleDateString()}</h5>
              <ul className="list-group list-group-flush">
                {order.items.map((item) => (
                  <li key={item.productId} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{item.productName}</span>
                    <span>Quantity: {item.quantity}</span>
                    <span>Price: ₹{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <h6 className="card-subtitle mt-3 text-end">
                <strong>Total: ₹{order.totalAmount.toFixed(2)}</strong>
              </h6>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderHistory;
