import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './SignUp.css';

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobileNumber: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { username, email, mobileNumber, password } = formData;
    try {
      await axios.post('http://localhost:3000/auth/signup', { username, email, mobileNumber, password });
      setMessage('Thank you for signing up. Click here to login');
      setFormData({ username: '', email: '', mobileNumber: '', password: '' });
      navigate('/sign-in'); 
    } catch (error) {
      setMessage('Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="welcome-section">
        <h2>Join Us</h2>
        <img src="https://t3.ftcdn.net/jpg/02/41/32/08/360_F_241320835_Z2fuURdWsRgtTnkARGQqiorzH8p4fnE5.jpg" alt="Signup illustration" />
      </div>

      <div className="signup-form-container">
        <h3>Sign Up</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter mobile number"
              id="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {message && <div className="alert alert-info mt-3">{message}</div>}

          <div className="form-group">
            <button type="submit" className="btn-primary">
              Sign Up
            </button>
          </div>

          <p className="forgot-password text-right">
            Already have an account? 
            <Link to="/sign-in">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
