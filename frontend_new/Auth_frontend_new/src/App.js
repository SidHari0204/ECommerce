import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Login from './components/login.component';
import SignUp from './components/signup.component';
import Dashboard from './components/Dashboard';
import Home from './components/Home'; 
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Navbar from './components/Navbar';  
import OrderHistory from './components/OrderHistory';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();

  // List of paths where you don't want the Navbar
  const noNavbarPaths = ['/', '/sign-in', '/sign-up'];

  return (
    <div className="App">
      {!noNavbarPaths.includes(location.pathname) && <Navbar />}
      <div className="auth-wrapper">
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route path="/sign-in" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/home" element={<Home />} /> 
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-history" element={<OrderHistory />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
