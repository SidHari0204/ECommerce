import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;
    try {
      const response = await axios.post('http://localhost:3000/auth/signin', { username, password });
      const { token, message } = response.data;
      setMessage(message);

      if (token) {
        localStorage.setItem('token', token);
        navigate('/home');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred';
      setMessage(errorMsg);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div className="auth-wrapper">
      <div className="welcome-section">
        <h1>Welcome back</h1>
        <img src="https://t3.ftcdn.net/jpg/03/28/52/12/360_F_328521248_dVW7NDnY8AsOvSVaHu6rad95HzLnly5F.jpg" alt="Welcome illustration" />
      </div>

      <div className="login-form-container">
        <h3>Sign In</h3>

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
              Login
            </button>
          </div>

          <div className="form-group">
            <button type="button" onClick={handleGoogleLogin} className="btn-primary btn-danger btn-block">
              Login with Google
            </button>
          </div>

          <p className="forgot-password text-right">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>

          <div className="signup-prompt">
            New user? <Link to="/sign-up">Sign up here</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
