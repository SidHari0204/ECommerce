const express = require('express');
const router = express.Router();
const Address = require('../models/Address'); 
const authenticateToken = require('../middleware/authenticateToken'); 

router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { addressLine1, addressLine2, city, state, zipCode, country, phone } = req.body;
    
    if (!addressLine1 || !city || !state || !zipCode || !country || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newAddress = new Address({
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      phone,
      user: req.user.userId 
    });

    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    console.error('Error saving address:', error);
    res.status(500).json({ message: 'Failed to save address' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const addresses = await Address.find({ user: userId });

    if (!addresses || addresses.length === 0) {
      return res.status(404).json({ message: 'No addresses found' });
    }

    res.status(200).json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Failed to fetch addresses' });
  }
});

module.exports = router;
