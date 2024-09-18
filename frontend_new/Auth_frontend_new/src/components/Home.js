import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    if (token) {
      localStorage.setItem('token', token);
      navigate('/home');
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/vendor/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, quantity) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: quantity,
    }));
  };

  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem('token');
      const quantity = quantities[product._id] || 1;
      const response = await axios.post('http://localhost:3000/cart/add', 
        { productId: product._id, quantity }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data.message);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">Welcome</h1>
      </div>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            {/* Display product image using the imageUrl from the backend */}
            <img src={product.imageUrl} className="product-image" alt={product.productName} />
            <div className="product-info">
              <h5 className="product-name">{product.productName}</h5>
              <p className="product-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              <p className="product-price">₹{product.price.toFixed(2)}</p>

              <div className="quantity-control">
                <button 
                  className="quantity-btn minus-btn" 
                  onClick={() => handleQuantityChange(product._id, Math.max((quantities[product._id] || 1) - 1, 1))}
                > 
                  −
                </button>
                
                <input 
                  type="number" 
                  min="1" 
                  value={quantities[product._id] || 1} 
                  onChange={(e) => handleQuantityChange(product._id, parseInt(e.target.value))} 
                  className="quantity-input" 
                />
                
                <button 
                  className="quantity-btn plus-btn" 
                  onClick={() => handleQuantityChange(product._id, (quantities[product._id] || 1) + 1)}
                > 
                  +
                </button>
              </div>

              <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
