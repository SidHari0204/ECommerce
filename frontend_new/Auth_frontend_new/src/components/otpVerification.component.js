import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/auth/verify-otp', { otp });
      const { token, message } = response.data;
      setMessage(message);

      if (token) {
        localStorage.setItem('token', token); 
        navigate('/home'); 
      }
    } catch (error) {
      setMessage(error.response.data.message || 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Verify OTP</h3>

      <div className="mb-3">
        <label>OTP</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
      </div>

      <div className="d-grid">
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </div>
      {message && <p>{message}</p>}
    </form>
  );
};

export default OtpVerification;
