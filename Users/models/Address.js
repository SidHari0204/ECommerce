const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  addressLine1: { 
    type: String, 
    required: true 
  },
  addressLine2: { 
    type: String 
  },
  city: { 
    type: String, 
    required: true
   },
  state: { 
    type: String, 
    required: true 
  },
  zipCode: { 
    type: String, 
    required: true },
  country: { 
    type: String, 
    required: true },
  phone: { 
    type: String, 
    required: true },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  }     
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
