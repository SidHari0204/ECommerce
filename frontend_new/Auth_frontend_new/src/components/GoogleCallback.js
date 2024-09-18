import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (token) {
      localStorage.setItem('authToken', token);
      navigate('/home');
    } else {
      navigate('/'); 
    }
  }, [navigate, location]);

  return <div>Loading...</div>;
};

export default GoogleCallback;
