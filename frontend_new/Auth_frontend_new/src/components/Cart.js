import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Cart.css'; 

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [deletingItemId, setDeletingItemId] = useState(null); 
  const [deleteQuantity, setDeleteQuantity] = useState(1); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/cart/items', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, []);

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleDeleteClick = (itemId) => {
    setDeletingItemId(itemId); 
  };

  const handleQuantityChange = (event) => {
    setDeleteQuantity(Number(event.target.value));
  };

  const handleDeleteConfirm = async (itemId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:3000/cart/item/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { quantity: deleteQuantity }
      });

      setCartItems((prevItems) =>
        prevItems
          .map((item) =>
            item._id === itemId
              ? { ...item, quantity: item.quantity - deleteQuantity }
              : item
          )
          .filter((item) => item.quantity > 0)
      );

      setDeletingItemId(null);
      setDeleteQuantity(1);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="container cart-container mt-4">
      <h1 className="mb-4 cart-title">Your Shopping Cart</h1>
      <div className="row">
        {cartItems.length === 0 ? (
          <div className="col-12">
            <p className="text-center empty-cart-message">Your cart is currently empty.</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item._id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
              <div className="card h-100 cart-item-card">
                <div className="card-body">
                  <h5 className="card-title product-name">{item.productName}</h5>
                  <p className="card-text product-price">Price: ₹{item.price.toFixed(2)}</p>
                  <p className="card-text product-quantity">Quantity: {item.quantity}</p>
                  <p className="card-text product-subtotal">Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</p>
                  {deletingItemId === item._id ? (
                    <div className="delete-confirmation">
                      <input
                        type="number"
                        min="1"
                        max={item.quantity}
                        value={deleteQuantity}
                        onChange={handleQuantityChange}
                        className="form-control delete-quantity-input mb-2"
                      />
                      <button
                        className="btn btn-danger confirm-delete-btn"
                        onClick={() => handleDeleteConfirm(item._id)}
                      >
                        Confirm Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      className=" btn-danger delete-item-btn btn-primary"
                      onClick={() => handleDeleteClick(item._id)}
                    >
                      Delete Item
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {cartItems.length > 0 && (
        <div className="total-container d-flex justify-content-between align-items-center mt-4">
          <h2 className="total-price">Total: ₹{totalPrice.toFixed(2)}</h2>
          <button
            className="btn btn-primary checkout-btn"
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
