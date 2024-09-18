import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

const stripePromise = loadStripe('YOUR_STRIPE_API_KEY');

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [newAddress, setNewAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const fetchCartItems = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get('http://localhost:3000/cart/items', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setErrorMessage('Failed to fetch cart items.');
      }
    };

    const fetchAddresses = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get('http://localhost:3000/address', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAddresses(response.data);
        if (response.data.length > 0) {
          setSelectedAddress(response.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setErrorMessage('Failed to fetch addresses.');
      }
    };

    fetchCartItems();
    fetchAddresses();
  }, []);

  const handleCheckout = async (event) => {
    event.preventDefault();
  
    if (!stripe || !elements) {
      setErrorMessage('Stripe has not loaded.');
      return;
    }
  
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage('Payment form is not complete.');
      return;
    }
  
    setIsProcessing(true);
    setErrorMessage('');
  
    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
  
      if (error) {
        setErrorMessage(error.message);
        setIsProcessing(false);
        return;
      }
  
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          addressId: selectedAddress,
        }),
      });
  
      const { client_secret, return_url } = await response.json();
  
      if (return_url) {
        window.location.href = return_url; 
      } else if (client_secret) {
        const { error } = await stripe.confirmCardPayment(client_secret);
  
        if (error) {
          setErrorMessage(error.message);
        } else {
          setCartItems([]); 
          alert('Checkout successful!');
          navigate('/home'); 
        }
      }
    } catch (error) {
      console.error('Error during checkout:', error.response ? error.response.data : error.message);
      setErrorMessage('An error occurred during the checkout process.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewAddress = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      const response = await axios.post(
        'http://localhost:3000/address',
        newAddress,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Add the new address to the list and select it
      setAddresses([...addresses, response.data]);
      setSelectedAddress(response.data._id);
      
      // Clear the new address form fields
      setNewAddress({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: ''
      });
  
      // Close the modal programmatically
      const modalElement = document.getElementById('newAddressModal');
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement); 
      if (modalInstance) {
        modalInstance.hide();
      }
    } catch (error) {
      console.error('Error adding new address:', error);
    }
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Checkout</h1>
      {cartItems.length > 0 ? (
        <form onSubmit={handleCheckout}>
          {cartItems.map((item) => (
            <div key={item._id} className="d-flex justify-content-between align-items-center p-3 mb-2 border-bottom">
              <div>
                <h5>{item.productName}</h5>
                <p>Quantity: {item.quantity}</p>
              </div>
              <p className="text-muted">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="form-group mt-4">
            <label htmlFor="address">Address</label>
            <select
              id="address"
              className="form-control"
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
            >
              {addresses.map((address) => (
                <option key={address._id} value={address._id}>
                  {`${address.addressLine1}, ${address.city}, ${address.state}, ${address.zipCode}, ${address.country}`}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-secondary mt-2"
              data-bs-toggle="modal"
              data-bs-target="#newAddressModal"
            >
              Add New Address
            </button>
          </div>
          <div className="form-group mt-3">
            <label>Card Details</label>
            <CardElement className="form-control" />
          </div>
          {errorMessage && <p className="text-danger mt-2">{errorMessage}</p>}
          <button type="submit" className="btn-primary btn-lg btn-block mt-4" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : `Pay ₹${totalPrice.toFixed(2)}`}
          </button>
        </form>
      ) : (
        <p>Your cart is empty.</p>
      )}

      {/* New Address Modal */}
      <div className="modal fade" id="newAddressModal" tabIndex="-1" role="dialog" aria-labelledby="newAddressModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="newAddressModalLabel">Add New Address</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {['addressLine1', 'addressLine2', 'city', 'state', 'zipCode', 'country', 'phone'].map((field) => (
                <div className="form-group" key={field}>
                  <label htmlFor={`new${field.charAt(0).toUpperCase() + field.slice(1)}`}>{field.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
                  <input
                    type={field === 'phone' ? 'tel' : 'text'}
                    className="form-control"
                    id={`new${field.charAt(0).toUpperCase() + field.slice(1)}`}
                    placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                    value={newAddress[field]}
                    onChange={(e) => setNewAddress({ ...newAddress, [field]: e.target.value })}
                    required
                  />
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary" onClick={handleNewAddress}>Save Address</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutWrapper = () => (
  <Elements stripe={stripePromise}>
    <Checkout />
  </Elements>
);

export default CheckoutWrapper;
